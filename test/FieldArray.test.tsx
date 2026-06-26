import * as React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import isFunction from 'lodash.isfunction';
import {
  FieldArray,
  withFormikReimagined,
  ArrayHelpers,
  FormikReimaginedTouched,
  FormikReimagined,
} from '../src';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

interface Values {
  friends: string[];
}
const initialValues = { friends: ['jared', 'andrea', 'brent'] };

const TestForm: React.FC<any> = (p) => (
  <Formik initialValues={{ friends: initialValues.friends }} {...p} />
);
const Formik = withFormikReimagined<
  {
    initialValues: Values;
  },
  Values
>({
  mapPropsToValues: (props) => props.initialValues,
})(FormikReimagined);

describe('<FieldArray />', () => {
  const node = document.createElement('div');
  let root: Root;

  beforeEach(() => {
    root = createRoot(node);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
  });

  function render(element: React.ReactNode) {
    act(() => {
      root.render(element);
    });
  }

  it('renders component with array helpers as props', () => {
    const TestComponent = (arrayProps: any) => {
      expect(isFunction(arrayProps.push)).toBeTruthy();
      return null;
    };

    render(
      <TestForm>
        {() => <FieldArray name="friends" component={TestComponent} />}
      </TestForm>
    );
  });

  it('renders with render callback with array helpers as props', () => {
    render(
      <TestForm>
        {() => (
          <FieldArray
            name="friends"
            render={(arrayProps) => {
              expect(isFunction(arrayProps.push)).toBeTruthy();
              return null;
            }}
          />
        )}
      </TestForm>
    );
  });

  it('renders with "children as a function" with array helpers as props', () => {
    render(
      <TestForm>
        {() => (
          <FieldArray name="friends">
            {(arrayProps) => {
              expect(isFunction(arrayProps.push)).toBeTruthy();
              return null;
            }}
          </FieldArray>
        )}
      </TestForm>
    );
  });

  describe('props.push()', () => {
    it('should add a value to the end of the field array', () => {
      let formikBag: any;
      let formikTouched: any;
      let arrayHelpers: ArrayHelpers<any>;
      render(
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
                render={(arrayProps) => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>
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
      render(
        <TestForm
          onChange={(value: any) => {
            values = value;
          }}
        >
          {() => {
            return (
              <FieldArray
                name="friends"
                render={(arrayProps) => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>
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

      render(
        <TestForm
          onTouched={(touched: FormikReimaginedTouched) =>
            (formikTouched = touched)
          }
        >
          {(props: any) => {
            formikBag = props;
            return <FieldArray name="friends" render={AddFriendsButton} />;
          }}
        </TestForm>
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
      render(
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
                render={(arrayProps) => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>
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
      render(
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
                render={(arrayProps) => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>
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
      render(
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
                render={(arrayProps) => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>
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
      render(
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
                render={(arrayProps) => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>
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
      render(
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
                render={(arrayProps) => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>
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
