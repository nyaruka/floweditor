import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import styles from 'components/flow/actions/action/Action.module.scss';
import { initializeLocalizedKeyForm } from 'components/flow/actions/localization/helpers';
import { determineTypeConfig } from 'components/flow/helpers';
import { LocalizationFormProps } from 'components/flow/props';
import TextInputElement from 'components/form/textinput/TextInputElement';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { FormState, StringEntry, ValidationFailure } from 'store/nodeEditor';
import i18n from 'config/i18n';

export interface KeyLocalizationFormState extends FormState {
  keyValues: { [key: string]: StringEntry };
}

export default class KeyLocalizationForm extends React.Component<
  LocalizationFormProps,
  KeyLocalizationFormState
> {
  constructor(props: LocalizationFormProps) {
    super(props);
    this.state = initializeLocalizedKeyForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/, /^on/]
    });
  }

  public static contextTypes = {
    config: fakePropType
  };

  public handleKeyUpdate(text: string, name: string): boolean {
    const keyValues = { ...this.state.keyValues };
    keyValues[name.toLowerCase()] = { value: text };
    this.setState({ keyValues });
    return true;
  }

  private handleSave(): void {
    const translations: { [key: string]: string } = {};

    Object.keys(this.state.keyValues).forEach((key: string) => {
      const value = this.state.keyValues[key].value;
      if (value) {
        translations[key] = value;
      } else {
        delete translations[key];
      }
    });

    this.props.updateLocalizations(this.props.language.id, [
      {
        uuid: this.props.nodeSettings.originalAction!.uuid,
        translations
      }
    ]);

    // notify our modal we are done
    this.props.onClose(false);
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.ok', 'Ok'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true)
      }
    };
  }

  public render(): JSX.Element {
    const typeConfig = determineTypeConfig(this.props.nodeSettings);
    const tabs: Tab[] = [];

    let base: JSX.Element;

    typeConfig.localizeableKeys.forEach((key: string) => {
      const name = key[0].toUpperCase() + key.slice(1);

      const form = (
        <div key={`localize_form_${key}`}>
          <div data-spec="translation-container">
            <div data-spec="text-to-translate" className={styles.translate_from}>
              {(this.props.nodeSettings.originalAction as any)[key]}
            </div>
          </div>
          <TextInputElement
            name={name}
            showLabel={false}
            onChange={this.handleKeyUpdate}
            entry={this.state.keyValues[key]}
            placeholder={`${this.props.language.name} Translation`}
            onFieldFailures={(persistantFailures: ValidationFailure[]) => {
              const keyValues = this.state.keyValues;
              keyValues[key] = { ...this.state.keyValues[key], persistantFailures };
              this.setState({
                keyValues,
                valid: this.state.valid
              });
            }}
            autocomplete={true}
            focus={true}
            textarea={true}
          />
        </div>
      );

      if (!base) {
        base = form;
      } else {
        tabs.push({
          name: name + ' ' + i18n.t('translation', 'Translation'),
          body: form,
          checked: !!this.state.keyValues[key].value
        });
      }
    });

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
      >
        {base}
      </Dialog>
    );
  }
}
