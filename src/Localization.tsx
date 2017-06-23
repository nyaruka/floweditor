import { LocalizationMap, Action, Exit, Case } from "./FlowDefinition";
import { Language } from "./components/LanguageSelector";
import { Config } from "./services/Config";


export class LocalizedObject {

    public localizedKeys: { [key: string]: boolean } = {};

    private localizedObject: Action | Exit | Case;
    private localized: boolean;
    private iso: string;
    private language: Language;

    constructor(object: Action | Exit | Case, iso: string) {
        this.localizedObject = object;
        this.iso = iso;
    }

    getLanguage() {
        if (!this.language) {
            if (this.iso) {
                this.language = { iso: this.iso, name: Config.get().languages[this.iso] };
            }
        }
        return this.language;
    }

    hasTranslation(key: string) {
        return key in this.localizedKeys;
    }

    // We use explicit any here to make this generic across all actions,
    // note this means we'll attempt to set any propertiy in our localization
    // dictionary regardless of the action type
    addTranslation(key: string, value: string) {

        // localization shouldn't side-affect the original action
        if (!this.localized) {
            this.localizedObject = Object.assign({}, this.localizedObject);
            this.localized = true;
        }

        (this.localizedObject as any)[key] = value;
        this.localizedKeys[key] = true;
    }

    public getObject(): Action | Case | Exit {
        return this.localizedObject;
    }
}

export class Localization {
    static translate(object: Action | Exit | Case, iso: string, translations: { [uuid: string]: any }): LocalizedObject {
        if (translations) {
            var localized = new LocalizedObject(object, iso);
            if (object.uuid in translations) {
                var values = translations[object.uuid];
                // we don't want to side affect our action
                for (let key of Object.keys(values)) {
                    localized.addTranslation(key, values[key]);
                }
            }
            return localized;
        }
        return null;
    }
}