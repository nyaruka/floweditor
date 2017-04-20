import * as Interfaces from '../interfaces';
import * as Renderer from '../components/Renderer';

export class Config {

    private static singleton: Config = new Config();

    static get(): Config {
        return Config.singleton;
    }

    private constructor() {
        console.log('init config');
    }

    public typeConfigs: Interfaces.TypeConfig[] = [

        // actions
        {type: "msg", name: "Send Message", description: "Send them a message", renderer: Renderer.SendMessage},
        {type: "add_to_group", name: "Add to Group", description: "Add them to a group", renderer: Renderer.AddToGroup},
        {type: "save_to_contact", name: "Save to Contact", description: "Update one of their fields", renderer: Renderer.SaveToContact},
        {type: "set_language", name: "Set Language", description: "Update their language", renderer: Renderer.SetLanguage},
        
        // hybrids
        {type: "webhook", name: "Call Webhook", description: "Call an external service", renderer: Renderer.Webhook},

        // routers
        {type: "switch", name: "Wait for Response", description: "Wait for them to respond", renderer: Renderer.SwitchRouter},
        {type: "random", name: "Random Split", description: "Split them up randomly", renderer: Renderer.RandomRouter}

    ]

    public getTypeConfig(type: string): Interfaces.TypeConfig {
        for (let config of this.typeConfigs) {
            if (config.type == type) {
                return config;
            }
        }
        return null;
    }
}

export default Config;