/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { react as bindCallbacks } from 'auto-bind';
import { AxiosError, AxiosResponse } from 'axios';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import {
  getComposeByAsset,
  getEmptyComposeValue,
  hasErrors,
  renderIssues
} from 'components/flow/actions/helpers';
import {
  initializeForm as stateToForm,
  stateToAction,
  TOPIC_OPTIONS
} from 'components/flow/actions/sendmsg/helpers';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import { hasUseableTranslation } from 'components/form/assetselector/helpers';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import MultiChoiceInput from 'components/form/multichoice/MultiChoice';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import { fetchAsset } from 'external';
import { Template, TemplateTranslation } from 'flowTypes';
import mutate from 'immutability-helper';
import * as React from 'react';
import { Asset, AssetType } from 'store/flowContext';
import {
  FormState,
  mergeForm,
  StringArrayEntry,
  StringEntry,
  SelectOptionEntry,
  FormEntry
} from 'store/nodeEditor';
import {
  MaxOf640Chars,
  MaxOfTenItems,
  MaxOfThreeItems,
  Required,
  shouldRequireIf,
  validate
} from 'store/validators';
import { range } from 'utils';

import styles from './SendMsgForm.module.scss';
import { hasFeature } from 'config/typeConfigs';
import { FeatureFilter } from 'config/interfaces';

import i18n from 'config/i18n';
import { Trans } from 'react-i18next';

export interface SendMsgFormState extends FormState {
  compose: StringEntry;
  quickReplies: StringArrayEntry;
  quickReplyEntry: StringEntry;
  sendAll: boolean;
  template: FormEntry;
  topic: SelectOptionEntry;
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
      compose?: string;
      sendAll?: boolean;
      quickReplies?: string[];
    },
    submitting = false
  ): boolean {
    const updates: Partial<SendMsgFormState> = {};

    // todo move this to shared helpers file
    if (keys.hasOwnProperty('compose')) {
      // validate empty compose value
      if (keys.compose === getEmptyComposeValue()) {
        updates.compose = validate(i18n.t('forms.compose', 'Compose'), '', [
          shouldRequireIf(submitting)
        ]);
        updates.compose.value = keys.compose;
        if (updates.compose.validationFailures.length > 0) {
          let composeErrMsg = updates.compose.validationFailures[0].message;
          composeErrMsg = composeErrMsg.replace('Compose is', 'Text or attachments are');
          updates.compose.validationFailures[0].message = composeErrMsg;
        }
      } else {
        updates.compose = validate(i18n.t('forms.compose', 'Compose'), keys.compose, [
          shouldRequireIf(submitting)
        ]);
        // validate inner compose text value
        const composeTextValue = getComposeByAsset(keys.compose, AssetType.ComposeText);
        const composeTextResult = validate(i18n.t('forms.compose', 'Compose'), composeTextValue, [
          MaxOf640Chars
        ]);
        if (composeTextResult.validationFailures.length > 0) {
          let textErrMsg = composeTextResult.validationFailures[0].message;
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

  public handleComposeChanged(): boolean {
    // todo
    return true;
  }

  public handleQuickRepliesUpdate(quickReplies: string[]): boolean {
    return this.handleUpdate({ quickReplies });
  }

  public handleSendAllUpdate(sendAll: boolean): boolean {
    return this.handleUpdate({ sendAll });
  }

  private handleSave(): void {
    // todo compose

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
                    entry={this.state.templateVariables[num]}
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

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const quickReplies: Tab = {
      name: i18n.t('forms.quick_replies', 'Quick Replies'),
      body: (
        <>
          <p>
            {i18n.t(
              'forms.quick_replies_summary',
              'Quick Replies are made into buttons for supported channels. For example, when asking a question, you might add a Quick Reply for "Yes" and one for "No".'
            )}
          </p>

          <MultiChoiceInput
            name={i18n.t('forms.quick_reply', 'quick_reply')}
            helpText={
              <Trans i18nKey="forms.add_quick_reply">Add a new Quick Reply and press enter.</Trans>
            }
            items={this.state.quickReplies}
            entry={this.state.quickReplyEntry}
            onChange={this.handleQuickRepliesUpdate}
          />
        </>
      ),
      checked: this.state.quickReplies.value.length > 0,
      hasErrors: hasErrors(this.state.quickReplyEntry)
    };

    const advanced: Tab = {
      name: i18n.t('forms.advanced', 'Advanced'),
      body: (
        <CheckboxElement
          name={i18n.t('forms.all_destinations', 'All Destinations')}
          title={i18n.t('forms.all_destinations', 'All Destinations')}
          labelClassName={styles.checkbox}
          checked={this.state.sendAll}
          description={i18n.t(
            'forms.all_destinations_description',
            "Send a message to all destinations known for this contact. If you aren't sure what this means, leave it unchecked."
          )}
          onChange={this.handleSendAllUpdate}
        />
      ),
      checked: this.state.sendAll
    };

    const tabs = [quickReplies, advanced];

    if (hasFeature(this.context.config, FeatureFilter.HAS_WHATSAPP)) {
      const templates: Tab = {
        name: 'WhatsApp',
        body: this.renderTemplateConfig(),
        checked: this.state.template.value != null,
        hasErrors: !!this.state.templateVariables.find((entry: StringEntry) => hasErrors(entry))
      };
      tabs.splice(0, 0, templates);
    }

    if (hasFeature(this.context.config, FeatureFilter.HAS_FACEBOOK)) {
      const templates: Tab = {
        name: 'Facebook',
        body: this.renderTopicConfig(),
        checked: this.state.topic.value != null
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
        {/* todo <ComposeElement/> */}
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
