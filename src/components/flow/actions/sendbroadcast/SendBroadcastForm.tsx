import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { initializeForm, stateToAction } from 'components/flow/actions/sendbroadcast/helpers';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TextInputElement, {
  Count,
  TextInputStyle
} from 'components/form/textinput/TextInputElement';

import TypeList from 'components/nodeeditor/TypeList';
import { hasUseableTranslation } from 'components/form/assetselector/helpers';
import { fakePropType } from 'config/ConfigProvider';
import mutate from 'immutability-helper';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import { AssetArrayEntry, FormState, mergeForm, FormEntry, StringEntry } from 'store/nodeEditor';
import { shouldRequireIf, validate, Required } from 'store/validators';
import i18n from 'config/i18n';

import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { Template, TemplateTranslation } from 'flowTypes';
import { createUUID, getAuthToken, range } from 'utils';
import styles from './SendBroadcastForm.module.scss';
import { Attachment } from '../sendmsg/SendMsgForm';
import { TembaSelectStyle } from 'temba/TembaSelect';
import Pill from 'components/pill/Pill';
import Loading from 'components/loading/Loading';
import { ImCross } from 'react-icons/im';
import { fetchAsset } from 'external';
import axios from 'axios';
export interface SendBroadcastFormState extends FormState {
  template: FormEntry;
  templateVariables: StringEntry[];
  templateTranslation?: TemplateTranslation;
  message: StringEntry;
  recipients: AssetArrayEntry;
  attachments: Attachment[];
  validAttachment: boolean;
  attachmentError: string;
}

const MAX_ATTACHMENTS = 1;

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'image', name: i18n.t('forms.image_url', 'Image URL') },
  { value: 'audio', name: i18n.t('forms.audio_url', 'Audio URL') },
  { value: 'video', name: i18n.t('forms.video_url', 'Video URL') },
  { value: 'application', name: i18n.t('forms.pdf_url', 'PDF Document URL') }
];

const getAttachmentTypeOption = (type: string): SelectOption => {
  return TYPE_OPTIONS.find((option: SelectOption) => option.value === type);
};

// Note: action prop is only used for its uuid (see onValid)
export default class SendBroadcastForm extends React.Component<
  ActionFormProps,
  SendBroadcastFormState
