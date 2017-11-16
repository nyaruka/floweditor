import { ComponentClass, SFC } from 'react';
import { AnyAction } from '../flowTypes';
import { Language } from '../components/LanguageSelector';
import { AnyFormProps } from '../components/NodeEditor/NodeEditor';
import { languages, endpoints } from '../flowEditorConfig';
import ChangeGroupComp from '../components/actions/ChangeGroup/ChangeGroup';
import ChangeGroupForm from '../components/actions/ChangeGroup/ChangeGroupForm';
import SaveFlowResultComp from '../components/actions/SaveFlowResult/SaveFlowResult';
import SaveFlowResultForm from '../components/actions/SaveFlowResult/SaveFlowResultForm';
import SaveToContactComp from '../components/actions/SaveToContact/SaveToContact';
import SaveToContactForm from '../components/actions/SaveToContact/SaveToContactForm';
import ReplyComp from '../components/actions/Reply/Reply';
import ReplyForm from '../components/actions/Reply/ReplyForm';
import WebhookComp from '../components/actions/Webhook/Webhook';
import StartFlowComp from '../components/actions/StartFlow/StartFlow';
import SendEmailComp from '../components/actions/SendEmail/SendEmail';
import SendEmailForm from '../components/actions/SendEmail/SendEmailForm';
import SwitchRouterForm from '../components/routers/SwitchRouter';
import SubflowRouterForm from '../components/routers/SubflowRouter';
import WebhookRouterForm from '../components/routers/WebhookRouter';

export enum Mode {
    EDITING = 0x1,
    TRANSLATING = 0x2,
    ALL = EDITING | TRANSLATING
}

export interface Endpoints {
    fields: string;
    groups: string;
    engine: string;
    contacts: string;
    flows: string;
    activity: string;
}

export interface Languages {
    [iso: string]: string;
}

export interface Type {
    type: string;
    name: string;
    description: string;
    allows(mode: Mode): boolean;
    component?: SFC<AnyAction>;
    form?: ComponentClass<AnyFormProps>;
    advanced?: Mode;
    aliases?: string[];
}

export interface TypeMap {
    [propName: string]: Type;
}

export interface Operator {
    type: string;
    verboseName: string;
    operands: number;
    // Default category name to use if specified
    categoryName?: string;
}

export interface OperatorMap {
    [propName: string]: Operator;
}

export type GetTypeConfig = (type: string) => Type;

export type GetOperatorConfig = (type: string) => Operator;

