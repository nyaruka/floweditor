import { ChangeGroupComp, ChangeGroupForm } from '../components/actions/ChangeGroup';
import { SaveToContactComp, SaveToContactForm } from '../components/actions/SaveToContact';
import { ReplyComp, ReplyForm } from '../components/actions/Reply';
import { WebhookComp } from '../components/actions/Webhook';
import { SaveFlowResultComp, SaveFlowResultForm } from '../components/actions/SaveFlowResult';
import { StartFlowComp } from '../components/actions/StartFlow';
import { SendEmailComp, SendEmailForm } from '../components/actions/SendEmail';
import { SwitchRouterForm } from '../components/routers/SwitchRouter';
import { SubflowForm } from "../components/routers/Subflow";
import { WebhookForm } from "../components/routers/Webhook";
import { External } from "./External";

export interface Endpoints {
    fields: string;
    groups: string;
    engine: string;
    contacts: string;
    flows: string;
    activity: string;
}

export interface TypeConfig {
    type: string;
    name: string;
    description: string;

    hasAdvanced?: boolean;
    aliases?: string[];

    form: { new(props: any): any };
    component?: { new(props: any): any };
}

export interface Operator {
    type: string;
    verboseName: string;
    operands: number;

    // Default category name to use if specified
    categoryName?: string;
}

export class Config {

    private static singleton: Config;

    private typeConfigMap: { [type: string]: TypeConfig } = {};
    private actionTypes: TypeConfig[];
    public endpoints: Endpoints;
    public external: External;
    public languages: { [iso: string]: string };

    static get(): Config {
        return Config.singleton;
    }

    static initialize(config: FlowEditorConfig) {
        Config.singleton = new Config(config);
    }

    private constructor(config: FlowEditorConfig) {

        this.endpoints = config.endpoints;
        this.external = new External(this.endpoints);
        this.languages = config.languages;

        // create a mapping for quick lookups
        for (let typeConfig of this.typeConfigs) {
            this.typeConfigMap[typeConfig.type] = typeConfig;
            if (typeConfig.aliases) {
                for (let alias of typeConfig.aliases) {
                    this.typeConfigMap[alias] = typeConfig;
                }
            }
        }

        // create option list of only actions (things that can stack)
        this.actionTypes = [];
        for (let type of this.typeConfigs) {

            // things based off the switch router form are not stackable
            if (type.form.prototype instanceof SwitchRouterForm) {
                continue;
            }

            this.actionTypes.push(type);
        }
    }

    public typeConfigs: TypeConfig[] = [

        // actions
        { type: "reply", name: "Send Message", description: "Send them a message", form: ReplyForm, component: ReplyComp, hasAdvanced: true },
        // { type: "msg", name: "Send Message", description: "Send somebody else a message", form: SendMessageForm, component: SendMessage },

        { type: "add_to_group", name: "Add to Group", description: "Add them to a group", form: ChangeGroupForm, component: ChangeGroupComp },
        { type: "remove_from_group", name: "Remove from Group", description: "Remove them from a group", form: ChangeGroupForm, component: ChangeGroupComp },
        { type: "save_contact_field", name: "Update Contact", description: "Update the contact", form: SaveToContactForm, component: SaveToContactComp, aliases: ["update_contact"] },
        { type: "send_email", name: "Send Email", description: "Send an email", form: SendEmailForm, component: SendEmailComp },
        { type: "save_flow_result", name: "Save Flow Result", description: "Save a result for this flow", form: SaveFlowResultForm, component: SaveFlowResultComp },

        // {type: "add_label", name: "Add Label", description: "Label the message", component: Missing},
        // {type: "set_preferred_channel", name: "Set Preferred Channel", description: "Set their preferred channel", component: Missing},

        // hybrids
        { type: "call_webhook", name: "Call Webhook", description: "Call a webook", form: WebhookForm, component: WebhookComp, hasAdvanced: true, aliases: ["webhook"] },
        { type: "start_flow", name: "Run Flow", description: "Run another flow", form: SubflowForm, component: StartFlowComp, aliases: ["subflow"] },

        // routers
        { type: "expression", name: "Split by Expression", description: "Split by a custom expression", form: SwitchRouterForm },
        { type: "wait_for_response", name: "Wait for Response", description: "Wait for them to respond", form: SwitchRouterForm, hasAdvanced: true, aliases: ["switch"] },
        // {type: "random", name: "Random Split", description: "Split them up randomly", form: RandomRouterForm}
    ]

    public getActionTypes(): TypeConfig[] {
        return this.actionTypes;
    }

    public getTypeConfig(type: string): TypeConfig {
        return this.typeConfigMap[type];
    }

    public getOperatorConfig(type: string): Operator {
        var operator = this.operators.find((operator: Operator) => { return operator.type == type });
        if (!operator) {
            throw new Error("No operator found for " + type);
        }
        return operator;
    }

    public operators: Operator[] = [
        { type: "has_any_word", verboseName: "has any of the words", operands: 1 },
        { type: "has_all_words", verboseName: "has all of the words", operands: 1 },
        { type: "has_phrase", verboseName: "has the phrase", operands: 1 },
        { type: "has_only_phrase", verboseName: "has only the phrase", operands: 1 },
        { type: "has_beginning", verboseName: "starts with", operands: 1 },

        // { type: "has_number_between", verboseName: "has a number between", operands: 2},
        { type: "has_number_lt", verboseName: "has a number below", operands: 1 },
        { type: "has_number_lte", verboseName: "has a number at or below", operands: 1 },
        { type: "has_number_eq", verboseName: "has a number equal to", operands: 1 },
        { type: "has_number_gte", verboseName: "has a number at or above", operands: 1 },
        { type: "has_number_gt", verboseName: "has a number above", operands: 1 },

        // { type: "has_date", verboseName: "has a date", operands: 0},
        { type: "has_date_lt", verboseName: "has a date before", operands: 1 },
        { type: "has_date_eq", verboseName: "has a date equal to", operands: 1 },
        { type: "has_date_gt", verboseName: "has a date after", operands: 1 },

        // { type: "has_run_status", verboseName: "has a run status of", operands: 1 },
        // { type: "has_group", verboseName: "is in the group", operands: 1},        

        { type: "has_text", verboseName: "has some text", operands: 0, categoryName: "Has Text" },
        { type: "has_number", verboseName: "has a number", operands: 0, categoryName: "Number" },
        { type: "has_phone", verboseName: "has a phone number", operands: 0, categoryName: "Phone" },
        { type: "has_email", verboseName: "has an email", operands: 0, categoryName: "Email" },
        { type: "has_error", verboseName: "has an error", operands: 0, categoryName: "Error" },
        { type: "has_value", verboseName: "is not empty", operands: 0, categoryName: "Not Empty" },
    ]
}

export default Config;