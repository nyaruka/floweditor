import {
    IsOptionUniqueHandler,
    IsValidNewOptionHandler,
    NewOptionCreatorHandler,
    PromptTextCreatorHandler
} from 'react-select';

export interface Languages {
    [iso: string]: string;
}

export interface Endpoints {
    fields: string;
    groups: string;
    engine: string;
    contacts: string;
    flows: string;
    activity: string;
}

export interface FlowEditorConfig {
    languages: { [iso: string]: string };
    endpoints: Endpoints;
    flow: string;
    path?: string;
}

export interface LocalizationMap {
    [lang: string]: {
        [uuid: string]: any;
    };
}

export interface FlowDefinition {
    localization: LocalizationMap;
    language: string;
    name: string;
    nodes: FlowNode[];
    uuid: string;
    _ui: UIMetaData;
}

export interface FlowNode {
    uuid: string;
    actions: Action[];
    exits: Exit[];
    router?: Router;
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

export enum WaitType {
    exp = 'exp',
    group = 'group',
    msg = 'msg',
    flow = 'flow'
}

export interface Wait {
    type: WaitType;
    flow_uuid?: string;
}

export interface Group {
    uuid: string;
    name: string;
}

export enum Methods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT'
}

export interface Action {
    type: string;
    uuid: string;
}

export interface ChangeGroups extends Action {
    groups: Group[];
}

export interface Field {
    key: string;
    name: string;
}

export interface SetContactField extends Action {
    field: Field;
    value: string;
}

export interface SetContactProperty extends Action {
    property: string;
    value: string;
}

export type SetContactAttribute = SetContactField | SetContactProperty;

export interface SendMsg extends Action {
    text: string;
    all_urns?: boolean;
}

export interface SetPreferredChannel extends Action {
    language: string;
}

export interface SendEmail extends Action {
    subject: string;
    body: string;
    emails: string[];
}

export interface SetRunResult extends Action {
    result_name: string;
    value: string;
    category?: string;
}

export interface Headers {
    [name: string]: string;
}

export interface CallWebhook extends Action {
    url: string;
    method: Methods;
    body?: string;
    headers?: Headers;
}

export interface StartFlow extends Action {
    flow_name: string;
    flow_uuid: string;
}

export interface UIMetaData {
    nodes: { [key: string]: UINode };
    languages: Array<{ [iso: string]: string }>;
}

export interface FlowPosition {
    left: number;
    top: number;
    right?: number;
    bottom?: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface UINode {
    position: FlowPosition;

    // ui type, used for split by expression, contact field, etc
    type?: string;
}

export interface StickyNote {
    position: FlowPosition;
    title: string;
    body: string;
}

export interface UIMetaData {
    nodes: { [key: string]: UINode };
    stickies: { [key: string]: StickyNote };
}

export type AnyAction =
    | Action
    | ChangeGroups
    | SetContactField
    | SetContactProperty
    | SetRunResult
    | SendMsg
    | SetPreferredChannel
    | SendEmail
    | CallWebhook
    | StartFlow;

export enum ContactProperties {
    UUID = 'UUID',
    'Created By' = 'Created By',
    'Modified By' = 'Modified By',
    Org = 'Org',
    Name = 'Name',
    Language = 'Language',
    Timezone = 'Timezone',
    Email = 'Email',
    Mailto = 'Mailto',
    Phone = 'Phone',
    Groups = 'Groups',
    Facebook = 'Facebook',
    Telegram = 'Telegram'
}

export enum ResultType {
    flow = 'flow',
    field = 'field',
    group = 'group',
    label = 'label'
}

export enum ValueType {
    text = 'text',
    numeric = 'numeric',
    datetime = 'datetime',
    state = 'state',
    district = 'district',
    ward = 'ward'
}

export enum AttributeType {
    property = 'property',
    field = 'field'
}

export interface CreateOptions {
    promptTextCreator?: PromptTextCreatorHandler;
    newOptionCreator?: NewOptionCreatorHandler;
    isValidNewOption?: IsValidNewOptionHandler;
    isOptionUnique?: IsOptionUniqueHandler;
    createNewOption?: NewOptionCreatorHandler;
    createPrompt?: string;
}
