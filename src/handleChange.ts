import { FormikReimaginedMessage } from 'reducer';

/** Return multi select values based on an array of options */
function getSelectedValues(options: any[]) {
  return Array.from(options)
    .filter(el => el.selected)
    .map(el => el.value);
}

/**
 * Execute change
 * @param event the react change event
 */
export function executeChangeMsg(
  event: React.ChangeEvent<any>
): FormikReimaginedMessage<any> | undefined {
  let field = null;
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
  if (/checkbox/.test(type)) {
    return { type: 'FLIP_CB', payload: { field, checked, value } };
  }
  if (/number|range/.test(type)) {
    const nvalue = ((parsed = parseFloat(value)), isNaN(parsed) ? '' : parsed);
    return { type: 'SET_FIELD_VALUE', payload: { field, value: nvalue } };
  }
  if (!!multiple) {
    const nvalue = getSelectedValues(options);
    return { type: 'SET_FIELD_VALUE', payload: { field, value: nvalue } };
  }

  return { type: 'SET_FIELD_VALUE', payload: { field, value } };
}
