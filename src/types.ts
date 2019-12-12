/**
 * Dumbed down version of Formik state tree
 */
export interface FormState<Values> {
    /** Form values */
    values: Values;
}

/**
 * Dumbed down version of Formik state helpers
 */
export interface FormHelpers {
    /** Set value of form field directly */
    setFieldValue(field: string, value: any, shouldValidate?: boolean): void;
}

/**
 * Dumbed down version of Formik form event handlers
 */
export interface FormHandlers {
    /** Classic React change handler, keyed by input name */
    handleChange(e: React.ChangeEvent<any>): void;
    /** Preact-like linkState. Will return a handleChange function.  */
    handleChange<T = string | React.ChangeEvent<any>>(
        field: T
    ): T extends React.ChangeEvent<any>
        ? void
        : ((e: string | React.ChangeEvent<any>) => void);
}

/**
 */
export interface SharedProps<T, Value> {

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
    /**
     * Receive changed value of a component
     */
    onChange?: (value: Value) => void;
    /**
     * Initial value or value
     */
    value?: Value;
}

/**
 * 
 */
export interface ArrayHelpers<Value> {
    /** Imperatively add a value to the end of an array */
    push: (obj: Value) => void;
    /** Imperatively swap two values in an array */
    swap: (indexA: number, indexB: number) => void;
    /** Imperatively move an element in an array to another index */
    move: (from: number, to: number) => void;
    /** Imperatively insert an element at a given index into the array */
    insert: (index: number, value: Value) => void;
    /** Imperatively replace a value at an index of an array  */
    replace: (index: number, value: Value) => void;
    unshift: (value: Value) => number;
    /** Imperatively remove and element at an index of an array */
    remove(index: number): Value | undefined;
}

/**
 * Values of fields in the form
 */
export interface FormValues {
    [field: string]: any;
}

/**
 * State, handlers, and helpers made available to form component or render prop
 * of <Formik/>.
 */
export type FormProps<Values> =
    FormState<Values> &
    FormHelpers &
    FormHandlers;
