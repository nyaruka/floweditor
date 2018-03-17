import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { Type } from '../config';
import { AnyAction, FlowDefinition, Node, Position } from '../flowTypes';
import { LocalizedObject } from '../services/Localization';

export type Flows = Array<{ uuid: string; name: string }>;

export interface ComponentDetails {
    nodeUUID: string;
    nodeIdx: number;
    actionIdx?: number;
    actionUUID?: string;
    exitIdx?: number;
    exitUUID?: string;
    pointers?: string[];
    type?: string;
}

export interface Components {
    [uuid: string]: ComponentDetails;
}

export interface SearchResult {
    name: string;
    id: string;
    type?: string;
    prefix?: string;
    extraResult?: boolean;
}

export interface ContactFieldResult extends SearchResult {
    key?: string;
}

export interface CompletionOption {
    name: string;
    description: string;
}

export interface PendingConnections {
    [uuid: string]: DragPoint;
}

export interface ReduxState {
    language: Language;
    translating: boolean;
    fetchingFlow: boolean;
    definition: FlowDefinition;
    nodeDragging: boolean;
    flows: Flows;
    dependencies: FlowDefinition[];
    components: Components;
    contactFields: ContactFieldResult[];
    resultNames: CompletionOption[];
    groups: SearchResult[];
    // nodes: Node[];
    createNodePosition: Position;
    pendingConnection: DragPoint;
    pendingConnections: PendingConnections;
    // Node last added or edited, previously 'addToNode'
    freshestNode: Node;
    nodeEditorOpen: boolean;
    ghostNode: Node;
    nodeToEdit: Node;
    actionToEdit: AnyAction;
    localizations: LocalizedObject[];
    dragGroup: boolean;
    userClickingNode: boolean;
    userClickingAction: boolean;
    typeConfig: Type;
    resultName: string;
    showResultName: boolean;
    operand: string;
    userAddingAction: boolean;
}

const initialState: ReduxState = {
    translating: false,
    language: null,
    fetchingFlow: false,
    definition: null,
    nodeDragging: false,
    flows: [],
    dependencies: null,
    components: {},
    contactFields: [],
    resultNames: [],
    groups: [],
    // nodes: [],
    createNodePosition: null,
    pendingConnection: null,
    pendingConnections: {},
    freshestNode: null,
    nodeEditorOpen: false,
    ghostNode: null,
    nodeToEdit: null,
    actionToEdit: null,
    localizations: [],
    dragGroup: false,
    userClickingNode: false,
    userClickingAction: false,
    typeConfig: null,
    resultName: '',
    showResultName: false,
    operand: '',
    userAddingAction: false
};

export default initialState;
