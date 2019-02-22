import AddLabelsComp from '~/components/flow/actions/addlabels/AddLabels';
import AddLabelsForm from '~/components/flow/actions/addlabels/AddLabelsForm';
import AddUrnComp from '~/components/flow/actions/addurn/AddUrn';
import AddUrnForm from '~/components/flow/actions/addurn/AddUrnForm';
import CallResthookComp from '~/components/flow/actions/callresthook/CallResthook';
import CallWebhookComp from '~/components/flow/actions/callwebhook/CallWebhook';
import AddGroupsForm from '~/components/flow/actions/changegroups/addgroups/AddGroupsForm';
import ChangeGroupsComp from '~/components/flow/actions/changegroups/ChangeGroups';
import RemoveGroupsForm from '~/components/flow/actions/changegroups/removegroups/RemoveGroupsForm';
import MsgLocalizationForm from '~/components/flow/actions/localization/MsgLocalizationForm';
import MissingComp from '~/components/flow/actions/missing/Missing';
import SendBroadcastComp from '~/components/flow/actions/sendbroadcast/SendBroadcast';
import SendBroadcastForm from '~/components/flow/actions/sendbroadcast/SendBroadcastForm';
import SendEmailComp from '~/components/flow/actions/sendemail/SendEmail';
import SendEmailForm from '~/components/flow/actions/sendemail/SendEmailForm';
import SendMsgComp from '~/components/flow/actions/sendmsg/SendMsg';
import SendMsgForm from '~/components/flow/actions/sendmsg/SendMsgForm';
import SetRunResultComp from '~/components/flow/actions/setrunresult/SetRunResult';
import SetRunResultForm from '~/components/flow/actions/setrunresult/SetRunResultForm';
import StartFlowComp from '~/components/flow/actions/startflow/StartFlow';
import StartSessionComp from '~/components/flow/actions/startsession/StartSession';
import StartSessionForm from '~/components/flow/actions/startsession/StartSessionForm';
import TransferAirtimeComp from '~/components/flow/actions/transferairtime/TransferAirtime';
import UpdateContactComp from '~/components/flow/actions/updatecontact/UpdateContact';
import UpdateContactForm from '~/components/flow/actions/updatecontact/UpdateContactForm';
import AirtimeRouterForm from '~/components/flow/routers/airtime/AirtimeRouterForm';
import ExpressionRouterForm from '~/components/flow/routers/expression/ExpressionRouterForm';
import FieldRouterForm from '~/components/flow/routers/field/FieldRouterForm';
import GroupsRouterForm from '~/components/flow/routers/groups/GroupsRouterForm';
import RouterLocalizationForm from '~/components/flow/routers/localization/RouterLocalizationForm';
import RandomRouterForm from '~/components/flow/routers/random/RandomRouterForm';
import ResponseRouterForm from '~/components/flow/routers/response/ResponseRouterForm';
import ResthookRouterForm from '~/components/flow/routers/resthook/ResthookRouterForm';
import ResultRouterForm from '~/components/flow/routers/result/ResultRouterForm';
import SubflowRouterForm from '~/components/flow/routers/subflow/SubflowRouterForm';
import WebhookRouterForm from '~/components/flow/routers/webhook/WebhookRouterForm';
import { AnyAction, RouterTypes } from '~/flowTypes';

/*
Old name	                New name	                Event(s) generated

add_urn	                    add_contact_urn	            contact_urn_added
add_to_group	            add_contact_groups	        contact_groups_added
remove_from_group	        remove_contact_groups	    contact_groups_removed
set_preferred_channel	    set_contact_channel	        contact_channel_changed
update_contact	            set_contact_name	        contact_name_changed
update_contact	            set_contact_language	    contact_language_changed
update_contact	            set_contact_timezone	    contact_timezone_changed
save_contact_field      	set_contact_field	        contact_field_changed
save_flow_result	        set_run_result	            run_result_changed
call_webhook	            call_webhook	            webhook_called
add_label	                add_input_labels	        input_labels_added
reply	                    send_msg	                msg_created
send_email	                send_email	                email_created / email_sent
send_msg	                send_broadcast	            broadcast_created
start_flow	                start_flow	                flow_triggered
start_session	            start_session	            session_triggered
*/

export const enum Types {
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
    call_resthook = 'call_resthook',
    call_webhook = 'call_webhook',
    send_msg = 'send_msg',
    send_email = 'send_email',
    send_broadcast = 'send_broadcast',
    start_flow = 'start_flow',
    start_session = 'start_session',
    transfer_airtime = 'transfer_airtime',
    split_by_airtime = 'split_by_airtime',
    split_by_expression = 'split_by_expression',
    split_by_contact_field = 'split_by_contact_field',
    split_by_run_result = 'split_by_run_result',
    split_by_run_result_delimited = 'split_by_run_result_delimited',
    split_by_groups = 'split_by_groups',
    split_by_random = 'split_by_random',
    split_by_resthook = 'split_by_resthook',
    split_by_subflow = 'split_by_subflow',
    split_by_webhook = 'split_by_webhook',
    wait_for_response = 'wait_for_response',

    missing = 'missing'
}

const dedupeTypeConfigs = (typeConfigs: Type[]) => {
    const map = {};
    return typeConfigs.filter(config => {
        if (config.type === 'missing') {
            return false;
        }
        const { name: key } = config;
        return map[key] ? false : (map[key] = true);
    });
};

export interface Type {
    type: Types;
    name: string;
    description: string;
    component?: React.SFC<AnyAction>;
    form?: React.ComponentClass<any>;
    aliases?: string[];
    localization?: React.ComponentClass<any>;
    localizeableKeys?: string[];
}

