import { createStore, compose, combineReducers } from 'redux';
import { set, has } from 'lodash';

let store = {};
let combine = combineReducers;

function combineReducersRecurse(reducers) {
  // If this is a leaf or already combined.
  if (typeof reducers === 'function') {
    return reducers;
  }

  // If this is an object of functions, combine reducers.
  if (typeof reducers === 'object') {
    let combinedReducers = {};
    for (let key of Object.keys(reducers)) {
      combinedReducers[key] = combineReducersRecurse(reducers[key]);
    }
    return combine(combinedReducers);
  }

  // If we get here we have an invalid item in the reducer path.
  throw new Error({
    message: 'Invalid item in reducer tree',
    item: reducers
  });
}

export function createInjectStore(initialReducers, initialState = {}, enhancers = [], overrides = {}) {
  // Allow overriding the combineReducers function such as with redux-immutable.
  if (overrides.hasOwnProperty('combineReducers') && typeof overrides.combineReducers === 'function') {
    combine = overrides.combineReducers;
  }

  store = createStore(
    combineReducersRecurse(initialReducers),
    initialState,
    compose(...enhancers)
  );

  store.injectedReducers = initialReducers;

  return store;
}

export function injectReducer(key, reducer, force = false) {
  // If already set, do nothing.
  if (has(store.injectedReducers, key) || force) return;

  set(store.injectedReducers, key, reducer);
  store.replaceReducer(combineReducersRecurse(store.injectedReducers));
}
