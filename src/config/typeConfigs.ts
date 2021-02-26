import AddLabelsComp from 'components/flow/actions/addlabels/AddLabels';
import AddLabelsForm from 'components/flow/actions/addlabels/AddLabelsForm';
import AddURNComp from 'components/flow/actions/addurn/AddURN';
import AddURNForm from 'components/flow/actions/addurn/AddURNForm';
import CallResthookComp from 'components/flow/actions/callresthook/CallResthook';
import CallWebhookComp from 'components/flow/actions/callwebhook/CallWebhook';
import AddGroupsForm from 'components/flow/actions/changegroups/addgroups/AddGroupsForm';
import ChangeGroupsComp from 'components/flow/actions/changegroups/ChangeGroups';
import RemoveGroupsForm from 'components/flow/actions/changegroups/removegroups/RemoveGroupsForm';
import KeyLocalizationForm from 'components/flow/actions/localization/KeyLocalizationForm';
import MsgLocalizationForm from 'components/flow/actions/localization/MsgLocalizationForm';
import MissingComp from 'components/flow/actions/missing/Missing';
import PlayAudioComp from 'components/flow/actions/playaudio/PlayAudio';
import PlayAudioForm from 'components/flow/actions/playaudio/PlayAudioForm';
import SayMsgComp from 'components/flow/actions/saymsg/SayMsg';
import SayMsgForm from 'components/flow/actions/saymsg/SayMsgForm';
import SendBroadcastComp from 'components/flow/actions/sendbroadcast/SendBroadcast';
import SendBroadcastForm from 'components/flow/actions/sendbroadcast/SendBroadcastForm';
import SendEmailComp from 'components/flow/actions/sendemail/SendEmail';
import SendEmailForm from 'components/flow/actions/sendemail/SendEmailForm';
import SendMsgComp from 'components/flow/actions/sendmsg/SendMsg';
import SendMsgForm from 'components/flow/actions/sendmsg/SendMsgForm';
import SetRunResultComp from 'components/flow/actions/setrunresult/SetRunResult';
import SetRunResultForm from 'components/flow/actions/setrunresult/SetRunResultForm';
import StartFlowComp from 'components/flow/actions/startflow/StartFlow';
import StartSessionComp from 'components/flow/actions/startsession/StartSession';
import StartSessionForm from 'components/flow/actions/startsession/StartSessionForm';
import TransferAirtimeComp from 'components/flow/actions/transferairtime/TransferAirtime';
import UpdateContactComp from 'components/flow/actions/updatecontact/UpdateContact';
import UpdateContactForm from 'components/flow/actions/updatecontact/UpdateContactForm';
import AirtimeRouterForm from 'components/flow/routers/airtime/AirtimeRouterForm';
import DialRouterForm from 'components/flow/routers/dial/DialRouterForm';
import DigitsRouterForm from 'components/flow/routers/digits/DigitsRouterForm';
import ExpressionRouterForm from 'components/flow/routers/expression/ExpressionRouterForm';
import FieldRouterForm from 'components/flow/routers/field/FieldRouterForm';
import GroupsRouterForm from 'components/flow/routers/groups/GroupsRouterForm';
import RouterLocalizationForm from 'components/flow/routers/localization/RouterLocalizationForm';
import MenuRouterForm from 'components/flow/routers/menu/MenuRouterForm';
import RandomRouterForm from 'components/flow/routers/random/RandomRouterForm';
import ResponseRouterForm from 'components/flow/routers/response/ResponseRouterForm';
import ResthookRouterForm from 'components/flow/routers/resthook/ResthookRouterForm';
import ResultRouterForm from 'components/flow/routers/result/ResultRouterForm';
import SubflowRouterForm from 'components/flow/routers/subflow/SubflowRouterForm';
import WaitRouterForm from 'components/flow/routers/wait/WaitRouterForm';
import WebhookRouterForm from 'components/flow/routers/webhook/WebhookRouterForm';
import {
  FeatureFilter,
  FlowTypes,
  Type,
  Types,
  VISIBILITY_HIDDEN,
  VISIBILITY_ONLINE,
  VISIBILITY_SURVEYOR,
  VISIBILITY_VOICE,
  VISIBILITY_INTERACTIVE,
  VISIBILITY_MESSAGING_INTERACTIVE
} from 'config/interfaces';
import { HintTypes, RouterTypes, FlowEditorConfig, SendMsg } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import CallClassifierComp from 'components/flow/actions/callclassifier/CallClassifier';
import ClassifyRouterForm from 'components/flow/routers/classify/ClassifyRouterForm';
import i18n from 'config/i18n';
import SchemeRouterForm from 'components/flow/routers/scheme/SchemeRouterForm';
import TicketRouterForm from 'components/flow/routers/ticket/TicketRouterForm';
import OpenTicketComp from 'components/flow/actions/openticket/OpenTicket';

