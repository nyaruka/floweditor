import { Action, Case, Category, MsgTemplateComponent } from 'flowTypes';

import { Language } from 'temba-components';

// list of keys that should always be treated as an array
const ARRAY_KEYS = ['attachments', 'components'];

export class LocalizedObject {
  public localizedKeys: { [key: string]: boolean } = {};

  private localizedObject: Action | Category | Case | any;
  private localized: boolean = false;
  private name: string;
  private language: Language;

  constructor(object: Action | Category | Case | MsgTemplateComponent, language: Language) {
    this.localizedObject = object;
    this.language = language;
  }

  public getLanguage(): Language {
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

    if (Array.isArray(this.localizedObject[key]) || ARRAY_KEYS.includes(key)) {
      this.localizedObject[key] = value;
    } else {
      if (value.length === 1) {
        this.localizedObject[key] = value[0];
      }
    }

    this.localizedKeys[key] = true;
  }

  public isLocalized(): boolean {
    return this.localized;
  }

  public getObject(): Action | Case | Category {
    return this.localizedObject;
  }
}

export default class Localization {
  public static translate(
    object: Action | Category | Case | MsgTemplateComponent,
    language: Language,
    translations?: { [uuid: string]: any }
  ): LocalizedObject {
    const localized: LocalizedObject = new LocalizedObject(object, language);

    if (translations) {
      if (object.uuid in translations) {
        const values = translations[object.uuid];
        // We don't want to side affect our action
        Object.keys(values).forEach(key => {
          return localized.addTranslation(key, values[key]);
        });
      }
    }

    return localized;
  }
}
