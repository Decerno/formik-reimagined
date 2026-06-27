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
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Whether the form is currently validating */
  isValidating?: boolean;
  /** Arbitrary user supplied status */
  status?: any;
  /** Number of times the user tried to submit the form */
  submitCount?: number;
}

/**
 * A map containing error messages whose keys correspond to FormikValues.
 */
export type FormikReimaginedErrors = Map<string, string>;

/**
 * Dumbed down version of Formik state helpers
 */
export interface FormikReimaginedHelpers<Values> {
  /** Set value of form field directly, use resetInitialValues = true to reset touched and initialValues */
  setFieldValue(field: string, value: any, resetInitialValues?: boolean): void;
  /** Set field as touched */
  setTouched(field: string): void;
  /** Set all values, use resetInitialValues = true to reset touched and initialValues */
  setValues(values: Values, resetInitialValues?: boolean): void;
}

/**
 * Additional helpers that mirror the wider Formik helper surface.
 * These are layered on top of {@link FormikReimaginedHelpers}.
 */
export interface FormikReimaginedAdditionalHelpers<Values> {
  /** Set the touched state of a single field (Formik compatible) */
  setFieldTouched(field: string, touched?: boolean): void;
  /** Set the error message of a single field */
  setFieldError(field: string, message: string | undefined): void;
  /** Replace the entire error map (accepts a Map or a nested error object) */
  setErrors(errors: FormikReimaginedErrors | { [field: string]: any }): void;
  /** Set arbitrary form status */
  setStatus(status?: any): void;
  /** Set whether the form is currently submitting */
  setSubmitting(isSubmitting: boolean): void;
  /** Reset the form to its initial values (optionally to new values) */
  resetForm(nextValues?: Values): void;
  /** Imperatively run validation and resolve with the resulting error map */
  validateForm(values?: Values): Promise<FormikReimaginedErrors>;
  /** Imperatively run validation for a single field */
  validateField(field: string): Promise<FormikReimaginedErrors>;
}

/**
 * Derived/computed values made available alongside the form state.
 */
export interface FormikReimaginedComputedProps {
  /** True when current values differ from the initial values */
  dirty: boolean;
  /** True when there are no validation errors */
  isValid: boolean;
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
  /** Classic React blur handler, keyed by input name */
  handleBlur(e: React.FocusEvent<any>): void;
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
  | React.FunctionComponent<P>;

export interface FormikReimaginedComponentDecorator<TOwnProps, TMergedProps> {
  (
    component: ComponentClassOrStatelessComponent<TMergedProps>
  ): React.ComponentType<TOwnProps>;
}
