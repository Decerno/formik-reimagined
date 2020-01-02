/**
 * Dumbed down version of Formik state tree
 */
export interface FormikReimaginedState<Values> {
  /** if errors are set using dispatch */
  errorsSet?: boolean;
  /** Values */
  values: Values;
  /** map of field names to specific error for that field */
  errors: FormikReimaginedErrors<Values>;
}

/**
 * A map containing error messages whose keys correspond to FormikValues.
 */
export type FormikReimaginedErrors<Values> = Map<keyof Values, string>;

/**
 * Dumbed down version of Formik state helpers
 */
export interface FormikReimaginedHelpers {
  /** Set value of form field directly */
  setFieldValue(field: string, value: any): void;
}

/**
 * Dumbed down version of Formik form event handlers
 */
export interface FormikReimaginedHandlers<Values> {
  /** Classic React change handler, keyed by input name */
  handleChange(e: React.ChangeEvent<any>): void;
  /** */
  onChange?(values: Values): void;
}

/**
 * Values of fields in the form
 */
export interface FormikReimaginedValues {
  [field: string]: any;
}

export type ComponentClassOrStatelessComponent<P> =
  | React.ComponentClass<P>
  | React.StatelessComponent<P>;

export interface FormikReimaginedComponentDecorator<TOwnProps, TMergedProps> {
  (
    component: ComponentClassOrStatelessComponent<TMergedProps>
  ): React.ComponentType<TOwnProps>;
}
