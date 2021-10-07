import * as React from 'react';
import * as ReactDOM from 'react-dom';
import isFunction from 'lodash.isfunction';
import {
  FieldArray,
  withFormikReimagined,
  ArrayHelpers,
  FormikReimaginedTouched,
  FormikReimagined
} from '../src';
import { act } from 'react-dom/test-utils';
interface Values {
  friends: string[];
}
const initialValues = { friends: ['jared', 'andrea', 'brent'] };

const TestForm: React.SFC<any> = p => (
  <Formik initialValues={{ friends: initialValues.friends }} {...p} />
);
const Formik = withFormikReimagined<
  {
    initialValues: Values;
  },
  Values
>({
  mapPropsToValues: props => props.initialValues,
})(FormikReimagined);

describe('<FieldArray />', () => {
  const node = document.createElement('div');

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(node);
  });

  it('renders component with array helpers as props', () => {
    const TestComponent = (arrayProps: any) => {
      expect(isFunction(arrayProps.push)).toBeTruthy();
      return null;
    };

    ReactDOM.render(
      <TestForm>
        {() => <FieldArray name="friends" component={TestComponent} />}
      </TestForm>,
      node
    );
  });

  it('renders with render callback with array helpers as props', () => {
    ReactDOM.render(
      <TestForm>
        {() => (
          <FieldArray
            name="friends"
            render={arrayProps => {
              expect(isFunction(arrayProps.push)).toBeTruthy();
              return null;
            }}
          />
        )}
      </TestForm>,
      node
    );
  });

  it('renders with "children as a function" with array helpers as props', () => {
    ReactDOM.render(
      <TestForm>
        {() => (
          <FieldArray name="friends">
            {arrayProps => {
              expect(isFunction(arrayProps.push)).toBeTruthy();
              return null;
            }}
          </FieldArray>
        )}
      </TestForm>,
      node
    );
  });

  describe('props.push()', () => {
    it('should add a value to the end of the field array', () => {
      let formikBag: any;
      let formikTouched: any;
      let arrayHelpers: ArrayHelpers<any>;
      ReactDOM.render(
        <TestForm
          onTouched={(touched: FormikReimaginedTouched) =>
            (formikTouched = touched)
          }
        >
          {(props: any) => {
            formikBag = props;
            return (
              <FieldArray
                name="friends"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>,
        node
      );
      act(() => {
        arrayHelpers.push('jared');
      });

      const expectedValues = ['jared', 'andrea', 'brent', 'jared'];
      expect(formikBag.values.friends).toEqual(expectedValues);
      const expectedTouched = { friends: true };
      expect(formikTouched).toEqual(expectedTouched);
    });

    it('dispatches onChange', () => {
      let values: any;
      let arrayHelpers: ArrayHelpers<any>;
      ReactDOM.render(
        <TestForm
          onChange={(value: any) => {
            values = value;
          }}
        >
          {() => {
            return (
              <FieldArray
                name="friends"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>,
        node
      );
      act(() => {
        arrayHelpers.push('jared');
      });

      const expected = ['jared', 'andrea', 'brent', 'jared'];
      expect(values.friends).toEqual(expected);
    });

    it('should add multiple values to the end of the field array', () => {
      let formikBag: any;
      let formikTouched: any;
      let addFriendsFn: any;
      const AddFriendsButton = (arrayProps: any) => {
        const addFriends = () => {
          arrayProps.push('john');
          arrayProps.push('paul');
          arrayProps.push('george');
          arrayProps.push('ringo');
        };

        addFriendsFn = addFriends;

        return <button type="button" onClick={addFriends} />;
      };

      ReactDOM.render(
        <TestForm
          onTouched={(touched: FormikReimaginedTouched) =>
            (formikTouched = touched)
          }
        >
          {(props: any) => {
            formikBag = props;
            return <FieldArray name="friends" render={AddFriendsButton} />;
          }}
        </TestForm>,
        node
      );
      act(() => {
        addFriendsFn();
      });
      const expectedValues = [
        'jared',
        'andrea',
        'brent',
        'john',
        'paul',
        'george',
        'ringo',
      ];
      expect(formikBag.values.friends).toEqual(expectedValues);
      const expectedTouched = { friends: true };
      expect(formikTouched).toEqual(expectedTouched);
    });
  });

  describe('props.swap()', () => {
    it('should swap two values in field array', () => {
      let formikBag: any;
      let formikTouched: any;
      let arrayHelpers: ArrayHelpers<any>;
      ReactDOM.render(
        <TestForm
          onTouched={(touched: FormikReimaginedTouched) =>
            (formikTouched = touched)
          }
        >
          {(props: any) => {
            formikBag = props;
            return (
              <FieldArray
                name="friends"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>,
        node
      );
      act(() => {
        arrayHelpers.swap(0, 2);
      });
      const expectedValues = ['brent', 'andrea', 'jared'];
      expect(formikBag.values.friends).toEqual(expectedValues);
      const expectedTouched = { friends: true };
      expect(formikTouched).toEqual(expectedTouched);
    });
  });

  describe('props.insert()', () => {
    it('should insert a value at given index of field array', () => {
      let formikBag: any;
      let formikTouched: any;
      let arrayHelpers: ArrayHelpers<any>;
      ReactDOM.render(
        <TestForm
          onTouched={(touched: FormikReimaginedTouched) =>
            (formikTouched = touched)
          }
        >
          {(props: any) => {
            formikBag = props;
            return (
              <FieldArray
                name="friends"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>,
        node
      );
      act(() => {
        arrayHelpers.insert(1, 'brian');
      });
      const expectedValues = ['jared', 'brian', 'andrea', 'brent'];
      expect(formikBag.values.friends).toEqual(expectedValues);
      const expectedTouched = { friends: true };
      expect(formikTouched).toEqual(expectedTouched);
    });
  });

  describe('props.replace()', () => {
    it('should replace a value at given index of field array', () => {
      let formikBag: any;
      let formikTouched: any;
      let arrayHelpers: ArrayHelpers<any>;
      ReactDOM.render(
        <TestForm
          onTouched={(touched: FormikReimaginedTouched) =>
            (formikTouched = touched)
          }
        >
          {(props: any) => {
            formikBag = props;
            return (
              <FieldArray
                name="friends"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>,
        node
      );
      act(() => {
        arrayHelpers.replace(1, 'brian');
      });
      const expectedValues = ['jared', 'brian', 'brent'];
      expect(formikBag.values.friends).toEqual(expectedValues);
      const expectedTouched = { friends: true };
      expect(formikTouched).toEqual(expectedTouched);
    });
  });

  describe('props.unshift()', () => {
    it('should add a value to start of field array', () => {
      let formikBag: any;
      let formikTouched: any;
      let arrayHelpers: ArrayHelpers<any>;
      ReactDOM.render(
        <TestForm
          onTouched={(touched: FormikReimaginedTouched) =>
            (formikTouched = touched)
          }
        >
          {(props: any) => {
            formikBag = props;
            return (
              <FieldArray
                name="friends"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>,
        node
      );
      act(() => {
        arrayHelpers.unshift('brian');
      });
      const expectedValues = ['brian', 'jared', 'andrea', 'brent'];
      expect(formikBag.values.friends).toEqual(expectedValues);
      const expectedTouched = { friends: true };
      expect(formikTouched).toEqual(expectedTouched);
    });
  });

  describe('props.remove()', () => {
    it('should remove a value at given index of field array', () => {
      let formikBag: any;
      let formikTouched: any;
      let arrayHelpers: ArrayHelpers<any>;
      ReactDOM.render(
        <TestForm
          onTouched={(touched: FormikReimaginedTouched) =>
            (formikTouched = touched)
          }
        >
          {(props: any) => {
            formikBag = props;
            return (
              <FieldArray
                name="friends"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>,
        node
      );
      act(() => {
        arrayHelpers.remove(1);
      });
      const expectedValues = ['jared', 'brent'];
      expect(formikBag.values.friends).toEqual(expectedValues);
      const expectedTouched = { friends: true };
      expect(formikTouched).toEqual(expectedTouched);
    });
  });
});