const dedupeTypeConfigs = (typeConfigs: Type[]) => {
  const map: any = {};
  return typeConfigs.filter(config => {
    if (config.type === 'missing') {
      return false;
    }
    const { name: key } = config;
    return map[key] ? false : (map[key] = true);
  });
};

export interface TypeMap {
  [propName: string]: Type;
}

export type GetTypeConfig = (type: string) => Type;

export interface Scheme {
  scheme: string;
  name: string;
  path: string;
  excludeFromSplit?: boolean;
}

export const SCHEMES: Scheme[] = [
  {
    scheme: 'tel',
    name: i18n.t('schemes.phone.name', 'SMS'),
    path: i18n.t('schemes.phone.path', 'Phone Number')
  },
  {
    scheme: 'whatsapp',
    name: i18n.t('schemes.whatsapp.name', 'WhatsApp'),
    path: i18n.t('schemes.whatsapp.path', 'WhatsApp Number')
  },
  {
    scheme: 'facebook',
    name: i18n.t('schemes.facebook.path', 'Facebook'),
    path: i18n.t('schemes.facebook.path', 'Facebook ID')
  },
  {
    scheme: 'twitterid',
    name: i18n.t('schemes.twitterid.name', 'Twitter'),
    path: i18n.t('schemes.twitterid.path', 'Twitter ID')
  },
  {
    scheme: 'telegram',
    name: i18n.t('schemes.telegram.name', 'Telegram'),
    path: i18n.t('schemes.telegram.path', 'Telegram ID')
  },
  {
    scheme: 'viber',
    name: i18n.t('schemes.viber.name', 'Viber'),
    path: i18n.t('schemes.viber.path', 'Viber ID')
  },
  {
    scheme: 'line',
    name: i18n.t('schemes.line.name', 'Line'),
    path: i18n.t('schemes.line.path', 'Line ID')
  },
  {
    scheme: 'wechat',
    name: i18n.t('schemes.wechat.name', 'Wechat'),
    path: i18n.t('schemes.wechat.path', 'Wechat ID')
  },
  {
    scheme: 'fcm',
    name: i18n.t('schemes.firebase.name', 'Firebase'),
    path: i18n.t('schemes.firebase.path', 'Firebase ID')
  },
  {
    scheme: 'jiochat',
    name: i18n.t('schemes.jiojach.name', 'Jiochat'),
    path: i18n.t('schemes.jiochat.path', 'Jiochat ID')
  },
  {
    scheme: 'freshchat',
    name: i18n.t('schemes.freschat.name', 'Freshchat'),
    path: i18n.t('schemes.freshchat.path', 'Freshchat ID')
  },
  {
    scheme: 'mailto',
    name: i18n.t('schemes.email.name', 'Email'),
    path: i18n.t('schemes.email.path', 'Email Address'),
    excludeFromSplit: true
  },
  {
    scheme: 'twitter',
    name: i18n.t('schemes.twitter.name', 'Twitter'),
    path: i18n.t('schemes.twitter.path', 'Twitter Handle'),
    excludeFromSplit: true
  },
  {
    scheme: 'ext',
    name: i18n.t('schemes.external.name', 'External'),
    path: i18n.t('schemes.external.path', 'External ID')
  }
];

