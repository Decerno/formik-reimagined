/**
 * Dumbed down version of Formik state tree
 */
export interface FormikReimaginedState<Values> {
  /** Initial Values */
  initialValues: Values;
  /** Values */
  values: Values;
  /** map of field names to specific error for that field */
  errors: FormikReimaginedErrors;
  touched: { [field: string]: boolean };
}

/**
 * A map containing error messages whose keys correspond to FormikValues.
 */
export type FormikReimaginedErrors = Map<string, string>;

/**
 * Dumbed down version of Formik state helpers
 */
export interface FormikReimaginedHelpers<Values> {
  /** Set value of form field directly */
  setFieldValue(field: string, value: any): void;
  /** Set field as touched */
  setTouched(field: string): void;
  /** Set all values */
  setValues(values: Values): void;
  // props: Props;
}

/**
 * Used to inject outer props together with FormikReimaginedHelpers
 */
export interface FormikReimaginedPropHelpers<Props> {
  /** Outer props */
  props: Props;
}

/**
 * Dumbed down version of Formik form event handlers
 */
export interface FormikReimaginedHandlers {
  /** Classic React change handler, keyed by input name */
  handleChange(e: React.ChangeEvent<any>): void;
  /** Submit form */
  submitForm(e?: React.FormEvent<HTMLFormElement>): void;
}

/**
 * Values of fields in the form
 */
export interface FormikReimaginedValues {
  [field: string]: any;
}

/**
 * Toched fields, true means the value have been touched by user input, untouched fields are not included
 */
export interface FormikReimaginedTouched {
  [field: string]: true;
}

export type ComponentClassOrStatelessComponent<P> =
  | React.ComponentClass<P>
  | React.StatelessComponent<P>;

export interface FormikReimaginedComponentDecorator<TOwnProps, TMergedProps> {
  (
    component: ComponentClassOrStatelessComponent<TMergedProps>
  ): React.ComponentType<TOwnProps>;
}
