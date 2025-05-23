import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import {
  AssetArrayEntry,
  FormState,
  mergeForm,
  StringEntry,
  SelectOptionEntry,
  FormEntry,
  ExclusionsCheckboxEntry
} from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';
import { renderIf } from 'utils';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import { initializeForm, stateToAction } from './helpers';
import TextInputElement from 'components/form/textinput/TextInputElement';
import i18n from 'config/i18n';
import { renderIssues } from '../helpers';
import styles from './StartSessionForm.module.scss';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import { fakePropType } from 'config/ConfigProvider';
import TembaSelectElement from 'temba/TembaSelectElement';

export const START_TYPE_ASSETS: SelectOption = {
  name: i18n.t('forms.start_type_manual', 'Select recipients manually'),
  value: 'assets'
};
export const START_TYPE_CREATE: SelectOption = {
  name: i18n.t('forms.start_type_create', 'Create a new contact'),
  value: 'create_contact'
};
export const START_TYPE_QUERY: SelectOption = {
  name: i18n.t('forms.start_type_query_contact', 'Select a contact with a query'),
  value: 'contact_query'
};

const START_TYPE_OPTIONS = [START_TYPE_ASSETS, START_TYPE_QUERY, START_TYPE_CREATE];

export interface StartSessionFormState extends FormState {
  recipients: AssetArrayEntry;
  flow: FormEntry;
  startType: SelectOptionEntry;
  contactQuery: StringEntry;
  exclusions: ExclusionsCheckboxEntry;
}

export class StartSessionForm extends React.Component<ActionFormProps, StartSessionFormState> {
  public static contextTypes = {
    config: fakePropType
  };

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

  public handleFlowChanged(flow: Asset): boolean {
    return this.handleUpdate({ flow });
  }

  public handleStartTypeChanged(startType: SelectOption): boolean {
    return this.handleUpdate({ startType });
  }

  public handleContactQueryChanged(contactQuery: string): boolean {
    return this.handleUpdate({ contactQuery });
  }

  public handleExclusions(skipContactsInAFlow: boolean): boolean {
    let exclusions = { in_a_flow: skipContactsInAFlow };
    return this.handleUpdate({ exclusions });
  }

  private handleUpdate(
    keys: {
      flow?: Asset;
      recipients?: Asset[];
      startType?: SelectOption;
      contactQuery?: string;
      exclusions?: ExclusionsCheckboxEntry;
    },
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
      updates.contactQuery = validate(
        i18n.t('forms.contact_query', 'Contact Query'),
        keys.contactQuery,
        [shouldRequireIf(submitting && this.state.startType.value === START_TYPE_QUERY)]
      );
    }

    if (keys.hasOwnProperty('recipients')) {
      updates.recipients = validate(i18n.t('forms.recipients', 'Recipients'), keys.recipients, [
        shouldRequireIf(submitting && this.state.startType.value === START_TYPE_ASSETS)
      ]);
    }

    if (keys.hasOwnProperty('flow')) {
      updates.flow = validate(i18n.t('forms.flow', 'Flow'), keys.flow, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('exclusions')) {
      updates.exclusions = keys.exclusions;
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
      primary: { name: i18n.t('buttons.ok', 'Ok'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true)
      }
    };
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const advanced: Tab = {
      name: i18n.t('forms.advanced', 'Advanced'),
      body: (
        <CheckboxElement
          name={i18n.t('forms.skip_contacts_in_a_flow', 'Skip contacts currently in a flow')}
          title={i18n.t('forms.skip_contacts_in_a_flow', 'Skip contacts currently in a flow')}
          checked={this.state.exclusions.in_a_flow}
          description={i18n.t(
            'forms.skip_contacts_in_a_flow_description',
            'Avoid interrupting a contact who is already in a flow.'
          )}
          onChange={this.handleExclusions}
        />
      ),
      checked: this.state.exclusions.in_a_flow
    };

    const tabs = [advanced];

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <div>
          <SelectElement
            key="start_type_select"
            name={i18n.t('forms.start_type', 'Start Type')}
            entry={this.state.startType}
            onChange={this.handleStartTypeChanged}
            options={START_TYPE_OPTIONS}
          />
        </div>
        <p />
        <div>
          {renderIf(this.state.startType.value === START_TYPE_ASSETS)(
            <div data-testid="recipients">
              <TembaSelectElement
                key="recipient_select"
                endpoint={this.context.config.endpoints.contacts}
                name={i18n.t('forms.recipients', 'Recipients')}
                placeholder={i18n.t(
                  'forms.select_who_to_start',
                  'Select who should be started in the flow'
                )}
                entry={this.state.recipients}
                searchable={true}
                multi={true}
                expressions={true}
                queryParam="search"
                onChange={this.handleRecipientsChanged}
              />

              <p />
            </div>
          )}

          {renderIf(this.state.startType.value === START_TYPE_QUERY)(
            <div data-testid="contact_query">
              <TextInputElement
                name={i18n.t('forms.contact_query', 'Contact Query')}
                placeholder={'household_id = @fields.household_id'}
                onChange={this.handleContactQueryChanged}
                entry={this.state.contactQuery}
                autocomplete={true}
                focus={true}
              />
              <div className={styles.helpText}>
                {i18n.t('forms.contact_query_help', 'Only one matching contact will be started')}
              </div>
            </div>
          )}

          <TembaSelectElement
            key="flow_select"
            name={i18n.t('forms.flow', 'Flow')}
            placeholder={i18n.t('forms.select_flow', 'Select the flow to start')}
            endpoint={this.context.config.endpoints.flows}
            entry={this.state.flow}
            valueKey="uuid"
            searchable={true}
            onChange={this.handleFlowChanged}
          />
        </div>
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}

export default StartSessionForm;
