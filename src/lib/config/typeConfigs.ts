import { AnyAction } from '../flowTypes';
import { Language } from '../component/LanguageSelector';
import ChangeGroupComp from '../component/actions/ChangeGroup/ChangeGroup';
import AddGroupForm from '../component/actions/ChangeGroup/AddGroupForm';
import RemoveGroupForm from '../component/actions/ChangeGroup/RemoveGroupForm';
import SaveFlowResultComp from '../component/actions/SaveFlowResult/SaveFlowResult';
import SaveFlowResultForm from '../component/actions/SaveFlowResult/SaveFlowResultForm';
import SaveToContactComp from '../component/actions/SaveToContact/SaveToContact';
import SaveToContactForm from '../component/actions/SaveToContact/SaveToContactForm';
import ReplyComp from '../component/actions/Reply/Reply';
import ReplyForm from '../component/actions/Reply/ReplyForm';
import WebhookComp from '../component/actions/Webhook/Webhook';
import StartFlowComp from '../component/actions/StartFlow/StartFlow';
import SendEmailComp from '../component/actions/SendEmail/SendEmail';
import SendEmailForm from '../component/actions/SendEmail/SendEmailForm';
import SwitchRouterForm from '../component/routers/SwitchRouter';
import SubflowRouterForm from '../component/routers/SubflowRouter';
import WebhookRouterForm from '../component/routers/WebhookRouter';

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

export const REPLY_ACTION_TYPE = 'reply';
export const REPLY_ACTION_NAME = 'Send Message';
export const REPLY_ACTION_DESC = 'Send them a message';

export const ADD_GROUP_ACTION_TYPE = 'add_to_group';
export const ADD_GROUP_ACTION_NAME = 'Add to Group';
export const ADD_GROUP_ACTION_DESC = 'Add them to a group';

export const REMOVE_GROUP_ACTION_TYPE = 'remove_from_group';
export const REMOVE_GROUP_ACTION_NAME = 'Remove from Group';
export const REMOVE_GROUP_ACTION_DESC = 'Remove them from a group';

export const typeConfigList: Type[] = [
    /** Actions */
    {
        type: REPLY_ACTION_TYPE,
        name: REPLY_ACTION_NAME,
        description: REPLY_ACTION_DESC,
        form: ReplyForm,
        component: ReplyComp,
        advanced: Mode.EDITING,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    // { type: 'msg', name: 'Send Message', description: 'Send somebody else a message', form: SendMessageForm, component: SendMessage },
    {
        type: ADD_GROUP_ACTION_TYPE,
        name: ADD_GROUP_ACTION_NAME,
        description: ADD_GROUP_ACTION_DESC,
        form: AddGroupForm,
        component: ChangeGroupComp,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    {
        type: REMOVE_GROUP_ACTION_TYPE,
        name: REMOVE_GROUP_ACTION_NAME,
        description: REMOVE_GROUP_ACTION_DESC,
        form: RemoveGroupForm,
        component: ChangeGroupComp,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    {
        type: 'save_contact_field',
        name: 'Update Contact',
        description: 'Update the contact',
        form: SaveToContactForm,
        component: SaveToContactComp,
        aliases: ['update_contact'],
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    {
        type: 'send_email',
        name: 'Send Email',
        description: 'Send an email',
        form: SendEmailForm,
        component: SendEmailComp,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    {
        type: 'save_flow_result',
        name: 'Save Flow Result',
        description: 'Save a result for this flow',
        form: SaveFlowResultForm,
        component: SaveFlowResultComp,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    // {type: 'add_label', name: 'Add Label', description: 'Label the message', component: Missing},
    // {type: 'set_preferred_channel', name: 'Set Preferred Channel', description: 'Set their preferred channel', component: Missing},
    /** Hybrids */
    {
        type: 'call_webhook',
        name: 'Call Webhook',
        description: 'Call a webook',
        form: WebhookRouterForm,
        component: WebhookComp,
        advanced: Mode.EDITING,
        aliases: ['webhook'],
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    {
        type: 'start_flow',
        name: 'Run Flow',
        description: 'Run another flow',
        form: SubflowRouterForm,
        component: StartFlowComp,
        aliases: ['subflow'],
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },

    /** Routers */
    {
        type: 'expression',
        name: 'Split by Expression',
        description: 'Split by a custom expression',
        form: SwitchRouterForm,
        advanced: Mode.TRANSLATING,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    {
        type: 'group',
        name: 'Split by Group Membership',
        description: 'Split by group membership',
        form: SwitchRouterForm,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    {
        type: 'wait_for_response',
        name: 'Wait for Response',
        description: 'Wait for them to respond',
        form: SwitchRouterForm,
        advanced: Mode.TRANSLATING,
        aliases: ['switch'],
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    }
    // {type: 'random', name: 'Random Split', description: 'Split them up randomly', form: RandomRouterForm}
];

export const actionConfigList: Type[] = typeConfigList.filter(
    ({ name }) =>
        name !== 'Wait for Response' &&
        name !== 'Split by Expression' &&
        name !== 'Run Flow' &&
        name !== 'Call Webhook'
);

export const typeConfigMap: TypeMap = typeConfigList.reduce(
    (map: TypeMap, typeConfig: Type) => {
        map[typeConfig.type] = typeConfig;
        if (typeConfig.aliases) {
            typeConfig.aliases.forEach(
                (alias: string) => (map[alias] = typeConfig)
            );
        }
        return map;
    },
    {}
);

/**
 * Shortcut for constant lookup of type config in type configs map
 * @param {string} type - The type of the type config to return, e.g. 'reply'
 * @returns {Object} - The type config found at typeConfigs[type] or -1
 */
export const getTypeConfig = (type: string): Type => typeConfigMap[type];
