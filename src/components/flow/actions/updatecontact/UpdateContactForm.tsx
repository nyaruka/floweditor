import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import {
  initializeForm,
  sortFieldsAndProperties,
  stateToAction,
  UpdateContactFormState
} from 'components/flow/actions/updatecontact/helpers';
import { ActionFormProps } from 'components/flow/props';
import TextInputElement from 'components/form/textinput/TextInputElement';
import { getContactProperties } from 'components/helpers';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import { Types, ContactStatus } from 'config/interfaces';
import { ContactProperties } from 'flowTypes';
import * as React from 'react';
import { Asset, AssetType } from 'store/flowContext';
import { mergeForm } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';

import styles from './UpdateContactForm.module.scss';
import i18n from 'config/i18n';
import { renderIssues } from '../helpers';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import TembaSelectElement from 'temba/TembaSelectElement';

export const CONTACT_STATUS_ACTIVE: SelectOption = {
  name: i18n.t('contact_statuses.active', 'Active'),
  value: ContactStatus.ACTIVE
};
export const CONTACT_STATUS_BLOCKED: SelectOption = {
  name: i18n.t('contact_statuses.blocked', 'Blocked - remove from groups, ignore forever'),
  value: ContactStatus.BLOCKED
};
export const CONTACT_STATUS_STOPPED: SelectOption = {
  name: i18n.t(
    'contact_statuses.stopped',
    'Stopped - remove from groups, ignore until they message again'
  ),
  value: ContactStatus.STOPPED
};
export const CONTACT_STATUS_ARCHIVED: SelectOption = {
  name: i18n.t('contact_statuses.archived', 'Archived - remove from groups, ignore forever'),
  value: ContactStatus.ARCHIVED
};
export const CONTACT_STATUS_OPTIONS: SelectOption[] = [
  CONTACT_STATUS_ACTIVE,
  CONTACT_STATUS_BLOCKED,
  CONTACT_STATUS_STOPPED,
  CONTACT_STATUS_ARCHIVED
];

export default class UpdateContactForm extends React.Component<
  ActionFormProps,
  UpdateContactFormState
