import * as React from 'react';

import { withFormikReimagined, FormikReimaginedProps } from '../src';
import { render } from '@testing-library/react';

interface Values {
  name: string;
}

function FormInner(props: FormikReimaginedProps<any, Values>) {
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
    handleSubmit: () => {},
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
});
