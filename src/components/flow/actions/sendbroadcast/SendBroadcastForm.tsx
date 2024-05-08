import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { initializeForm, stateToAction } from 'components/flow/actions/sendbroadcast/helpers';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import { hasUseableTranslation } from 'components/form/assetselector/helpers';
import { fakePropType } from 'config/ConfigProvider';
import mutate from 'immutability-helper';
import * as React from 'react';
import { FormEntry } from 'store/nodeEditor';
import { Required } from 'store/validators';

import { hasErrors } from 'components/flow/actions/helpers';
import { Template, TemplateTranslation } from 'flowTypes';
import { range } from 'utils';
import styles from './SendBroadcastForm.module.scss';
import { Attachment, renderAttachments, validateURL } from '../sendmsg/attachments';
import { fetchAsset } from 'external';
import axios, { AxiosError, AxiosResponse } from 'axios';

import { Asset, AssetType } from 'store/flowContext';
import { AssetArrayEntry, FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { MaxOf640Chars, MaxOfThreeItems, shouldRequireIf, validate } from 'store/validators';
import i18n from 'config/i18n';
import { getComposeByAsset, getEmptyComposeValue, renderIssues } from '../helpers';
import TextInputElement from 'components/form/textinput/TextInputElement';

export interface SendBroadcastFormState extends FormState {
  template: FormEntry;
  templateVariables: StringEntry[];
  templateTranslation?: TemplateTranslation;
  compose: StringEntry;
  recipients: AssetArrayEntry;
  attachments: Attachment[];
  validAttachment: boolean;
  uploadInProgress: boolean;
  uploadError: string;
  attachmentError: string;
}

// Note: action prop is only used for its uuid (see onValid)
export default class SendBroadcastForm extends React.Component<
  ActionFormProps,
  SendBroadcastFormState
> {
  public static contextTypes = {
    config: fakePropType,
    endpoints: fakePropType,
    assetService: fakePropType
  };
  private timeout: any;

  constructor(props: ActionFormProps) {
    super(props);
    this.state = initializeForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
    if (this.state.template.value !== null) {
      fetchAsset(this.props.assetStore.templates, this.state.template.value.uuid).then(
        (asset: Asset) => {
          if (asset && asset.content) {
            this.handleTemplateChanged([{ ...this.state.template.value, ...asset.content }]);
          }
        }
      );
    }
  }

  public handleRecipientsChanged(recipients: Asset[]): boolean {
    return this.handleUpdate({ recipients });
  }

  public handleComposeChanged(compose: string): boolean {
    return this.handleUpdate({ compose });
  }

  private handleUpdate(
    keys: { compose?: string; recipients?: Asset[]; template?: string },
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

    if (keys.hasOwnProperty('template')) {
      updates.template = validate(i18n.t('forms.templates', 'Template'), keys.template!, [
        shouldRequireIf(submitting)
      ]);
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

  public handleAxios(body: any) {
    axios
      .get(`${this.props.assetStore.validateMedia.endpoint}?url=${body.url}&type=${body.type}`)
      .then(response => {
        if (response.data.is_valid) {
          // make sure we validate untouched text fields and contact fields
          let valid = true;

          valid = this.handleUpdate(
            {
              recipients: this.state.recipients.value
            },
            true
          );

          if (valid) {
            // this.setState({ validAttachment: false });
            this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));
            // notify our modal we are done
            this.props.onClose(false);
          } else {
            this.setState({ valid });
          }
        } else {
          this.setState({ attachmentError: response.data.message });
        }
      })
      .catch(error => {
        this.setState({ attachmentError: `The attachment url is invalid!: ${error.toString()}` });
      });
  }

  private handleSave(): void {
    if (this.state.attachments.length > 0) {
      this.handleAxios(this.state.attachments[0]);

      this.setState({ validAttachment: true, attachmentError: null });
    } else {
      // validate in case they never updated an empty field
      let valid = this.handleUpdate(
        {
          compose: this.state.compose.value,
          recipients: this.state.recipients.value,
          template: this.state.template.value
        },
        true
      );

      let templateVariables = this.state.templateVariables;
      // make sure we don't have untouched template variables
      this.state.templateVariables.forEach((variable: StringEntry, num: number) => {
        const updated = validate(`Variable ${num + 1}`, variable.value, [Required]);
        templateVariables = mutate(templateVariables, {
          [num]: { $merge: updated }
        }) as StringEntry[];
        valid = valid && !hasErrors(updated);
      });
      if (valid) {
        this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));
        // notify our modal we are done
        this.props.onClose(false);
      } else {
        this.setState({ templateVariables, valid });
      }
    }
  }

  private handleShouldExcludeTemplate(template: any): boolean {
    return !hasUseableTranslation(template as Template);
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

  private handleTemplateChanged(selected: any[]): void {
    const template = selected ? selected[0] : null;

    if (!template) {
      this.setState({
        template: { value: null },
        templateTranslation: null,
        templateVariables: []
      });
    } else {
      const templateTranslation = template.translations[0];

      const templateVariables =
        this.state.templateVariables.length === 0 ||
        (this.state.template.value && this.state.template.value.uuid !== template.uuid)
          ? range(0, templateTranslation.variable_count).map(() => {
              return {
                value: ''
              };
            })
          : this.state.templateVariables;
      this.setState({
        template: { value: template },
        templateTranslation,
        templateVariables
      });
    }
  }

  private handleTemplateVariableChanged(updatedText: string, num: number): void {
    const entry = validate(`Variable ${num + 1}`, updatedText, [Required]);
    const templateVariables = mutate(this.state.templateVariables, {
      $merge: { [num]: entry }
    }) as StringEntry[];
    this.setState({ templateVariables });
  }

  private renderTemplateConfig(): JSX.Element {
    return (
      <>
        <p>
          {i18n.t(
            'forms.whatsapp_warning',
            'Sending messages over a WhatsApp channel requires that a template be used if you have not received a message from a contact in the last 24 hours. Setting a template to use over WhatsApp is especially important for the first message in your flow.'
          )}
        </p>
        <AssetSelector
          name={i18n.t('forms.template', 'template')}
          noOptionsMessage="No templates found"
          assets={this.props.assetStore.templates}
          entry={this.state.template}
          onChange={this.handleTemplateChanged}
          shouldExclude={this.handleShouldExcludeTemplate}
          searchable={true}
          formClearable={true}
        />
        {this.state.templateTranslation ? (
          <>
            <div className={styles.template_text}>{this.state.templateTranslation.content}</div>
            {range(0, this.state.templateTranslation.variable_count).map((num: number): any => {
              return (
                <div className={styles.variable} key={'tr_arg_' + num}>
                  <TextInputElement
                    name={`${i18n.t('forms.variable', 'Variable')} ${num + 1}`}
                    showLabel={false}
                    placeholder={`${i18n.t('forms.variable', 'Variable')} ${num + 1}`}
                    onChange={(updatedText: string): any => {
                      this.handleTemplateVariableChanged(updatedText, num);
                    }}
                    entry={
                      this.state.templateVariables[num] === undefined
                        ? { value: '' }
                        : this.state.templateVariables[num]
                    }
                    autocomplete={true}
                  />
                </div>
              );
            })}
          </>
        ) : null}
      </>
    );
  }

  private handleAttachmentUploading(isUploading: boolean) {
    const uploadError = '';
    this.setState({ uploadError });

    if (isUploading) {
      const uploadInProgress = true;
      this.setState({ uploadInProgress });
    } else {
      const uploadInProgress = false;
      this.setState({ uploadInProgress });
    }
  }

  private handleAttachmentUploaded(response: AxiosResponse) {
    //django returns a 200 even when there's an error
    if (response.data && response.data.error) {
      const uploadError: string = response.data.error;
      this.setState({ uploadError });
    } else {
      const attachments: any = mutate(this.state.attachments, {
        $push: [{ type: response.data.type, url: response.data.url, uploaded: true }]
      });
      this.setState({ attachments });

      const uploadError = '';

      this.setState({ uploadError });
    }

    const uploadInProgress = false;
    this.setState({ uploadInProgress });
  }

  private handleAttachmentUploadFailed(error: AxiosError) {
    //nginx returns a 300+ if there's an error
    let uploadError = '';
    const status = error.response.status;
    if (status >= 500) {
      uploadError = i18n.t('file_upload_failed_generic', 'File upload failed, please try again');
    } else if (status === 413) {
      uploadError = i18n.t('file_upload_failed_max_limit', 'Limit for file uploads is 25 MB');
    } else {
      uploadError = error.response.statusText;
    }
    this.setState({ uploadError });

    const uploadInProgress = false;
    this.setState({ uploadInProgress });
  }

  private handleAttachmentChanged(index: number, type: string, url: string) {
    this.handleAttachmentUploading(false);

    let attachments: any = this.state.attachments;

    const isExpression = type === 'expression';

    if (type && !isExpression && url) {
      window.clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        validateURL(this.props.assetStore.validateMedia.endpoint, attachments[0], this);
      }, 1000);
    }

    if (index === -1) {
      attachments = mutate(attachments, {
        $push: [{ type, url, uploaded: false }]
      });
    } else {
      attachments = mutate(attachments, {
        [index]: {
          $set: { type, url, valid: !isExpression }
        }
      });
    }

    this.setState({ attachments });
  }

  private attachmentValidate(body: any, valid: boolean, validationFailures: any) {
    const attachments: any = mutate(this.state.attachments, {
      0: {
        $set: { type: body.type, url: body.url, valid, validationFailures }
      }
    });
    this.setState({ attachments });
  }

  public handleAttachmentRemoved(index: number): void {
    // we found a match, merge us in
    const updated: any = mutate(this.state.attachments, {
      $splice: [[index, 1]]
    });
    this.setState({ attachments: updated, attachmentError: null, validAttachment: false });
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const shouldExclude = (asset: Asset): boolean => asset.type === 'group';

    const templates: any = {
      name: 'WhatsApp',
      body: this.renderTemplateConfig(),
      checked: this.state.template.value != null,
      hasErrors: !!this.state.templateVariables.find((entry: StringEntry) => hasErrors(entry))
    };

    const attachments: Tab = {
      name: 'Attachments',
      body: renderAttachments(
        this.context.config.endpoints.attachments,
        this.context.config.attachmentsEnabled,
        this.state.attachments,
        this.state.uploadInProgress,
        this.state.uploadError,
        this.handleAttachmentUploading,
        this.handleAttachmentUploaded,
        this.handleAttachmentUploadFailed,
        this.handleAttachmentChanged,
        this.handleAttachmentRemoved
      ),
      checked: this.state.attachments.length > 0,
      hasErrors: this.state.attachments.length > 0 && this.state.attachments[0].valid
    };
    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={[attachments, templates]}
      >
        <TypeList
          __className=""
          initialType={typeConfig}
          onChange={this.props.onTypeChange}
          customTitle={'Step 1: When a contact arrives at this point in your flow...'}
        />

        <AssetSelector
          name={i18n.t('forms.recipients', 'Recipients')}
          placeholder={i18n.t('forms.select_contacts', 'Select Contacts')}
          assets={this.props.assetStore.recipients}
          entry={this.state.recipients}
          searchable={true}
          multi={true}
          shouldExclude={shouldExclude}
          expressions={true}
          onChange={this.handleRecipientsChanged}
        />
        <p />

        {/* 
        This is not needed in Glific's context
        <ComposeElement
          name={i18n.t('forms.compose', 'Compose')}
          chatbox
          counter
          entry={this.state.compose}
          onChange={this.handleComposeChanged}
        ></ComposeElement> */}
        <p>Step 2: Select a template on the WhatsApp tab</p>
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
