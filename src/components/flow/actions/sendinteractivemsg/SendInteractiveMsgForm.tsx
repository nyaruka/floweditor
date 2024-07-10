/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import {
  getMsgBody,
  initializeForm as stateToForm,
  stateToAction,
  stateToRouter
} from 'components/flow/actions/sendinteractivemsg/helpers';
import { ActionFormProps, RouterFormProps } from 'components/flow/props';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { FormEntry, FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';
import styles from './SendInteractiveMsg.module.scss';

import i18n from 'config/i18n';

import AssetSelector from 'components/form/assetselector/AssetSelector';
import { Asset } from 'store/flowContext';
import { AddLabelsFormState } from '../addlabels/AddLabelsForm';
import { getAsset } from 'external';
import TextInputElement, { TextInputStyle } from 'components/form/textinput/TextInputElement';
import mutate from 'immutability-helper';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import { FormProps } from 'components/nodeeditor/NodeEditor';

// const MAX_ATTACHMENTS = 10;
export interface SendInteractiveMsgFormState extends FormState {
  interactives: FormEntry;
  labels?: any;
  expression?: null | FormEntry;
  listValues?: any[];
  listValuesCount?: string;
  isChecked?: boolean;
  attachment_type?: StringEntry;
  attachment_url?: StringEntry;
}

const additionalOption = {
  name: 'Expression',
  text: 'Expression'
};

export default class SendMsgForm extends React.Component<
  ActionFormProps & RouterFormProps & FormProps,
  SendInteractiveMsgFormState
> {
  constructor(props: ActionFormProps & RouterFormProps & FormProps) {
    super(props);
    this.state = stateToForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/, /^on/]
    });
  }

  public static contextTypes = {
    config: fakePropType
  };

  private handleInteractivesChanged(selected: any[]): void {
    let interactiveMsg = selected ? selected[0] : null;
    interactiveMsg = {
      ...interactiveMsg,
      uuid: this.props.nodeSettings.originalNode.node.uuid
    };
    if (interactiveMsg.name === 'Expression') {
      this.setState({
        expression: { value: '' },
        interactives: {
          value: { name: 'Expression' }
        }
      });
    } else {
      this.setState({
        expression: null,
        interactives: {
          value: interactiveMsg
        },
        isChecked: false
      });
    }
  }

  private handleUpdate(
    keys: {
      text?: any;
    },
    submitting = false
  ): boolean {
    const updates: Partial<SendInteractiveMsgFormState> = {};

    if (keys.hasOwnProperty('text')) {
      updates.interactives = validate(i18n.t('forms.message', 'Message'), keys.text, [
        shouldRequireIf(submitting)
      ]);
    }
    const updated = mergeForm(this.state, updates) as SendInteractiveMsgFormState;

    this.setState(updated);
    return updated.valid;
  }

  public handleMessageInput(event: React.KeyboardEvent) {
    return this.handleUpdate({ text: (event.target as any).value }, false);
  }

  public handleMessageUpdate(message: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ text: message }, submitting);
  }

  public handleLabelsChanged(selected: Asset[], submitting: boolean = false): boolean {
    const updates: Partial<AddLabelsFormState> = {
      labels: validate(i18n.t('forms.labels', 'Labels'), selected, [shouldRequireIf(submitting)])
    };

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  public handleCreateAssetFromInput(input: string): any {
    return { name: input };
  }

  public handleLabelCreated(label: Asset): void {
    // update our store with our new group
    this.props.addAsset('labels', label);

    this.handleLabelsChanged(this.state.labels.value!.concat(label));
  }

  private handleSave(): void {
    // don't continue if our message already has errors
    if (hasErrors(this.state.interactives)) {
      return;
    }
    // make sure we validate untouched text fields and contact fields
    let valid = this.handleMessageUpdate(this.state.interactives.value, null, true);

    if (this.state.expression) {
      valid = true;
    }
    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));

      let interactiveMessageId = this.state.interactives.value.id;
      const originalAction: any = this.props.nodeSettings.originalAction;

      if (
        (this.props.nodeSettings.originalNode.ghost ||
          this.props.nodeSettings.originalNode.node.exits[0].destination_uuid) &&
        interactiveMessageId !== originalAction.id
      ) {
        this.props.resetNodeEditing();
        this.props.updateRouter(
          stateToRouter(this.props.nodeSettings, this.state, this.props.assetStore)
        );
      }

      // notify our modal we are done
      this.props.onClose(false);
    } else {
      this.setState({ valid });
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

  private renderLabelOption(): JSX.Element {
    return (
      <div className={styles.label_container}>
        <p>Select the labels to apply to the interactive message.</p>

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

  private handleAttachmentChanged(index: number, id: string, label: string): void {
    let { listValues }: any = this.state;
    listValues = mutate(listValues, {
      [index]: {
        $set: { value: { id, label } }
      }
    });

    this.setState({ listValues });
  }

  private renderListOptions(): JSX.Element {
    const { listValues } = this.state;

    const renderListOption = ({ value }: any, index: number) => (
      <div className={styles.listItem}>
        <div className={styles.id}>
          <TextInputElement
            placeholder={`id ${index + 1}`}
            name={i18n.t('forms.list_item_id', 'id')}
            style={TextInputStyle.normal}
            onChange={(id: string) => {
              this.handleAttachmentChanged(index, id, value.label);
            }}
            entry={{ value: value.id }}
            autocomplete={true}
          />
        </div>
        <TextInputElement
          placeholder={`variable ${index + 1}`}
          name={i18n.t('forms.list_item_variable', 'variable')}
          style={TextInputStyle.normal}
          onChange={(label: string) => {
            this.handleAttachmentChanged(index, value.id, label);
          }}
          entry={{ value: value.label }}
          autocomplete={true}
        />
      </div>
    );

    const values = listValues.map((value, index) => renderListOption(value, index));

    return (
      <div>
        <div className={styles.list_container}>
          <div className={styles.variable_count}>
            <TextInputElement
              placeholder={`Number of variables`}
              name={i18n.t('forms.list_item', '')}
              style={TextInputStyle.normal}
              onChange={(value: string) => {
                this.setState({ listValuesCount: value });
              }}
              entry={{ value: this.state.listValuesCount }}
              autocomplete={true}
            />
          </div>
          {values}
          <div className={styles.variable_count}>
            <TextInputElement
              placeholder={`Attachment type`}
              name={i18n.t('forms.attachment_type', 'attachment_type')}
              style={TextInputStyle.normal}
              onChange={(value: string) => {
                this.setState({ attachment_type: { value } });
              }}
              entry={this.state.attachment_type}
              autocomplete={true}
            />
          </div>
          <div className={styles.variable_count}>
            <TextInputElement
              placeholder={`Attachment url`}
              name={i18n.t('forms.attachment_url', 'attachment_url')}
              style={TextInputStyle.normal}
              onChange={(value: string) => {
                this.setState({ attachment_url: { value } });
              }}
              entry={this.state.attachment_url}
              autocomplete={true}
            />
          </div>
        </div>
      </div>
    );
  }
  async componentDidMount(): Promise<any> {
    const id = this.state.interactives.value.id;

    if (!id) {
      return;
    }
    const { endpoint, type, items } = this.props.assetStore.interactives;
    const interactive: any = items[id];

    if (interactive) {
      this.setState({
        interactives: {
          value: {
            ...this.state.interactives.value,
            interactive_content: interactive.interactive_content
          }
        }
      });
    } else {
      let content = await getAsset(endpoint, type, id);

      if (content.interactive_content) {
        this.setState({
          interactives: {
            value: {
              ...this.state.interactives.value,
              interactive_content: content.interactive_content
            }
          }
        });
      }
    }
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const currentMessage = this.state.interactives.value;
    let body;

    if (currentMessage && currentMessage.interactive_content) {
      const message = currentMessage.interactive_content;
      body = getMsgBody(message);
    }
    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={[]}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <AssetSelector
          additionalOptions={[additionalOption]}
          name={i18n.t('forms.interactive', 'interactive')}
          noOptionsMessage="No interactive messages found"
          placeholder={'Select interactive message'}
          assets={this.props.assetStore.interactives}
          entry={this.state.interactives}
          onChange={this.handleInteractivesChanged}
          searchable={true}
          formClearable={true}
        />
        {this.state.expression && (
          <div className={styles.expression}>
            <TextInputElement
              name="Expression"
              showLabel={false}
              placeholder="Expression"
              onChange={(updatedText: string) => {
                this.setState({ expression: { value: updatedText } });
              }}
              entry={this.state.expression}
              autocomplete={true}
            />
          </div>
        )}
        <div className={styles.body}> {body}</div>

        <div className={styles.checkbox}>
          <CheckboxElement
            name={i18n.t('forms.timeout', 'Timeout')}
            checked={this.state.isChecked}
            description={'Use dynamic fields'}
            onChange={value => {
              this.setState({ isChecked: value });
            }}
          />
        </div>
        {this.state.isChecked && this.renderListOptions()}

        {this.renderLabelOption()}
      </Dialog>
    );
  }
}
