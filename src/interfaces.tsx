import { FlowLoader } from './components/FlowLoader'
import { NodeComp } from './components/Node'
import { Node, Position, Action } from './FlowDefinition';
import { TypeConfig } from './services/Config';

export interface FlowContext {
    eventHandler: FlowEventHandler;
    endpoints: Endpoints;
    getContactFields(): ContactFieldResult[];
    getGroups(): SearchResult[];
}

export interface EditableProps {
    initial: any;
    type: string;
    uuid: string;
    context: FlowContext;
}

export interface FlowEventHandler {
    onRemoveAction(props: Action): void;
    onNodeMoved(nodeUUID: string, position: Position): void;
    onAddAction(nodeUUID: string): void;
    onRemoveNode(props: Node): void;
    onEditNode(props: EditableProps): void;
    onNodeMounted(props: Node): void;
    onAddContactField(field: ContactFieldResult): void;
    onAddGroup(group: SearchResult): void;
}

export interface Endpoints {
    fields: string;
    groups: string;
    engine: string;
    contacts: string;
    flows: string;
}

export interface ContactField {
    uuid: string;
    name: string;
}

export interface Group {
    uuid: string;
    name: string;
}



export interface NodeEditorState { }

export interface NodeEditorProps {
    type: string;
    uuid: string;
    context: FlowContext;
    config?: TypeConfig;
}

export interface ActionProps extends NodeEditorProps {
    dragging: boolean;
}

export interface ChangeGroupProps extends ActionProps {
    groups: GroupProps[];
}

export interface GroupProps {
    uuid: string;
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

export interface SendEmailProps extends ActionProps {
    subject: string,
    body: string,
    emails: string[]
}

export interface WebhookProps extends ActionProps {
    url: string;
    method: string;
}

export interface RouterProps extends NodeEditorProps {
    type: string;
    name?: string;
}

export interface SwitchRouterState extends NodeEditorState { }
export interface RandomRouterProps extends RouterProps { }

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