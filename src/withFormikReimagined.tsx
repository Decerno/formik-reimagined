import * as React from 'react';
import {
  FormikReimaginedStateContext,
  FormikReimaginedUpdateContext,
  FormikReimaginedBagContext,
} from './FormikContext';
import { useFormikReimagined } from './useFormikReimagined';
import {
  ComponentClassOrStatelessComponent,
  FormikReimaginedComponentDecorator,
  FormikReimaginedValues,
} from './types';
import { WithFormikReimaginedConfig } from './types.config';
import {
  FormikReimaginedCallbacks,
  FormikReimaginedProps,
} from './types.props';

/**
 * A public higher-order component to access the imperative API
 */
export function withFormikReimagined<
  OuterProps extends object,
  Values extends FormikReimaginedValues,
>({
  mapPropsToValues = (vanillaProps: OuterProps): Values => {
    let val: Values = {} as Values;
    for (let k in vanillaProps) {
      if (
        Object.prototype.hasOwnProperty.call(vanillaProps, k) &&
        typeof vanillaProps[k] !== 'function'
      ) {
        // @todo TypeScript fix
        (val as any)[k] = vanillaProps[k];
      }
    }
    return val as Values;
  },
  validate,
  validationSchema,
}: WithFormikReimaginedConfig<
  OuterProps,
  Values
>): FormikReimaginedComponentDecorator<
  OuterProps & FormikReimaginedCallbacks<OuterProps, Values>,
  OuterProps & FormikReimaginedProps<Values>
> {
  return function createFormik(
    Component: ComponentClassOrStatelessComponent<
      OuterProps &
        FormikReimaginedProps<Values> &
        FormikReimaginedCallbacks<OuterProps, Values>
    >
  ): React.FunctionComponent<
    OuterProps & FormikReimaginedCallbacks<OuterProps, Values>
  > {
    //
    return function CWrapped(
      props: OuterProps & FormikReimaginedCallbacks<OuterProps, Values>
    ): React.FunctionComponentElement<OuterProps> {
      const initialValues = mapPropsToValues(props);
      const { onChange, onError, onSubmit, onTouched } = props;
      const { children, ...outerProps } = props as any;

      const bag = useFormikReimagined<OuterProps, Values>({
        initialValues,
        validate,
        validationSchema,
        props: outerProps,
        onChange,
        onError,
        onSubmit,
        onTouched,
      });

      const { state, dispatch, ...injectedformikProps } = bag;

      return (
        <FormikReimaginedStateContext.Provider value={state}>
          <FormikReimaginedUpdateContext.Provider value={dispatch}>
            <FormikReimaginedBagContext.Provider value={injectedformikProps}>
              <Component {...outerProps} {...(injectedformikProps as any)}>
                {children}
              </Component>
            </FormikReimaginedBagContext.Provider>
          </FormikReimaginedUpdateContext.Provider>
        </FormikReimaginedStateContext.Provider>
      );
    };
  };
}
