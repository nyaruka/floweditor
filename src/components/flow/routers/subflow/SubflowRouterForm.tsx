import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { RouterFormProps } from 'components/flow/props';
import { nodeToState, stateToNode } from 'components/flow/routers/subflow/helpers';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { FormEntry, FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';
import i18n from 'config/i18n';
import { fetchAsset, getFlowType } from 'external';
import styles from './SubflowRouterForm.module.scss';
import { Trans } from 'react-i18next';
import TextInputElement from 'components/form/textinput/TextInputElement';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';

// TODO: Remove use of Function
export interface SubflowRouterFormState extends FormState {
  flow: FormEntry;
  params: { [name: string]: StringEntry };
}

export default class SubflowRouterForm extends React.PureComponent<
  RouterFormProps,
  SubflowRouterFormState
> {
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public componentDidMount() {
    // we need to resolve our flow for it's parent refs
    // todo: just fetch this is a plan flow result without the asset translation
    if (this.state.flow.value) {
      fetchAsset(this.props.assetStore.flows, this.state.flow.value.uuid).then((flow: Asset) => {
        if (flow) {
          this.handleFlowChanged([
            { name: flow.name, uuid: flow.id, parent_refs: flow.content.parent_refs }
          ]);
        }
      });
    }
  }

  public handleFlowChanged(flows: any[], submitting = false): boolean {
    const flow = flows[0];

    const updates: Partial<SubflowRouterFormState> = {
      flow: validate(i18n.t('forms.flow', 'Flow'), flow, [shouldRequireIf(submitting)])
    };

    const params: { [key: string]: StringEntry } = {};
    // ensure our parameters are initialized
    if (flow && flow.parent_refs) {
      for (const key of flow.parent_refs) {
        if (this.state.params[key]) {
          params[key] = { ...this.state.params[key] };
        } else {
          params[key] = { value: '' };
        }
      }
      updates.params = params;
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);

    return updated.valid;
  }

  private handleSave(): void {
    // validate our flow in case they haven't interacted
    this.handleFlowChanged([this.state.flow.value], true);

    const hasFieldErrors = Object.keys(this.state.params).find((key: string) =>
      hasErrors(this.state.params[key])
    );

    if (this.state.valid && !hasFieldErrors) {
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

  private handleShouldExclude(flow: any): boolean {
    // only show flows that match our flow type
    return getFlowType(flow) !== this.context.config.flowType;
  }

  private handleParamChanged(text: string, name: string) {
    const params = { ...this.state.params };
    params[name] = { value: text };
    this.setState({ params });
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const tabs: Tab[] = [];
    const flow = this.state.flow.value;

    const hasFieldErrors = !!Object.keys(this.state.params).find((key: string) =>
      hasErrors(this.state.params[key])
    );

    if (flow && flow.parent_refs && flow.parent_refs.length > 0) {
      tabs.push({
        name: i18n.t('forms.enter_flow_parameters_tab', 'Parameters'),
        body: (
          <div>
            <p className={styles.info}>
              <Trans
                i18nKey="forms.enter_flow_parameters_summary"
                values={{
                  flow: this.state.flow.value.name,
                  url: this.context.config.endpoints.editor + '/' + this.state.flow.value.id
                }}
              >
                <a
                  target="_"
                  href={this.context.config.endpoints.editor + '/' + this.state.flow.value.id}
                >
                  [[flow]]
                </a>{' '}
                expects the following parameters to be set by this flow. These can be set using a{' '}
                <span>Save Flow Result</span> action or directly below.
              </Trans>
            </p>
            <table className={styles.params}>
              <tbody>
                {flow.parent_refs.map((name: string) => {
                  return (
                    <tr key={'param_' + name} className={styles.param}>
                      <td className={styles.param_name}>{name}</td>
                      <td className={styles.param_input}>
                        <TextInputElement
                          name={name}
                          showLabel={false}
                          placeholder={name}
                          onChange={(updatedText: string) => {
                            this.handleParamChanged(updatedText, name);
                          }}
                          entry={this.state.params[name]}
                          autocomplete={true}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ),
        hasErrors: hasFieldErrors,
        checked: !!Object.keys(this.state.params).find(
          (key: string) => this.state.params[key] && this.state.params[key].value.trim().length > 0
        )
      });
    }

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <AssetSelector
          name={i18n.t('forms.flow', 'Flow')}
          placeholder={i18n.t('forms.select_flow', 'Select the flow to start')}
          assets={this.props.assetStore.flows}
          entry={this.state.flow}
          searchable={true}
          shouldExclude={this.handleShouldExclude}
          onChange={this.handleFlowChanged}
        />
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
