import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { initializeForm, stateToAction } from 'components/flow/actions/sendbroadcast/helpers';
import { ActionFormProps } from 'components/flow/props';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { Asset, AssetType } from 'store/flowContext';
import { AssetArrayEntry, FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { MaxOf640Chars, MaxOfThreeItems, shouldRequireIf, validate } from 'store/validators';
import i18n from 'config/i18n';
import { getComposeByAsset, getEmptyComposeValue, renderIssues } from '../helpers';
import ComposeElement from 'components/form/compose/ComposeElement';
import { MAX_ATTACHMENTS, MAX_TEXT_LEN } from 'config/interfaces';
import TembaSelectElement from 'temba/TembaSelectElement';

export interface SendBroadcastFormState extends FormState {
  compose: StringEntry;
  recipients: AssetArrayEntry;
}

// Note: action prop is only used for its uuid (see onValid)
export default class SendBroadcastForm extends React.Component<
  ActionFormProps,
  SendBroadcastFormState
> {
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: ActionFormProps) {
    super(props);
    this.state = initializeForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public handleRecipientsChanged(recipients: Asset[]): boolean {
    return this.handleUpdate({ recipients });
  }

  public handleComposeChanged(compose: string): boolean {
    return this.handleUpdate({ compose });
  }

  private handleUpdate(
    keys: { compose?: string; recipients?: Asset[] },
    submitting = false
  ): boolean {
    const updates: Partial<SendBroadcastFormState> = {};

    if (keys.hasOwnProperty('compose')) {
      // validate empty compose value
      if (keys.compose === getEmptyComposeValue()) {
        updates.compose = validate(i18n.t('forms.compose', 'Compose'), '', [
          shouldRequireIf(submitting)
        ]);
        updates.compose.value = keys.compose;
        if (updates.compose.validationFailures.length > 0) {
          let composeErrMsg = updates.compose.validationFailures[0].message;
          composeErrMsg = composeErrMsg.replace('Compose is', 'Message text is');
          updates.compose.validationFailures[0].message = composeErrMsg;
        }
      } else {
        updates.compose = validate(i18n.t('forms.compose', 'Compose'), keys.compose, [
          shouldRequireIf(submitting)
        ]);
        // validate inner compose text value
        const composeTextValue = getComposeByAsset(keys.compose, AssetType.ComposeText);
        const composeTextResult = validate(i18n.t('forms.compose', 'Compose'), composeTextValue, [
          MaxOf640Chars,
          shouldRequireIf(submitting)
        ]);
        if (composeTextResult.validationFailures.length > 0) {
          let textErrMsg = composeTextResult.validationFailures[0].message;
          textErrMsg = textErrMsg.replace('Compose is', 'Message text is');
          textErrMsg = textErrMsg.replace('Compose cannot be more than', 'Maximum allowed text is');
          composeTextResult.validationFailures[0].message = textErrMsg;
          updates.compose.validationFailures = [
            ...updates.compose.validationFailures,
            ...composeTextResult.validationFailures
          ];
        }
        // validate inner compose attachments value
        const composeAttachmentsValue = getComposeByAsset(
          keys.compose,
          AssetType.ComposeAttachments
        );
        const composeAttachmentsResult = validate(
          i18n.t('forms.compose', 'Compose'),
          composeAttachmentsValue,
          [MaxOfThreeItems]
        );
        if (composeAttachmentsResult.validationFailures.length > 0) {
          let attachmentsErrMsg = composeAttachmentsResult.validationFailures[0].message;
          attachmentsErrMsg = attachmentsErrMsg
            .replace('Compose cannot have more than', 'Maximum allowed attachments is')
            .replace('entries', 'files');
          composeAttachmentsResult.validationFailures[0].message = attachmentsErrMsg;
          updates.compose.validationFailures = [
            ...updates.compose.validationFailures,
            ...composeAttachmentsResult.validationFailures
          ];
        }
      }
    }

    if (keys.hasOwnProperty('recipients')) {
      updates.recipients = validate(i18n.t('forms.recipients', 'Recipients'), keys.recipients!, [
        shouldRequireIf(submitting)
      ]);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleSave(): void {
    // validate in case they never updated an empty field
    const valid = this.handleUpdate(
      {
        compose: this.state.compose.value!,
        recipients: this.state.recipients.value!
      },
      true
    );

    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));

      // notify our modal we are done
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

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />

        <TembaSelectElement
          key="recipient_select"
          name={i18n.t('forms.recipients', 'Recipients')}
          placeholder={i18n.t('forms.select_contacts', 'Select Contacts')}
          endpoint={this.context.config.endpoints.recipients}
          entry={this.state.recipients}
          searchable={true}
          multi={true}
          expressions={true}
          queryParam="search"
          onChange={this.handleRecipientsChanged}
        />

        <p />
        <ComposeElement
          name={i18n.t('forms.compose', 'Compose')}
          chatbox
          attachments
          counter
          entry={this.state.compose}
          maxlength={MAX_TEXT_LEN}
          maxattachments={MAX_ATTACHMENTS}
          onChange={this.handleComposeChanged}
        ></ComposeElement>
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
