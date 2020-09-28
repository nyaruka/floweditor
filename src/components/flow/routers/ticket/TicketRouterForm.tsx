import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import { nodeToState, stateToNode } from './helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { FormState, mergeForm, StringEntry, FormEntry } from 'store/nodeEditor';
import {
  Alphanumeric,
  Required,
  shouldRequireIf,
  StartIsNonNumeric,
  validate
} from 'store/validators';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import { Asset } from 'store/flowContext';
import styles from './TicketRouterForm.module.scss';
import i18n from 'config/i18n';
import TextInputElement from 'components/form/textinput/TextInputElement';

export interface TicketRouterFormState extends FormState {
  ticketer: FormEntry;
  subject: StringEntry;
  body: StringEntry;
  resultName: StringEntry;
}

export default class TicketRouterForm extends React.Component<
  RouterFormProps,
  TicketRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);
    this.state = nodeToState(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  private handleUpdate(
    keys: {
      ticketer?: Asset;
      subject?: string;
      body?: string;
      resultName?: string;
    },
    submitting = false
  ): boolean {
    const updates: Partial<TicketRouterFormState> = {};

    if (keys.hasOwnProperty('ticketer')) {
      updates.ticketer = validate(i18n.t('forms.ticketer', 'Ticketer'), keys.ticketer, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('subject')) {
      updates.subject = validate(i18n.t('forms.subject', 'Subject'), keys.subject, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('body')) {
      updates.body = validate(i18n.t('forms.body', 'Body'), keys.body, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('resultName')) {
      updates.resultName = validate(i18n.t('forms.result_name', 'Result Name'), keys.resultName, [
        shouldRequireIf(submitting)
      ]);
    }

    const updated = mergeForm(this.state, updates);

    // update our form
    this.setState(updated);
    return updated.valid;
  }

  private handleTicketerUpdate(selected: Asset[]): void {
    this.handleUpdate({ ticketer: selected[0] });
  }

  private handleSubjectUpdate(subject: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ subject }, submitting);
  }

  private handleBodyUpdate(body: string): boolean {
    return this.handleUpdate({ body });
  }

  private handleResultNameUpdate(value: string): void {
    const resultName = validate(i18n.t('forms.result_name', 'Result Name'), value, [
      Required,
      Alphanumeric,
      StartIsNonNumeric
    ]);
    this.setState({
      resultName,
      valid: this.state.valid && !hasErrors(resultName)
    });
  }

  private handleSave(): void {
    // validate all fields in case they haven't interacted
    const valid = this.handleUpdate(
      {
        ticketer: this.state.ticketer.value,
        subject: this.state.subject.value,
        body: this.state.body.value,
        resultName: this.state.resultName.value
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
        <p>
          <span>Open ticket via... </span>
        </p>
        <AssetSelector
          key="select_ticketer"
          name={i18n.t('forms.ticketer', 'Ticketer')}
          placeholder="Select the ticketing service to use"
          assets={this.props.assetStore.ticketers}
          onChange={this.handleTicketerUpdate}
          entry={this.state.ticketer}
        />
        <div className={styles.subject}>
          <TextInputElement
            name={i18n.t('forms.subject', 'Subject')}
            placeholder={i18n.t('forms.enter_a_subject', 'Enter a subject')}
            entry={this.state.subject}
            onChange={this.handleSubjectUpdate}
            autocomplete={true}
          />
        </div>
        <div className={styles.body}>
          <TextInputElement
            name={i18n.t('forms.body', 'Body')}
            placeholder={i18n.t('forms.enter_a_body', 'Enter a body')}
            entry={this.state.body}
            onChange={this.handleBodyUpdate}
            autocomplete={true}
            textarea={true}
          />
        </div>

        {createResultNameInput(this.state.resultName, this.handleResultNameUpdate)}
        {renderIssues(this.props)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