> {
  public static contextTypes = {
    endpoints: fakePropType,
    assetService: fakePropType
  };

  constructor(props: ActionFormProps) {
    super(props);
    this.state = initializeForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
    if (this.state.template.value !== null) {
      fetchAsset(this.props.assetStore.templates, this.state.template.value.uuid).then(
        (asset: Asset) => {
          if (asset !== null) {
            this.handleTemplateChanged([{ ...this.state.template.value, ...asset.content }]);
          }
        }
      );
    }
  }

  public handleRecipientsChanged(recipients: Asset[]): boolean {
    return this.handleUpdate({ recipients });
  }

  public handleMessageUpdate(text: string): boolean {
    return this.handleUpdate({ text });
  }

  private handleUpdate(keys: { text?: string; recipients?: Asset[] }, submitting = false): boolean {
    const updates: Partial<SendBroadcastFormState> = {};

    if (keys.hasOwnProperty('recipients')) {
      updates.recipients = validate(i18n.t('forms.recipients', 'Recipients'), keys.recipients!, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('text')) {
      updates.message = validate(i18n.t('forms.message', 'Message'), keys.text!, [
        shouldRequireIf(submitting)
      ]);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  public handleAxios(body: any, type: any) {
    axios
      .get(`${this.props.assetStore.validateMedia.endpoint}?url=${body.url}&type=${body.type}`)
      .then(response => {
        if (response.data.is_valid) {
          // make sure we validate untouched text fields and contact fields
          let valid = true;
          // check if the recipient is added or not
          // if not, throw required validation
          if (this.state.recipients.value!.length <= 0 && !this.state.message.value) {
            valid = this.handleUpdate(
              {
                recipients: this.state.recipients.value!
              },
              true
            );
          } else if (this.state.recipients.value!.length > 0 && !this.state.message.value) {
            valid = true;
          }

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
      const type = this.state.attachments[0].type;
      const url = this.state.attachments[0].url;

      let body = {
        type,
        url
      };

      if (type === 'application') {
        body.type = 'document';
      }
      switch (type) {
        case 'image':
          this.handleAxios(body, 'image');
          break;
        case 'video':
          this.handleAxios(body, 'video');
          break;
        case 'audio':
          this.handleAxios(body, 'audio');
          break;
        case 'application':
          this.handleAxios(body, 'document');
          break;
      }
      this.setState({ validAttachment: true, attachmentError: null });
    } else {
      // validate in case they never updated an empty field
      let valid = this.handleUpdate(
        {
          text: this.state.message.value,
          recipients: this.state.recipients.value!
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
      // check if the template and recipient are added or not
      // if not, throw required validation
      if (templateVariables.length > 0) {
        if (this.state.recipients.value!.length <= 0 && !this.state.message.value) {
          valid = this.handleUpdate(
            {
              recipients: this.state.recipients.value!
            },
            true
          );
        } else if (this.state.recipients.value!.length > 0 && !this.state.message.value) {
          valid = true;
        }
      }
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

  public handleAttachmentRemoved(index: number): void {
    // we found a match, merge us in
    const updated: any = mutate(this.state.attachments, {
      $splice: [[index, 1]]
    });
    this.setState({ attachments: updated, attachmentError: null, validAttachment: false });
  }

  private renderAttachment(index: number, attachment: Attachment): JSX.Element {
    let attachments: any = this.state.attachments;
    return (
      <>
        <div
          className={styles.url_attachment}
          key={index > -1 ? 'url_attachment_' + index : createUUID()}
        >
          <div className={styles.type_choice}>
            <SelectElement
              key={'attachment_type_' + index}
              style={TembaSelectStyle.small}
              name={i18n.t('forms.type_options', 'Type Options')}
              placeholder="Add Attachment"
              entry={{
                value: index > -1 ? getAttachmentTypeOption(attachment.type) : null
              }}
              onChange={(option: any) => {
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
              }}
              options={TYPE_OPTIONS}
            />
          </div>
          {index > -1 ? (
            <>
              <div className={styles.url}>
                <TextInputElement
                  placeholder="URL"
                  name={i18n.t('forms.url', 'URL')}
                  style={TextInputStyle.small}
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
        {this.state.valid && this.state.validAttachment && !this.state.attachmentError ? (
          <div className={styles.loading}>
            Checking URL validity
            <Loading size={10} units={6} color="#999999" />
          </div>
        ) : null}
        {this.state.attachmentError ? (
          <div className={styles.error}>
            <ImCross className={styles.crossIcon} />
            {this.state.attachmentError}
          </div>
        ) : null}
      </>
    );
  }

  private renderAttachments(): JSX.Element {
    const attachments = this.state.attachments.map((attachment, index: number) =>
      this.renderAttachment(index, attachment)
    );

    const emptyOption =
      this.state.attachments.length < MAX_ATTACHMENTS
        ? this.renderAttachment(-1, { url: '', type: '' })
        : null;
    return (
      <>
        <p>
          {i18n.t(
            'forms.send_msg_summary',
            'Add an attachment to each message. The attachment can be a file you upload or a dynamic URL using expressions and variables from your Flow.',
            { count: MAX_ATTACHMENTS }
          )}
        </p>
        {attachments}
        {emptyOption}
      </>
    );
  }

  private checkAttachmentErrors(): boolean {
    if (this.state.valid) {
      return this.state.validAttachment;
    } else {
      return false;
    }
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const templates: any = {
      name: 'WhatsApp',
      body: this.renderTemplateConfig(),
      checked: this.state.template.value != null,
      hasErrors: !!this.state.templateVariables.find((entry: StringEntry) => hasErrors(entry))
    };

    const attachments: Tab = {
      name: 'Attachments',
      body: this.renderAttachments(),
      checked: this.state.attachments.length > 0,
      hasErrors: this.checkAttachmentErrors()
    };
    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={[templates, attachments]}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <AssetSelector
          name={i18n.t('forms.recipients', 'Recipients')}
          placeholder={i18n.t('forms.select_contacts', 'Select Contacts')}
          assets={this.props.assetStore.recipients}
          entry={this.state.recipients}
          searchable={true}
          multi={true}
          expressions={true}
          onChange={this.handleRecipientsChanged}
        />
        <p />
        <TextInputElement
          name={i18n.t('forms.message', 'Message')}
          showLabel={false}
          count={Count.SMS}
          onChange={this.handleMessageUpdate}
          entry={this.state.message}
          autocomplete={true}
          focus={true}
          textarea={true}
        />
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
