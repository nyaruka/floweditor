import { combineReducers } from 'redux';
import translating from './translating';
import language from './language';
import fetchingFlow from './fetchingFlow';
import definition from './definition';
import nodeDragging from './nodeDragging';
import flows from './flows';
import dependencies from './dependencies';

const rootReducer = combineReducers({
    translating,
    language,
    fetchingFlow,
    definition,
    nodeDragging,
    flows,
    dependencies
});

export default rootReducer;
