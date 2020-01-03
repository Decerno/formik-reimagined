import * as React from 'react';
import * as Yup from 'yup';

import {
  FormikReimaginedProps,
  FieldArray,
  FormikReimaginedErrors,
  FormikReimaginedConfig,
} from '../src';
import { Formik } from './formik';
import { fireEvent, render, wait } from '@testing-library/react';

// tslint:disable-next-line:no-empty
export const noop = () => {};
function later(delay: number, value?: any) {
  return new Promise(resolve => setTimeout(resolve, delay, value));
}
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

function renderFormikReimagined<V extends Values>(
  props?: Partial<
    FormikReimaginedConfig<any, V> & { onSubmit?: any; initialValues?: V }
  >
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
      const validateSync = jest.fn(
        (_: Values) => (new Map() as any) as FormikReimaginedErrors<Values>
      );
      const validationSchema: Yup.ObjectSchema<Values> = Yup.object();
      const { getByTestId, rerender } = renderFormikReimagined<Values>({
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
      expect(validateSync).toHaveBeenCalledTimes(2);
    });
  });
  const validationSchema: Yup.ObjectSchema<Values> = Yup.object({
    name: Yup.string(),
    users: Yup.array().of(
      Yup.object({
        lastName: Yup.string().required('required'),
        firstName: Yup.string(),
      })
    ),
  });
  xit('should merge validation errors', async () => {
    const validate = (_: Values) => {
      return (new Map([
        ['users[0].firstName', 'required'],
      ]) as any) as FormikReimaginedErrors<Values>;
    };

    const { getProps, getByTestId, rerender } = renderFormikReimagined<Values>({
      initialValues: { name: '', users: [{ firstName: '1', lastName: '2' }] },
      validate,
      validationSchema,
    });

    fireEvent.change(getByTestId('lastName-input'), {
      persist: noop,
      target: {
        name: 'lastName',
        value: '',
      },
    });
    rerender();
    await later(1000);
    await later(1000);

    await wait( () => {
      const props = getProps();
      expect(Array.from(props.errors.entries())).toEqual([
        ['users[0].firstName', 'required'],
        ['users[0].lastName', 'required'],
      ]);
    });
  }, 10000);
  xit('should validate with props', async () => {
    var count =0;
    const validationSchema1 = ((_props: any) => {
      count++;
      return validationSchema;
    });

    const { getByTestId, rerender } = renderFormikReimagined<Values>({
      initialValues: { name: '', users: [{ firstName: '1', lastName: '2' }] },
      validate: undefined,
      validationSchema: validationSchema1,
    });

    fireEvent.change(getByTestId('lastName-input'), {
      persist: noop,
      target: {
        name: 'lastName',
        value: '',
      },
    });
    rerender();
    await later(10);
    await wait( () => {
      expect(count).toEqual(2);
    });
  });
});
