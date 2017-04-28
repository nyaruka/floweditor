import FlowComp from './components/FlowComp'
import NodeComp from './components/NodeComp'
import Renderer from './components/Renderer';

export interface FlowContext {
    flow: FlowComp;
    node?: NodeComp;
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

export interface NodeEditorProps {
    type: string;
    uuid: string;
}

export interface ActionProps extends NodeEditorProps {
    nodeUUID: string;
}

export interface AddToGroupProps extends ActionProps {
    name: string;
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

export interface ExitProps {
    uuid: string;
    destination: string;
    name: string;

    totalExits?: number;
    first?: boolean;
}

export interface NodeProps {
    uuid: string;
    exits?: ExitProps[];
    router?: any;
    actions?: ActionProps[];
    wait?: any;
    _ui: UINode;

    // are we a ghost node
    ghost?: boolean;

    // source id pointing to us
    pendingConnection?: DragPoint;
}

/**
 * A point in the flow from which a drag is initiated
 */
export interface DragPoint {
    exitUUID: string;
    nodeUUID: string;
}

export interface TypeConfig {
    type: string;
    name: string;
    description: string;
    renderer: {new(props: NodeEditorProps, context: FlowContext): Renderer};
}

export interface FlowDefinition {
    localization:  {[lang: string]: {[uuid: string]: any}};
    nodes: NodeProps[]
    _ui: UIMetaDataProps
}

export interface SearchResult {
    name: string,
    id: string,
    type: string,
    prefix?: string,
    created?: boolean
}

export interface ContactFieldResult extends SearchResult {
    key: string
}