import Constants from './constants';
import { Language } from '../component/LanguageSelector';
import { FlowDefinition } from '../flowTypes';
import { UpdateFlows, UpdateDependencies } from './actionTypes';
import {
    UpdateTranslating,
    UpdateLanguage,
    UpdateFetchingFlow,
    UpdateDefinition,
    UpdateNodeDragging
} from './actionTypes';
import { Flows } from './initialState';

export const updateTranslating = (translating: boolean): UpdateTranslating => ({
    type: Constants.UPDATE_TRANSLATING,
    payload: {
        translating
    }
});

export const updateLanguage = (language: Language): UpdateLanguage => ({
    type: Constants.UPDATE_LANGUAGE,
    payload: {
        language
    }
});

export const updateFetchingFlow = (fetchingFlow: boolean): UpdateFetchingFlow => ({
    type: Constants.UPDATE_FETCHING_FLOW,
    payload: {
        fetchingFlow
    }
});

export const updateDefinition = (definition: FlowDefinition): UpdateDefinition => ({
    type: Constants.UPDATE_DEFINITION,
    payload: {
        definition
    }
});

export const updateNodeDragging = (nodeDragging: boolean): UpdateNodeDragging => ({
    type: Constants.UPDATE_NODE_DRAGGING,
    payload: {
        nodeDragging
    }
});

export const updateFlows = (flows: Flows): UpdateFlows => ({
    type: Constants.UPDATE_FLOWS,
    payload: {
        flows
    }
});

export const updateDependencies = (dependencies: FlowDefinition[]): UpdateDependencies => ({
    type: Constants.UPDATE_DEPENDENCIES,
    payload: {
        dependencies
    }
});
