import { Methods } from '~/components/flow/routers/webhook/helpers';
import { Operators } from '~/config/operatorConfigs';
import { Types } from '~/config/typeConfigs';

export interface Languages {
    [iso: string]: string;
}

export interface Language {
    name: string;
    iso: string;
}

export interface Environment {
    date_format: string;
    time_format: string;
    timezone: string;
    languages: string[];
}

export interface Endpoints {
    attachments: string;
    resthooks: string;
    fields: string;
    groups: string;
    recipients: string;
    flows: string;
    revisions: string;
    activity: string;
    labels: string;
    channels: string;
    environment: string;
    languages: string;
    simulateStart: string;
    simulateResume: string;
}

export interface FlowEditorConfig {
    localStorage: boolean;
    endpoints: Endpoints;
    flow: string;
    showDownload?: boolean;
    debug?: boolean;
    path?: string;
    headers?: any;
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
    wait?: Wait;
}

export interface Exit {
    uuid: string;
    name?: string;
    destination_node_uuid?: string;
}

export enum RouterTypes {
    switch = 'switch',
    random = 'random'
}

export interface Router {
    type: RouterTypes;
    result_name?: string;
}

export interface Channel {
    uuid: string;
    name: string;
}

export interface Case {
    uuid: string;
    type: Operators;
    exit_uuid: string;
    arguments?: string[];
}

export interface SwitchRouter extends Router {
    cases: Case[];
    operand: string;
    default_exit_uuid: string;
}

export enum WaitTypes {
    exp = 'exp',
    group = 'group',
    msg = 'msg',
    flow = 'flow'
}

export interface Wait {
    type: WaitTypes;
    timeout?: number;
}

export interface Group {
    uuid: string;
    name: string;
}

export interface Contact {
    uuid: string;
    name: string;
}

export interface ChangeGroups extends Action {
    groups: Group[];
}

export interface RemoveFromGroups extends ChangeGroups {
    all_groups: boolean;
}

export interface Field {
    key: string;
    name: string;
}

export interface Label {
    uuid: string;
    name: string;
}

export interface Flow {
    uuid: string;
    name: string;
}

export interface Action {
    type: Types;
    uuid: string;
}

export interface SetContactField extends Action {
    field: Field;
    value: string;
}

export interface SetContactName extends Action {
    type: Types.set_contact_name;
    name: string;
}

export interface SetContactLanguage extends Action {
    type: Types.set_contact_language;
    language: string;
}

export interface SetContactChannel extends Action {
    type: Types.set_contact_channel;
    channel: Channel;
}

export type SetContactProperty = SetContactName | SetContactLanguage | SetContactChannel;

export type SetContactAttribute = SetContactField | SetContactProperty;

// tslint:disable-next-line:no-empty-interface
export interface Missing extends Action {}

export interface RecipientsAction extends Action {
    contacts: Contact[];
    groups: Group[];
}

export interface SendMsg extends Action {
    text: string;
    all_urns?: boolean;
    quick_replies?: string[];
    attachments?: string[];
}

export interface BroadcastMsg extends RecipientsAction {
    text: string;
}

export interface AddLabels extends Action {
    labels: Label[];
}

export interface AddURN extends Action {
    scheme: string;
    path: string;
}

export interface SetPreferredChannel extends Action {
    language: string;
}

export interface SendEmail extends Action {
    subject: string;
    body: string;
    addresses: string[];
}

export interface SetRunResult extends Action {
    name: string;
    value: string;
    category?: string;
}

export interface Headers {
    [name: string]: string;
}

export interface TransferAirtime extends Action {
    amounts: { [name: string]: number };
}

export interface CallResthook extends Action {
    resthook: string;
}

export interface CallWebhook extends Action {
    url: string;
    method: Methods;
    body?: string;
    headers?: Headers;
}

export interface StartFlow extends Action {
    flow: Flow;
}

export interface StartSession extends RecipientsAction {
    flow: Flow;
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
    type?: Types;
    config?: { [key: string]: any };
}

export interface StickyNote {
    position: FlowPosition;
    title: string;
    body: string;
    color?: string;
}

export interface UIMetaData {
    nodes: { [key: string]: UINode };
    stickies: { [key: string]: StickyNote };
}

export type AnyAction =
    | Action
    | ChangeGroups
    | SetContactField
    | SetContactName
    | SetRunResult
    | SendMsg
    | SetPreferredChannel
    | SendEmail
    | CallWebhook
    | StartFlow
    | StartSession;

export enum ContactProperties {
    UUID = 'uuid',
    'Created By' = 'created_by',
    'Modified By' = 'modified_by',
    Org = 'org',
    Name = 'name',
    Language = 'language',
    Timezone = 'timezone',
    Channel = 'channel',
    Email = 'email',
    Mailto = 'mailto',
    Phone = 'phone',
    Groups = 'groups'
}

export enum ValueType {
    text = 'text',
    numeric = 'numeric',
    datetime = 'datetime',
    state = 'state',
    district = 'district',
    ward = 'ward'
}

export interface CreateOptions {
    promptTextCreator?: any;
    newOptionCreator?: any;
    isValidNewOption?: any;
    isOptionUnique?: any;
    createNewOption?: any;
    createPrompt?: string;
}

export enum StartFlowArgs {
    Complete = 'C',
    Expired = 'E'
}

export enum StartFlowExitNames {
    Complete = 'Complete',
    Expired = 'Expired'
}

export enum WebhookExitNames {
    Success = 'Success',
    Failure = 'Failed',
    Unreachable = 'Unreachable'
}

export enum TransferAirtimeExitNames {
    Success = 'Success',
    Failure = 'Failed'
}
