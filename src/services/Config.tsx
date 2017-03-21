import * as Interfaces from '../interfaces';
import * as Forms from '../components/Forms';

export interface TypeConfig {
    type: string;
    name: string;
    description: string;
    form: {new(props: Interfaces.NodeEditorProps): Forms.FormHandler};
}

export class Config {

    private static singleton: Config = new Config();

    static get(): Config {
        return Config.singleton;
    }

    private constructor() {
        console.log('init config');
    }

    public typeConfigs: TypeConfig[] = [

        // actions
        {type: "msg", name: "Send Message", description: "Send them a message", form: Forms.SendMessageForm},
        {type: "add_to_group", name: "Add to Group", description: "Add them to a group", form: Forms.AddToGroupForm},
        {type: "save_to_contact", name: "Save to Contact", description: "Update one of their fields", form: Forms.SaveToContactForm},
        {type: "set_language", name: "Set Language", description: "Update their language", form: Forms.SetLanguageForm},
        
        // hybrids
        {type: "webhook", name: "Call Webhook", description: "Call an external service", form: Forms.WebhookForm},

        // routers
        {type: "switch", name: "Wait for Response", description: "Wait for them to respond", form: Forms.SwitchRouterForm}

    ]

    public getTypeConfig(type: string): TypeConfig {
        for (let config of this.typeConfigs) {
            if (config.type == type) {
                return config;
            }
        }
        return null;
    }
}