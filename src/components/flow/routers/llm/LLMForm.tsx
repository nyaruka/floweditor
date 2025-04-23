import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { FormEntry, FormState, mergeForm, StringEntry, ValidationFailure } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';

import styles from './LLMForm.module.scss';
import i18n from 'config/i18n';
import { LLM } from 'flowTypes';
import { nodeToState, stateToNode } from './helpers';
import { fakePropType } from 'config/ConfigProvider';
import TembaSelectElement from 'temba/TembaSelectElement';

export interface LLMFormState extends FormState {
  instructions: StringEntry;
  input: StringEntry;
  llm: FormEntry;
}

export default class WebhookRouterForm extends React.Component<RouterFormProps, LLMFormState> {
  constructor(props: RouterFormProps) {
    super(props);
    this.state = nodeToState(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public static contextTypes = {
    config: fakePropType
  };

  private handleUpdate(
    keys: {
      input?: string;
      instructions?: string;
      llm?: LLM;
      validationFailures?: ValidationFailure[];
    },
    submitting = false
  ): boolean {
    const updates: Partial<LLMFormState> = {};

    if (keys.hasOwnProperty('instructions')) {
      updates.instructions = validate(
        i18n.t('forms.instructions', 'Instructions'),
        keys.instructions,
        [shouldRequireIf(submitting)]
      );
    }

    if (keys.hasOwnProperty('input')) {
      updates.input = validate(i18n.t('forms.input', 'Input'), keys.input, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('llm')) {
      updates.llm = validate(i18n.t('forms.aimodel', 'AI Model'), keys.llm, [
        shouldRequireIf(submitting)
      ]);
    }

    const updated = mergeForm(this.state, updates);

    // update our form
    this.setState(updated, () => {});
    return updated.valid;
  }

  private handleLLMUpdate(llm: LLM): void {
    this.handleUpdate({ llm: { name: llm.name, uuid: llm.uuid } });
  }

  private handleInstructionsUpdate(
    instructions: string,
    name: string,
    submitting = false
  ): boolean {
    return this.handleUpdate({ instructions }, submitting);
  }

  private handleInputUpdate(input: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ input }, submitting);
  }

  private handleSave(): void {
    const valid = this.handleUpdate(
      {
        input: this.state.input.value,
        instructions: this.state.instructions.value,
        llm: this.state.llm?.value
      },
      true
    );

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

  private renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />

        <TembaSelectElement
          key="select_llm"
          name={i18n.t('forms.aimodel', 'AI Model')}
          placeholder="Select an AI Model"
          valueKey="uuid"
          nameKey="name"
          endpoint={this.context.config.endpoints.llms}
          onChange={this.handleLLMUpdate}
          value={this.state.llm?.value ? this.state.llm.value : null}
          entry={this.state.llm}
        ></TembaSelectElement>

        <div className={styles.input}>
          <div className={styles.step}>The input the AI will process</div>
          <TextInputElement
            name={i18n.t('forms.input', 'Input')}
            placeholder={i18n.t('forms.llm_input', '@input')}
            entry={this.state.input}
            onChange={this.handleInputUpdate}
            autocomplete={true}
          />
        </div>

        <div className={styles.instructions}>
          <div className={styles.step}>Tell the AI what to do with the input</div>
          <TextInputElement
            name={i18n.t('forms.instructions', 'Intructions')}
            placeholder={i18n.t(
              'forms.llm_instructions',
              'e.g. "Translate to French" or "On a scale of 1-10 rate their frustration level."'
            )}
            entry={this.state.instructions}
            onChange={this.handleInstructionsUpdate}
            autocomplete={true}
            textarea={true}
          />
        </div>

        <div className={styles.help_text}>
          The result can be referenced as <b>@locals._llm_output</b>
        </div>

        {renderIssues(this.props)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
