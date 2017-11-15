import * as React from 'react';
import { SaveFlowResult } from '../../../flowTypes';
import { Type } from '../../../services/EditorConfig';
import { NodeEditorFormChildProps } from '../../NodeEditor/NodeEditorForm';
import ComponentMap from '../../../services/ComponentMap';
import TextInputElement from '../../form/TextInputElement';

const styles = require('./SaveFlowResult.scss');

export interface SaveFlowResultFormProps extends NodeEditorFormChildProps {
    action: SaveFlowResult;
    getActionUUID: Function;
    config: Type;
    updateAction(action: SaveFlowResult): void;
    getInitialAction(): SaveFlowResult;
    onBindWidget(ref: any): void;
    ComponentMap: ComponentMap;
}

export default class extends React.PureComponent<SaveFlowResultFormProps> {
    constructor(props: SaveFlowResultFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { state: { value: result_name } } = widgets['Name'] as TextInputElement;
        const { state: { value } } = widgets['Value'] as TextInputElement;
        const { state: { value: category } } = widgets['Category'] as TextInputElement;

        const newAction: SaveFlowResult = {
            uuid: this.props.getActionUUID(),
            type: this.props.config.type,
            result_name,
            value,
            category
        };

        this.props.updateAction(newAction);
    }

    public renderForm(): JSX.Element {
        let name;
        let value;
        let category;

        if (this.props.action && this.props.action.value) {
            ({ result_name: name } = this.props.action);
            ({ value } = this.props.action);
            ({ category } = this.props.action);
        }

        return (
            <div className={styles.form}>
                <TextInputElement
                    className={styles.name}
                    ref={this.props.onBindWidget}
                    name="Name"
                    showLabel={true}
                    value={name}
                    required
                    helpText="The name of the result, used to reference later, for example: @run.results.my_result_name"
                    ComponentMap={this.props.ComponentMap}
                />
                <TextInputElement
                    className={styles.value}
                    ref={this.props.onBindWidget}
                    name="Value"
                    showLabel={true}
                    value={value}
                    autocomplete
                    helpText="The value to save for this result or empty to clears it. You can use expressions, for example: @(title(input))"
                    ComponentMap={this.props.ComponentMap}
                />
                <TextInputElement
                    className={styles.category}
                    ref={this.props.onBindWidget}
                    name="Category"
                    placeholder="Optional"
                    showLabel={true}
                    value={category}
                    autocomplete
                    helpText="An optional category for your result. For age, the value might be 17, but the category might be 'Young Adult'"
                    ComponentMap={this.props.ComponentMap}
                />
            </div>
        );
    }

    public render(): JSX.Element {
        return this.renderForm();
    }
}
