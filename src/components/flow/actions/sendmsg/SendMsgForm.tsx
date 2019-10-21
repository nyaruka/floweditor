import { react as bindCallbacks } from 'auto-bind';
import axios from 'axios';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import {
  initializeForm as stateToForm,
  stateToAction
} from 'components/flow/actions/sendmsg/helpers';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import { hasUseableTranslation } from 'components/form/assetselector/helpers';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import MultiChoiceInput from 'components/form/multichoice/MultiChoice';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import TextInputElement, { Count } from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import Pill from 'components/pill/Pill';
import { fakePropType } from 'config/ConfigProvider';
import { fetchAsset, getCookie } from 'external';
import { Template, TemplateOptions, TemplateTranslation } from 'flowTypes';
import mutate from 'immutability-helper';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import {
  AssetEntry,
  FormState,
  mergeForm,
  StringArrayEntry,
  StringEntry,
  ValidationFailure
} from 'store/nodeEditor';
import { MaxOfTenItems, Required, shouldRequireIf, validate } from 'store/validators';
import { createUUID, range } from 'utils';
import { small } from 'utils/reactselect';

import styles from './SendMsgForm.module.scss';
import { hasFeature } from 'config/typeConfigs';
import { FeatureFilter } from 'config/interfaces';

const MAX_ATTACHMENTS = 3;

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'image', label: 'Image URL' },
  { value: 'audio', label: 'Audio URL' },
  { value: 'video', label: 'Video URL' }
];

const NEW_TYPE_OPTIONS = TYPE_OPTIONS.concat([{ value: 'upload', label: 'Upload Attachment' }]);

const getAttachmentTypeOption = (type: string): SelectOption => {
  return TYPE_OPTIONS.find((option: SelectOption) => option.value === type);
};

export interface Attachment {
  type: string;
  url: string;
  uploaded?: boolean;
}

export interface SendMsgFormState extends FormState {
  message: StringEntry;
  quickReplies: StringArrayEntry;
  quickReplyEntry: StringEntry;
  sendAll: boolean;
  attachments: Attachment[];
  template: AssetEntry;
  templateVariables: StringEntry[];
  templateTranslation?: TemplateTranslation;
}

export default class SendMsgForm extends React.Component<ActionFormProps, SendMsgFormState> {
  private filePicker: any;

  constructor(props: ActionFormProps) {
    super(props);
    this.state = stateToForm(this.props.nodeSettings, this.props.assetStore);
    bindCallbacks(this, {
      include: [/^handle/, /^on/]
    });

    // intialize our templates if we have them
    if (this.state.template.value !== null) {
      fetchAsset(this.props.assetStore.templates, this.state.template.value.id).then(
        (asset: Asset) => {
          if (asset !== null) {
            this.handleTemplateChanged([asset]);
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
      updates.message = validate('Message', keys.text, [shouldRequireIf(submitting)]);
    }

    if (keys.hasOwnProperty('sendAll')) {
      updates.sendAll = keys.sendAll;
    }

    if (keys.hasOwnProperty('quickReplies')) {
      updates.quickReplies = validate('Quick Replies', keys.quickReplies, [MaxOfTenItems]);
    }

    const updated = mergeForm(this.state, updates) as SendMsgFormState;

    this.setState(updated);
    return updated.valid;
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
    // make sure we validate untouched text fields and contact fields
    let valid = this.handleMessageUpdate(this.state.message.value, null, true);

    let templateVariables = this.state.templateVariables;
    // make sure we don't have untouched template variables
    this.state.templateVariables.forEach((variable: StringEntry, num: number) => {
      const updated = validate(`Variable ${num + 1}`, variable.value, [Required]);
      templateVariables = mutate(templateVariables, {
        [num]: { $merge: updated }
      }) as StringEntry[];
      valid = valid && !hasErrors(updated);
    });

    valid = valid && !hasErrors(this.state.quickReplyEntry);

    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));
      // notify our modal we are done
      this.props.onClose(false);
    } else {
      this.setState({ templateVariables, valid });
    }
  }

  public handleFieldFailures(persistantFailures: ValidationFailure[]): void {
    const message = { ...this.state.message, persistantFailures };
    this.setState({ message, valid: this.state.valid && !hasErrors(message) });
  }

  public handleQuickReplyFieldFailures(persistantFailures: ValidationFailure[]): void {
    const quickReplies = { ...this.state.quickReplies, persistantFailures };
    this.setState({
      quickReplies,
      valid: this.state.valid && !hasErrors(quickReplies)
    });
  }

