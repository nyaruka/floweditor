import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import initialState from './initialState';
import rootReducer from './reducers';

export default (state = initialState) => {
    // prettier-ignore
    const store = createStore(
        rootReducer,
        state,
        composeWithDevTools(
            applyMiddleware(thunk)
        )
    );

    if (module.hot) {
        module.hot.accept('./reducers', () => {
            const { default: nextRootReducer } = require('./reducers');
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
};
