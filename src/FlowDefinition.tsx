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

    router?: any;
    actions?: Action[];
    wait?: any;
}

export interface Exit {
    uuid: string;
    name?: string;
    destination?: string;
}

export interface Action {
    type: string;
    uuid: string;
}

export interface ChangeGroup extends Action {
    groups: GroupProps[];
}

export interface GroupProps {
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
}

export interface UIMetaDataProps {
    nodes: { [key: string]: UINode };
}

