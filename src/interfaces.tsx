import FlowLoaderComp from './components/FlowLoaderComp'
import NodeComp from './components/NodeComp'
import Renderer from './components/Renderer';
import FlowMutator from './components/FlowMutator';

export interface FlowContext {
    flow: FlowLoaderComp;
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
    
    mutator?: FlowMutator;

    // creating a new node from dragging
    draggedFrom?: DragPoint;

    // node to add a new action to 
    addToNode?: string;

    // location to create new nodes
    newPosition?: LocationProps;
}

export interface ActionProps extends NodeEditorProps {
    dragging?: boolean;
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
}

export interface NodeProps {
    uuid: string;
    exits: ExitProps[];
    
    router?: any;
    actions?: ActionProps[];
    wait?: any;
    _ui?: UINode;

    // hook for updating the flow
    mutator?: FlowMutator;

    // a ghost node dragged from somewhere
    draggedFrom?: DragPoint

    // a connection that needs to be wired on mounting
    pendingConnection?: DragPoint;

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
    renderer: {new(props: NodeEditorProps): Renderer};
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
    extraResult?: boolean
}

export interface ContactFieldResult extends SearchResult {
    key?: string
}