import AddLabelsComp from '../component/actions/AddLabels/AddLabels';
import AddLabelsForm from '../component/actions/AddLabels/AddLabelsForm';
import CallWebhookComp from '../component/actions/CallWebhook/CallWebhook';
import AddGroupsForm from '../component/actions/ChangeGroups/AddGroupsForm';
import ChangeGroupsComp from '../component/actions/ChangeGroups/ChangeGroups';
import RemoveGroupsForm from '../component/actions/ChangeGroups/RemoveGroupsForm';
import MissingComp from '../component/actions/Missing/Missing';
import SendBroadcastComp from '../component/actions/SendBroadcast/SendBroadcast';
import SendBroadcastForm from '../component/actions/SendBroadcast/SendBroadcastForm';
import { SendBroadcastFormHelper } from '../component/actions/SendBroadcast/SendBroadcastFormHelper';
import SendEmailComp from '../component/actions/SendEmail/SendEmail';
import SendEmailForm from '../component/actions/SendEmail/SendEmailForm';
import SendMsgComp from '../component/actions/SendMsg/SendMsg';
import SendMsgForm from '../component/actions/SendMsg/SendMsgForm';
import SetContactAttrib from '../component/actions/SetContactAttrib/SetContactAttrib';
import SetContactAttribForm from '../component/actions/SetContactAttrib/SetContactAttribForm';
import { SetContactAttribFormHelper } from '../component/actions/SetContactAttrib/SetContactAttribFormHelper';
import SetRunResultComp from '../component/actions/SetRunResult/SetRunResult';
import SetRunResultForm from '../component/actions/SetRunResult/SetRunResultForm';
import StartFlowComp from '../component/actions/StartFlow/StartFlow';
import StartSessionComp from '../component/actions/StartSession/StartSession';
import StartSessionForm from '../component/actions/StartSession/StartSessionForm';
import { StartSessionFormHelper } from '../component/actions/StartSession/StartSessionFormHelper';
import GroupsRouter from '../component/routers/GroupsRouter';
import SubflowRouter from '../component/routers/SubflowRouter';
import SwitchRouter from '../component/routers/SwitchRouter';
import WebhookRouter from '../component/routers/WebhookRouter';
import { AnyAction, RouterTypes, UINodeTypes } from '../flowTypes';
import { NodeEditorForm } from '../store/nodeEditor';

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
    set_contact_name = 'set_contact_name',
    set_contact_field = 'set_contact_field',
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

export enum Mode {
    EDITING = 0x1,
    TRANSLATING = 0x2,
    ALL = EDITING | TRANSLATING
}

export interface FormHelper {
    actionToState: (action: AnyAction, actionType?: Types) => NodeEditorForm;
    stateToAction: (actionUUID: string, formState: NodeEditorForm, formType?: Types) => AnyAction;
}

export interface Type {
    type: Types;
    name: string;
    description: string;
    allows(mode: Mode): boolean;
    component?: React.SFC<AnyAction>;
    form?: React.ComponentClass<any>;
    formHelper?: FormHelper;
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

const ContactAttribHelper = new SetContactAttribFormHelper();

export const typeConfigList: Type[] = [
    /** Actions */
    {
        type: Types.missing,
        name: 'Missing',
        description: ' ** Unsupported ** ',
        component: MissingComp,
        allows
    },
    {
        type: Types.send_msg,
        name: 'Send Message',
        description: 'Send the contact a message',
        form: SendMsgForm,
        component: SendMsgComp,
        advanced: Mode.EDITING,
        allows
    },
    {
        type: Types.send_broadcast,
        name: 'Send Broadcast',
        description: 'Send somebody else a message',
        form: SendBroadcastForm,
        formHelper: new SendBroadcastFormHelper(),
        component: SendBroadcastComp,
        allows
    },
    {
        type: Types.add_input_labels,
        name: 'Add Labels',
        description: 'Label the incoming message',
        form: AddLabelsForm,
        component: AddLabelsComp,
        allows
    },
    {
        type: Types.add_contact_groups,
        name: 'Add to Group',
        description: 'Add the contact to a group',
        form: AddGroupsForm,
        component: ChangeGroupsComp,
        allows
    },
    {
        type: Types.remove_contact_groups,
        name: 'Remove from Group',
        description: 'Remove the contact from a group',
        form: RemoveGroupsForm,
        component: ChangeGroupsComp,
        allows
    },
    {
        type: Types.set_contact_field,
        name: 'Update Contact',
        description: 'Update the contact',
        form: SetContactAttribForm,
        formHelper: ContactAttribHelper,
        component: SetContactAttrib,
        allows
    },
    {
        type: Types.set_contact_name,
        name: 'Update Contact',
        description: 'Update the contact',
        form: SetContactAttribForm,
        formHelper: ContactAttribHelper,
        component: SetContactAttrib,
        allows
    },
    {
        type: Types.send_email,
        name: 'Send Email',
        description: 'Send an email',
        form: SendEmailForm,
        component: SendEmailComp,
        allows
    },
    {
        type: Types.set_run_result,
        name: 'Save Flow Result',
        description: 'Save a result for this flow',
        form: SetRunResultForm,
        component: SetRunResultComp,
        allows
    },
    // {type: 'set_preferred_channel', name: 'Set Preferred Channel', description: 'Set their preferred channel', component: Missing},
    /** Hybrids */
    {
        type: Types.call_webhook,
        name: 'Call Webhook',
        description: 'Call a webook',
        form: WebhookRouter,
        component: CallWebhookComp,
        advanced: Mode.EDITING,
        aliases: [UINodeTypes.webhook],
        allows
    },
    {
        type: Types.start_flow,
        name: 'Start a Flow',
        description: 'Enter another flow',
        form: SubflowRouter,
        component: StartFlowComp,
        aliases: [UINodeTypes.subflow],
        allows
    },
    {
        type: Types.start_session,
        name: 'Start Somebody Else',
        description: 'Start somebody else in a flow',
        form: StartSessionForm,
        formHelper: new StartSessionFormHelper(),
        component: StartSessionComp,
        allows
    },

    /** Routers */
    {
        type: Types.split_by_expression,
        name: 'Split by Expression',
        description: 'Split by a custom expression',
        form: SwitchRouter,
        advanced: Mode.TRANSLATING,
        allows
    },
    {
        type: Types.split_by_groups,
        name: 'Split by Group Membership',
        description: 'Split by group membership',
        form: GroupsRouter,
        allows
    },
    {
        type: Types.wait_for_response,
        name: 'Wait for Response',
        description: 'Wait for the contact to respond',
        form: SwitchRouter,
        advanced: Mode.TRANSLATING,
        aliases: [RouterTypes.switch],
        allows
    }
    // {type: 'random', name: 'Random Split', description: 'Split them up randomly', form: RandomRouterForm}
];

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
