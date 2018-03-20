import * as React from 'react';
import { connect } from 'react-redux';
import { Type } from '../../../config';
import { SetRunResult } from '../../../flowTypes';
import { AppState } from '../../../store';
import TextInputElement from '../../form/TextInputElement';
import * as styles from './SetRunResult.scss';

export interface SetRunResultFormStoreProps {
    typeConfig: Type;
}

export interface SetRunResultFormPassedProps {
    action: SetRunResult;
    updateAction(action: SetRunResult): void;
    getInitialAction(): SetRunResult;
    onBindWidget(ref: any): void;
}

export type SetRunResultFormProps = SetRunResultFormStoreProps & SetRunResultFormPassedProps;

export class SetRunResultForm extends React.PureComponent<SetRunResultFormProps> {
    constructor(props: SetRunResultFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { wrappedInstance: { state: { value: resultName } } } = widgets.Name;
        const { wrappedInstance: { state: { value } } } = widgets.Value;
        const { wrappedInstance: { state: { value: category } } } = widgets.Category;

        const newAction: SetRunResult = {
            uuid: this.props.action.uuid,
            type: this.props.typeConfig.type,
            result_name: resultName,
            value,
            category
        };

        this.props.updateAction(newAction);
    }

    public render(): JSX.Element {
        return (
            <div className={styles.form}>
                <TextInputElement
                    __className={styles.name}
                    ref={this.props.onBindWidget}
                    name="Name"
                    showLabel={true}
                    value={this.props.action.result_name}
                    required={true}
                    helpText="The name of the result, used to reference later, for example: @run.results.my_result_name"
                />
                <TextInputElement
                    __className={styles.value}
                    ref={this.props.onBindWidget}
                    name="Value"
                    showLabel={true}
                    value={this.props.action.value}
                    autocomplete={true}
                    helpText="The value to save for this result or empty to clears it. You can use expressions, for example: @(title(input))"
                />
                <TextInputElement
                    __className={styles.category}
                    ref={this.props.onBindWidget}
                    name="Category"
                    placeholder="Optional"
                    showLabel={true}
                    value={this.props.action.category}
                    autocomplete={true}
                    helpText="An optional category for your result. For age, the value might be 17, but the category might be 'Young Adult'"
                />
            </div>
        );
    }
}

const mapStateToProps = ({ nodeEditor: { typeConfig } }: AppState) => ({ typeConfig });

const ConnectedSetRunResultForm = connect(mapStateToProps, null, null, { withRef: true })(
    SetRunResultForm
);

export default ConnectedSetRunResultForm;
