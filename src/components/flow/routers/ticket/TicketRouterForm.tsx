import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import { getUserName, nodeToState, stateToNode } from './helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { FormState, mergeForm, StringEntry, FormEntry } from 'store/nodeEditor';
import { Alphanumeric, shouldRequireIf, StartIsNonNumeric, validate } from 'store/validators';
import styles from './TicketRouterForm.module.scss';
import i18n from 'config/i18n';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TembaSelect from 'temba/TembaSelect';
import { fakePropType } from 'config/ConfigProvider';
import { Topic, User } from 'flowTypes';
import { isEqual } from 'lodash';

export interface TicketRouterFormState extends FormState {
  assignee: FormEntry;
  topic: FormEntry;
  note: StringEntry;
  resultName: StringEntry;
  loaded: boolean;
}

export default class TicketRouterForm extends React.Component<
  RouterFormProps,
  TicketRouterFormState
> {
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: RouterFormProps) {
    super(props);
    this.state = {
      assignee: { value: null },
      topic: { value: null },
      note: { value: '' },
      resultName: { value: '' },
      valid: false,
      loaded: false
    };

    bindCallbacks(this, { include: [/^handle/] });
  }

  async componentDidMount(): Promise<void> {
    await this.setStateFromNodeSettings(this.props.nodeSettings);
  }

  async componentDidUpdate(prev: RouterFormProps): Promise<void> {
    if (!isEqual(prev.nodeSettings, this.props.nodeSettings)) {
      await this.setStateFromNodeSettings(this.props.nodeSettings);
    }
  }

  private async setStateFromNodeSettings(settings: RouterFormProps['nodeSettings']): Promise<void> {
    const state = await nodeToState(settings);

    this.setState(state, () => {
      // ensure default topic after state is ready
      if (!this.state.topic.value) {
        this.handleTopicUpdate(this.context.config.defaultTopic);
      }
    });
  }

  private handleUpdate(
    keys: {
      assignee?: User;
      topic?: Topic;
      note?: string;
      resultName?: string;
    },
    submitting = false
  ): boolean {
    const updates: Partial<TicketRouterFormState> = {};

    if (keys.hasOwnProperty('assignee')) {
      updates.assignee = validate(i18n.t('forms.assignee', 'Assignee'), keys.assignee, []);
    }

    if (keys.hasOwnProperty('topic')) {
      updates.topic = validate(i18n.t('forms.topic', 'Topic'), keys.topic, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('note')) {
      updates.note = validate(i18n.t('forms.note', 'Note'), keys.note, []);
    }

    if (keys.hasOwnProperty('resultName')) {
      updates.resultName = validate(
        i18n.t('forms.result_name', 'Result Name'),
        keys.resultName,
        []
      );
    }

    const updated = mergeForm(this.state, updates);

    // update our form
    this.setState(updated);
    return updated.valid;
  }

  private handleAssigneeUpdate(assignee: User): void {
    this.handleUpdate({ assignee });
  }

  private handleTopicUpdate(topic: Topic): void {
    this.handleUpdate({ topic });
  }

  private handleNoteUpdate(note: string): boolean {
    return this.handleUpdate({ note });
  }

  private handleResultNameUpdate(value: string): void {
    const resultName = validate(i18n.t('forms.result_name', 'Result Name'), value, [
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
        topic: this.state.topic.value,
        note: this.state.note.value,
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
        <div style={{ display: 'flex', width: '100%', marginTop: '0.5em' }}>
          <div style={{ flexBasis: 250 }}>
            <TembaSelect
              key="select_topic"
              valueKey="uuid"
              nameKey="name"
              name={i18n.t('forms.topic', 'Topic')}
              endpoint={this.context.config.endpoints.topics}
              onChange={this.handleTopicUpdate}
              value={this.state.topic.value || this.context.config.defaultTopic}
              searchable={true}
              placeholder="Select a topic"
              errors={(this.state.topic.validationFailures || []).map(failure => failure.message)}
            />
          </div>

          <div style={{ flexGrow: 1, marginLeft: '0.5em' }}>
            <TembaSelect
              key="select_assignee"
              name={i18n.t('forms.assignee', 'Assignee')}
              placeholder="Assign to (optional)"
              valueKey="uuid"
              endpoint={this.context.config.endpoints.users}
              onChange={this.handleAssigneeUpdate}
              clearable={true}
              value={this.state.assignee.value}
              getName={getUserName}
            />
          </div>
        </div>
        <div className={styles.note}>
          <TextInputElement
            name={i18n.t('forms.note', 'Note')}
            placeholder={i18n.t('forms.enter_a_note', 'Enter a note (optional)')}
            entry={this.state.note}
            onChange={this.handleNoteUpdate}
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
    if (this.state.loaded) {
      return this.renderEdit();
    }
    return null;
  }
}