> {
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: ActionFormProps) {
    super(props);

    this.state = initializeForm(this.props.nodeSettings, this.props.assetStore);

    bindCallbacks(this, {
      include: [/^get/, /^on/, /^handle/]
    });
  }

  private handleUpdate(
    keys: {
      type?: Types;
      name?: string;
      channel?: Asset;
      language?: Asset;
      status?: SelectOption;
      field?: Asset;
      fieldValue?: string;
    },
    submitting = false
  ): boolean {
    const updates: Partial<UpdateContactFormState> = {};

    if (keys.hasOwnProperty('type')) {
      updates.type = keys.type;
    }

    if (keys.hasOwnProperty('name')) {
      updates.name = { value: keys.name };
    }

    if (keys.hasOwnProperty('channel')) {
      updates.channel = validate(i18n.t('forms.channel', 'Channel'), keys.channel, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('language')) {
      updates.language = validate(i18n.t('forms.language', 'Language'), keys.language, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('status')) {
      updates.status = { value: keys.status };
    }

    if (keys.hasOwnProperty('field')) {
      updates.field = { value: keys.field };
    }

    if (keys.hasOwnProperty('fieldValue')) {
      updates.fieldValue = { value: keys.fieldValue, validationFailures: [] };
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handlePropertyChange(selection: any): boolean {
    if (selection) {
      if (selection.type === AssetType.ContactProperty) {
        switch (selection.id) {
          case ContactProperties.Name:
            return this.handleUpdate({
              field: selection,
              type: Types.set_contact_name
            });
          case ContactProperties.Language:
            return this.handleUpdate({
              field: selection,
              type: Types.set_contact_language
            });
          case ContactProperties.Status:
            return this.handleUpdate({
              field: selection,
              type: Types.set_contact_status
            });
          case ContactProperties.Channel:
            return this.handleUpdate({
              field: selection,
              type: Types.set_contact_channel
            });
        }
      }
      return this.handleUpdate({
        type: Types.set_contact_field,
        field: selection
      });
    }
  }

  private handleChannelUpdate(selection: Asset, submitting = false): boolean {
    return this.handleUpdate({ channel: selection }, submitting);
  }

  private handleLanguageUpdate(selection: Asset, submitting = false): boolean {
    return this.handleUpdate({ language: selection }, submitting);
  }

  private handleStatusUpdate(status: SelectOption): boolean {
    return this.handleUpdate({ status, fieldValue: '' });
  }

  private handleFieldValueUpdate(fieldValue: string): boolean {
    return this.handleUpdate({ fieldValue, name: '' });
  }

  private handleNameUpdate(name: string): boolean {
    return this.handleUpdate({ name, fieldValue: '' });
  }

  public handleFieldAdded(field: Asset): void {
    // update our store with our new group
    this.props.addAsset('fields', field);
    this.handlePropertyChange(field);
  }

  private handleSave(): void {
    let valid = this.state.valid;

    // check if language required
    if (this.state.type === Types.set_contact_language) {
      valid = this.handleLanguageUpdate(this.state.language.value, true) && valid;
    }

    // check if channel required
    if (this.state.type === Types.set_contact_channel) {
      valid = this.handleChannelUpdate(this.state.channel.value, true) && valid;
    }

    if (valid) {
      // do the saving!
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));
      this.props.onClose(true);
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

  /**
   * The value widget varies for the action type
   */
  private getValueWidget(): JSX.Element {
    if (this.state.type === Types.set_contact_channel) {
      return (
        <TembaSelectElement
          key="select_channel"
          name={i18n.t('forms.channel', 'Channel')}
          placeholder={i18n.t('forms.select_channel', 'Select the channel to use for this contact')}
          endpoint={this.context.config.endpoints.channels}
          entry={this.state.channel}
          valueKey="uuid"
          searchable={true}
          clearable={true}
          onChange={this.handleChannelUpdate}
        />
      );
    }

    if (this.state.type === Types.set_contact_language) {
      return (
        <TembaSelectElement
          key="select_language"
          name={i18n.t('forms.language', 'Language')}
          placeholder={i18n.t(
            'forms.select_language',
            'Select the language to use for this contact'
          )}
          endpoint={this.context.config.endpoints.languages}
          entry={this.state.language}
          valueKey="iso"
          clearable={true}
          shouldExclude={(language: any) => {
            return language.iso === 'base';
          }}
          onChange={this.handleLanguageUpdate}
        />
      );
    } else if (this.state.type === Types.set_contact_status) {
      return (
        <SelectElement
          key="contact_status_select"
          name={i18n.t('forms.status', 'Status')}
          entry={this.state.status}
          onChange={this.handleStatusUpdate}
          options={CONTACT_STATUS_OPTIONS}
        />
      );
    } else if (this.state.type === Types.set_contact_name) {
      return (
        <TextInputElement
          name={i18n.t('forms.name', 'Name')}
          placeholder={i18n.t('forms.enter_new_name', 'Enter a new name for the contact')}
          onChange={this.handleNameUpdate}
          entry={this.state.name}
          autocomplete={true}
          focus={true}
        />
      );
    } else {
      return (
        <TextInputElement
          name={i18n.t('forms.field_value', 'Field Value')}
          placeholder={i18n.t('forms.enter_field_value', { field: this.state.field.value.label })}
          onChange={this.handleFieldValueUpdate}
          entry={this.state.fieldValue}
          autocomplete={true}
          focus={true}
        />
      );
    }
  }

  public handleCreateAssetFromInput(input: string): any {
    return { label: input, value_type: 'text' };
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />

        <p>{i18n.t('forms.select_what_to_update', 'Select what to update')}</p>

        <TembaSelectElement
          key="field_select"
          name={i18n.t('forms.contact_field', 'Contact Field')}
          endpoint={this.context.config.endpoints.fields}
          entry={this.state.field}
          valueKey="uuid"
          searchable={true}
          sortFunction={sortFieldsAndProperties}
          onChange={this.handlePropertyChange}
          options={getContactProperties(this.context.config.flowType)}
          allowCreate={true}
          createPrefix={i18n.t('create_field', 'Create Field') + ': '}
          createArbitraryOption={this.handleCreateAssetFromInput}
        />

        <div className={styles.value}>{this.getValueWidget()}</div>
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