  public handleAttachmentRemoved(index: number): void {
    // we found a match, merge us in
    const updated: any = mutate(this.state.attachments, {
      $splice: [[index, 1]]
    });
    this.setState({ attachments: updated });
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: 'Ok', onClick: this.handleSave },
      secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
    };
  }

  private renderUpload(index: number, attachment: Attachment): JSX.Element {
    return (
      <div
        className={styles.url_attachment}
        key={index > -1 ? 'url_attachment_' + index : createUUID()}
      >
        <div className={styles.type_choice}>
          <SelectElement
            name="Type"
            styles={small as any}
            entry={{
              value: { label: attachment.type }
            }}
            options={TYPE_OPTIONS}
          />
        </div>
        <div className={styles.url}>
          <span className={styles.upload}>
            <Pill
              icon="fe-download"
              text=" Download"
              large={true}
              onClick={() => {
                window.open(attachment.url, '_blank');
              }}
            />
            <div className={styles.remove_upload}>
              <Pill
                icon="fe-x"
                text=" Remove"
                large={true}
                onClick={() => {
                  this.handleAttachmentRemoved(index);
                }}
              />
            </div>
          </span>
        </div>
      </div>
    );
  }

  private handleUploadFile(files: FileList): void {
    let attachments: any = this.state.attachments;

    // if we have a csrf in our cookie, pass it along as a header
    const csrf = getCookie('csrftoken');
    const headers = csrf ? { 'X-CSRFToken': csrf } : {};

    const data = new FormData();
    data.append('file', files[0]);
    axios
      .post(this.context.config.endpoints.attachments, data, { headers })
      .then(response => {
        attachments = mutate(attachments, {
          $push: [{ type: response.data.type, url: response.data.url, uploaded: true }]
        });
        this.setState({ attachments });
      })
      .catch(error => {
        console.log(error);
      });
  }

  private renderAttachment(index: number, attachment: Attachment): JSX.Element {
    let attachments: any = this.state.attachments;
    return (
      <div
        className={styles.url_attachment}
        key={index > -1 ? 'url_attachment_' + index : createUUID()}
      >
        <div className={styles.type_choice}>
          <SelectElement
            styles={small as any}
            name="Type Options"
            placeholder="Add Attachment"
            entry={{
              value: index > -1 ? getAttachmentTypeOption(attachment.type) : null
            }}
            onChange={(option: any) => {
              if (option.value === 'upload') {
                window.setTimeout(() => {
                  this.filePicker.click();
                }, 200);
              } else {
                if (index === -1) {
                  attachments = mutate(attachments, {
                    $push: [{ type: option.value, url: '' }]
                  });
                } else {
                  attachments = mutate(attachments, {
                    [index]: {
                      $set: { type: option.value, url: attachment.url }
                    }
                  });
                }
                this.setState({ attachments });
              }
            }}
            options={index > -1 ? TYPE_OPTIONS : NEW_TYPE_OPTIONS}
          />
        </div>
        {index > -1 ? (
          <>
            <div className={styles.url}>
              <TextInputElement
                placeholder="URL"
                name="url"
                onChange={(value: string) => {
                  attachments = mutate(attachments, {
                    [index]: { $set: { type: attachment.type, url: value } }
                  });
                  this.setState({ attachments });
                }}
                entry={{ value: attachment.url }}
                autocomplete={true}
              />
            </div>
            <div className={styles.remove}>
              <Pill
                icon="fe-x"
                text=" Remove"
                large={true}
                onClick={() => {
                  this.handleAttachmentRemoved(index);
                }}
              />
            </div>
          </>
        ) : null}
      </div>
    );
  }

  private renderAttachments(): JSX.Element {
    const attachments = this.state.attachments.map((attachment, index: number) =>
      attachment.uploaded
        ? this.renderUpload(index, attachment)
        : this.renderAttachment(index, attachment)
    );

    const emptyOption =
      this.state.attachments.length < MAX_ATTACHMENTS
        ? this.renderAttachment(-1, { url: '', type: '' })
        : null;
    return (
      <>
        <p>
          Add up to {MAX_ATTACHMENTS} attachments to each message. Each attachment can be a file you
          upload or a dynamic URL using expressions and variables from your Flow.
        </p>
        {attachments}
        {emptyOption}
        <input
          style={{
            display: 'none'
          }}
          ref={ele => {
            this.filePicker = ele;
          }}
          type="file"
          onChange={e => this.handleUploadFile(e.target.files)}
        />
      </>
    );
  }

  private handleTemplateChanged(selected: Asset[]): void {
    const template = selected[0];

    if (!template) {
      this.setState({
        template: { value: null },
        templateTranslation: null,
        templateVariables: []
      });
    } else {
      const templateOptions = template.content as TemplateOptions;
      const templateTranslation = templateOptions.translations[0];

      const templateVariables =
        this.state.templateVariables.length === 0 ||
        (this.state.template.value && this.state.template.value.id !== template.id)
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

  private handleTemplateFieldFailures(persistantFailures: ValidationFailure[], num: number): void {
    const templateVariables = mutate(this.state.templateVariables, {
      [num]: { $merge: { persistantFailures } }
    }) as StringEntry[];

    this.setState({
      templateVariables,
      valid: this.state.valid && !hasErrors(templateVariables[num])
    });
  }

  private handleTemplateVariableChanged(updatedText: string, num: number): void {
    const entry = validate(`Variable ${num + 1}`, updatedText, [Required]);
    const templateVariables = mutate(this.state.templateVariables, {
      $merge: { [num]: entry }
    }) as StringEntry[];
    this.setState({ templateVariables });
  }

  private handleShouldExcludeTemplate(asset: Asset): boolean {
    return !hasUseableTranslation(asset.content as Template);
  }

  private renderTemplateConfig(): JSX.Element {
    return (
      <>
        <p>
          Sending messages over a WhatsApp channel requires that a template be used if you have not
          received a message from a contact in the last 24 hours. Setting a template to use over
          WhatsApp is especially important for the first message in your flow.
        </p>
        <AssetSelector
          name="Template"
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
            {range(0, this.state.templateTranslation.variable_count).map((num: number) => {
              return (
                <div className={styles.variable} key={'tr_arg_' + num}>
                  <TextInputElement
                    name={`Variable ${num + 1}`}
                    showLabel={false}
                    placeholder={`Variable ${num + 1}`}
                    onChange={(updatedText: string) => {
                      this.handleTemplateVariableChanged(updatedText, num);
                    }}
                    entry={this.state.templateVariables[num]}
                    autocomplete={true}
                    onFieldFailures={(failures: ValidationFailure[]) => {
                      this.handleTemplateFieldFailures(failures, num);
                    }}
                  />
                </div>
              );
            })}
          </>
        ) : null}
      </>
    );
  }

  private handleAddQuickReply(newQuickReply: string): boolean {
    const newReplies = [...this.state.quickReplies.value];
    if (newReplies.length >= 10) {
      return false;
    }

    // we don't allow two quick replies with the same name
    const isNew = !newReplies.find(
      (reply: string) => reply.toLowerCase() === newQuickReply.toLowerCase()
    );

    if (isNew) {
      newReplies.push(newQuickReply);
      this.setState({
        quickReplies: { value: newReplies }
      });
      return true;
    }

    return false;
  }

  private handleRemoveQuickReply(toRemove: string): void {
    this.setState({
      quickReplies: {
        value: this.state.quickReplies.value.filter((reply: string) => reply !== toRemove)
      }
    });
  }

  private handleQuickReplyEntry(quickReplyEntry: StringEntry): void {
    this.setState({ quickReplyEntry });
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const quickReplies: Tab = {
      name: 'Quick Replies',
      body: (
        <>
          <p>
            Quick Replies are made into buttons for supported channels. For example, when asking a
            question, you might add a Quick Reply for "Yes" and one for "No".
          </p>

          <MultiChoiceInput
            name="Quick Reply"
            helpText="Add a new Quick Reply and press enter."
            items={this.state.quickReplies}
            entry={this.state.quickReplyEntry}
            onRemoved={this.handleRemoveQuickReply}
            onItemAdded={this.handleAddQuickReply}
            onEntryChanged={this.handleQuickReplyEntry}
            onFieldErrors={this.handleQuickReplyFieldFailures}
          />
        </>
      ),
      checked: this.state.quickReplies.value.length > 0,
      hasErrors: hasErrors(this.state.quickReplyEntry)
    };

    const attachments: Tab = {
      name: 'Attachments',
      body: this.renderAttachments(),
      checked: this.state.attachments.length > 0
    };

    const advanced: Tab = {
      name: 'Advanced',
      body: (
        <CheckboxElement
          name="All Destinations"
          title="All Destinations"
          labelClassName={styles.checkbox}
          checked={this.state.sendAll}
          description="Send a message to all destinations known for this contact. If you aren't sure what this means, leave it unchecked."
          onChange={this.handleSendAllUpdate}
        />
      ),
      checked: this.state.sendAll
    };

    const tabs = [quickReplies, attachments, advanced];

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
          name="Message"
          showLabel={false}
          count={Count.SMS}
          onChange={this.handleMessageUpdate}
          entry={this.state.message}
          autocomplete={true}
          focus={true}
          textarea={true}
          onFieldFailures={this.handleFieldFailures}
        />
      </Dialog>
    );
  }
}
