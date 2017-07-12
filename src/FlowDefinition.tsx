export type LocalizationMap = { [lang: string]: { [uuid: string]: any } };

export interface FlowDefinition {
    localization: LocalizationMap;
    language: string,
    name: string
    nodes: Node[]
    uuid: string
    _ui: UIMetaData
}

export interface Node {
    uuid: string;
    exits: Exit[];

    router?: Router;
    actions?: Action[];
    wait?: any;
}

export interface Exit {
    uuid: string;
    name?: string;
    destination_node_uuid?: string;
}

export interface Router {
    type: string;
    result_name?: string;
}

export interface Case {
    uuid: string;
    type: string;
    exit_uuid: string;
    arguments?: string[];
}

export interface SwitchRouter extends Router {
    cases: Case[];
    operand: string;
    default_exit_uuid: string;
}

export interface Action {
    type: string;
    uuid: string;
}

export interface ChangeGroup extends Action {
    groups: Group[];
}

export interface Group {
    uuid: string;
    name: string;
}

export interface SaveToContact extends Action {
    field_uuid: string
    field_name: string;
    value: string;
    created_on?: Date;
}

export interface UpdateContact extends Action {
    field_name: string;
    value: string;
}

export interface Reply extends Action {
    text: string;
    all_urns?: boolean;
}

export interface SetLanguage extends Action {
    language: string;
}

export interface SendEmail extends Action {
    subject: string,
    body: string,
    emails: string[]
}

export interface SaveFlowResult extends Action {
    result_name: string;
    value: string;
    category: string;
}

export interface Webhook extends Action {
    url: string;
    method: string;
    body?: string;
    headers?: { [name: string]: string };
}

export interface StartFlow extends Action {
    flow_name: string;
    flow_uuid: string;
}

export interface UIMetaData {
    nodes: { [key: string]: UINode };
    languages: { [iso: string]: string };
}

export interface Position {
    x: number;
    y: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface UINode {
    position: Position;
    dimensions?: Dimensions;

    // ui type, used for split by expression, contact field, etc
    type?: string
}

export interface UIMetaData {
    nodes: { [key: string]: UINode };
}

