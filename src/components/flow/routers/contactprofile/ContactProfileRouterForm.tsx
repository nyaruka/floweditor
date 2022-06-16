import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { FormEntry, FormState, StringEntry } from 'store/nodeEditor';
import { Numeric, Required, shouldRequireIf, validate } from 'store/validators';

import { nodeToState, stateToNode } from './helpers';
import styles from './ContactProfileRouterForm.module.scss';
import i18n from 'config/i18n';
import TextInputElement, { TextInputStyle } from 'components/form/textinput/TextInputElement';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import { AssetType } from 'store/flowContext';

export interface ContactProfileRouterFormState extends FormState {
  optionType: FormEntry;
  profileName: FormEntry;
  profileType: FormEntry;
}

export const profileOptions = {
  '1': { id: '1', name: 'Create Profile', type: AssetType.ContactProfile },
  '2': { id: '2', name: 'Switch Profile', type: AssetType.ContactProfile }
};

export const profileOptionsWithName: any = {
  'Create Profile': { id: '1', name: 'Create Profile', type: AssetType.ContactProfile },
  'Switch Profile': { id: '2', name: 'Switch Profile', type: AssetType.ContactProfile }
};

export default class ContactProfileRouterForm extends React.Component<
  RouterFormProps,
  ContactProfileRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handleTypeChange(value: any): void {
    const selection = value[0];
    this.setState({
      optionType: { value: selection }
    });
  }

  private handleSave(): void {
    let valid = true;

    const validName = validate('Name', this.state.profileName.value, [shouldRequireIf(true)]);

    if (validName.validationFailures.length > 0) {
      valid = false;
    }
    this.setState({ profileName: validName });

    if (valid) {
      this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
      this.props.onClose(false);
    }
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

  public renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />

        <p>{i18n.t('forms.select_what_to_update', 'Select what to update')}</p>
        <AssetSelector
          name={i18n.t('forms.contact_field', 'Contact profile')}
          assets={{
            type: AssetType.ContactProfile,
            items: profileOptions
          }}
          entry={this.state.optionType}
          searchable={true}
          onChange={this.handleTypeChange}
        />

        <div className={styles.name_field}>
          <TextInputElement
            name={i18n.t('forms.name', 'Name')}
            placeholder={i18n.t('forms.enter_profile_name', 'Enter profile name')}
            onChange={value => {
              this.setState({ profileName: { value } });
            }}
            entry={this.state.profileName}
            autocomplete={true}
            focus={true}
          />
        </div>

        {this.state.optionType.value.id === '1' && (
          <>
            <TextInputElement
              name={i18n.t('forms.type', 'Type')}
              placeholder={i18n.t('forms.enter_profile_type', 'Enter profile type')}
              onChange={value => {
                this.setState({ profileType: { value } });
              }}
              entry={this.state.profileType}
              autocomplete={true}
              focus={true}
            />
          </>
        )}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