export const typeConfigList: Type[] = [
  {
    type: Types.missing,
    name: 'Missing',
    description: ' ** Unsupported ** ',
    component: MissingComp,
    visibility: VISIBILITY_HIDDEN
  },
  {
    type: Types.say_msg,
    name: i18n.t('actions.play_message.name', 'Play Message'),
    description: i18n.t('actions.play_message.description', 'Play a message'),
    form: SayMsgForm,
    localization: MsgLocalizationForm,
    localizeableKeys: ['text', 'audio_url'],
    component: SayMsgComp,
    visibility: VISIBILITY_VOICE
  },

  {
    type: Types.wait_for_menu,
    name: i18n.t('actions.wait_for_menu.name', 'Wait for Menu Selection'),
    description: i18n.t('actions.wait_for_menu.description', 'Wait for menu selection'),
    form: MenuRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    visibility: VISIBILITY_VOICE
  },
  {
    type: Types.wait_for_digits,
    name: i18n.t('actions.wait_for_digits.name', 'Wait for Digits'),
    description: i18n.t('actions.wait_for_digits.description', 'Wait for multiple digits'),
    form: DigitsRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits', 'cases'],
    visibility: VISIBILITY_VOICE
  },

  {
    type: Types.wait_for_audio,
    name: i18n.t('actions.wait_for_audio.name', 'Wait for Audio'),
    description: i18n.t('actions.wait_for_audio.description', 'Wait for an audio recording'),
    form: WaitRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    visibility: [FlowTypes.MESSAGING_OFFLINE, FlowTypes.VOICE]
  },

  {
    type: Types.wait_for_dial,
    name: i18n.t('actions.wait_for_dial.name', 'Wait for Forwarded Call'),
    description: i18n.t(
      'actions.wait_for_dial.description',
      'Wait for forwarded call to someone else'
    ),
    form: DialRouterForm,
    visibility: VISIBILITY_VOICE
  },

  {
    type: Types.send_msg,
    name: i18n.t('actions.send_msg.name', 'Send Message'),
    description: i18n.t('actions.send_msg.description', 'Send the contact a message'),
    form: SendMsgForm,
    localization: MsgLocalizationForm,
    localizeableKeys: ['text', 'quick_replies', 'templating.variables'],
    component: SendMsgComp,
    massageForDisplay: (action: SendMsg) => {
      // quick replies are optional in the definition, make sure we have
      // at least an empty array so the localization has a proper cue
      action.quick_replies = action.quick_replies || [];
    }
  },
  {
    type: Types.wait_for_response,
    name: i18n.t('actions.wait_for_response.name', 'Wait for Response'),
    description: i18n.t('actions.wait_for_response.description', 'Wait for the contact to respond'),
    form: ResponseRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['categories', 'cases'],
    aliases: [RouterTypes.switch],
    visibility: VISIBILITY_MESSAGING_INTERACTIVE
  },

  {
    type: Types.send_broadcast,
    name: i18n.t('actions.send_broadcast.name', 'Send Broadcast'),
    description: i18n.t('actions.send_broadcast.description', 'Send somebody else a message'),
    form: SendBroadcastForm,
    localization: KeyLocalizationForm,
    localizeableKeys: ['text'],
    component: SendBroadcastComp
  },
  {
    type: Types.add_input_labels,
    name: i18n.t('actions.add_input.name', 'Add Labels'),
    description: i18n.t('actions.add_input.description', 'Label the incoming message'),
    form: AddLabelsForm,
    component: AddLabelsComp,
    visibility: VISIBILITY_INTERACTIVE
  },
  {
    type: Types.add_contact_urn,
    name: i18n.t('actions.add_contact_urn.name', 'Add URN'),
    description: i18n.t('actions.add_contact_urn.description', 'Add a URN for the contact'),
    form: AddURNForm,
    component: AddURNComp
  },
  {
    type: Types.add_contact_groups,
    name: i18n.t('actions.add_contact_groups.name', 'Add to Group'),
    description: i18n.t('actions.add_contact_groups.description', 'Add the contact to a group'),
    form: AddGroupsForm,
    component: ChangeGroupsComp
  },
  {
    type: Types.remove_contact_groups,
    name: i18n.t('actions.remove_contact_groups.name', 'Remove from Group'),
    description: i18n.t(
      'actions.remove_contact_groups.description',
      'Remove the contact from a group'
    ),
    form: RemoveGroupsForm,
    component: ChangeGroupsComp
  },
  {
    type: Types.set_contact_field,
    aliases: [
      Types.set_contact_name,
      Types.set_contact_language,
      Types.set_contact_channel,
      Types.set_contact_status
    ],
    name: i18n.t('actions.set_contact_field.name', 'Update Contact'),
    description: i18n.t('actions.set_contact_field.description', 'Update the contact'),
    form: UpdateContactForm,
    component: UpdateContactComp
  },
  {
    type: Types.send_email,
    name: i18n.t('actions.send_email.name', 'Send Email'),
    description: i18n.t('actions.send_email.description', 'Send an email'),
    form: SendEmailForm,
    localization: KeyLocalizationForm,
    localizeableKeys: ['subject', 'body'],
    component: SendEmailComp,
    visibility: VISIBILITY_ONLINE
  },
  {
    type: Types.set_run_result,
    name: i18n.t('actions.set_run_result.name', 'Save Flow Result'),
    description: i18n.t('actions.set_run_result.description', 'Save a result for this flow'),
    form: SetRunResultForm,
    component: SetRunResultComp
  },

  {
    type: Types.play_audio,
    name: i18n.t('actions.play_audio.name', 'Play Recording'),
    description: i18n.t('actions.play_audio.description', 'Play a contact recording'),
    form: PlayAudioForm,
    component: PlayAudioComp,
    visibility: VISIBILITY_VOICE
  },

  {
    type: Types.call_webhook,
    name: i18n.t('actions.call_webhook.name', 'Call Webhook'),
    description: i18n.t('actions.call_webhook.description', 'Call a webhook'),
    form: WebhookRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    component: CallWebhookComp,
    aliases: [Types.split_by_webhook],
    visibility: VISIBILITY_ONLINE
  },
  {
    type: Types.call_resthook,
    name: i18n.t('actions.call_resthook.name', 'Call Zapier'),
    description: i18n.t('actions.call_resthook.description', 'Call Zapier'),
    form: ResthookRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    component: CallResthookComp,
    aliases: [Types.split_by_resthook],
    filter: FeatureFilter.HAS_RESTHOOK,
    visibility: VISIBILITY_ONLINE
  },
  {
    type: Types.enter_flow,
    name: i18n.t('actions.enter_flow.name', 'Enter a Flow'),
    description: i18n.t('actions.enter_flow.description', 'Enter another flow'),
    form: SubflowRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    component: StartFlowComp,
    aliases: [Types.split_by_subflow]
  },
  {
    type: Types.start_session,
    name: i18n.t('actions.start_session.name', 'Start Somebody Else'),
    description: i18n.t('actions.start_session.description', 'Start somebody else in a flow'),
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    form: StartSessionForm,
    component: StartSessionComp,
    visibility: VISIBILITY_ONLINE
  },
  {
    type: Types.open_ticket,
    name: i18n.t('actions.open_ticket.name', 'Open Ticket'),
    description: i18n.t('actions.open_ticket.description', 'Open a ticket with a human agent'),
    form: TicketRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    component: OpenTicketComp,
    aliases: [Types.split_by_ticket],
    visibility: VISIBILITY_ONLINE,
    filter: FeatureFilter.HAS_TICKETER
  },
  {
    type: Types.transfer_airtime,
    name: i18n.t('actions.transfer_airtime.name', 'Send Airtime'),
    description: i18n.t('actions.transfer_airtime.description', 'Send the contact airtime'),
    form: AirtimeRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    component: TransferAirtimeComp,
    aliases: [Types.split_by_airtime],
    visibility: VISIBILITY_ONLINE,
    filter: FeatureFilter.HAS_AIRTIME
  },

  /** Routers */

  {
    type: Types.wait_for_image,
    name: i18n.t('actions.wait_for_image.name', 'Wait for Image'),
    description: i18n.t('actions.wait_for_image.description', 'Wait for an image'),
    form: WaitRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    visibility: VISIBILITY_SURVEYOR
  },
  {
    type: Types.wait_for_video,
    name: i18n.t('actions.wait_for_video.name', 'Wait for Video'),
    description: i18n.t('actions.wait_for_video.description', 'Wait for a video'),
    form: WaitRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    visibility: VISIBILITY_SURVEYOR
  },
  {
    type: Types.wait_for_location,
    name: i18n.t('actions.wait_for_location.name', 'Wait for Location'),
    description: i18n.t(
      'actions.wait_for_location.description',
      'Wait for location GPS coordinates'
    ),
    form: WaitRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    visibility: VISIBILITY_SURVEYOR
  },
  {
    type: Types.split_by_intent,
    name: i18n.t('actions.split_by_intent.name', 'Split by Intent'),
    description: i18n.t('actions.split_by_intent.description', 'Split by intent'),
    form: ClassifyRouterForm,
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    component: CallClassifierComp,
    aliases: [Types.call_classifier],
    visibility: VISIBILITY_ONLINE,
    filter: FeatureFilter.HAS_CLASSIFIER
  },
  {
    type: Types.split_by_expression,
    name: i18n.t('actions.split_by_expression.name', 'Split by Expression'),
    description: i18n.t('actions.split_by_expression.description', 'Split by a custom expression'),
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits', 'cases'],
    form: ExpressionRouterForm
  },
  {
    type: Types.split_by_contact_field,
    name: i18n.t('actions.split_by_contact_field.name', 'Split by Contact Field'),
    description: i18n.t('actions.split_by_contact_field.description', 'Split by a contact field'),
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits', 'cases'],
    form: FieldRouterForm
  },
  {
    type: Types.split_by_run_result,
    aliases: [Types.split_by_run_result_delimited],
    name: i18n.t('actions.split_by_run_result.name', 'Split by Flow Result'),
    description: i18n.t('actions.split_by_run_result.description', 'Split by a result in the flow'),
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits', 'cases'],
    form: ResultRouterForm
  },
  {
    type: Types.split_by_random,
    name: i18n.t('actions.split_by_random.name', 'Split Randomly'),
    description: i18n.t('actions.split_by_random.description', 'Split by random chance'),
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    form: RandomRouterForm
  },
  {
    type: Types.split_by_groups,
    name: i18n.t('actions.split_by_groups.name', 'Split by Group Membership'),
    description: i18n.t('actions.split_by_groups.description', 'Split by group membership'),
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    form: GroupsRouterForm
  },
  {
    type: Types.split_by_scheme,
    name: i18n.t('actions.split_by_scheme.name', 'Split by URN Type'),
    description: i18n.t('actions.split_by_scheme.description', 'Split by URN type'),
    localization: RouterLocalizationForm,
    localizeableKeys: ['exits'],
    form: SchemeRouterForm
  }
  // {type: 'random', name: 'Random Split', description: 'Split them up randomly', form: RandomRouterForm}
];

