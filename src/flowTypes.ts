import { Methods } from 'components/flow/routers/webhook/helpers';
import { FlowTypes, Operators, Types, ContactStatus } from 'config/interfaces';
import { ExclusionsCheckboxEntry } from 'store/nodeEditor';

// we don't concern ourselves with patch versions
export const SPEC_VERSION = '13.2';

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
  recents: string;
  fields: string;
  globals: string;
  groups: string;
  recipients: string;
  contacts: string;
  flows: string;
  revisions: string;
  activity: string;
  labels: string;
  optins: string;
  channels: string;
  classifiers: string;
  ticketers: string;
  users: string;
  topics: string;
  environment: string;
  languages: string;
  templates: string;
  simulateStart: string;
  simulateResume: string;
  editor: string;
}

export interface FlowEditorConfig {
  localStorage: boolean;
  endpoints: Endpoints;
  flow: string;
  flowType: FlowTypes;
  showTemplates?: boolean;
  showDownload?: boolean;
  mutable?: boolean;
  debug?: boolean;
  path?: string;
  headers?: any;
  brand: string;

  onLoad?: () => void;
  onActivityClicked?: (uuid: string) => void;
  onChangeLanguage?: (code: string, name: string) => void;

  // help links
  help: { [key: string]: string };

  // whether to force a save on load
  forceSaveOnLoad?: boolean;

  filters?: string[];
}

export interface LocalizationMap {
  [lang: string]: {
    [uuid: string]: any;
  };
}

export interface Result {
  key: string;
  name: string;
  categories: string[];
  node_uuids: string[];
}

export enum DependencyType {
  channel = 'channel',
  classifier = 'classifier',
  contact = 'contact',
  field = 'field',
  flow = 'flow',
  group = 'group',
  label = 'label',
  template = 'template'
}

export interface Dependency {
  uuid?: string;
  key?: string;
  name: string;
  type: DependencyType;
  missing?: boolean;
  nodes: { [uuid: string]: string[] };
}

export interface FlowMetadata {
  dependencies: Dependency[];
  waiting_exit_uuids: string[];
  results: Result[];
  parent_refs: string[];
}

export enum FlowIssueType {
  MISSING_DEPENDENCY = 'missing_dependency',
  LEGACY_EXTRA = 'legacy_extra',
  INVALID_REGEX = 'invalid_regex'
}

export interface User {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  created_on?: string;
}

export interface Topic {
  uuid: string;
  name: string;
  created_on?: string;
}

export interface FlowIssue {
  type: FlowIssueType;
  node_uuid: string;
  action_uuid: string;
  description: string;
  dependency?: Dependency;
  language?: string;
  regex?: string;
}

export interface FlowDetails {
  definition: FlowDefinition;
  issues: FlowIssue[];
  metadata: FlowMetadata;
}

export interface FlowDefinition {
  localization: LocalizationMap;
  language: string;
  name: string;
  nodes: FlowNode[];
  uuid: string;
  type: FlowTypes;
  revision: number;
  spec_version: string;
  _ui: UIMetaData;
}

export interface FlowNode {
  uuid: string;
  actions: Action[];
  exits: Exit[];
  router?: Router;
}

export interface Exit {
  uuid: string;
  destination_uuid?: string;
}

export enum RouterTypes {
  switch = 'switch',
  random = 'random'
}

export interface Router {
  type: RouterTypes;
  result_name?: string;
  categories: Category[];
  wait?: Wait;
}

export interface Channel {
  uuid: string;
  name: string;
}

export interface Case {
  uuid: string;
  type: Operators;
  category_uuid: string;
  arguments?: string[];
  omit_operand?: boolean;
}

export interface Category {
  uuid: string;
  name: string;
  exit_uuid: string;
}

export interface TemplateTranslation {
  language: string;
  status: string;
  content: string;
}

export interface Template {
  created_on: Date;
  modified_on: Date;
  translations: TemplateTranslation[];
}

export interface SwitchRouter extends Router {
  cases: Case[];
  operand: string;
  default_category_uuid: string;
}

export enum WaitTypes {
  msg = 'msg',
  dial = 'dial'
}

