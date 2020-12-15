import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { ActionFormProps, RouterFormProps } from 'components/flow/props';
import CaseList, { CaseProps } from 'components/flow/routers/caselist/CaseList';

import { nodeToState, stateToNode } from 'components/flow/routers/sequence/helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TimeoutControl from 'components/form/timeout/TimeoutControl';
import TypeList from 'components/nodeeditor/TypeList';
import { FormState, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, StartIsNonNumeric, validate } from 'store/validators';
import { WAIT_LABEL } from 'components/flow/routers/constants';
import i18n from 'config/i18n';
import TextInputElement, { TextInputStyle } from 'components/form/textinput/TextInputElement';
import styles from 'components/flow/routers/sequence/SequenceForm.module.scss';

export interface SequenceFormState extends FormState {
  days: string;
  hours: string;
  minutes: string;
}

export default class SequenceForm extends React.Component<ActionFormProps, SequenceFormState> {
  constructor(props: ActionFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handleSave(): void {
    if (this.state.valid) {
      this.props.updateAction(stateToNode(this.props.nodeSettings, this.state));
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

  public renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <div>Wait for time</div>

        <div className={styles.delay_container}>
          <span className={styles.title}>Days</span>
          <TextInputElement
            name={i18n.t('forms.state', 'State')}
            placeholder="Enter days"
            onChange={props => this.setState({ days: props })}
            style={TextInputStyle.small}
            entry={{ value: this.state.days }}
          />
          <span className={styles.title}>Hours</span>
          <TextInputElement
            name={i18n.t('forms.state', 'State')}
            placeholder="Enter hours"
            onChange={props => this.setState({ hours: props })}
            style={TextInputStyle.small}
            entry={{ value: this.state.hours }}
          />
          <span className={styles.title}>Minutes</span>
          <TextInputElement
            name={i18n.t('forms.state', 'State')}
            placeholder="Enter minutes"
            onChange={props => this.setState({ minutes: props })}
            style={TextInputStyle.small}
            entry={{ value: this.state.minutes }}
          />
        </div>
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
