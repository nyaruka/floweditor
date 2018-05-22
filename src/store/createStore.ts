import { applyMiddleware, createStore, Middleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import rootReducer from './rootReducer';
import AppState, { initialState } from './state';

const middlewares: Middleware[] = [thunk];

export default (state: AppState = initialState) => {
    const store = createStore(
        rootReducer,
        state,
        composeWithDevTools(applyMiddleware(...middlewares))
    );

    /* istanbul ignore next */
    if (module.hot) {
        module.hot.accept('./rootReducer', () => {
            const { default: nextRootReducer } = require('./rootReducer');
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
};
