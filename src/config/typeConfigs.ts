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
import GroupRouter from '../component/routers/GroupRouter';

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
        type: 'reply',
        name: 'Send Message',
        description: 'Send them a message',
        form: ReplyForm,
        component: ReplyComp,
        advanced: Mode.EDITING,
        allows
    },
    // { type: 'msg', name: 'Send Message', description: 'Send somebody else a message', form: SendMessageForm, component: SendMessage },
    {
        type: 'add_to_group',
        name: 'Add to Group',
        description: 'Add them to a group',
        form: AddGroupForm,
        component: ChangeGroupComp,
        allows
    },
    {
        type: 'remove_from_group',
        name: 'Remove from Group',
        description: 'Remove them from a group',
        form: RemoveGroupForm,
        component: ChangeGroupComp,
        allows
    },
    {
        type: 'save_contact_field',
        name: 'Update Contact',
        description: 'Update the contact',
        form: SaveToContactForm,
        component: SaveToContactComp,
        aliases: ['update_contact'],
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
        type: 'save_flow_result',
        name: 'Save Flow Result',
        description: 'Save a result for this flow',
        form: SaveFlowResultForm,
        component: SaveFlowResultComp,
        allows
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
        allows
    },
    {
        type: 'start_flow',
        name: 'Run Flow',
        description: 'Run another flow',
        form: SubflowRouterForm,
        component: StartFlowComp,
        aliases: ['subflow'],
        allows
    },

    /** Routers */
    {
        type: 'split_by_expression',
        name: 'Split by Expression',
        description: 'Split by a custom expression',
        form: SwitchRouterForm,
        advanced: Mode.TRANSLATING,
        allows
    },
    {
        type: 'split_by_group',
        name: 'Split by Group Membership',
        description: 'Split by group membership',
        form: GroupRouter,
        allows
    },
    {
        type: 'wait_for_response',
        name: 'Wait for Response',
        description: 'Wait for them to respond',
        form: SwitchRouterForm,
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
 * @param {string} type - The type of the type config to return, e.g. 'reply'
 * @returns {Object} - The type config found at typeConfigs[type] or -1
 */
export const getTypeConfig = (type: string): Type => typeConfigMap[type];
