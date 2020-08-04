import { render, fireEvent } from '@testing-library/react';
import * as React from 'react';
import {
  FormikReimaginedProps,
  withFormikReimagined,
  FormikReimaginedTouched,
} from '../src';

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
          name="resetValue1"
          value="reset value1"
          data-testid="reset-value1"
          onClick={() => setFieldValue('value1', 'a', true)}
        />
      </div>
      <div>
        <input
          type="button"
          name="setAll"
          value="set all"
          data-testid="set-all"
          onClick={() => setValues({ value1: 'x', value2: 'y' })}
        />
      </div>
      <div>
        <input
          type="button"
          name="resetAll"
          value="reset all"
          data-testid="reset-all"
          onClick={() => setValues({ value1: 'a', value2: 'b' }, true)}
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

describe('<ResetInitialValues>', () => {
  it('should reset touched when calling setValues with resetInitialValues = true', async () => {
    let onTouchedValue: FormikReimaginedTouched | undefined;
    const { getByTestId } = render(
      <Formik
        initialValues={InitialValues}
        onTouched={touched => (onTouchedValue = touched)}
      />
    );

    fireEvent.click(getByTestId('reset-all'), {
      persist: noop,
      target: {
        name: 'resetAll',
      },
    });

    const values = JSON.parse(getByTestId('values').innerHTML);
    expect(values).toEqual({ value1: 'a', value2: 'b' });
    const touched = JSON.parse(getByTestId('touched').innerHTML);
    expect(touched).toEqual({});
    expect(touched).toEqual(onTouchedValue);
  });
  it('should reset touched when calling setFieldValue with resetInitialValues = true', async () => {
    let onTouchedValue: FormikReimaginedTouched | undefined;
    const { getByTestId } = render(
      <Formik
        initialValues={InitialValues}
        onTouched={touched => (onTouchedValue = touched)}
      />
    );

    fireEvent.click(getByTestId('reset-value1'), {
      persist: noop,
      target: {
        name: 'resetValue1',
      },
    });

    const values = JSON.parse(getByTestId('values').innerHTML);
    expect(values).toEqual({ value1: 'a', value2: '' });
    const touched = JSON.parse(getByTestId('touched').innerHTML);
    expect(touched).toEqual({});
    expect(touched).toEqual(onTouchedValue);
  });
  it('should set touched on input after reset', async () => {
    let onTouchedValue: FormikReimaginedTouched | undefined;
    const { getByTestId } = render(
      <Formik
        initialValues={InitialValues}
        onTouched={touched => (onTouchedValue = touched)}
      />
    );

    fireEvent.click(getByTestId('reset-value1'), {
      persist: noop,
      target: {
        name: 'resetValue1',
      },
    });

    const resetValues = JSON.parse(getByTestId('values').innerHTML);
    expect(resetValues).toEqual({ value1: 'a', value2: '' });

    fireEvent.change(getByTestId('value1-input'), {
      persist: noop,
      target: {
        name: 'value1',
        value: 'x',
      },
    });

    const values = JSON.parse(getByTestId('values').innerHTML);
    expect(values).toEqual({ value1: 'x', value2: '' });
    const touched = JSON.parse(getByTestId('touched').innerHTML);
    expect(touched).toEqual({ value1: true });
    expect(touched).toEqual(onTouchedValue);
  });
  it('should set touched on set all after reset', async () => {
    let onTouchedValue: FormikReimaginedTouched | undefined;
    const { getByTestId } = render(
      <Formik
        initialValues={InitialValues}
        onTouched={touched => (onTouchedValue = touched)}
      />
    );

    fireEvent.click(getByTestId('reset-all'), {
      persist: noop,
      target: {
        name: 'resetAll',
      },
    });

    const resetValues = JSON.parse(getByTestId('values').innerHTML);
    expect(resetValues).toEqual({ value1: 'a', value2: 'b' });

    fireEvent.click(getByTestId('set-all'), {
      persist: noop,
      target: {
        name: 'setAll',
      },
    });

    const values = JSON.parse(getByTestId('values').innerHTML);
    expect(values).toEqual({ value1: 'x', value2: 'y' });
    const touched = JSON.parse(getByTestId('touched').innerHTML);
    expect(touched).toEqual({ value1: true, value2: true });
    expect(touched).toEqual(onTouchedValue);
  });
});