export interface TypeMap {
    [propName: string]: Type;
}

export type GetTypeConfig = (type: string) => Type;

export interface Scheme {
    scheme: string;
    name: string;
}

export const SCHEMES: Scheme[] = [
    { scheme: 'ext', name: 'External ID' },
    { scheme: 'facebook', name: 'Facebook ID' },
    { scheme: 'fcm', name: 'Firebase ID' },
    { scheme: 'jiochat', name: 'Jiochat ID' },
    { scheme: 'line', name: 'Line ID' },
    { scheme: 'mailto', name: 'Email Address' },
    { scheme: 'tel', name: 'Phone Number' },
    { scheme: 'telegram', name: 'Telegram ID' },
    { scheme: 'twitter', name: 'Twitter Handle' },
    { scheme: 'twitterid', name: 'Twitter ID' },
    { scheme: 'wechat', name: 'Wechat ID' },
    { scheme: 'whatsapp', name: 'Whatsapp Number' },
    { scheme: 'viber', name: 'Viber ID' }
];

export const typeConfigList: Type[] = [
    /** Actions */
    {
        type: Types.missing,
        name: 'Missing',
        description: ' ** Unsupported ** ',
        component: MissingComp
    },
    {
        type: Types.send_msg,
        name: 'Send Message',
        description: 'Send the contact a message',
        form: SendMsgForm,
        localization: MsgLocalizationForm,
        localizeableKeys: ['text', 'quick_replies'],
        component: SendMsgComp
    },
    {
        type: Types.wait_for_response,
        name: 'Wait for Response',
        description: 'Wait for the contact to respond',
        form: ResponseRouterForm,
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits', 'cases'],
        aliases: [RouterTypes.switch]
    },
    {
        type: Types.send_broadcast,
        name: 'Send Broadcast',
        description: 'Send somebody else a message',
        form: SendBroadcastForm,
        localization: MsgLocalizationForm,
        localizeableKeys: ['text'],
        component: SendBroadcastComp
    },
    {
        type: Types.add_input_labels,
        name: 'Add Labels',
        description: 'Label the incoming message',
        form: AddLabelsForm,
        component: AddLabelsComp
    },
    {
        type: Types.add_contact_urn,
        name: 'Add URN',
        description: 'Add a URN for the contact',
        form: AddUrnForm,
        component: AddUrnComp
    },
    {
        type: Types.add_contact_groups,
        name: 'Add to Group',
        description: 'Add the contact to a group',
        form: AddGroupsForm,
        component: ChangeGroupsComp
    },
    {
        type: Types.remove_contact_groups,
        name: 'Remove from Group',
        description: 'Remove the contact from a group',
        form: RemoveGroupsForm,
        component: ChangeGroupsComp
    },
    {
        type: Types.set_contact_field,
        aliases: [Types.set_contact_name, Types.set_contact_language, Types.set_contact_channel],
        name: 'Update Contact',
        description: 'Update the contact',
        form: UpdateContactForm,
        component: UpdateContactComp
    },
    {
        type: Types.send_email,
        name: 'Send Email',
        description: 'Send an email',
        form: SendEmailForm,
        component: SendEmailComp
    },
    {
        type: Types.set_run_result,
        name: 'Save Flow Result',
        description: 'Save a result for this flow',
        form: SetRunResultForm,
        component: SetRunResultComp
    },

    /** Hybrids */
    {
        type: Types.call_webhook,
        name: 'Call Webhook',
        description: 'Call a webook',
        form: WebhookRouterForm,
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits'],
        component: CallWebhookComp,
        aliases: [Types.split_by_webhook]
    },
    {
        type: Types.call_resthook,
        name: 'Call Zapier',
        description: 'Call Zapier',
        form: ResthookRouterForm,
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits'],
        component: CallResthookComp,
        aliases: [Types.split_by_resthook]
    },
    {
        type: Types.start_flow,
        name: 'Start a Flow',
        description: 'Enter another flow',
        form: SubflowRouterForm,
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits'],
        component: StartFlowComp,
        aliases: [Types.split_by_subflow]
    },
    {
        type: Types.start_session,
        name: 'Start Somebody Else',
        description: 'Start somebody else in a flow',
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits'],
        form: StartSessionForm,
        component: StartSessionComp
    },
    {
        type: Types.transfer_airtime,
        name: 'Send Airtime',
        description: 'Send the contact airtime',
        form: AirtimeRouterForm,
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits'],
        component: TransferAirtimeComp,
        aliases: [Types.split_by_airtime]
    },

    /** Routers */
    {
        type: Types.split_by_expression,
        name: 'Split by Expression',
        description: 'Split by a custom expression',
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits', 'cases'],
        form: ExpressionRouterForm
    },
    {
        type: Types.split_by_contact_field,
        name: 'Split by Contact Field',
        description: 'Split by a contact field',
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits', 'cases'],
        form: FieldRouterForm
    },
    {
        type: Types.split_by_run_result,
        aliases: [Types.split_by_run_result_delimited],
        name: 'Split by Flow Result',
        description: 'Split by a result in the flow',
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits', 'cases'],
        form: ResultRouterForm
    },
    {
        type: Types.split_by_random,
        name: 'Split Randomly',
        description: 'Split by random chance',
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits'],
        form: RandomRouterForm
    },
    {
        type: Types.split_by_groups,
        name: 'Split by Group Membership',
        description: 'Split by group membership',
        localization: RouterLocalizationForm,
        localizeableKeys: ['exits'],
        form: GroupsRouterForm
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
