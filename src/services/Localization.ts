import { Action, Case, Category, Language, MsgTemplating } from 'flowTypes';
import { Asset } from 'store/flowContext';

export class LocalizedObject {
  public localizedKeys: { [key: string]: boolean } = {};

  private localizedObject: Action | Category | Case | any;
  private localized: boolean = false;
  private iso: string;
  private name: string;
  private language: Language;

  constructor(object: Action | Category | Case | MsgTemplating, { id, name }: Asset) {
    this.localizedObject = object;
    this.iso = id;
    this.language = { iso: this.iso, name };
  }

  public getLanguage(): Language {
    if (!this.language) {
      if (this.iso) {
        this.language = { iso: this.iso, name: this.name };
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

    if (Array.isArray(this.localizedObject[key])) {
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

  public getObject(): Action | Case | Category | MsgTemplating {
    return this.localizedObject;
  }
}

export default class Localization {
  public static translate(
    object: Action | Category | Case | MsgTemplating,
    language: Asset,
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
