export interface ILocalizationMap {
    [lang: string]: {
        [uuid: string]: any;
    };
}

export interface IFlowDefinition {
    localization: ILocalizationMap;
    language: string;
    name: string;
    nodes: INode[];
    uuid: string;
    _ui: IUIMetaData;
}

export interface INode {
    uuid: string;
    exits: IExit[];

    router?: IRouter;
    actions?: IAction[];
    wait?: any;
}

export interface IExit {
    uuid: string;
    name?: string;
    destination_node_uuid?: string;
}

export interface IRouter {
    type: string;
    result_name?: string;
}

export interface ICase {
    uuid: string;
    type: string;
    exit_uuid: string;
    arguments?: string[];
}

export interface ISwitchRouter extends IRouter {
    cases: ICase[];
    operand: string;
    default_exit_uuid: string;
}

export interface IGroup {
    uuid: string;
    name: string;
}

export interface IAction {
    type: string;
    uuid: string;
}

export interface IChangeGroup extends IAction {
    groups: IGroup[];
}
export interface ISaveToContact extends IAction {
    field_uuid: string;
    field_name: string;
    value: string;
    created_on?: Date;
}

export interface IUpdateContact extends ISaveToContact {
    field_name: string;
    value: string;
}

export interface IReply extends IAction {
    text: string;
    all_urns?: boolean;
}

export interface ISetLanguage extends IAction {
    language: string;
}

export interface ISendEmail extends IAction {
    subject: string;
    body: string;
    emails: string[];
}

export interface ISaveFlowResult extends IAction {
    result_name: string;
    value: string;
    category?: string;
}

export interface IHeaders {
    [name: string]: string;
}

export interface ICallWebhook extends IAction {
    url: string;
    method: string;
    body?: string;
    headers?: IHeaders;
}

export interface IStartFlow extends IAction {
    flow_name: string;
    flow_uuid: string;
}

export interface IUIMetaData {
    nodes: { [key: string]: IUINode };
    languages: { [iso: string]: string };
}

export interface IPosition {
    x: number;
    y: number;
}

export interface IDimensions {
    width: number;
    height: number;
}

export interface IUINode {
    position: IPosition;
    dimensions?: IDimensions;

    // ui type, used for split by expression, contact field, etc
    type?: string;
}

export interface IUIMetaData {
    nodes: { [key: string]: IUINode };
}

export type TAnyAction =
    | IAction
    | IChangeGroup
    | ISaveToContact
    | ISaveFlowResult
    | IReply
    | ISetLanguage
    | ISendEmail
    | ICallWebhook
    | IStartFlow;
