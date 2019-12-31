import * as R from 'ramda';

/** Return multi select values based on an array of options */
function getSelectedValues(options: any[]) {
  return Array.from(options)
    .filter(el => el.selected)
    .map(el => el.value);
}

/** Return the next value for a checkbox */
function getValueForCheckbox(
  currentValue: string | any[],
  checked: boolean,
  valueProp: any
) {
  // eslint-disable-next-line eqeqeq
  if (valueProp == 'true' || valueProp == 'false') {
    return !!checked;
  }

  if (checked && valueProp) {
    return Array.isArray(currentValue)
      ? currentValue.concat(valueProp)
      : [valueProp];
  }
  if (!Array.isArray(currentValue)) {
    return !currentValue;
  }
  const index = currentValue.indexOf(valueProp);
  if (index < 0) {
    return currentValue;
  }
  return currentValue.slice(0, index).concat(currentValue.slice(index + 1));
}
function getIn(state: any, field: string): string | any[] {
  return R.view(R.lensProp(field), state);
}
/**
 * Execute change
 * @param state the current state
 * @param setFieldValue Set form fields by name (i.e. set the state property)
 * @param event the react change event
 */
export const executeChange = (
  state: any,
  setFieldValue: { (field: string, value: any): void },
  event: React.ChangeEvent<any>
) => {
  let field = null;
  let val = event;
  let parsed;
  // If we can, persist the event
  // @see https://reactjs.org/docs/events.html#event-pooling
  if ((event as React.ChangeEvent<any>).persist) {
    (event as React.ChangeEvent<any>).persist();
  }
  const {
    type,
    name,
    id,
    value,
    checked,
    //outerHTML,
    options,
    multiple,
  } = (event as React.ChangeEvent<any>).target;

  field = name ? name : id;
  if (!field) {
    console.warn('Missing id or name for handle change');
    return;
  }
  val = /number|range/.test(type)
    ? ((parsed = parseFloat(value)), isNaN(parsed) ? '' : parsed)
    : /checkbox/.test(type) // checkboxes
    ? getValueForCheckbox(getIn(state, field!), checked, value)
    : !!multiple // <select multiple>
    ? getSelectedValues(options)
    : value;
  // Set form fields by name
  setFieldValue(field, val);
};
