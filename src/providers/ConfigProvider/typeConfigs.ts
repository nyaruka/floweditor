
import { AnyAction } from '../../flowTypes';
import { Language } from '../../components/LanguageSelector';
import ChangeGroupComp from '../../components/actions/ChangeGroup/ChangeGroup';
import AddGroupForm from '../../components/actions/ChangeGroup/AddGroupForm';
import RemoveGroupForm from '../../components/actions/ChangeGroup/RemoveGroupForm';
import SaveFlowResultComp from '../../components/actions/SaveFlowResult/SaveFlowResult';
import SaveFlowResultForm from '../../components/actions/SaveFlowResult/SaveFlowResultForm';
import SaveToContactComp from '../../components/actions/SaveToContact/SaveToContact';
import SaveToContactForm from '../../components/actions/SaveToContact/SaveToContactForm';
import ReplyComp from '../../components/actions/Reply/Reply';
import ReplyForm from '../../components/actions/Reply/ReplyForm';
import WebhookComp from '../../components/actions/Webhook/Webhook';
import StartFlowComp from '../../components/actions/StartFlow/StartFlow';
import SendEmailComp from '../../components/actions/SendEmail/SendEmail';
import SendEmailForm from '../../components/actions/SendEmail/SendEmailForm';
import SwitchRouterForm from '../../components/routers/SwitchRouter';
import SubflowRouterForm from '../../components/routers/SubflowRouter';
import WebhookRouterForm from '../../components/routers/WebhookRouter';
import GroupRouter from '../../components/routers/GroupRouter';

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

export const typeConfigList: Type[] = [
    /** Actions */
    {
        type: 'reply',
        name: 'Send Message',
        description: 'Send them a message',
        form: ReplyForm,
        component: ReplyComp,
        advanced: Mode.EDITING,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    // { type: 'msg', name: 'Send Message', description: 'Send somebody else a message', form: SendMessageForm, component: SendMessage },
    {
        type: 'add_to_group',
        name: 'Add to Group',
        description: 'Add them to a group',
        form: AddGroupForm,
        component: ChangeGroupComp,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    {
        type: 'remove_from_group',
        name: 'Remove from Group',
        description: 'Remove them from a group',
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
        form: GroupRouter,
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
