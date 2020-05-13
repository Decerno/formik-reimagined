/* eslint-disable react/prop-types */
import * as React from 'react';
import {
  withFormikReimagined,
  FormikReimaginedProps,
  InjectedFormikReimaginedProps,
} from '../src';
import { render, fireEvent } from '@testing-library/react';
import { noop } from './Formik.test';

interface Values {
  name: string;
}

interface OwnProps {
  initialValues: Values;
  injectedProp?: boolean;
}

type SubmitCallback = (e?: React.FormEvent<any> | undefined) => void;

function FormInner(props: FormikReimaginedProps<Values>) {
  const { values, handleChange } = props;
  return (
    <form>
      <input
        type="text"
        onChange={handleChange}
        value={values.name}
        name="name"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
const Form = withFormikReimagined<{}, Values>({})(FormInner);

const InitialValues: Values = { name: 'jared' };

const renderWithFormik = (options?: any, props?: any) => {
  let injected: any;

  const FormikForm = withFormikReimagined<{}, Values>({
    mapPropsToValues: () => InitialValues,
    ...options,
  })(props => (injected = props) && <Form {...props} />);

  return {
    getProps() {
      return injected;
    },
    ...render(<FormikForm {...props} />),
  };
};

describe('withFormik()', () => {
  xit('should initialize Formik state and pass down props', () => {
    const { getProps } = renderWithFormik();

    const props = getProps();

    expect(props).toEqual({
      children: expect.anything(),
      handleChange: expect.any(Function),
      setFieldValue: expect.any(Function),
      state: expect.anything(),
      values: {
        name: InitialValues.name,
      },
    });
  });

  it('should render child element', () => {
    const { container } = renderWithFormik();
    expect(container.firstChild).toBeDefined();
  });

  it('passes down custom props', () => {
    const { getProps } = renderWithFormik({}, { my: 'prop' });
    expect(getProps().my).toEqual('prop');
  });

  it('should trigger onSubmit on submitForm()', () => {
    let myValues: Values = { name: 'jared' };
    let myInjectedProp = false;
    let submit: SubmitCallback = () => {};

    const FormOnSubmit: React.FC<InjectedFormikReimaginedProps<
      OwnProps,
      Values
    >> = ({ values, errors, handleChange, submitForm }) => {
      submit = submitForm;
      return (
        <form noValidate={true} autoComplete="off" data-testid="form">
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
        </form>
      );
    };
    const FormikOnSubmit = withFormikReimagined<OwnProps, Values>({
      mapPropsToValues: props => props.initialValues,
    })(FormOnSubmit);

    const { getByTestId } = render(
      <FormikOnSubmit
        initialValues={{ name: 'jared' }}
        injectedProp={true}
        onSubmit={(values, formikHelpers) => {
          myValues = values;
          myInjectedProp = formikHelpers.props.injectedProp || false;
        }}
      />
    );

    fireEvent.change(getByTestId('name-input'), {
      persist: noop,
      target: {
        name: 'name',
        value: 'john',
      },
    });

    submit();

    // Assert
    expect(myValues.name).toBe('john');
    expect(myInjectedProp).toBe(true);
  });
});
