export interface FlowDefinition {
    localization: { [lang: string]: { [uuid: string]: any } };
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
    destination?: string;
}

export interface Router {
    type: string;
}

export interface Case {
    uuid: string;
    type: string;
    exit: string;
    arguments?: string[];
}

export interface SwitchRouter extends Router {
    name?: string;
    cases: Case[];
    operand: string;
    default: string;
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
    name: string;
    value: string;
    field: string;
}

export interface SendMessage extends Action {
    text: string;
}

export interface SetLanguage extends Action {
    language: string;
}

export interface SendEmail extends Action {
    subject: string,
    body: string,
    emails: string[]
}

export interface Webhook extends Action {
    url: string;
    method: string;
}


export interface UIMetaData {
    nodes: { [key: string]: UINode };
}

export interface Position {
    x: number;
    y: number;
}

export interface UINode {
    position: Position;

    // ui type, used for split by expression, contact field, etc
    type?: string
}

export interface UIMetaData {
    nodes: { [key: string]: UINode };
}

