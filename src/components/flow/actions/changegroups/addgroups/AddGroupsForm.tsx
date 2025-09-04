import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import TypeList from 'components/nodeeditor/TypeList';
import { ChangeGroups } from 'flowTypes';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { mergeForm } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';

import { ChangeGroupsFormState, excludeDynamicGroups, labelSpecId } from '../helpers';
import { initializeForm, stateToAction } from './helpers';
import i18n from 'config/i18n';
import { Trans } from 'react-i18next';
import { renderIssues } from '../../helpers';
import TembaSelectElement from 'temba/TembaSelectElement';
import { fakePropType } from 'config/ConfigProvider';

export default class AddGroupsForm extends React.Component<ActionFormProps, ChangeGroupsFormState> {
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: ActionFormProps) {
    super(props);
    this.state = initializeForm(this.props.nodeSettings) as ChangeGroupsFormState;

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public handleSave(): void {
    const valid = this.handleGroupsChanged(this.state.groups.value!, true);
    if (valid) {
      const newAction = stateToAction(this.props.nodeSettings, this.state);
      this.props.updateAction(newAction as ChangeGroups);
      this.props.onClose(false);
    }
  }

  public handleGroupsChanged(groups: any[], submitting: boolean = false): boolean {
    const updates: Partial<ChangeGroupsFormState> = {
      groups: validate(i18n.t('forms.groups', 'Groups'), groups, [shouldRequireIf(submitting)])
    };

    const updated = mergeForm(this.state, updates);

    // make sure we don't have any unresolved arbitrary options
    updated.valid = updated.valid && !groups.find(group => (group as any).arbitrary);

    this.setState(updated);
    return updated.valid;
  }

  public handleGroupAdded(group: Asset): void {
    const groups = (this.state.groups.value || [])
      .concat(group)
      .filter((g: Asset) => g.id !== 'created');

    // update our store with our new group
    this.props.addAsset('groups', group);

    // try to add the group
    this.handleGroupsChanged(groups, false);
  }

  public handleCreateAssetFromInput(input: string): any {
    return { name: input };
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
    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p data-spec={labelSpecId}>
          <Trans i18nKey="forms.add_groups_summary">Select the groups to add the contact to.</Trans>
        </p>

        <TembaSelectElement
          key="group_select"
          name={i18n.t('forms.groups', 'Groups')}
          placeholder={i18n.t('enter_to_create_group', 'Enter a name to create a new group')}
          endpoint={this.context.config.endpoints.groups}
          entry={this.state.groups}
          shouldExclude={excludeDynamicGroups}
          valueKey="uuid"
          searchable={true}
          multi={true}
          expressions={true}
          onChange={this.handleGroupsChanged}
          allowCreate={true}
          createPrefix={i18n.t('forms.create_group', 'Create Group') + ': '}
          createArbitraryOption={this.handleCreateAssetFromInput}
        />

        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
