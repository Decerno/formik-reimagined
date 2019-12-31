import * as React from 'react';
import * as ReactDOM from 'react-dom';
import isFunction from 'lodash.isfunction';
import { FieldArray } from '../src';
import { Formik } from './formik';
import { act } from 'react-dom/test-utils';
const initialValues = { friends: ['jared', 'andrea', 'brent'] };

const TestForm: React.SFC<any> = p => (
  <Formik initialValues={{ friends: initialValues.friends }} {...p} />
);

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
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
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

      const expected = ['jared', 'andrea', 'brent', 'jared'];
      expect(formikBag.values.friends).toEqual(expected);
    });

    it('should add multiple values to the end of the field array', () => {
      let formikBag: any;
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
        <TestForm>
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
      const expected = [
        'jared',
        'andrea',
        'brent',
        'john',
        'paul',
        'george',
        'ringo',
      ];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.swap()', () => {
    it('should swap two values in field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
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
      const expected = ['brent', 'andrea', 'jared'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.insert()', () => {
    it('should insert a value at given index of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
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
      const expected = ['jared', 'brian', 'andrea', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.replace()', () => {
    it('should replace a value at given index of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
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
      const expected = ['jared', 'brian', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.unshift()', () => {
    it('should add a value to start of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
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
      const expected = ['brian', 'jared', 'andrea', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.remove()', () => {
    it('should remove a value at given index of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
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
      const expected = ['jared', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });
});
