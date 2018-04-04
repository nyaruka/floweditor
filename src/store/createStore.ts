import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import AppState, { initialState } from './state';
import rootReducer from './rootReducer';

export default (state: AppState = initialState) => {
    const store = createStore(rootReducer, state, composeWithDevTools(applyMiddleware(thunk)));

    /* istanbul ignore next */
    if (module.hot) {
        module.hot.accept('./rootReducer', () => {
            const { default: nextRootReducer } = require('./rootReducer');
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
};
