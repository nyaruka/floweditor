import { createStore, applyMiddleware } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';
import rootReducer from './reducers';
import initialState from './initialState';

export default (state = initialState) => {
    const store = createStore(rootReducer, state, devToolsEnhancer({}));
    if (module.hot) {
        module.hot.accept('./reducers', () => {
            const { default: nextRootReducer } = require('./reducers');
            store.replaceReducer(nextRootReducer);
        });
    }
    return store;
};
