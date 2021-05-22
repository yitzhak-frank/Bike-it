import thunk from 'redux-thunk';
import { locationsRrducer } from "./locations-reducer";
import { createStore, combineReducers, applyMiddleware } from "redux";

const store = createStore(
    combineReducers({ locations: locationsRrducer }), 
    applyMiddleware(thunk)
);

export default store;