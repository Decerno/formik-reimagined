/* eslint-disable react/prop-types */
import * as React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import {
  withFormikReimagined,
  FormikReimaginedProps,
  FieldArray,
} from '../src';

const noop = () => {};

interface Values {
  name: string;
  users: string[];
}

const InitialValues: Values = { name: 'jared', users: ['a', 'b'] };

function HelpersForm(props: FormikReimaginedProps<Values>) {
  const {
    values,
    errors,
    dirty,
    isSubmitting,
    submitCount,
    setFieldError,
    setStatus,
    status,
    resetForm,
    handleChange,
    submitForm,
  } = props;
  return (
    <form data-testid="form">
      <pre data-testid="values">{JSON.stringify(values)}</pre>
      <pre data-testid="errors">
        {JSON.stringify(Array.from(errors.entries()))}
      </pre>
      <pre data-testid="dirty">{JSON.stringify(dirty)}</pre>
      <pre data-testid="isSubmitting">{JSON.stringify(!!isSubmitting)}</pre>
      <pre data-testid="submitCount">{JSON.stringify(submitCount)}</pre>
      <pre data-testid="status">{JSON.stringify(status)}</pre>
      <input
        type="text"
        onChange={handleChange}
        value={values.name}
        name="name"
        data-testid="name-input"
      />
      <button
        type="button"
        data-testid="set-error"
        onClick={() => setFieldError('name', 'boom')}
      />
      <button
        type="button"
        data-testid="set-status"
        onClick={() => setStatus('done')}
      />
      <button type="button" data-testid="reset" onClick={() => resetForm()} />
      <button
        type="button"
        data-testid="submit"
        onClick={() => submitForm()}
      />
    </form>
  );
}

const Form = withFormikReimagined<{ initialValues: Values }, Values>({
  mapPropsToValues: (p) => p.initialValues,
})(HelpersForm);

describe('extended helpers', () => {
  it('setFieldError sets a single error in the map', () => {
    const { getByTestId } = render(<Form initialValues={InitialValues} />);
    fireEvent.click(getByTestId('set-error'));
    const errors = JSON.parse(getByTestId('errors').innerHTML);
    expect(errors).toEqual([['name', 'boom']]);
  });

  it('setStatus updates status', () => {
    const { getByTestId } = render(<Form initialValues={InitialValues} />);
    fireEvent.click(getByTestId('set-status'));
    expect(JSON.parse(getByTestId('status').innerHTML)).toBe('done');
  });

  it('dirty reflects value changes and resetForm restores', () => {
    const { getByTestId } = render(<Form initialValues={InitialValues} />);
    expect(JSON.parse(getByTestId('dirty').innerHTML)).toBe(false);
    fireEvent.change(getByTestId('name-input'), {
      persist: noop,
      target: { name: 'name', value: 'changed' },
    });
    expect(JSON.parse(getByTestId('dirty').innerHTML)).toBe(true);
    fireEvent.click(getByTestId('reset'));
    expect(JSON.parse(getByTestId('values').innerHTML).name).toBe('jared');
    expect(JSON.parse(getByTestId('dirty').innerHTML)).toBe(false);
  });

  it('submitForm increments submitCount', async () => {
    const { getByTestId } = render(<Form initialValues={InitialValues} />);
    await act(async () => {
      fireEvent.click(getByTestId('submit'));
      await Promise.resolve();
    });
    expect(JSON.parse(getByTestId('submitCount').innerHTML)).toBe(1);
  });
});

interface AsyncValues {
  name: string;
}

function AsyncForm(props: FormikReimaginedProps<AsyncValues>) {
  const { errors, validateForm } = props;
  return (
    <form>
      <pre data-testid="errors">
        {JSON.stringify(Array.from(errors.entries()))}
      </pre>
      <button
        type="button"
        data-testid="validate"
        onClick={() => validateForm()}
      />
    </form>
  );
}

const AsyncValidated = withFormikReimagined<
  { initialValues: AsyncValues },
  AsyncValues
>({
  mapPropsToValues: (p) => p.initialValues,
  validate: async (values: AsyncValues) => {
    await Promise.resolve();
    const errors = new Map<string, string>();
    if (!values.name) {
      errors.set('name', 'async-required');
    }
    return errors as any;
  },
})(AsyncForm);

describe('async validation', () => {
  it('validateForm resolves async validate errors into the map', async () => {
    const { getByTestId } = render(
      <AsyncValidated initialValues={{ name: '' }} />
    );
    await act(async () => {
      fireEvent.click(getByTestId('validate'));
    });
    await waitFor(() => {
      const errors = JSON.parse(getByTestId('errors').innerHTML);
      expect(errors).toEqual([['name', 'async-required']]);
    });
  });
});

interface ArrValues {
  users: string[];
}

function ArrForm(props: FormikReimaginedProps<ArrValues>) {
  const { values } = props;
  return (
    <div>
      <pre data-testid="values">{JSON.stringify(values)}</pre>
      <FieldArray
        name="users"
        render={(helpers) => (
          <div>
            <pre data-testid="name">{helpers.name}</pre>
            <button
              type="button"
              data-testid="push"
              onClick={helpers.handlePush('c')}
            />
            <button type="button" data-testid="pop" onClick={() => helpers.pop()} />
          </div>
        )}
      />
    </div>
  );
}

const ArrFormik = withFormikReimagined<{ initialValues: ArrValues }, ArrValues>({
  mapPropsToValues: (p) => p.initialValues,
})(ArrForm);

describe('FieldArray parity', () => {
  it('exposes name and supports handlePush + pop', () => {
    const { getByTestId } = render(
      <ArrFormik initialValues={{ users: ['a', 'b'] }} />
    );
    expect(getByTestId('name').textContent).toBe('users');
    fireEvent.click(getByTestId('push'));
    expect(JSON.parse(getByTestId('values').innerHTML).users).toEqual([
      'a',
      'b',
      'c',
    ]);
    fireEvent.click(getByTestId('pop'));
    expect(JSON.parse(getByTestId('values').innerHTML).users).toEqual([
      'a',
      'b',
    ]);
  });
});
