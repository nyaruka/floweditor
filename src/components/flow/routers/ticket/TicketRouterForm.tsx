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
import styles from './TicketRouterForm.module.scss';
import i18n from 'config/i18n';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TembaSelect from 'temba/TembaSelect';
import { fakePropType } from 'config/ConfigProvider';
import { Topic, User } from 'flowTypes';

export interface TicketRouterFormState extends FormState {
  assignee: FormEntry;
  topic: FormEntry;
  subject: StringEntry;
  note: StringEntry;
  resultName: StringEntry;
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

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }
  private handleUpdate(
    keys: {
      assignee?: User;
      topic?: Topic;
      subject?: string;
      note?: string;
      resultName?: string;
    },
    submitting = false
  ): boolean {
    const updates: Partial<TicketRouterFormState> = {};

    if (keys.hasOwnProperty('assignee')) {
      updates.assignee = validate(i18n.t('forms.assignee', 'Assignee'), keys.assignee, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('topic')) {
      updates.topic = validate(i18n.t('forms.topic', 'Topic'), keys.topic, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('subject')) {
      updates.subject = validate(i18n.t('forms.subject', 'Subject'), keys.subject, []);
    }

    if (keys.hasOwnProperty('note')) {
      updates.note = validate(i18n.t('forms.note', 'Note'), keys.note, []);
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

  private handleAssigneeUpdate(assignee: User): void {
    this.handleUpdate({ assignee });
  }

  private handleTopicUpdate(topic: Topic): void {
    this.handleUpdate({ topic });
  }

  private handleSubjectUpdate(subject: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ subject }, submitting);
  }

  private handleNoteUpdate(note: string): boolean {
    return this.handleUpdate({ note });
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
        subject: this.state.subject.value,
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
              name={i18n.t('forms.topic', 'Topic')}
              endpoint={this.context.config.endpoints.topics}
              onChange={this.handleTopicUpdate}
              value={this.state.topic.value}
              searchable={true}
            />
          </div>

          <div style={{ flexGrow: 1, marginLeft: '0.5em' }}>
            <TembaSelect
              key="select_assignee"
              name={i18n.t('forms.assignee', 'Assignee')}
              placeholder="Assign to (optional)"
              valueKey="email"
              endpoint={this.context.config.endpoints.users}
              onChange={this.handleAssigneeUpdate}
              clearable={true}
              value={this.state.assignee.value}
              getName={(user: User) => {
                if (!user.first_name && !user.last_name) {
                  return user.email || '';
                }
                return `${user.first_name} ${user.last_name}`;
              }}
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
    return this.renderEdit();
  }
}
