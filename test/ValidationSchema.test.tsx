import { render } from '@testing-library/react';
import * as React from 'react';
import * as Yup from 'yup';
import {
  FormikReimaginedProps,
  withFormikReimagined,
  FieldArray,
} from '../src';

interface Values {
  readonly rows: RowValue[];
}

interface RowValue {
  readonly done: boolean;
  readonly description: string;
}

function Form({ values, errors }: FormikReimaginedProps<any, Values>) {
  return (
    <form data-testid="form" noValidate={true} autoComplete="off">
      <pre data-testid="values">{JSON.stringify(values)}</pre>
      <pre data-testid="errors">
        {JSON.stringify(Array.from(errors.entries()))}
      </pre>
      <FieldArray
        name="rows"
        render={arrayHelpers => (
          <table>
            <tbody>
              {values.rows.map((value, i) => {
                const rowerrors = arrayHelpers.errors(i);
                return (
                  <tr key={i}>
                    <td>
                      <pre data-testid={'rowerrors' + i}>
                        {JSON.stringify(
                          rowerrors ? Array.from(rowerrors.entries()) : null
                        )}
                      </pre>
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
                        value={value.description}
                        name="description"
                        data-testid="description-input"
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        name="done"
                        checked={value.done}
                        onChange={v =>
                          arrayHelpers.replace(i, {
                            ...value,
                            [v.target.name]: !value.done,
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      />
    </form>
  );
}

const validationSchema: Yup.ObjectSchema<Values> = Yup.object({
  rows: Yup.array()
    .required()
    .of(
      Yup.object().shape({
        description: Yup.string().required('required'),
        done: Yup.boolean(),
      })
    ),
});

const InitialValues: Values = { rows: [{ description: '', done: false }] };

const FormikValidationSchemaIsFunction = withFormikReimagined<
  {
    initialValues: Values;
  },
  Values
>({
  mapPropsToValues: props => props.initialValues,
  validationSchema: _ => validationSchema,
})(Form);

const FormikValidationSchemaIsObject = withFormikReimagined<
  {
    initialValues: Values;
  },
  Values
>({
  mapPropsToValues: props => props.initialValues,
  validationSchema,
})(Form);

describe('<ValidationSchema>', () => {
  it('should validate initial values when validationSchema is passed as function', async () => {
    const { getByTestId } = render(
      <FormikValidationSchemaIsFunction initialValues={InitialValues} />
    );
    const errors = JSON.parse(getByTestId('errors').innerHTML);
    expect(errors).toEqual([['rows[0].description', 'required']]);
  });
  it('should validate initial values when validationSchema is passed as object', async () => {
    const { getByTestId } = render(
      <FormikValidationSchemaIsObject initialValues={InitialValues} />
    );
    const errors = JSON.parse(getByTestId('errors').innerHTML);
    expect(errors).toEqual([['rows[0].description', 'required']]);
  });
});
