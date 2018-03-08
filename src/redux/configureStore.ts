import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';
import initialState from './initialState';

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
