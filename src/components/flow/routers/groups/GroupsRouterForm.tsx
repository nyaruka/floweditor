import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { RouterFormProps } from 'components/flow/props';
import { GROUP_LABEL } from 'components/flow/routers/constants';
import { nodeToState, stateToNode } from 'components/flow/routers/groups/helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import { Asset } from 'store/flowContext';
import { AssetArrayEntry, FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, Required, StartIsNonNumeric, validate } from 'store/validators';
import i18n from 'config/i18n';
import { renderIssues } from 'components/flow/actions/helpers';

// TODO: Remove use of Function
// tslint:disable:ban-types
export interface GroupsRouterFormState extends FormState {
  groups: AssetArrayEntry;
  resultName: StringEntry;
}

export default class GroupsRouterForm extends React.Component<
  RouterFormProps,
  GroupsRouterFormState
> {
  public static contextTypes = {
    endpoints: fakePropType,
    assetService: fakePropType
  };

  constructor(props: RouterFormProps) {
    super(props);
    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  private handleGroupsChanged(groups: Asset[]): void {
    this.handleUpdate({ groups });
  }

  private handleUpdateResultName(resultName: string): void {
    this.handleUpdate({ resultName });
  }

  private handleUpdate(keys: { groups?: Asset[]; resultName?: string }): boolean {
    const updates: Partial<GroupsRouterFormState> = {};

    if (keys.hasOwnProperty('groups')) {
      updates.groups = validate(i18n.t('forms.groups', 'Groups'), keys.groups, [Required]);
    }

    if (keys.hasOwnProperty('resultName')) {
      updates.resultName = validate(i18n.t('forms.result_name', 'Result Name'), keys.resultName, [
        Alphanumeric,
        StartIsNonNumeric
      ]);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleSave(): void {
    if (this.state.valid) {
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

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p>{GROUP_LABEL}</p>
        <AssetSelector
          name={i18n.t('forms.groups', 'Groups')}
          assets={this.props.assetStore.groups}
          entry={this.state.groups}
          searchable={true}
          onChange={this.handleGroupsChanged}
          multi={true}
        />
        {createResultNameInput(this.state.resultName, this.handleUpdateResultName)}
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
