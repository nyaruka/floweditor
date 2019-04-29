import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { hasErrors } from '~/components/flow/actions/helpers';
import { initializeForm, stateToAction } from '~/components/flow/actions/setrunresult/helpers';
import * as styles from '~/components/flow/actions/setrunresult/SetRunResult.scss';
import { ActionFormProps } from '~/components/flow/props';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { Asset, AssetType } from '~/store/flowContext';
import {
    AssetEntry,
    FormState,
    mergeForm,
    StringEntry,
    ValidationFailure
} from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';
import { snakify } from '~/utils';

export interface SetRunResultFormState extends FormState {
    name: AssetEntry;
    value: StringEntry;
    category: StringEntry;
}

export default class SetRunResultForm extends React.PureComponent<
    ActionFormProps,
    SetRunResultFormState
> {
    constructor(props: ActionFormProps) {
        super(props);

        this.state = initializeForm(this.props.nodeSettings);

        bindCallbacks(this, {
            include: [/^handle/, /^on/]
        });
    }

    private handleNameUpdate(selected: Asset[]): void {
        this.setState({ name: { value: selected[0] } });
    }

    public handleValueUpdate(value: string): boolean {
        return this.handleUpdate({ value });
    }

    public handleCategoryUpdate(category: string): boolean {
        return this.handleUpdate({ category });
    }

    private handleUpdate(keys: { name?: Asset; value?: string; category?: string }): boolean {
        const updates: Partial<SetRunResultFormState> = {};

        if (keys.hasOwnProperty('name')) {
            updates.name = validate('Name', keys.name, [validateRequired]);
        }

        if (keys.hasOwnProperty('value')) {
            updates.value = validate('Value', keys.value, []);
        }

        if (keys.hasOwnProperty('category')) {
            updates.category = validate('Category', keys.category, []);
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private handleSave(): void {
        // make sure we validate untouched text fields
        const valid = this.handleUpdate({
            name: this.state.name.value
        });

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

    private handleCreateAssetFromInput(input: string): Asset {
        return {
            id: snakify(input),
            name: input,
            type: AssetType.Result
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
                <div className={styles.form}>
                    <AssetSelector
                        name="Name"
                        assets={this.props.assetStore.results}
                        entry={this.state.name}
                        searchable={true}
                        createPrefix="New: "
                        onChange={this.handleNameUpdate}
                        createAssetFromInput={this.handleCreateAssetFromInput}
                        showLabel={true}
                        helpText="The name of the result, used to reference later, for example: @run.results.my_result_name"
                    />

                    <TextInputElement
                        __className={styles.value}
                        name="Value"
                        showLabel={true}
                        onChange={this.handleValueUpdate}
                        entry={this.state.value}
                        onFieldFailures={(persistantFailures: ValidationFailure[]) => {
                            const value = { ...this.state.value, persistantFailures };
                            this.setState({ value, valid: this.state.valid && !hasErrors(value) });
                        }}
                        autocomplete={true}
                        helpText="The value to save for this result or empty to clears it. You can use expressions, for example: @(title(input))"
                    />
                    <TextInputElement
                        __className={styles.category}
                        name="Category"
                        placeholder="Optional"
                        showLabel={true}
                        onChange={this.handleCategoryUpdate}
                        entry={this.state.category}
                        autocomplete={false}
                        helpText="An optional category for your result. For age, the value might be 17, but the category might be 'Young Adult'"
                    />
                </div>
            </Dialog>
        );
    }
}
