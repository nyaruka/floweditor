export enum FlowTypes {
  MESSAGING = 'messaging',
  MESSAGING_BACKGROUND = 'messaging_background',
  MESSAGING_OFFLINE = 'messaging_offline',
  VOICE = 'voice',
  NONE = '-'
}

export enum ContactStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  STOPPED = 'stopped',
  ARCHIVED = 'archived'
}

export enum Types {
  execute_actions = 'execute_actions',
  add_contact_urn = 'add_contact_urn',
  add_contact_groups = 'add_contact_groups',
  add_input_labels = 'add_input_labels',
  remove_contact_groups = 'remove_contact_groups',
  set_contact_channel = 'set_contact_channel',
  set_contact_field = 'set_contact_field',
  set_contact_name = 'set_contact_name',
  set_contact_language = 'set_contact_language',
  set_contact_status = 'set_contact_status',
  set_run_result = 'set_run_result',
  call_classifier = 'call_classifier',
  call_resthook = 'call_resthook',
  call_webhook = 'call_webhook',
  open_ticket = 'open_ticket',
  send_msg = 'send_msg',
  send_email = 'send_email',
  send_broadcast = 'send_broadcast',
  enter_flow = 'enter_flow',
  start_session = 'start_session',
  transfer_airtime = 'transfer_airtime',
  split_by_airtime = 'split_by_airtime',
  split_by_expression = 'split_by_expression',
  split_by_contact_field = 'split_by_contact_field',
  split_by_run_result = 'split_by_run_result',
  split_by_run_result_delimited = 'split_by_run_result_delimited',
  split_by_groups = 'split_by_groups',
  split_by_intent = 'split_by_intent',
  split_by_random = 'split_by_random',
  split_by_resthook = 'split_by_resthook',
  split_by_ticket = 'split_by_ticket',
  split_by_scheme = 'split_by_scheme',
  split_by_subflow = 'split_by_subflow',
  split_by_webhook = 'split_by_webhook',
  wait_for_response = 'wait_for_response',
  wait_for_menu = 'wait_for_menu',
  wait_for_dial = 'wait_for_dial',
  wait_for_digits = 'wait_for_digits',
  wait_for_audio = 'wait_for_audio',
  wait_for_video = 'wait_for_video',
  wait_for_location = 'wait_for_location',
  wait_for_image = 'wait_for_image',
  missing = 'missing',
  say_msg = 'say_msg',
  play_audio = 'play_audio'
}

export enum Operators {
  has_any_word = 'has_any_word',
  has_all_words = 'has_all_words',
  has_phrase = 'has_phrase',
  has_only_phrase = 'has_only_phrase',
  has_beginning = 'has_beginning',
  has_text = 'has_text',
  has_date = 'has_date',
  has_date_lt = 'has_date_lt',
  has_date_eq = 'has_date_eq',
  has_date_gt = 'has_date_gt',
  has_time = 'has_time',
  has_number = 'has_number',
  has_number_between = 'has_number_between',
  has_number_lt = 'has_number_lt',
  has_number_lte = 'has_number_lte',
  has_number_eq = 'has_number_eq',
  has_number_gte = 'has_number_gte',
  has_number_gt = 'has_number_gt',
  has_run_status = 'has_run_status',
  has_only_text = 'has_only_text',
  has_group = 'has_group',
  has_phone = 'has_phone',
  has_email = 'has_email',
  has_value = 'has_value',
  has_district = 'has_district',
  has_state = 'has_state',
  has_ward = 'has_ward',
  has_pattern = 'has_pattern',
  has_error = 'has_error',
  has_intent = 'has_intent',
  has_top_intent = 'has_top_intent',
  has_category = 'has_category'
}

export enum FeatureFilter {
  HAS_RESTHOOK = 'resthook',
  HAS_WHATSAPP = 'whatsapp',
  HAS_AIRTIME = 'airtime',
  HAS_CLASSIFIER = 'classifier',
  HAS_TICKETER = 'ticketer',
  HAS_FACEBOOK = 'facebook'
}

export interface FlowTypeVisibility {
  visibility?: FlowTypes[];
  filter?: FeatureFilter;
}

export enum PopTabType {
  SIMULATOR = 'Simulator',
  REVISION_HISTORY = 'Revision History',
  ISSUES_TAB = 'Issues Tab',
  TRANSLATOR_TAB = 'Translator Tab'
}

export interface Type extends FlowTypeVisibility {
  type: Types;
  name: string;
  description: string;
  component?: any;
  form?: React.ComponentClass<any>;
  aliases?: string[];
  localization?: React.ComponentClass<any>;
  localizeableKeys?: string[];

  // opportunity to massage our object for display
  massageForDisplay?: (obj: any) => void;
}

export interface Operator extends FlowTypeVisibility {
  type: Operators;
  verboseName: string;
  operands: number;
  categoryName?: string;
}

export interface OperatorMap {
  [propName: string]: Operator;
}

export const VISIBILITY_MESSAGING = [
  FlowTypes.MESSAGING,
  FlowTypes.MESSAGING_BACKGROUND,
  FlowTypes.MESSAGING_OFFLINE
];
export const VISIBILITY_MESSAGING_INTERACTIVE = [FlowTypes.MESSAGING, FlowTypes.MESSAGING_OFFLINE];
export const VISIBILITY_VOICE = [FlowTypes.VOICE];
export const VISIBILITY_ONLINE = [
  FlowTypes.MESSAGING,
  FlowTypes.MESSAGING_BACKGROUND,
  FlowTypes.VOICE
];
export const VISIBILITY_INTERACTIVE = [
  FlowTypes.MESSAGING,
  FlowTypes.MESSAGING_OFFLINE,
  FlowTypes.VOICE
];
export const VISIBILITY_SURVEYOR = [FlowTypes.MESSAGING_OFFLINE];
export const VISIBILITY_HIDDEN = [FlowTypes.NONE];
