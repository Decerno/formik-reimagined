import {
  formikReimaginedReducer,
  formikReimaginedErrorReducer,
} from '../src/reducer';
import { FormikReimaginedErrors, FormikReimaginedState } from '../src/types';

interface Values {
  [field: string]: string;
}

const FIELD_COUNT = 1000;
const ITERATIONS = 1000;
const PERFORMANCE_BUDGET_MS = 2500;

function createValues(fieldCount: number): Values {
  const values: Values = {};
  for (let index = 0; index < fieldCount; index += 1) {
    values[`field${index}`] = `value${index}`;
  }
  return values;
}

function createState(values: Values): FormikReimaginedState<Values> {
  return {
    initialValues: values,
    values,
    errors: new Map(),
    touched: {},
  };
}

function expectUnderBudget(callback: () => FormikReimaginedState<Values>) {
  const start = performance.now();
  const state = callback();
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(PERFORMANCE_BUDGET_MS);
  return state;
}

describe('reducer performance', () => {
  it('updates large value maps within the performance budget', () => {
    let state = createState(createValues(FIELD_COUNT));

    state = expectUnderBudget(() => {
      for (let index = 0; index < ITERATIONS; index += 1) {
        state = formikReimaginedReducer(state, {
          type: 'SET_FIELD_VALUE',
          payload: {
            field: `field${index % FIELD_COUNT}`,
            value: `changed${index}`,
          },
        });
      }

      return state;
    });

    expect(state.values.field0).toBe('changed0');
    expect(state.values.field999).toBe('changed999');
    expect(state.touched.field0).toBe(true);
    expect(state.touched.field999).toBe(true);
  });

  it('updates large value maps with validation within the performance budget', () => {
    let state = createState(createValues(FIELD_COUNT));
    const reducer = formikReimaginedErrorReducer<Values>(undefined, values => {
      const errors: FormikReimaginedErrors = new Map();
      if (values.field0.length === 0) {
        errors.set('field0', 'required');
      }
      return errors;
    });

    state = expectUnderBudget(() => {
      for (let index = 0; index < ITERATIONS; index += 1) {
        state = reducer(state, {
          type: 'SET_FIELD_VALUE',
          payload: {
            field: `field${index % FIELD_COUNT}`,
            value: `changed${index}`,
          },
        });
      }

      return state;
    });

    expect(state.errors).toEqual(new Map());
    expect(state.values.field0).toBe('changed0');
    expect(state.values.field999).toBe('changed999');
  });
});
