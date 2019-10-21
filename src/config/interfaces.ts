export enum FlowTypes {
  MESSAGE = 'message',
  VOICE = 'voice',
  SURVEY = 'message_offline',
  NONE = '-'
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
  set_run_result = 'set_run_result',
  call_classifier = 'call_classifier',
  call_resthook = 'call_resthook',
  call_webhook = 'call_webhook',
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
  split_by_subflow = 'split_by_subflow',
  split_by_webhook = 'split_by_webhook',
  wait_for_response = 'wait_for_response',
  wait_for_menu = 'wait_for_menu',
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
  HAS_CLASSIFIER = 'classifier'
}

export interface FlowTypeVisibility {
  visibility?: FlowTypes[];
  filter?: FeatureFilter;
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

export const HIDDEN = [FlowTypes.NONE];
export const VOICE = [FlowTypes.VOICE];
export const SURVEY = [FlowTypes.SURVEY];
export const TEXT_TYPES = [FlowTypes.MESSAGE, FlowTypes.SURVEY];
export const ONLINE = [FlowTypes.MESSAGE, FlowTypes.VOICE];
