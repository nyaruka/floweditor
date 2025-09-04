import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { FormState, mergeForm } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';

import i18n from 'config/i18n';
import { Trans } from 'react-i18next';
import { renderIssues } from '../helpers';
import { initializeForm, stateToAction } from './helpers';
import TembaSelectElement from 'temba/TembaSelectElement';
import { createUUID } from 'utils';

export interface RequestOptInFormState extends FormState {
  optin: any;
}

export const controlLabelSpecId = 'label';

export default class RequestOptInForm extends React.PureComponent<
  ActionFormProps,
  RequestOptInFormState
> {
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

  public handleSave(): void {
    const valid = this.handleOptInChanged(this.state.optin.value!, true);

    if (valid) {
      const newAction = stateToAction(this.props.nodeSettings, this.state);
      this.props.updateAction(newAction);
      this.props.onClose(false);
    }
  }

  public handleOptInChanged(selected: Asset, submitting: boolean = false): boolean {
    const updates: Partial<RequestOptInFormState> = {
      optin: validate(i18n.t('forms.title', 'Name'), selected, [shouldRequireIf(submitting)])
    };

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
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

  public handleCreateAssetFromInput(input: string): any {
    return { name: input, uuid: createUUID() };
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p data-spec={controlLabelSpecId}>
          <Trans i18nKey="forms.request_optin_summary">Select the opt-in to request</Trans>
        </p>

        <TembaSelectElement
          key="optin_select"
          name={i18n.t('forms.request_optin.title', 'Request Opt-In')}
          placeholder={i18n.t(
            'enter_to_create_optin',
            'Enter the name of an existing opt-in or create a new one'
          )}
          endpoint={this.context.config.endpoints.optins}
          entry={this.state.optin}
          valueKey="uuid"
          searchable={true}
          expressions={true}
          onChange={this.handleOptInChanged}
          allowCreate={true}
          createPrefix={i18n.t('forms.create_optin', 'Create opt-in') + ': '}
          createArbitraryOption={this.handleCreateAssetFromInput}
        />

        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
