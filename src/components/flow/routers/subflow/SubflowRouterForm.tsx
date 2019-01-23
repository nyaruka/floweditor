import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { RouterFormProps } from '~/components/flow/props';
import { nodeToState, stateToNode } from '~/components/flow/routers/subflow/helpers';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset } from '~/store/flowContext';
import { AssetEntry, FormState, mergeForm } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

// TODO: Remove use of Function
export interface SubflowRouterFormState extends FormState {
    flow: AssetEntry;
}

export default class SubflowRouterForm extends React.PureComponent<
    RouterFormProps,
    SubflowRouterFormState
> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: RouterFormProps) {
        super(props);

        this.state = nodeToState(props.nodeSettings);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public handleFlowChanged(flows: Asset[]): boolean {
        const updates: Partial<SubflowRouterFormState> = {
            flow: validate('Flow', flows[0], [validateRequired])
        };

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private handleSave(): void {
        // validate our flow in case they haven't interacted
        this.handleFlowChanged([this.state.flow.value]);

        if (this.state.valid) {
            this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
            this.props.onClose(false);
        }
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave, disabled: !this.state.valid },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public render(): JSX.Element {
        const typeConfig = this.props.typeConfig;
        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                buttons={this.getButtons()}
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <AssetSelector
                    name="Flow"
                    placeholder="Select the flow to start"
                    assets={this.props.assetStore.flows}
                    entry={this.state.flow}
                    searchable={true}
                    onChange={this.handleFlowChanged}
                />
            </Dialog>
        );
    }
}
