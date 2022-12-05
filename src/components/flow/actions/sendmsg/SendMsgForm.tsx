/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { react as bindCallbacks } from 'auto-bind';
import { AxiosError, AxiosResponse } from 'axios';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import {
  initializeForm as stateToForm,
  stateToAction,
  TOPIC_OPTIONS
} from 'components/flow/actions/sendmsg/helpers';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import { hasUseableTranslation } from 'components/form/assetselector/helpers';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import { fetchAsset } from 'external';
import { Template, TemplateTranslation } from 'flowTypes';
import mutate from 'immutability-helper';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import {
  FormState,
  mergeForm,
  StringArrayEntry,
  StringEntry,
  SelectOptionEntry,
  FormEntry
} from 'store/nodeEditor';
import {
  CharactersLessThan,
  MaxOfTenItems,
  Required,
  shouldRequireIf,
  validate
} from 'store/validators';
import { range } from 'utils';

import styles from './SendMsgForm.module.scss';
import { hasFeature } from 'config/typeConfigs';
import { FeatureFilter } from 'config/interfaces';

import i18n from 'config/i18n';
import { Attachment, renderAttachments, validateURL } from './attachments';
import { AddLabelsFormState } from '../addlabels/AddLabelsForm';

export interface SendMsgFormState extends FormState {
  message: StringEntry;
  quickReplies: StringArrayEntry;
  quickReplyEntry: StringEntry;
  sendAll: boolean;
  attachments: Attachment[];
  uploadInProgress: boolean;
  uploadError: string;
  template: FormEntry;
  topic: SelectOptionEntry;
  templateVariables: StringEntry[];
  templateTranslation?: TemplateTranslation;
  labels?: any;
  expression?: any;
}

// this is an additonal item in templates that need to have a same format as other list items
const additionalOption = {
  name: 'Expression',
  translations: [
    {
      channel: {
        name: 'WhatsApp'
      },
      status: 'approved'
    }
  ]
};

export default class SendMsgForm extends React.Component<ActionFormProps, SendMsgFormState> {
  private filePicker: any;
  private timeout: any;

  constructor(props: ActionFormProps) {
    super(props);
    this.state = stateToForm(this.props.nodeSettings, this.props.assetStore);
    bindCallbacks(this, {
      include: [/^handle/, /^on/]
    });
    // intialize our templates if we have them
    if (this.state.template.value !== null && this.state.template.value.name !== 'Expression') {
      fetchAsset(this.props.assetStore.templates, this.state.template.value.uuid).then(
        (asset: Asset) => {
          if (asset !== null) {
            this.handleTemplateChanged([{ ...this.state.template.value, ...asset.content }]);
          }
        }
      );
    }
  }

  public static contextTypes = {
    config: fakePropType
  };

  private handleUpdate(
    keys: {
      text?: string;
      sendAll?: boolean;
      quickReplies?: string[];
    },
    submitting = false
  ): boolean {
    const updates: Partial<SendMsgFormState> = {};
    if (keys.hasOwnProperty('text')) {
      updates.message = validate(i18n.t('forms.message', 'Message'), keys.text, [
        shouldRequireIf(submitting),
        CharactersLessThan(4096, '4096 characters')
      ]);
    }

    if (keys.hasOwnProperty('sendAll')) {
      updates.sendAll = keys.sendAll;
    }

    if (keys.hasOwnProperty('quickReplies')) {
      updates.quickReplies = validate(
        i18n.t('forms.quick_replies', 'Quick Replies'),
        keys.quickReplies,
        [MaxOfTenItems]
      );
    }
    const updated = mergeForm(this.state, updates) as SendMsgFormState;

    this.setState(updated);
    return updated.valid;
  }

  public handleMessageInput(event: React.KeyboardEvent) {
    return this.handleUpdate({ text: (event.target as any).value }, false);
  }

