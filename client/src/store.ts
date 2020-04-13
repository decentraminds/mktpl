import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

import loadingReducer from './slices/loadingSlice'

const rootReducer = combineReducers( { loading: loadingReducer } )

const store = configureStore({
    reducer: rootReducer
});


export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof rootReducer>;

export default store;
