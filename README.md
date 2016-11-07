# redux-injector
Allows dynamically injecting reducers into a redux store at runtime.

Typically when creating a redux data store all reducers are combined and then passed to the ```createStore``` function. However, this doesn't allow adding additional reducers later which can be lazy loaded or added by plugin modules. This module changes the creation of the redux store to pass in an object of reducer functions (recursively!) that are then dynamically combined. Adding a new reducer is then done with ```injectReducer``` at any time.

## Installation
Install ```redux-injector``` via npm.

```javascript
npm install --save redux-injector
```

Then with a module bundler like webpack that supports either CommonJS or ES2015 modules, use as you would anything else:
 
 ```javascript
 // using an ES6 transpiler, like babel
 import { createInjectStore } from 'redux-injector';
 
 // not using an ES6 transpiler
 var createInjectStore = require('redux-injector').createInjectStore;
 ```


## Create Inject Store
There are two parts to using redux injector.

### 1. DO NOT COMBINE reducers!
Typically reducers are combined using ```combineReducers`` up a tree to a single reducer function that is then passed to the createStore function. DO NOT DO THIS! Instead, create the exact same object tree but without combine reducers. For example:
 
 ```javascript
 let reducersObject = {
   router: routerReducerFunction,
   data: {
     user: userReducerFunction,
     auth: {
       loggedIn: loggedInReducerFunction,
       loggedOut: loggedOutReducerFunction
     },
     info: infoReducerFunction
   }
 };
 ```
 
If you do have combined reducers it is still possible to pass them to createInjectReducers but you cannot then inject into any previously combined reducers.

### 2. Use ```createInjectStore``` instead of ```createStore```
Pass the uncombined reducer tree to ```createInjectStore``` along with any other arguments you would usually pass to ```createStore```. This wraps and passes the arguments and results to ```createStore```. 

```javascript
import { createInjectStore } from 'redux-injector';

let store = createInjectStore(
  reducersObject,
  initialState
); 
```

## Injecting a new reducer.
For any store created using redux-injector, simply use ```injectReducer``` to add a new reducer.

```javascript
import { injectReducer } from 'redux-injector';

injectReducer('date.form', formReducerFunction);
```

The injector uses lodash.set so any paths that are supported by it can be used and any missing objects will be created.

## Immutable.js
Redux Injector by default uses ```combineReducers``` from redux. However, if you are using immutable.js for your states, you need to use  ```combineReducers``` from ```redux-immutable```. To do this, pass in an override at the end of the arguments with the ```combineReducers``` function.

```javascript
import { createInjectStore } from 'redux-injector';
import { combineReducers } from 'redux-immutable';

let store = createInjectStore(
  reducersObject,
  initialState,
  { combineReducers }
); 
```