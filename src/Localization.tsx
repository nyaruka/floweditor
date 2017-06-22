import { LocalizationMap, Action, Exit, Case } from "./FlowDefinition";


export class LocalizedObject {

    public localizedKeys: { [key: string]: boolean } = {};

    private localizedObject: Action | Exit;
    private localized: boolean;

    constructor(object: Action | Exit | Case) {
        this.localizedObject = object;
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

    public getObject() {
        return this.localizedObject;
    }
}

export class Localization {
    private mappings: LocalizationMap;

    constructor(mappings: LocalizationMap) {
        this.mappings = mappings;
    }

    getTranslations(object: Action | Exit | Case, iso: string): LocalizedObject {
        if (iso) {
            var localized = new LocalizedObject(object);
            if (this.mappings) {
                if (iso in this.mappings) {
                    var languageValues = this.mappings[iso];
                    if (object.uuid in languageValues) {
                        var translations = languageValues[object.uuid];
                        // we don't want to side affect our action
                        for (let key of Object.keys(translations)) {
                            localized.addTranslation(key, translations[key]);
                        }
                    }
                }
            }
            return localized;
        }
        return null;
    }
}