  public handleMessageUpdate(message: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ text: message }, submitting);
  }

  public handleQuickRepliesUpdate(quickReplies: string[]): boolean {
    return this.handleUpdate({ quickReplies });
  }

  public handleSendAllUpdate(sendAll: boolean): boolean {
    return this.handleUpdate({ sendAll });
  }

  private handleSave(): void {
    if (this.state.attachments.length > 0 && this.state.attachments[0].valid) {
      return;
    }

    // make sure we validate untouched text fields and contact fields
    let valid = true;

    let templateVariables = this.state.templateVariables;
    let template = this.state.template;

    // make sure we don't have untouched template variables
    this.state.templateVariables.forEach((variable: StringEntry, num: number) => {
      const updated = validate(`Variable ${num + 1}`, variable.value, [Required]);
      templateVariables = mutate(templateVariables, {
        [num]: { $merge: updated }
      }) as StringEntry[];
      valid = valid && !hasErrors(updated);
    });

    if (valid && template.value && !this.state.message.value) {
      valid = true;
    }

    if (!template.value) {
      // message box can be empty if the attachments are present
      valid =
        (valid && this.handleMessageUpdate(this.state.message.value, null, true)) ||
        this.state.attachments.length > 0;
    }

    valid = valid && !hasErrors(this.state.quickReplyEntry);

    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));
      // notify our modal we are done
      this.props.onClose(false);
    } else {
      this.setState({ templateVariables, valid });
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

  private handleTemplateChanged(selected: any[]): void {
    const template = selected ? selected[0] : null;

    if (!template) {
      this.setState({
        expression: null,
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
        expression: null,
        template: { value: template },
        templateTranslation,
        templateVariables
      });
    }
    if (template.name === 'Expression') {
      this.setState({ expression: { value: this.state.expression } });
    }
  }

  private handleTemplateVariableChanged(updatedText: string, num: number): void {
    const entry = validate(`Variable ${num + 1}`, updatedText, [Required]);
    const templateVariables = mutate(this.state.templateVariables, {
      $merge: { [num]: entry }
    }) as StringEntry[];
    this.setState({ templateVariables });
  }

  private handleShouldExcludeTemplate(template: any): boolean {
    return !hasUseableTranslation(template as Template);
  }

  private renderTopicConfig(): JSX.Element {
    return (
      <>
        <p>
          {i18n.t(
            'forms.send_msg_facebook_warning',
            'Sending bulk messages over a Facebook channel requires that a topic be specified if the user has not sent a message in the last 24 hours. Setting a topic to use over Facebook is especially important for the first message in your flow.'
          )}
        </p>
        <SelectElement
          key={'fb_method_select'}
          name={i18n.t('forms.method', 'Method')}
          entry={this.state.topic}
          onChange={this.handleTopicUpdate}
          options={TOPIC_OPTIONS}
          placeholder={i18n.t(
            'forms.send_msg_facebook_topic_placeholder',
            'Select a topic to use over Facebook'
          )}
          clearable={true}
        />
      </>
    );
  }

  private handleTopicUpdate(topic: SelectOption) {
    this.setState({ topic: { value: topic } });
  }

  private renderLabelOption(): JSX.Element {
    return (
      <div className={styles.label_container}>
        <p>Select the labels to apply to the outgoing message.</p>

        <AssetSelector
          name={i18n.t('forms.labels', 'Labels')}
          placeholder={i18n.t(
            'enter_to_create_label',
            'Enter the name of an existing label or create a new one'
          )}
          assets={this.props.assetStore.labels}
          entry={this.state.labels}
          searchable={true}
          multi={true}
          expressions={true}
          onChange={this.handleLabelsChanged}
          createPrefix={i18n.t('create_label', 'Create Label') + ': '}
          createAssetFromInput={this.handleCreateAssetFromInput}
          onAssetCreated={this.handleLabelCreated}
        />
      </div>
    );
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
          additionalOptions={[additionalOption]}
          name={i18n.t('forms.template', 'template')}
          noOptionsMessage="No templates found"
          assets={this.props.assetStore.templates}
          entry={this.state.template}
          onChange={this.handleTemplateChanged}
          shouldExclude={this.handleShouldExcludeTemplate}
          searchable={true}
          formClearable={true}
        />
        {this.state.expression && (
          <div className={styles.expression}>
            <TextInputElement
              name={'Expression'}
              showLabel={false}
              placeholder={'Expression'}
              onChange={(updatedText: string) => {
                this.setState({ expression: { value: updatedText } });
              }}
              entry={{ value: this.state.expression.value }}
              autocomplete={true}
            />
          </div>
        )}
        {this.state.templateTranslation ? (
          <>
            {this.state.templateTranslation.content && (
              <div className={styles.template_text}>{this.state.templateTranslation.content}</div>
            )}
            {range(0, this.state.templateTranslation.variable_count).map((num: number) => {
              return (
                <div className={styles.variable} key={'tr_arg_' + num}>
                  <TextInputElement
                    name={`${i18n.t('forms.variable', 'Variable')} ${num + 1}`}
                    showLabel={false}
                    placeholder={`${i18n.t('forms.variable', 'Variable')} ${num + 1}`}
                    onChange={(updatedText: string) => {
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
        {this.renderLabelOption()}
      </>
    );
  }

  private handleAttachmentUploading(isUploading: boolean) {
    const uploadError: string = '';
    console.log(uploadError);
    this.setState({ uploadError });

    if (isUploading) {
      const uploadInProgress: boolean = true;
      this.setState({ uploadInProgress });
    } else {
      const uploadInProgress: boolean = false;
      this.setState({ uploadInProgress });
    }
  }

  private handleAttachmentUploaded(response: AxiosResponse) {
    //django returns a 200 even when there's an error
    if (response.data && response.data.error) {
      const uploadError: string = response.data.error;
      console.log(uploadError);
      this.setState({ uploadError });
    } else {
      const attachments: any = mutate(this.state.attachments, {
        $push: [{ type: response.data.type, url: response.data.url, uploaded: true }]
      });
      console.log(attachments);
      this.setState({ attachments });

      const uploadError: string = '';
      console.log(uploadError);
      this.setState({ uploadError });
    }

    const uploadInProgress: boolean = false;
    this.setState({ uploadInProgress });
  }

  private handleAttachmentUploadFailed(error: AxiosError) {
    //nginx returns a 300+ if there's an error
    let uploadError: string = '';
    const status = error.response.status;
    if (status >= 500) {
      uploadError = i18n.t('file_upload_failed_generic', 'File upload failed, please try again');
    } else if (status === 413) {
      uploadError = i18n.t('file_upload_failed_max_limit', 'Limit for file uploads is 25 MB');
    } else {
      uploadError = error.response.statusText;
    }
    this.setState({ uploadError });

    const uploadInProgress: boolean = false;
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

  public handleLabelsChanged(selected: Asset[], submitting: boolean = false): boolean {
    const updates: Partial<AddLabelsFormState> = {
      labels: validate(i18n.t('forms.labels', 'Labels'), selected, [shouldRequireIf(submitting)])
    };

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleAttachmentRemoved(index: number) {
    const attachments: any = mutate(this.state.attachments, {
      $splice: [[index, 1]]
    });
    this.setState({ attachments });
  }

  public handleCreateAssetFromInput(input: string): any {
    return { name: input };
  }

  public handleLabelCreated(label: Asset): void {
    // update our store with our new group
    this.props.addAsset('labels', label);

    this.handleLabelsChanged(this.state.labels.value!.concat(label));
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const attachments: Tab = {
      name: i18n.t('forms.attachments', 'Attachments'),
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

    const tabs = [attachments];

    if (hasFeature(this.context.config, FeatureFilter.HAS_WHATSAPP)) {
      const templates: Tab = {
        name: 'WhatsApp',
        body: this.renderTemplateConfig(),
        checked: this.state.template.value != null,
        hasErrors: !!this.state.templateVariables.find((entry: StringEntry) => hasErrors(entry))
      };
      tabs.splice(0, 0, templates);
    }

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <TextInputElement
          name={i18n.t('forms.message', 'Message')}
          showLabel={false}
          counter=".sms-counter"
          onChange={this.handleMessageUpdate}
          entry={this.state.message}
          autocomplete={true}
          focus={true}
          textarea={true}
        />
        <temba-charcount class="sms-counter"></temba-charcount>
        {this.renderLabelOption()}
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
