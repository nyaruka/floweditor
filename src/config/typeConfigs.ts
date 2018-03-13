import AddGroupsForm from '../component/actions/ChangeGroups/AddGroupsForm';
import ChangeGroupsComp from '../component/actions/ChangeGroups/ChangeGroups';
import RemoveGroupsForm from '../component/actions/ChangeGroups/RemoveGroupsForm';
import SendMsgComp from '../component/actions/SendMsg/SendMsg';
import SendMsgForm from '../component/actions/SendMsg/SendMsgForm';
import SetRunResultComp from '../component/actions/SetRunResult/SetRunResult';
import SetRunResultForm from '../component/actions/SetRunResult/SetRunResultForm';
import SetContactFieldComp from '../component/actions/SetContactField/SetContactField';
import SetContactFieldForm from '../component/actions/SetContactField/SetContactFieldForm';
import SendEmailComp from '../component/actions/SendEmail/SendEmail';
import SendEmailForm from '../component/actions/SendEmail/SendEmailForm';
import StartFlowComp from '../component/actions/StartFlow/StartFlow';
import CallWebhookComp from '../component/actions/CallWebhook/CallWebhook';
import GroupsRouter from '../component/routers/GroupsRouter';
import SubflowRouter from '../component/routers/SubflowRouter';
import SwitchRouter from '../component/routers/SwitchRouter';
import WebhookRouter from '../component/routers/WebhookRouter';
import { AnyAction } from '../flowTypes';

/*
Old name	                New name	                Event(s) generated

add_urn	                    add_contact_urn	            contact_urn_added
add_to_group	            add_contact_groups	        contact_groups_added
remove_from_group	        remove_contact_groups	    contact_groups_removed
set_preferred_channel	    set_contact_channel	        contact_channel_changed
update_contact	            set_contact_property	    contact_property_changed
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

export enum Mode {
    EDITING = 0x1,
    TRANSLATING = 0x2,
    ALL = EDITING | TRANSLATING
}

export interface Type {
    type: string;
    name: string;
    description: string;
    allows(mode: Mode): boolean;
    component?: React.SFC<AnyAction>;
    form?: React.ComponentClass<any>;
    advanced?: Mode;
    aliases?: string[];
}

export interface TypeMap {
    [propName: string]: Type;
}

export type GetTypeConfig = (type: string) => Type;

export function allows(mode: Mode): boolean {
    return (this.advanced & mode) === mode;
}

export const typeConfigList: Type[] = [
    /** Actions */
    {
        type: 'send_msg',
        name: 'Send Message',
        description: 'Send them a message',
        form: SendMsgForm,
        component: SendMsgComp,
        advanced: Mode.EDITING,
        allows
    },
    // { type: 'msg', name: 'Send Message', description: 'Send somebody else a message', form: SendMessageForm, component: SendMessage },
    {
        type: 'add_contact_groups',
        name: 'Add to Group',
        description: 'Add them to a group',
        form: AddGroupsForm,
        component: ChangeGroupsComp,
        allows
    },
    {
        type: 'remove_contact_groups',
        name: 'Remove from Group',
        description: 'Remove them from a group',
        form: RemoveGroupsForm,
        component: ChangeGroupsComp,
        allows
    },
    {
        type: 'set_contact_field',
        name: 'Update Contact',
        description: 'Update the contact',
        form: SetContactFieldForm,
        component: SetContactFieldComp,
        aliases: ['set_contact_property'],
        allows
    },
    {
        type: 'send_email',
        name: 'Send Email',
        description: 'Send an email',
        form: SendEmailForm,
        component: SendEmailComp,
        allows
    },
    {
        type: 'set_run_result',
        name: 'Save Flow Result',
        description: 'Save a result for this flow',
        form: SetRunResultForm,
        component: SetRunResultComp,
        allows
    },
    // {type: 'add_label', name: 'Add Label', description: 'Label the message', component: Missing},
    // {type: 'set_preferred_channel', name: 'Set Preferred Channel', description: 'Set their preferred channel', component: Missing},
    /** Hybrids */
    {
        type: 'call_webhook',
        name: 'Call Webhook',
        description: 'Call a webook',
        form: WebhookRouter,
        component: CallWebhookComp,
        advanced: Mode.EDITING,
        aliases: ['webhook'],
        allows
    },
    {
        type: 'start_flow',
        name: 'Run Flow',
        description: 'Run another flow',
        form: SubflowRouter,
        component: StartFlowComp,
        aliases: ['subflow'],
        allows
    },

    /** Routers */
    {
        type: 'split_by_expression',
        name: 'Split by Expression',
        description: 'Split by a custom expression',
        form: SwitchRouter,
        advanced: Mode.TRANSLATING,
        allows
    },
    {
        type: 'split_by_group',
        name: 'Split by Group Membership',
        description: 'Split by group membership',
        form: GroupsRouter,
        allows
    },
    {
        type: 'wait_for_response',
        name: 'Wait for Response',
        description: 'Wait for them to respond',
        form: SwitchRouter,
        advanced: Mode.TRANSLATING,
        aliases: ['switch'],
        allows
    }
    // {type: 'random', name: 'Random Split', description: 'Split them up randomly', form: RandomRouterForm}
];

export const actionConfigList = typeConfigList.filter(
    ({ type }) =>
        type !== 'wait_for_response' &&
        type !== 'split_by_expression' &&
        type !== 'split_by_group' &&
        type !== 'run_flow' &&
        type !== 'call_webhook'
);

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
export const getTypeConfig = (type: string): Type => typeConfigMap[type];
