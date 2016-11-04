'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.createInjectStore = createInjectStore;
exports.injectReducer = injectReducer;

var _redux = require('redux');

var _lodash = require('lodash');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var store = {};
var combine = _redux.combineReducers;

function combineReducersRecurse(reducers) {
  // If this is a leaf or already combined.
  if (typeof reducers === 'function') {
    return reducers;
  }

  // If this is an object of functions, combine reducers.
  if ((typeof reducers === 'undefined' ? 'undefined' : _typeof(reducers)) === 'object') {
    var combinedReducers = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(reducers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        combinedReducers[key] = combineReducersRecurse(reducers[key]);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return combine(combinedReducers);
  }

  // If we get here we have an invalid item in the reducer path.
  throw new Error({
    message: 'Invalid item in reducer tree',
    item: reducers
  });
}

function createInjectStore(initialReducers) {
  var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var enhancers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var overrides = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  // Allow overriding the combineReducers function such as with redux-immutable.
  if (overrides.hasOwnProperty('combineReducers') && typeof overrides.combineReducers === 'function') {
    combine = overrides.combineReducers;
  }

  store = (0, _redux.createStore)(combineReducersRecurse(initialReducers), initialState, _redux.compose.apply(undefined, _toConsumableArray(enhancers)));

  store.injectedReducers = initialReducers;

  return store;
}

function injectReducer(key, reducer) {
  var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  // If already set, do nothing.
  if ((0, _lodash.has)(store.injectedReducers, key) || force) return;

  (0, _lodash.set)(store.injectedReducers, key, reducer);
  store.replaceReducer(combineReducersRecurse(store.injectedReducers));
}