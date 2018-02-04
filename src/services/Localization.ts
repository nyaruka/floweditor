import { Action, Languages, Exit, Case } from '../flowTypes';
import { Language } from '../components/LanguageSelector';

export class LocalizedObject {
    public localizedKeys: { [key: string]: boolean } = {};

    private localizedObject: Action | Exit | Case;
    private localized: boolean = false;
    private iso: string;
    private language: Language;
    private languages: Languages;

    constructor(object: Action | Exit | Case, iso: string, languages: Languages) {
        this.localizedObject = object;
        this.iso = iso;
        this.language = { iso, name: languages[iso] };
        this.languages = languages;
    }

    public getLanguage(): Language {
        if (!this.language) {
            if (this.iso) {
                this.language = { iso: this.iso, name: this.languages[this.iso] };
            }
        }

        return this.language;
    }

    public hasTranslation(key: string): boolean {
        return key in this.localizedKeys;
    }

    // We use explicit any here to make this generic across all actions,
    // note this means we'll attempt to set any property in our localization
    // dictionary regardless of the object type
    public addTranslation(key: string, value: any): void {
        // localization shouldn't side-affect the original object
        if (!this.localized) {
            this.localizedObject = Object.assign({}, this.localizedObject);

            this.localized = true;
        }

        this.localizedObject[key] = value;

        this.localizedKeys[key] = true;
    }

    public isLocalized(): boolean {
        return this.localized;
    }

    public getObject(): Action | Case | Exit {
        return this.localizedObject;
    }
}
export default class Localization {
    public static translate(
        object: Action | Exit | Case,
        iso: string,
        languages: Languages,
        translations?: { [uuid: string]: any }
    ): LocalizedObject {
        const localized: LocalizedObject = new LocalizedObject(object, iso, languages);

        if (translations) {
            if (object.uuid in translations) {
                const values = translations[object.uuid];
                // We don't want to side affect our action
                Object.keys(values).forEach(key => localized.addTranslation(key, values[key]));
            }
        }

        return localized;
    }
}
