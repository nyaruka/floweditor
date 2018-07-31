import AddLabelsComp from '~/components/flow/actions/addlabels/AddLabels';
import AddLabelsForm from '~/components/flow/actions/addlabels/AddLabelsForm';
import CallWebhookComp from '~/components/flow/actions/callwebhook/CallWebhook';
import AddGroupsForm from '~/components/flow/actions/changegroups/addgroups/AddGroupsForm';
import ChangeGroupsComp from '~/components/flow/actions/changegroups/ChangeGroups';
import RemoveGroupsForm from '~/components/flow/actions/changegroups/removegroups/RemoveGroupsForm';
import MissingComp from '~/components/flow/actions/missing/Missing';
import SendBroadcastComp from '~/components/flow/actions/sendbroadcast/SendBroadcast';
import SendBroadcastForm from '~/components/flow/actions/sendbroadcast/SendBroadcastForm';
import SendEmailComp from '~/components/flow/actions/sendemail/SendEmail';
import SendEmailForm from '~/components/flow/actions/sendemail/SendEmailForm';
import SendMsgComp from '~/components/flow/actions/sendmsg/SendMsg';
import SendMsgForm from '~/components/flow/actions/sendmsg/SendMsgForm';
import SendMsgLocalizationForm from '~/components/flow/actions/sendmsg/SendMsgLocalizationForm';
import SetRunResultComp from '~/components/flow/actions/setrunresult/SetRunResult';
import SetRunResultForm from '~/components/flow/actions/setrunresult/SetRunResultForm';
import StartFlowComp from '~/components/flow/actions/startflow/StartFlow';
import StartSessionComp from '~/components/flow/actions/startsession/StartSession';
import StartSessionForm from '~/components/flow/actions/startsession/StartSessionForm';
import UpdateContactComp from '~/components/flow/actions/updatecontact/UpdateContact';
import UpdateContactForm from '~/components/flow/actions/updatecontact/UpdateContactForm';
import ExpressionRouterForm from '~/components/flow/routers/expression/ExpressionRouterForm';
import GroupsRouterForm from '~/components/flow/routers/groups/GroupsRouterForm';
import RouterLocalizationForm from '~/components/flow/routers/localization/RouterLocalizationForm';
import ResponseRouterForm from '~/components/flow/routers/response/ResponseRouterForm';
import { SubflowRouter } from '~/components/flow/routers/subflow/SubflowRouter';
import { WebhookRouterForm } from '~/components/flow/routers/webhook/WebhookRouterForm';
import { AnyAction, RouterTypes, UINodeTypes } from '~/flowTypes';

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
    add_contact_urn = 'add_contact_urn',
    add_contact_groups = 'add_contact_groups',
    add_input_labels = 'add_input_labels',
    remove_contact_groups = 'remove_contact_groups',
    set_contact_channel = 'set_contact_channel',
    set_contact_field = 'set_contact_field',
    set_contact_name = 'set_contact_name',
    set_contact_language = 'set_contact_language',
    set_run_result = 'set_run_result',
    call_webhook = 'call_webhook',
    send_msg = 'send_msg',
    send_email = 'send_email',
    send_broadcast = 'send_broadcast',
    start_flow = 'start_flow',
    start_session = 'start_session',
    split_by_expression = 'split_by_expression',
    split_by_groups = 'split_by_groups',
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
    localization?: React.ComponentClass<any>;
    aliases?: string[];
}

export interface TypeMap {
    [propName: string]: Type;
}

export type GetTypeConfig = (type: string) => Type;

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
        localization: SendMsgLocalizationForm,
        component: SendMsgComp
    },
    {
        type: Types.send_broadcast,
        name: 'Send Broadcast',
        description: 'Send somebody else a message',
        form: SendBroadcastForm,
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
        component: CallWebhookComp,
        aliases: [UINodeTypes.webhook]
    },
    {
        type: Types.start_flow,
        name: 'Start a Flow',
        description: 'Enter another flow',
        form: SubflowRouter,
        component: StartFlowComp,
        aliases: [UINodeTypes.subflow]
    },
    {
        type: Types.start_session,
        name: 'Start Somebody Else',
        description: 'Start somebody else in a flow',
        form: StartSessionForm,
        component: StartSessionComp
    },

    /** Routers */
    {
        type: Types.split_by_expression,
        name: 'Split by Expression',
        description: 'Split by a custom expression',
        localization: RouterLocalizationForm,
        form: ExpressionRouterForm
    },
    {
        type: Types.split_by_groups,
        name: 'Split by Group Membership',
        description: 'Split by group membership',
        localization: RouterLocalizationForm,
        form: GroupsRouterForm
    },
    {
        type: Types.wait_for_response,
        name: 'Wait for Response',
        description: 'Wait for the contact to respond',
        form: ResponseRouterForm,
        localization: RouterLocalizationForm,
        aliases: [RouterTypes.switch]
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
export const getTypeConfig = (type: Types | RouterTypes | UINodeTypes): Type => {
    let actionConfig = typeConfigMap[type];

    if (!actionConfig) {
        actionConfig = typeConfigMap.missing;
    }
    return actionConfig;
};