export const configsToDisplay = dedupeTypeConfigs(typeConfigList);

export const typeConfigMap: TypeMap = typeConfigList.reduce((map: TypeMap, typeConfig: Type) => {
  map[typeConfig.type] = typeConfig;
  if (typeConfig.aliases) {
    typeConfig.aliases.forEach((alias: string) => (map[alias] = typeConfig));
  }
  return map;
}, {});

/**
 * Shortcut for constant lookup of type config in type configs map
 * @param {string} type - The type of the type config to return, e.g. 'send_msg'
 * @returns {Object} - The type config found at typeConfigs[type] or -1
 */
export const getTypeConfig = (type: Types | RouterTypes): Type => {
  let config = typeConfigMap[type];

  if (!config) {
    config = typeConfigMap.missing;
  }
  return config;
};

export const getType = (renderNode: RenderNode): any => {
  const wait = renderNode.node.router && renderNode.node.router.wait;
  if (wait && wait.hint) {
    switch (wait.hint.type) {
      case HintTypes.digits:
        if (wait.hint.count === 1) {
          return Types.wait_for_menu;
        }
        return Types.wait_for_digits;
      case HintTypes.audio:
        return Types.wait_for_audio;
      case HintTypes.image:
        return Types.wait_for_image;
      case HintTypes.location:
        return Types.wait_for_location;
      case HintTypes.video:
        return Types.wait_for_video;
    }
  }

  // if we are splitting by field, but don't know the name, force it into split by expression
  if (renderNode.ui.type === Types.split_by_contact_field && !renderNode.ui.config.operand.name) {
    return Types.split_by_expression;
  }

  return renderNode.ui.type;
};

export const hasFeature = (config: FlowEditorConfig, filter: FeatureFilter) => {
  return !!(config.filters || []).find((name: string) => name === filter);
};
