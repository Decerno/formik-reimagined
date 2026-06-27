/* eslint-disable react/prop-types */
import * as React from 'react';
import * as Yup from 'yup';
import { render, fireEvent, waitFor } from '@testing-library/react';
import {
  FormikReimaginedProvider,
  Field,
  Form,
  ErrorMessage,
  useFormikReimaginedContext,
  Formik,
  useFormik,
} from '../src';

const noop = () => {};

interface Values {
  name: string;
  nested: { city: string };
}

const initialValues: Values = { name: 'jared', nested: { city: 'sf' } };

describe('FormikReimaginedProvider + components', () => {
  it('provides bag through context and renders Field with nested value', () => {
    const { getByTestId } = render(
      <FormikReimaginedProvider<Values> initialValues={initialValues}>
        {() => (
          <div>
            <Field name="name" data-testid="name-input" />
            <Field name="nested.city" data-testid="city-input" />
          </div>
        )}
      </FormikReimaginedProvider>
    );
    expect((getByTestId('name-input') as HTMLInputElement).value).toBe('jared');
    expect((getByTestId('city-input') as HTMLInputElement).value).toBe('sf');
  });

  it('updates nested values through Field handleChange', () => {
    let latest: any;
    const Spy = () => {
      latest = useFormikReimaginedContext<Values>();
      return null;
    };
    const { getByTestId } = render(
      <FormikReimaginedProvider<Values> initialValues={initialValues}>
        {() => (
          <div>
            <Field name="nested.city" data-testid="city-input" />
            <Spy />
          </div>
        )}
      </FormikReimaginedProvider>
    );
    fireEvent.change(getByTestId('city-input'), {
      persist: noop,
      target: { name: 'nested.city', value: 'nyc' },
    });
    expect(latest.values.nested.city).toBe('nyc');
  });

  it('ErrorMessage only shows for an invalid, touched field', async () => {
    const schema = Yup.object({
      name: Yup.string().min(3, 'short').required('required'),
      nested: Yup.object({ city: Yup.string() }),
    }).defined();
    const { getByTestId, queryByTestId } = render(
      <FormikReimaginedProvider<Values>
        initialValues={{ name: 'jared', nested: { city: 'sf' } }}
        validationSchema={schema as any}
      >
        {() => (
          <div>
            <Field name="name" data-testid="name-input" />
            <ErrorMessage
              name="name"
              component="span"
              data-testid="name-error"
            />
          </div>
        )}
      </FormikReimaginedProvider>
    );
    // Not touched yet -> no error shown
    expect(queryByTestId('name-error')).toBeNull();
    // Change to a too-short value: field is now touched and invalid
    fireEvent.change(getByTestId('name-input'), {
      persist: noop,
      target: { name: 'name', value: 'ab' },
    });
    await waitFor(() => {
      expect(getByTestId('name-error').textContent).toBe('short');
    });
  });

  it('Form calls submitForm and onSubmit on submit', async () => {
    let submitted: Values | undefined;
    const { getByTestId } = render(
      <Formik<Values>
        initialValues={initialValues}
        onSubmit={(v) => {
          submitted = v;
        }}
      >
        {() => (
          <Form data-testid="form">
            <Field name="name" data-testid="name-input" />
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </Form>
        )}
      </Formik>
    );
    fireEvent.submit(getByTestId('form'));
    await waitFor(() => {
      expect(submitted).toEqual(initialValues);
    });
  });
});

describe('useFormik hook', () => {
  it('exposes values, helpers and computed props', () => {
    let bag: any;
    const Comp = () => {
      bag = useFormik<{}, Values>({ initialValues });
      return null;
    };
    render(<Comp />);
    expect(bag.values).toEqual(initialValues);
    expect(bag.dirty).toBe(false);
    expect(bag.isValid).toBe(true);
    expect(typeof bag.setFieldValue).toBe('function');
    expect(typeof bag.validateForm).toBe('function');
  });
});
