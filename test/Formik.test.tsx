import * as React from 'react';
import * as Yup from 'yup';

import {
  FormikReimaginedProps,
  FieldArray,
  FormikReimaginedErrors,
  FormikReimaginedConfig,
  withFormikReimagined,
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
  errors,
  handleSubmit,
  handleChange,
}: FormikReimaginedProps<Values> & { handleSubmit?: any }) {
  return (
    <form onSubmit={handleSubmit} data-testid="form">
      <pre data-testid="values">{JSON.stringify(values)}</pre>
      <pre data-testid="errors">
        {JSON.stringify(Array.from(errors.entries()))}
      </pre>
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
const validationSchema: Yup.ObjectSchema<Values> = Yup.object({
  name: Yup.string(),
  users: Yup.array().of(
    Yup.object({
      lastName: Yup.string().required('required'),
      firstName: Yup.string(),
    })
  ),
});
const InitialValues = { name: 'jared', users: [] };

let countOfFormWithCountingValidation = 0;
const FormWithCountingValidation = withFormikReimagined<
  {
    initialValues: Values;
  },
  Values
>({
  mapPropsToValues: props => props.initialValues,
  validate: (_: Values) => {
    return (new Map([
      ['count', (++countOfFormWithCountingValidation).toString()],
    ]) as any) as FormikReimaginedErrors<Values>;
  },
})(Form);

const FormWithTwoValidations = withFormikReimagined<
  {
    initialValues: Values;
  },
  Values
>({
  mapPropsToValues: props => props.initialValues,
  validate: (_: Values) => {
    return (new Map([
      ['users[0].firstName', 'required'],
    ]) as any) as FormikReimaginedErrors<Values>;
  },
  validationSchema,
})(Form);

const FormWithPropsValidation = withFormikReimagined<
  {
    initialValues: Values;
  },
  Values
>({
  mapPropsToValues: props => props.initialValues,
  validationSchema: _ => validationSchema,
})(Form);
let countOfFormWithPropsValidationAndCount = 0;
const FormWithPropsValidationAndCount = withFormikReimagined<
  {
    initialValues: Values;
  },
  Values
>({
  mapPropsToValues: props => props.initialValues,
  validationSchema: _ => validationSchema,
  validate: (_: Values) => {
    return (new Map([
      ['count', (++countOfFormWithPropsValidationAndCount).toString()],
    ]) as any) as FormikReimaginedErrors<Values>;
  },
})(Form);

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
      const { rerender, getByTestId } = render(
        <FormWithCountingValidation initialValues={InitialValues} />
      );

      fireEvent.change(getByTestId('name-input'), {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      rerender(<FormWithCountingValidation initialValues={InitialValues} />);
      const errors = JSON.parse(getByTestId('errors').innerHTML);
      expect(errors).toEqual([['count', '2']]);
    });
  });

  it('should merge validation errors', async () => {
    const initialValues = {
      name: '',
      users: [{ firstName: '1', lastName: '2' }],
    };
    const { rerender, getByTestId } = render(
      <FormWithTwoValidations initialValues={initialValues} />
    );

    fireEvent.change(getByTestId('lastName-input'), {
      persist: noop,
      target: {
        name: 'lastName',
        value: '',
      },
    });
    rerender(<FormWithTwoValidations initialValues={initialValues} />);

    await wait(() => {
      const values = JSON.parse(getByTestId('values').innerHTML);
      const errors = JSON.parse(getByTestId('errors').innerHTML);
      expect(values.users[0].lastName).toEqual('');
      expect(errors).toEqual([
        ['users[0].lastName', 'required'],
        ['users[0].firstName', 'required'],
      ]);
    });
  }, 10000);
  it('should validate with props', async () => {
    const initialValues = {
      name: '',
      users: [{ firstName: '1', lastName: '2' }],
    };
    const { rerender, getByTestId } = render(
      <FormWithPropsValidation initialValues={initialValues} />
    );

    fireEvent.change(getByTestId('lastName-input'), {
      persist: noop,
      target: {
        name: 'lastName',
        value: '',
      },
    });

    rerender(<FormWithPropsValidation initialValues={initialValues} />);
    await later(10);
    await wait(() => {
      const errors = JSON.parse(getByTestId('errors').innerHTML);
      expect(errors).toEqual([['users[0].lastName', 'required']]);
    });
  });
  it('should not validate too often when using props', async () => {
    const initialValues = {
      name: '',
      users: [{ firstName: '1', lastName: '2' }],
    };
    const { rerender, getByTestId } = render(
      <FormWithPropsValidationAndCount initialValues={initialValues} />
    );

    await wait(() => {
      const errors = JSON.parse(getByTestId('errors').innerHTML);
      expect(errors).toEqual([['count', '2']]);
    });
    fireEvent.change(getByTestId('lastName-input'), {
      persist: noop,
      target: {
        name: 'lastName',
        value: '<>',
      },
    });
    rerender(<FormWithPropsValidationAndCount initialValues={initialValues} />);
    await wait(() => {
      const errors = JSON.parse(getByTestId('errors').innerHTML);
      expect(errors).toEqual([['count', '4']]);
    });
  });
});
