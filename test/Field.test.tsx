import * as React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import isFunction from 'lodash.isfunction';
import {
  Field,
  FastField,
  withFormikReimagined,
  FormikReimagined,
  FormikReimaginedErrors,
  FieldRenderProps,
} from '../src';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

interface Values {
  name: string;
  email: string;
}

const initialValues: Values = { name: 'jared', email: 'jared@example.com' };

const Formik = withFormikReimagined<{ initialValues: Values }, Values>({
  mapPropsToValues: (props) => props.initialValues,
  validate: (values) => {
    const errors: FormikReimaginedErrors = new Map();
    if (!values.name) {
      errors.set('name', 'Required');
    }
    return errors;
  },
})(FormikReimagined);

const TestForm: React.FC<any> = (p) => (
  <Formik initialValues={initialValues} {...p} />
);

describe('<Field /> & <FastField />', () => {
  const node = document.createElement('div');
  let root: Root;

  beforeEach(() => {
    root = createRoot(node);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
  });

  function render(element: React.ReactNode) {
    act(() => {
      root.render(element);
    });
  }

  it('renders component with field props', () => {
    let fieldProps: FieldRenderProps | undefined;
    const TestComponent = (props: any) => {
      fieldProps = props;
      return null;
    };

    render(
      <TestForm>
        {() => <Field name="name" component={TestComponent} />}
      </TestForm>
    );

    expect(fieldProps!.name).toBe('name');
    expect(fieldProps!.value).toBe('jared');
    expect(fieldProps!.touched).toBe(false);
    expect(isFunction(fieldProps!.onChange)).toBeTruthy();
    expect(isFunction(fieldProps!.setValue)).toBeTruthy();
  });

  it('renders with render callback with field props', () => {
    render(
      <TestForm>
        {() => (
          <Field
            name="email"
            render={(props: FieldRenderProps) => {
              expect(props.value).toBe('jared@example.com');
              return null;
            }}
          />
        )}
      </TestForm>
    );
  });

  it('renders with "children as a function" with field props', () => {
    render(
      <TestForm>
        {() => (
          <Field name="email">
            {(props: FieldRenderProps) => {
              expect(props.value).toBe('jared@example.com');
              return null;
            }}
          </Field>
        )}
      </TestForm>
    );
  });

  it('binds value via onChange', () => {
    let formikBag: any;
    let fieldProps: FieldRenderProps | undefined;
    render(
      <TestForm>
        {(props: any) => {
          formikBag = props;
          return (
            <Field
              name="name"
              render={(p: FieldRenderProps) => {
                fieldProps = p;
                return null;
              }}
            />
          );
        }}
      </TestForm>
    );

    act(() => {
      fieldProps!.onChange({
        target: { name: 'name', value: 'brian' },
      } as React.ChangeEvent<any>);
    });

    expect(formikBag.values.name).toBe('brian');
  });

  it('sets value imperatively via setValue', () => {
    let formikBag: any;
    let fieldProps: FieldRenderProps | undefined;
    render(
      <TestForm>
        {(props: any) => {
          formikBag = props;
          return (
            <Field
              name="name"
              render={(p: FieldRenderProps) => {
                fieldProps = p;
                return null;
              }}
            />
          );
        }}
      </TestForm>
    );

    act(() => {
      fieldProps!.setValue('andrea');
    });

    expect(formikBag.values.name).toBe('andrea');
  });

  it('surfaces errors from the error map', () => {
    let fieldProps: FieldRenderProps | undefined;
    render(
      <TestForm>
        {() => {
          return (
            <Field
              name="name"
              render={(p: FieldRenderProps) => {
                fieldProps = p;
                return null;
              }}
            />
          );
        }}
      </TestForm>
    );

    act(() => {
      fieldProps!.onChange({
        target: { name: 'name', value: '' },
      } as React.ChangeEvent<any>);
    });

    expect(fieldProps!.error).toBe('Required');
  });

  it('tracks touched state', () => {
    let fieldProps: FieldRenderProps | undefined;
    render(
      <TestForm>
        {() => (
          <Field
            name="name"
            render={(p: FieldRenderProps) => {
              fieldProps = p;
              return null;
            }}
          />
        )}
      </TestForm>
    );

    expect(fieldProps!.touched).toBe(false);

    act(() => {
      fieldProps!.onChange({
        target: { name: 'name', value: 'brian' },
      } as React.ChangeEvent<any>);
    });

    expect(fieldProps!.touched).toBe(true);
  });

  describe('<FastField />', () => {
    it('binds value via onChange', () => {
      let formikBag: any;
      let fieldProps: FieldRenderProps | undefined;
      render(
        <TestForm>
          {(props: any) => {
            formikBag = props;
            return (
              <FastField
                name="name"
                render={(p: FieldRenderProps) => {
                  fieldProps = p;
                  return null;
                }}
              />
            );
          }}
        </TestForm>
      );

      act(() => {
        fieldProps!.onChange({
          target: { name: 'name', value: 'brian' },
        } as React.ChangeEvent<any>);
      });

      expect(formikBag.values.name).toBe('brian');
    });

    it('does not re-render when an unrelated field changes', () => {
      let nameRenderCount = 0;
      let emailRenderCount = 0;
      let emailProps: FieldRenderProps | undefined;

      const NameField = (p: any) => {
        nameRenderCount++;
        return <span>{p.value}</span>;
      };
      const EmailField = (p: any) => {
        emailRenderCount++;
        emailProps = p;
        return <span>{p.value}</span>;
      };

      render(
        <TestForm>
          {() => (
            <>
              <FastField name="name" component={NameField} />
              <FastField name="email" component={EmailField} />
            </>
          )}
        </TestForm>
      );

      const nameRendersAfterMount = nameRenderCount;
      expect(nameRendersAfterMount).toBeGreaterThan(0);

      act(() => {
        emailProps!.onChange({
          target: { name: 'email', value: 'changed@example.com' },
        } as React.ChangeEvent<any>);
      });

      // The email field re-rendered with its new value...
      expect(emailRenderCount).toBeGreaterThan(1);
      // ...but the unrelated name field did not re-render.
      expect(nameRenderCount).toBe(nameRendersAfterMount);
    });
  });
});
