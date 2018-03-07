import Constants from './constants';
import { Language } from '../component/LanguageSelector';
import { FlowDefinition } from '../flowTypes';

interface TranslatingPayload {
    [translating: string]: boolean;
}

interface LanguagePayload {
    [language: string]: Language;
}

interface FetchingFlowPayload {
    [fetchingFlow: string]: boolean;
}

interface DefinitionPayload {
    [definition: string]: FlowDefinition;
}

interface NodeDraggingPayload {
    [nodeDragging: string]: boolean;
}

interface UpdateFlowsPayload {
    [flows: string]: Array<{ uuid: string; name: string }>;
}

interface UpdateDependenciesPayload {
    [dependencies: string]: FlowDefinition[];
}

export interface UpdateTranslating {
    type: Constants.UPDATE_TRANSLATING;
    payload: TranslatingPayload;
}

export interface UpdateLanguage {
    type: Constants.UPDATE_LANGUAGE;
    payload: LanguagePayload;
}

export interface UpdateFetchingFlow {
    type: Constants.UPDATE_FETCHING_FLOW;
    payload: FetchingFlowPayload;
}

export interface UpdateDefinition {
    type: Constants.UPDATE_DEFINITION;
    payload: DefinitionPayload;
}

export interface UpdateNodeDragging {
    type: Constants.UPDATE_NODE_DRAGGING;
    payload: NodeDraggingPayload;
}

export interface UpdateFlows {
    type: Constants.UPDATE_FLOWS;
    payload: UpdateFlowsPayload;
}

export interface UpdateDependencies {
    type: Constants.UPDATE_DEPENDENCIES;
    payload: UpdateDependenciesPayload;
}

type ActionTypes =
    | UpdateTranslating
    | UpdateLanguage
    | UpdateFetchingFlow
    | UpdateDefinition
    | UpdateNodeDragging
    | UpdateFlows
    | UpdateDependencies;

export type Dispatch = (action: ActionTypes) => void;

export default ActionTypes;
