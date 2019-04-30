import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { hasErrors } from '~/components/flow/actions/helpers';
import { RouterFormProps } from '~/components/flow/props';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { Asset } from '~/store/flowContext';
import { AssetEntry, FormState, mergeForm, StringEntry } from '~/store/nodeEditor';
import {
    validate,
    validateAlphanumeric,
    validateDoesntStartWithNumber,
    validateRequired
} from '~/store/validators';

import { nodeToState, stateToNode } from './helpers';
import * as styles from './ResthookRouter.scss';

// TODO: Remove use of Function
export interface ResthookRouterFormState extends FormState {
    resthook: AssetEntry;
    resultName: StringEntry;
}

export default class ResthookRouterForm extends React.PureComponent<
    RouterFormProps,
    ResthookRouterFormState
> {
    constructor(props: RouterFormProps) {
        super(props);

        this.state = nodeToState(props.nodeSettings);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    private handleUpdateResultName(result: string): void {
        const resultName = validate('Result Name', result, [
            validateRequired,
            validateAlphanumeric,
            validateDoesntStartWithNumber
        ]);
        this.setState({ resultName, valid: this.state.valid && !hasErrors(resultName) });
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
                    assets={this.props.assetStore.resthooks}
                    entry={this.state.resthook}
                    searchable={true}
                    onChange={this.handleResthookChanged}
                />
                <div className={styles.resultName}>
                    <TextInputElement
                        name="Result Name"
                        entry={this.state.resultName}
                        onChange={this.handleUpdateResultName}
                        helpText="This name allows you to reference the results later using @results.whatever_the_name_is"
                    />
                </div>
            </Dialog>
        );
    }
}
