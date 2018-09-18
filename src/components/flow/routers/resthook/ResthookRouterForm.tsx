import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { RouterFormProps } from '~/components/flow/props';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset } from '~/store/flowContext';
import { AssetEntry, FormState, mergeForm } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';
import { nodeToState, stateToNode } from './helpers';

// TODO: Remove use of Function
export interface ResthookRouterFormState extends FormState {
    resthook: AssetEntry;
}

export default class ResthookRouterForm extends React.PureComponent<
    RouterFormProps,
    ResthookRouterFormState
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

    public handleResthookChanged(selected: Asset[]): boolean {
        const updates: Partial<ResthookRouterFormState> = {
            resthook: validate('Resthook', selected[0], [validateRequired])
        };

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private handleSave(): void {
        // validate our resthook in case they haven't interacted
        const valid = this.handleResthookChanged([this.state.resthook.value]);

        if (valid) {
            this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
            this.props.onClose(false);
        }
    }

    public getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
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
                    name="Resthook"
                    placeholder="Select the resthook to call"
                    assets={this.props.assets.resthooks}
                    entry={this.state.resthook}
                    searchable={true}
                    onChange={this.handleResthookChanged}
                />
            </Dialog>
        );
    }
}
