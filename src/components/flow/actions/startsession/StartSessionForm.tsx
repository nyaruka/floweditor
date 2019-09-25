import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import {
  AssetArrayEntry,
  AssetEntry,
  FormState,
  mergeForm,
  StringEntry,
  SelectOptionEntry,
  ValidationFailure
} from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';
import { renderIf } from 'utils';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import { initializeForm, stateToAction } from './helpers';
import TextInputElement from 'components/form/textinput/TextInputElement';
import { large } from 'utils/reactselect';

export const START_TYPE_ASSETS = { label: 'Select recipients manually', value: 'assets' };
export const START_TYPE_CREATE = { label: 'Create a new contact', value: 'create_contact' };
export const START_TYPE_QUERY = { label: 'Select recipients from a query', value: 'contact_query' };

const START_TYPE_OPTIONS = [START_TYPE_ASSETS, START_TYPE_QUERY, START_TYPE_CREATE];

export interface StartSessionFormState extends FormState {
  recipients: AssetArrayEntry;
  flow: AssetEntry;
  startType: SelectOptionEntry;
  contactQuery: StringEntry;
}

export class StartSessionForm extends React.Component<ActionFormProps, StartSessionFormState> {
  constructor(props: ActionFormProps) {
    super(props);

    this.state = initializeForm(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public handleRecipientsChanged(recipients: Asset[]): boolean {
    return this.handleUpdate({ recipients });
  }

  public handleFlowChanged(flows: Asset[]): boolean {
    let flow = null;
    if (flows && flows.length > 0) {
      flow = flows[0];
    }
    return this.handleUpdate({ flow });
  }

  public handleStartTypeChanged(startType: SelectOption): boolean {
    return this.handleUpdate({ startType });
  }

  public handleContactQueryChanged(contactQuery: string): boolean {
    return this.handleUpdate({ contactQuery });
  }

  private handleUpdate(
    keys: { flow?: Asset; recipients?: Asset[]; startType?: SelectOption; contactQuery?: string },
    submitting = false
  ): boolean {
    const updates: Partial<StartSessionFormState> = {};

    if (keys.hasOwnProperty('startType')) {
      updates.startType = { value: keys.startType };
      if (keys.startType !== START_TYPE_ASSETS) {
        updates.recipients = { value: [] };
      }

      if (keys.startType !== START_TYPE_QUERY) {
        updates.contactQuery = { value: '' };
      }
    }

    if (keys.hasOwnProperty('contactQuery')) {
      updates.contactQuery = validate('Contact query', keys.contactQuery, [
        shouldRequireIf(submitting && this.state.startType.value === START_TYPE_QUERY)
      ]);
    }

    if (keys.hasOwnProperty('recipients')) {
      updates.recipients = validate('Recipients', keys.recipients, [
        shouldRequireIf(submitting && this.state.startType.value === START_TYPE_ASSETS)
      ]);
    }

    if (keys.hasOwnProperty('flow')) {
      updates.flow = validate('Flow', keys.flow, [shouldRequireIf(submitting)]);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleSave(): void {
    // validate in case they never updated an empty field
    const valid = this.handleUpdate(
      {
        recipients: this.state.recipients.value,
        flow: this.state.flow.value,
        contactQuery: this.state.contactQuery.value
      },
      true
    );

    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));

      // notify our modal we are done
      this.props.onClose(false);
    }
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
        <div>
          <SelectElement
            name="Start Type"
            styles={large as any}
            entry={this.state.startType}
            onChange={this.handleStartTypeChanged}
            options={START_TYPE_OPTIONS}
          />
        </div>
        <p />
        <div>
          {renderIf(this.state.startType.value === START_TYPE_ASSETS)(
            <div data-testid="recipients">
              <AssetSelector
                name="Recipients"
                placeholder="Choose who should be started in the flow"
                assets={this.props.assetStore.recipients}
                completion={{
                  assetStore: this.props.assetStore,
                  schema: this.props.completionSchema
                }}
                entry={this.state.recipients}
                searchable={true}
                multi={true}
                onChange={this.handleRecipientsChanged}
              />
              <p />
            </div>
          )}

          {renderIf(this.state.startType.value === START_TYPE_QUERY)(
            <div data-testid="contact_query">
              <TextInputElement
                name="Contact Query"
                placeholder={'household_id = @fields.household_id'}
                onFieldFailures={(persistantFailures: ValidationFailure[]) => {
                  const contactQuery = { ...this.state.contactQuery, persistantFailures };
                  this.setState({
                    contactQuery,
                    valid: this.state.valid
                  });
                }}
                onChange={this.handleContactQueryChanged}
                entry={this.state.contactQuery}
                autocomplete={true}
                focus={true}
              />
              <p />
            </div>
          )}

          <AssetSelector
            name="Flow"
            placeholder="Choose which flow to start"
            assets={this.props.assetStore.flows}
            entry={this.state.flow}
            searchable={true}
            onChange={this.handleFlowChanged}
          />
        </div>
      </Dialog>
    );
  }
}

export default StartSessionForm;
