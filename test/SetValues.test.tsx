import { render, fireEvent } from '@testing-library/react';
import * as React from 'react';
import {
  FormikReimaginedProps,
  withFormikReimagined,
  FormikReimaginedTouched,
} from '../src';

// tslint:disable-next-line:no-empty
export const noop = () => {};

interface Values {
  readonly value1: string;
  readonly value2: string;
}

function Form({
  values,
  touched,
  setFieldValue,
  setValues,
}: FormikReimaginedProps<Values>) {
  return (
    <form data-testid="form" noValidate={true} autoComplete="off">
      <pre data-testid="values">{JSON.stringify(values)}</pre>
      <pre data-testid="touched">{JSON.stringify(touched)}</pre>
      <div>
        <input
          type="text"
          onChange={v => setFieldValue(v.target.name, v.target.value)}
          value={values.value1}
          name="value1"
          data-testid="value1-input"
        />
      </div>
      <div>
        <input
          type="text"
          onChange={v => setFieldValue(v.target.name, v.target.value)}
          value={values.value2}
          name="value2"
          data-testid="value2-input"
        />
      </div>
      <div>
        <input
          type="button"
          name="setAll"
          value="set all"
          data-testid="set-all"
          onClick={() => setValues({ value1: 'a', value2: 'b' })}
        />
      </div>
    </form>
  );
}

const InitialValues: Values = { value1: '', value2: '' };

const Formik = withFormikReimagined<
  {
    initialValues: Values;
  },
  Values
>({
  mapPropsToValues: props => props.initialValues,
})(Form);

describe('<SetValues>', () => {
  it('should set single value on input', async () => {
    let onTouchedValue: FormikReimaginedTouched | undefined;
    const { getByTestId } = render(
      <Formik
        initialValues={InitialValues}
        onTouched={touched => (onTouchedValue = touched)}
      />
    );

    fireEvent.change(getByTestId('value1-input'), {
      persist: noop,
      target: {
        name: 'value1',
        value: '1',
      },
    });

    const values = JSON.parse(getByTestId('values').innerHTML);
    expect(values).toEqual({ value1: '1', value2: '' });
    const touched = JSON.parse(getByTestId('touched').innerHTML);
    expect(touched).toEqual({ value1: true });
    expect(touched).toEqual(onTouchedValue);
  });
  it('should set all values on button click', async () => {
    let onTouchedValue: FormikReimaginedTouched | undefined;
    const { getByTestId } = render(
      <Formik
        initialValues={InitialValues}
        onTouched={touched => (onTouchedValue = touched)}
      />
    );

    fireEvent.click(getByTestId('set-all'), {
      persist: noop,
      target: {
        name: 'setAll',
      },
    });

    const values = JSON.parse(getByTestId('values').innerHTML);
    expect(values).toEqual({ value1: 'a', value2: 'b' });
    const touched = JSON.parse(getByTestId('touched').innerHTML);
    expect(touched).toEqual({ value1: true, value2: true });
    expect(touched).toEqual(onTouchedValue);
  });
  // TODO: nice to have feature if we decide it is needed
  // it('should reset touched if value is touched for the very first time and then resetted to pristine', async () => {
  //   let onTouchedValue: FormikReimaginedTouched | undefined;
  //   const { getByTestId } = render(
  //     <Formik
  //       initialValues={InitialValues}
  //       onTouched={touched => (onTouchedValue = touched)}
  //     />
  //   );

  //   fireEvent.change(getByTestId('value1-input'), {
  //     persist: noop,
  //     target: {
  //       name: 'value1',
  //       value: '1',
  //     },
  //   });

  //   const values = JSON.parse(getByTestId('values').innerHTML);
  //   expect(values).toEqual({ value1: '1', value2: '' });
  //   const touched = JSON.parse(getByTestId('touched').innerHTML);
  //   expect(touched).toEqual({ value1: true });
  //   expect(touched).toEqual(onTouchedValue);

  //   fireEvent.change(getByTestId('value1-input'), {
  //     persist: noop,
  //     target: {
  //       name: 'value1',
  //       value: '',
  //     },
  //   });

  //   const values2 = JSON.parse(getByTestId('values').innerHTML);
  //   expect(values2).toEqual({ value1: '', value2: '' });
  //   const touched2 = JSON.parse(getByTestId('touched').innerHTML);
  //   expect(touched2).toEqual({});
  //   expect(touched2).toEqual(onTouchedValue);
  // });
});
