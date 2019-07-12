import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import { ActionFormProps } from 'components/flow/props';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import {
  FormState,
  mergeForm,
  SelectOptionEntry,
  StringEntry,
  ValidationFailure
} from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';

import styles from './AddURNForm.module.scss';
import { getSchemeOptions, initializeForm, stateToAction } from './helpers';

export interface AddURNFormState extends FormState {
  scheme: SelectOptionEntry;
  path: StringEntry;
}

export const controlLabelSpecId = 'label';

export default class AddURNForm extends React.PureComponent<ActionFormProps, AddURNFormState> {
  constructor(props: ActionFormProps) {
    super(props);
    this.state = initializeForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public handleSave(): void {
    const valid = this.handlePathChanged(this.state.path.value, null, true);
    if (valid) {
      const newAction = stateToAction(this.props.nodeSettings, this.state);
      this.props.updateAction(newAction);
      this.props.onClose(false);
    }
  }

  public handleSchemeChanged(selected: SelectOption): boolean {
    const updates: Partial<AddURNFormState> = {
      scheme: { value: selected }
    };
    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  public handlePathChanged(value: string, name: string, submitting: boolean = false): boolean {
    const updates: Partial<AddURNFormState> = {
      path: validate('URN', value, [shouldRequireIf(submitting)])
    };

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: 'Ok', onClick: this.handleSave },
      secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
    };
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p data-spec={controlLabelSpecId}>
          Add a new URN to reach the contact such as a phone number.
        </p>
        <div className={styles.scheme_selection}>
          <SelectElement
            name="URN Type"
            entry={this.state.scheme}
            onChange={this.handleSchemeChanged}
            options={getSchemeOptions()}
          />
        </div>
        <div className={styles.path}>
          <TextInputElement
            name="URN"
            placeholder="Enter the URN value"
            entry={this.state.path}
            onChange={this.handlePathChanged}
            onFieldFailures={(persistantFailures: ValidationFailure[]) => {
              const path = { ...this.state.path, persistantFailures };
              this.setState({
                path,
                valid: this.state.valid && !hasErrors(path)
              });
            }}
            autocomplete={true}
          />
        </div>
      </Dialog>
    );
  }
}
