import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TextInputElement from '~/component/form/TextInputElement';
import { AppState, DispatchWithState } from '~/store';
import { SetRunResultFunc, updateSetRunResultForm } from '~/store/forms';
import { SetRunResultFormState } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

import { Type } from '~/config';
import { SetRunResult } from '~/flowTypes';
import * as styles from './SetRunResult.scss';
import { SetRunResultFormHelper } from './SetRunResultFormHelper';

export interface SetRunResultFormStoreProps {
    typeConfig: Type;
    form: SetRunResultFormState;
    updateSetRunResultForm: SetRunResultFunc;
}

export interface SetRunResultFormPassedProps {
    action: SetRunResult;
    updateAction(action: SetRunResult): void;
    getInitialAction(): SetRunResult;
    formHelper: SetRunResultFormHelper;
}

export type SetRunResultFormProps = SetRunResultFormStoreProps & SetRunResultFormPassedProps;

export class SetRunResultForm extends React.PureComponent<SetRunResultFormProps> {
    constructor(props: SetRunResultFormProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^handle/, /^on/]
        });
    }

    public validate(): boolean {
        return this.handleUpdateName(this.props.form.name.value);
    }
    public onValid(): void {
        this.props.updateAction(
            this.props.formHelper.stateToAction(this.props.action.uuid, this.props.form)
        );
    }

    public handleFormUpdate(updates: Partial<SetRunResultFormState>): boolean {
        return (this.props.updateSetRunResultForm(updates) as any).valid;
    }

    public handleUpdateName(name: string): boolean {
        return this.handleFormUpdate({
            name: validate('Name', name, [validateRequired])
        });
    }

    public handleUpdateValue(value: string): boolean {
        return this.handleFormUpdate({ value: validate('Value', value, []) });
    }

    public handleUpdateCategory(category: string): boolean {
        return this.handleFormUpdate({ category: validate('Category', category, []) });
    }

    public render(): JSX.Element {
        return (
            <div className={styles.form}>
                <TextInputElement
                    __className={styles.name}
                    name="Name"
                    showLabel={true}
                    onChange={this.handleUpdateName}
                    entry={this.props.form.name}
                    helpText="The name of the result, used to reference later, for example: @run.results.my_result_name"
                />
                <TextInputElement
                    __className={styles.value}
                    name="Value"
                    showLabel={true}
                    onChange={this.handleUpdateValue}
                    entry={this.props.form.value}
                    autocomplete={true}
                    helpText="The value to save for this result or empty to clears it. You can use expressions, for example: @(title(input))"
                />
                <TextInputElement
                    __className={styles.category}
                    name="Category"
                    placeholder="Optional"
                    showLabel={true}
                    onChange={this.handleUpdateCategory}
                    entry={this.props.form.category}
                    autocomplete={true}
                    helpText="An optional category for your result. For age, the value might be 17, but the category might be 'Young Adult'"
                />
            </div>
        );
    }
}

const mapStateToProps = ({ nodeEditor: { form, typeConfig } }: AppState) => ({ form, typeConfig });

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateSetRunResultForm }, dispatch);

const ConnectedSetRunResultForm = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        withRef: true
    }
)(SetRunResultForm);

export default ConnectedSetRunResultForm;
