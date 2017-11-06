import { IAction, IExit, ICase } from '../flowTypes';
import { ILanguages } from '../services/EditorConfig';
import { ILanguage } from '../components/LanguageSelector';
import __flow_editor_config__ from '../flowEditorConfig';

 export class LocalizedObject {
    public localizedKeys: { [key: string]: boolean } = {};

    private localizedObject: IAction | IExit | ICase;
    private localized: boolean;
    private iso: string;
    private language: ILanguage;

    constructor(object: IAction | IExit | ICase, iso: string, languages: ILanguages) {
        this.localizedObject = object;
        this.iso = iso;
    }

    getLanguage() {
        if (!this.language) {
            if (this.iso) {
                this.language = { iso: this.iso, name: __flow_editor_config__.languages[this.iso] };
            }
        }
        return this.language;
    }

    hasTranslation(key: string) {
        return key in this.localizedKeys;
    }

    // We use explicit any here to make this generic across all actions,
    // note this means we'll attempt to set any property in our localization
    // dictionary regardless of the object type
    addTranslation(key: string, value: any) {
        // localization shouldn't side-affect the original object
        if (!this.localized) {
            this.localizedObject = Object.assign({}, this.localizedObject);
            this.localized = true;
        }

        if ((this.localizedObject as any)[key].constructor.name == 'String') {
            value = value[0];
        }
        (this.localizedObject as any)[key] = value;
        this.localizedKeys[key] = true;
    }

    public getObject(): IAction | ICase | IExit {
        return this.localizedObject;
    }
}
class Localization {
    static translate(
        object: IAction | IExit | ICase,
        iso: string,
        languages: ILanguages,
        translations?: { [uuid: string]: any }
    ): LocalizedObject {
        if (translations) {
            const localized = new LocalizedObject(object, iso, languages);
            if (object.uuid in translations) {
                const values = translations[object.uuid];
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

export default Localization;
