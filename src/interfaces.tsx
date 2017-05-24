import {FlowLoader} from './components/FlowLoader'
import {Node} from './components/Node'

export interface FlowContext {
    eventHandler: FlowEventHandler;
    endpoints: Endpoints;
    getContactFields(): ContactFieldResult[];
    getGroups(): SearchResult[];
}

export interface FlowEventHandler {
    onEditNode?: Function;
    onRemoveAction?: Function;
    onNodeMoved?: Function;
    onNodeMounted?: Function;
    onRemoveNode?: Function;
    onAddAction?: Function;
    onAddContactField(field: ContactFieldResult): void;
    onAddGroup(group: SearchResult): void;
}

export interface Endpoints {
    fields: string;
    groups: string;
    engine: string;
    contacts: string;
    flow: string;
}

export interface ContactField {
    uuid: string;
    name: string;
}

export interface Group {
    uuid: string;
    name: string;
}

export interface UINode {
    position: LocationProps;
}

export interface UIMetaDataProps {
    nodes: {[key: string]: UINode};
}

export interface LocationProps {
    x: number;
    y: number;
}


export interface NodeEditorState {}

export interface NodeEditorProps {
    type: string;
    uuid: string;
    context: FlowContext;
}

export interface ActionProps extends NodeEditorProps {
    dragging: boolean;
}

export interface AddToGroupProps extends ActionProps {
    name: string;
    group: string;
}

export interface SaveToContactProps extends ActionProps {
    name: string;
    value: string;
    field: string;
}

export interface SendMessageProps extends ActionProps {
    text: string;
}

export interface SetLanguageProps extends ActionProps {
    language: string;
}

export interface WebhookProps extends ActionProps {
    url: string;
    method: string;
}

export interface RouterProps extends NodeEditorProps {
    type: string;
}

export interface CaseProps {
    uuid: string;
    type: string;
    arguments?: string[];
    exit?: string;

    exitName?: string;
    onChanged?: Function;
    moveCase?: Function;
}

export interface SwitchRouterProps extends RouterProps {
    cases: CaseProps[];
    operand: string;
    default: string;
    exits?: ExitProps[];
}

export interface SwitchRouterState extends NodeEditorState {}
export interface RandomRouterProps extends RouterProps {}

export interface ExitProps {
    uuid: string;
    name?: string;
    destination?: string;
}


export interface NodeProps {
    uuid: string;
    exits: ExitProps[];
    
    router?: any;
    actions?: ActionProps[];
    wait?: any;
    _ui?: UINode;

    ghost?: boolean;
    // a connection that needs to be wired on mounting
    pendingConnection?: DragPoint;

    context?: FlowContext    
}

/**
 * A point in the flow from which a drag is initiated
 */
export interface DragPoint {
    exitUUID: string;
    nodeUUID: string;
    onResolved?: Function;
}

export interface TypeConfig {
    type: string;
    name: string;
    description: string;
    
    form?: { new (props: NodeEditorProps): any};
    component?: { new (props: NodeEditorProps): any};
}

export interface Operator {
    type: string;
    verboseName: string;
    operands: number;
}

export interface FlowDefinition {
    localization:  {[lang: string]: {[uuid: string]: any}};
    nodes: NodeProps[]
    uuid: string
    _ui: UIMetaDataProps
    
}

export interface SearchResult {
    name: string,
    id: string,
    type: string,
    prefix?: string,
    extraResult?: boolean
}

export interface ContactFieldResult extends SearchResult {
    key?: string
}