export enum HintTypes {
  digits = 'digits',
  audio = 'audio',
  image = 'image',
  video = 'video',
  location = 'location'
}

export interface Hint {
  type: HintTypes;
  count?: number;
}

export interface Timeout {
  category_uuid: string;
  seconds: number;
}

export interface Wait {
  type: WaitTypes;
  timeout?: Timeout;
  hint?: Hint;
  phone?: string;
  dial_limit_seconds?: number;
  call_limit_seconds?: number;
}

export interface ComposeAttachment {
  uuid: string;
  content_type: string;
  url: string;
  filename: string;
  size: number;
  error: string;
}

export interface Group {
  uuid?: string;
  name?: string;
  name_match?: string;
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
  name_match?: string;
}

export interface OptIn {
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

export interface SetContactStatus extends Action {
  type: Types.set_contact_status;
  status: ContactStatus;
}

export type SetContactProperty =
  | SetContactName
  | SetContactLanguage
  | SetContactChannel
  | SetContactStatus;

export type SetContactAttribute = SetContactField | SetContactProperty;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Missing extends Action {}

export interface RecipientsAction extends Action {
  contacts: Contact[];
  groups: Group[];
  legacy_vars?: string[];
}

export interface TemplateTranslation {
  channel: Channel;
  content: string;
  language: string;
  status: string;
  variable_count: number;
}

export interface TemplateOptions {
  translations: TemplateTranslation[];
}

export interface MsgTemplate {
  name: string;
  uuid: string;
}

export interface MsgTemplating {
  uuid: string;
  template: MsgTemplate;
  variables: string[];
}

export interface SendMsg extends Action {
  text: string;
  all_urns?: boolean;
  quick_replies?: string[];
  attachments?: string[];
  topic?: string;
  templating?: MsgTemplating;
}

export interface SayMsg extends Action {
  text: string;
  audio_url?: string;
}

export interface PlayAudio extends Action {
  audio_url: string;
}

export interface BroadcastMsg extends RecipientsAction {
  compose: string;
  text?: string;
  attachments?: string[];
}

export interface AddLabels extends Action {
  labels: Label[];
}

export interface RequestOptIn extends Action {
  optin: {
    uuid: string;
    name: string;
  };
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

export interface Classifier {
  uuid: string;
  name: string;
}

export interface Ticketer {
  uuid: string;
  name: string;
}

export interface TransferAirtime extends Action {
  amounts: { [name: string]: number };
  result_name: string;
}

export interface CallClassifier extends Action {
  classifier: Classifier;
  input: string;
  result_name: string;
}

export interface CallResthook extends Action {
  resthook: string;
  result_name: string;
}

export interface CallWebhook extends Action {
  url: string;
  method: Methods;
  result_name: string;
  body?: string;
  headers?: Headers;
}

export interface OpenTicket extends Action {
  ticketer: Ticketer;
  subject?: string;
  topic?: Topic;
  body: string;
  result_name: string;
  assignee?: User;
}

export interface StartFlow extends Action {
  flow: Flow;
}

export interface StartSession extends RecipientsAction {
  flow: Flow;
  create_contact?: boolean;
  contact_query?: string;
  exclusions?: ExclusionsCheckboxEntry;
}

export interface UIMetaData {
  nodes: { [key: string]: UINode };
  languages: { [iso: string]: string }[];
  translation_filters?: { categories: boolean; rules: boolean };
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

export interface UIConfig {
  [key: string]: any;
}

export interface UINode {
  position: FlowPosition;
  // ui type, used for split by expression, contact field, etc
  type?: Types;
  config?: UIConfig;
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
  | CallClassifier
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
  Status = 'status',
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
  Failure = 'Failure'
}

export enum TransferAirtimeExitNames {
  Success = 'Success',
  Failure = 'Failed'
}

export enum DialCategoryNames {
  Answered = 'Answered',
  NoAnswer = 'No Answer',
  Busy = 'Busy',
  Failure = 'Failed'
}

export enum DialStatus {
  answered = 'answered',
  noAnswer = 'no_answer',
  busy = 'busy',
  failure = 'failed'
}
