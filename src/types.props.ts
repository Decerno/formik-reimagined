import {
  FormikReimaginedState,
  FormikReimaginedHandlers,
  FormikReimaginedHelpers,
  FormikReimaginedErrors,
  FormikReimaginedPropHelpers,
  FormikReimaginedTouched,
} from './types';
import { ArrayHelpers } from './types.array';

/**
 */
export interface FormikReimaginedSharedProps<T> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?: string | React.ComponentType<T | void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: (props: T) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: (props: T) => React.ReactNode;
}
/**
 * State, handlers, and helpers injected as props into the wrapped form component.
 * Used with withFormik()
 *
 * @deprecated  Use `OuterProps & FormikReimaginedProps<Values>` instead.
 */
export type InjectedFormikReimaginedProps<Props, Values> = Props &
  FormikReimaginedProps<Values>;

export interface FormikReimaginedCallbacks<Props, Values> {
  /**
   * Callback whenever state changes, second parameter are errors if any
   */
  onChange?(values: Values, errors?: FormikReimaginedErrors): void;
  /**
   * Callback whenever error values changes
   */
  onError?(errors: FormikReimaginedErrors | undefined): void;
  /**
   * Callback whenever touched values changes
   */
  onTouched?(touched: FormikReimaginedTouched | undefined): void;

  /**
   * Submission handler
   */
  onSubmit?(
    values: Values,
    formikHelpers: FormikReimaginedHelpers<Values> &
      FormikReimaginedPropHelpers<Props>
  ): void;
}

/**
 * State, handlers, and helpers made available to form component or render prop
 * of <Formik/>.
 */
export type FormikReimaginedProps<Values> = FormikReimaginedState<Values> &
  FormikReimaginedHelpers<Values> &
  FormikReimaginedHandlers;
/**
 * Render properties of field array. Accessible through render and children.
 **/
export type FieldArrayAllProps<Value> = FormikReimaginedSharedProps<
  ArrayHelpers<Value>
>;
