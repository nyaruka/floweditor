import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import AppState, { initialState } from './state';
import rootReducer from './rootReducer';

export default (state: AppState = initialState) => {
    // prettier-ignore
    const store = createStore(
        rootReducer,
        state,
        composeWithDevTools(
            applyMiddleware(thunk)
        )
    );

    if (module.hot) {
        module.hot.accept('./rootReducer', () => {
            const { default: nextRootReducer } = require('./rootReducer');
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
};