const TYPE_CONFIG_LIST: Type[] = [
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
        form: ChangeGroupForm,
        component: ChangeGroupComp,
        allows(mode: Mode): boolean {
            return (this.advanced & mode) === mode;
        }
    },
    {
        type: 'remove_from_group',
        name: 'Remove from Group',
        description: 'Remove them from a group',
        form: ChangeGroupForm,
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

const OPERATOR_CONFIG_LIST: Operator[] = [
    { type: 'has_any_word', verboseName: 'has any of the words', operands: 1 },
    { type: 'has_all_words', verboseName: 'has all of the words', operands: 1 },
    { type: 'has_phrase', verboseName: 'has the phrase', operands: 1 },
    { type: 'has_only_phrase', verboseName: 'has only the phrase', operands: 1 },
    { type: 'has_beginning', verboseName: 'starts with', operands: 1 },
    {
        type: 'has_number_between',
        verboseName: 'has a number between',
        operands: 2
    },
    { type: 'has_number_lt', verboseName: 'has a number below', operands: 1 },
    {
        type: 'has_number_lte',
        verboseName: 'has a number at or below',
        operands: 1
    },
    { type: 'has_number_eq', verboseName: 'has a number equal to', operands: 1 },
    {
        type: 'has_number_gte',
        verboseName: 'has a number at or above',
        operands: 1
    },
    { type: 'has_number_gt', verboseName: 'has a number above', operands: 1 },
    { type: 'has_date', verboseName: 'has a date', operands: 0 },
    { type: 'has_date_lt', verboseName: 'has a date before', operands: 1 },
    { type: 'has_date_eq', verboseName: 'has a date equal to', operands: 1 },
    { type: 'has_date_gt', verboseName: 'has a date after', operands: 1 },
    { type: 'has_run_status', verboseName: 'has a run status of', operands: 1 },
    { type: 'has_group', verboseName: 'is in the group', operands: 1 },
    {
        type: 'has_text',
        verboseName: 'has some text',
        operands: 0,
        categoryName: 'Has Text'
    },
    {
        type: 'has_number',
        verboseName: 'has a number',
        operands: 0,
        categoryName: 'Number'
    },
    {
        type: 'has_phone',
        verboseName: 'has a phone number',
        operands: 0,
        categoryName: 'Phone'
    },
    {
        type: 'has_email',
        verboseName: 'has an email',
        operands: 0,
        categoryName: 'Email'
    },
    {
        type: 'has_error',
        verboseName: 'has an error',
        operands: 0,
        categoryName: 'Error'
    },
    {
        type: 'has_value',
        verboseName: 'is not empty',
        operands: 0,
        categoryName: 'Not Empty'
    }
];

export default class EditorConfig {
    public typeConfigList: Type[];
    public operatorConfigList: Operator[];
    public actionConfigList: Type[];

    public typeConfigMap: TypeMap;
    public operatorConfigMap: OperatorMap;

    public endpoints: Endpoints;
    public languages: Languages;
    public baseLanguage: Language;

    constructor() {
        this.typeConfigList = TYPE_CONFIG_LIST;
        this.operatorConfigList = OPERATOR_CONFIG_LIST;
        this.actionConfigList = this.filterActionConfigs();
        this.typeConfigMap = this.mapTypeConfigs();
        this.operatorConfigMap = this.mapOperatorConfigs();
        this.endpoints = endpoints;
        this.languages = languages;
        this.baseLanguage = this.getBaseLanguage();

        this.getTypeConfig = this.getTypeConfig.bind(this);
        this.getOperatorConfig = this.getOperatorConfig.bind(this);
        this.getBaseLanguage = this.getBaseLanguage.bind(this);
    }

    private filterActionConfigs(): Type[] {
        return this.typeConfigList.filter(
            ({ name }) =>
                name !== 'Wait for Response' &&
                name !== 'Split by Expression' &&
                name !== 'Run Flow' &&
                name !== 'Call Webhook'
        );
    }

    private mapTypeConfigs(): TypeMap {
        return this.typeConfigList.reduce((typeConfigMap: TypeMap, typeConfig: Type) => {
            typeConfigMap = Object.assign(typeConfigMap, { [typeConfig.type]: typeConfig });
            if (typeConfig.hasOwnProperty('aliases') && typeConfig.aliases) {
                typeConfig.aliases.forEach(
                    (alias: string) =>
                        (typeConfigMap = Object.assign(typeConfigMap, { [alias]: typeConfig }))
                );
            }
            return typeConfigMap;
        }, {});
    }

    private mapOperatorConfigs(): OperatorMap {
        return this.operatorConfigList.reduce(
            (operatorConfigMap: OperatorMap, operatorConfig: Operator) =>
                Object.assign(operatorConfigMap, { [operatorConfig.type]: operatorConfig }),
            {}
        );
    }

    /**
    * Shortcut for constant lookup of type config in type configs map
    * @param {string} type - The type of the type config to return, e.g. 'reply'
    * @returns {Object} - The type config found at typeConfigs[type] or -1
    */
    public getTypeConfig(type: string): Type {
        if (this.typeConfigMap.hasOwnProperty(type)) {
            return this.typeConfigMap[type];
        }
    }

    /**
    * Shortcut for constant lookup of operator config in operator configs map
    * @param {string} type - The type of the operator config to return, e.g. 'reply'
    * @returns {Object} - The operator config found at operatorConfigs[type] or -1
    */
    public getOperatorConfig(type: string): Operator {
        if (this.operatorConfigMap.hasOwnProperty(type)) {
            return this.operatorConfigMap[type];
        }
    }

    private getBaseLanguage(): Language {
        const [iso] = Object.keys(this.languages);
        const name = this.languages[iso];
        return {
            name,
            iso
        };
    }
};
