import * as React from 'react';
import * as Yup from 'yup';

import { FormikReimaginedProps, FieldArray } from '../src';
import { Formik, FormikReimaginedConfig } from './formik';
import { fireEvent, render, wait } from '@testing-library/react';

// tslint:disable-next-line:no-empty
export const noop = () => {};

interface ValuesUser {
  firstName: string;
  lastName: string;
}
interface Values {
  name: string;
  users: ValuesUser[];
}

function Form({
  values,
  handleSubmit,
  handleChange,
}: FormikReimaginedProps<Values> & { handleSubmit?: any }) {
  return (
    <form onSubmit={handleSubmit} data-testid="form">
      <input
        type="text"
        onChange={handleChange}
        value={values.name}
        name="name"
        data-testid="name-input"
      />
      <FieldArray
        name="users"
        render={arrayHelpers => (
          <table>
            <tbody>
              {values.users.map((value, i) => {
                return (
                  <tr key={i}>
                    <td>
                      <input
                        type="text"
                        onChange={v =>
                          arrayHelpers.replace(i, {
                            ...value,
                            [v.target.name]: v.target.value,
                          })
                        }
                        value={value.firstName}
                        name="firstName"
                        data-testid="firstName-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        onChange={v =>
                          arrayHelpers.replace(i, {
                            ...value,
                            [v.target.name]: v.target.value,
                          })
                        }
                        value={value.lastName}
                        name="lastName"
                        data-testid="lastName-input"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      />
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
}

const InitialValues = { name: 'jared', users: [] };

function renderFormikReimagined<V = Values>(
  props?: Partial<FormikReimaginedConfig<V> & { onSubmit?: any }>
) {
  let injected: any;
  const { rerender, ...rest } = render(
    <Formik initialValues={InitialValues as any} {...props}>
      {(formikProps: any) =>
        (injected = formikProps) && (
          <Form
            {...((formikProps as unknown) as FormikReimaginedProps<Values>)}
          />
        )
      }
    </Formik>
  );
  return {
    getProps(): FormikReimaginedProps<V> {
      return injected;
    },
    ...rest,
    rerender: () =>
      rerender(
        <Formik initialValues={InitialValues as any} {...props}>
          {(formikProps: any) =>
            (injected = formikProps) && (
              <Form
                {...((formikProps as unknown) as FormikReimaginedProps<Values>)}
              />
            )
          }
        </Formik>
      ),
  };
}

describe('<Formik>', () => {
  it('should initialize FormikReimagined state and pass down props', () => {
    const { getProps } = renderFormikReimagined();
    const props = getProps();

    //expect(props.isSubmitting).toBe(false);
    //expect(props.touched).toEqual({});
    expect(props.values).toEqual(InitialValues);
    expect(props.errors).toEqual(new Map());
    //expect(props.dirty).toBe(false);
    //expect(props.isValid).toBe(true);
    //expect(props.submitCount).toBe(0);
  });

  describe('handleChange', () => {
    it('updates values based on name attribute', () => {
      const { getProps, getByTestId } = renderFormikReimagined<Values>();

      expect(getProps().values.name).toEqual(InitialValues.name);

      const input = getByTestId('name-input');
      fireEvent.change(input, {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });

      expect(getProps().values.name).toEqual('ian');
    });

    it('updates values via `name` instead of `id` attribute when both are present', () => {
      const { getProps, getByTestId } = renderFormikReimagined<Values>();

      expect(getProps().values.name).toEqual(InitialValues.name);

      const input = getByTestId('name-input');
      fireEvent.change(input, {
        persist: noop,
        target: {
          id: 'person-1-thinger',
          name: 'name',
          value: 'ian',
        },
      });

      expect(getProps().values.name).toEqual('ian');
    });

    it('runs validations by default', async () => {
      const validateSync = jest.fn(() => new Map());
      const validationSchema = {
        validateSync,
      };
      const { getByTestId, rerender } = renderFormikReimagined({
        validate: validateSync,
        validationSchema,
      });

      fireEvent.change(getByTestId('name-input'), {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      rerender();
      expect(validateSync).toHaveBeenCalledTimes(4);
    });
  });

  it('should merge validation errors', async () => {
    const validate = () => new Map([['users[0].firstName', 'required']]);
    const validationSchema = Yup.object({
      users: Yup.array().of(
        Yup.object({
          lastName: Yup.string().required('required'),
        })
      ),
    });

    const { getProps, getByTestId, rerender } = renderFormikReimagined({
      initialValues: { name: '', users: [{ firstName: '1', lastName: '2' }] },
      validate,
      validationSchema,
    });
    fireEvent.change(getByTestId('firstName-input'), {
      persist: noop,
      target: {
        name: 'firstName',
        value: '',
      },
    });
    rerender();

    fireEvent.change(getByTestId('lastName-input'), {
      persist: noop,
      target: {
        name: 'lastName',
        value: '',
      },
    });
    rerender();
    const props = getProps();
    wait(
      () => {
        setTimeout(() => {
          expect(Array.from(props.errors.entries())).toEqual([
            ['users[0].firstName', 'required'],
            ['users[0].lastName', 'required'],
          ]);
        }, 1);
      },
      { timeout: 100 }
    );
  });
});
