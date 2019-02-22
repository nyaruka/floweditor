import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { ActionFormProps } from '~/components/flow/props';
import SelectElement, { SelectOption } from '~/components/form/select/SelectElement';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { FormState, mergeForm, SelectOptionEntry, StringEntry } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

import * as styles from './AddURNForm.scss';
import { getSchemeOptions, initializeForm, stateToAction } from './helpers';

export interface AddUrnFormState extends FormState {
    scheme: SelectOptionEntry;
    path: StringEntry;
}

export const controlLabelSpecId = 'label';

export default class AddURNForm extends React.PureComponent<ActionFormProps, AddUrnFormState> {
    constructor(props: ActionFormProps) {
        super(props);
        this.state = initializeForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public handleSave(): void {
        const valid = this.handlePathChanged(this.state.path.value);
        if (valid) {
            const newAction = stateToAction(this.props.nodeSettings, this.state);
            this.props.updateAction(newAction);
            this.props.onClose(false);
        }
    }

    public handleSchemeChanged(selected: SelectOption): boolean {
        const updates: Partial<AddUrnFormState> = {
            scheme: { value: selected }
        };
        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    public handlePathChanged(value: string): boolean {
        const updates: Partial<AddUrnFormState> = {
            path: validate('URN', value, [validateRequired])
        };

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
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
                <p data-spec={controlLabelSpecId}>
                    Add a new URN to reach the contact such as a phone number or a Twitter handle.
                </p>
                <div className={styles.schemeSelection}>
                    <SelectElement
                        name="URN Type"
                        entry={this.state.scheme}
                        onChange={this.handleSchemeChanged}
                        options={getSchemeOptions()}
                    />
                </div>
                <div className={styles.path}>
                    <TextInputElement
                        name="URN"
                        placeholder="Enter the URN value"
                        entry={this.state.path}
                        onChange={this.handlePathChanged}
                        autocomplete={true}
                    />
                </div>
            </Dialog>
        );
    }
}
