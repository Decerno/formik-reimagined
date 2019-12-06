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