import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { initializeForm, stateToAction } from '~/components/flow/actions/setrunresult/helpers';
import * as styles from '~/components/flow/actions/setrunresult/SetRunResult.scss';
import { determineTypeConfig } from '~/components/flow/helpers';
import { ActionFormProps } from '~/components/flow/props';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { FormState, mergeForm, StringEntry } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

export interface SetRunResultFormState extends FormState {
    name: StringEntry;
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

    public handleNameUpdate(name: string): boolean {
        return this.handleUpdate({ name });
    }

    public handleValueUpdate(value: string): boolean {
        return this.handleUpdate({ value });
    }

    public handleCategoryUpdate(category: string): boolean {
        return this.handleUpdate({ category });
    }

    private handleUpdate(keys: { name?: string; value?: string; category?: string }): boolean {
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
            this.props.updateAction(
                stateToAction(this.props.nodeSettings.originalAction.uuid, this.state)
            );

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
        const typeConfig = determineTypeConfig(this.props.nodeSettings);
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
                    <TextInputElement
                        __className={styles.name}
                        name="Name"
                        showLabel={true}
                        onChange={this.handleNameUpdate}
                        entry={this.state.name}
                        helpText="The name of the result, used to reference later, for example: @run.results.my_result_name"
                    />
                    <TextInputElement
                        __className={styles.value}
                        name="Value"
                        showLabel={true}
                        onChange={this.handleValueUpdate}
                        entry={this.state.value}
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
                        autocomplete={true}
                        helpText="An optional category for your result. For age, the value might be 17, but the category might be 'Young Adult'"
                    />
                </div>
            </Dialog>
        );
    }
}
