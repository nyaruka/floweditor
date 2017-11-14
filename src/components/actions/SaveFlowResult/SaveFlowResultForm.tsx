import * as React from 'react';
import { SaveFlowResult } from '../../../flowTypes';
import { Type } from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import TextInputElement from '../../form/TextInputElement';

const styles = require('./SaveFlowResult.scss');

export interface SaveFlowResultFormProps {
    action: SaveFlowResult;
    onValidCallback: Function;
    getActionUUID: Function;
    config: Type;
    updateAction(action: SaveFlowResult): void;
    getInitialAction(): SaveFlowResult;
    onBindWidget(ref: any): void;
    ComponentMap: ComponentMap;
}

const SaveFlowResultFormProps: React.SFC<SaveFlowResultFormProps> = ({
    action,
    onValidCallback,
    getActionUUID,
    config,
    updateAction,
    onBindWidget,
    ComponentMap
}): JSX.Element => {
    onValidCallback((widgets: { [name: string]: any }) => {
        const nameEle = widgets['Name'] as TextInputElement;
        const valueEle = widgets['Value'] as TextInputElement;
        const categoryEle = widgets['Category'] as TextInputElement;

        const newAction: SaveFlowResult = {
            uuid: getActionUUID(),
            type: config.type,
            result_name: nameEle.state.value,
            value: valueEle.state.value,
            category: categoryEle.state.value
        };

        updateAction(newAction);
    });

    const renderForm = (): JSX.Element => {
        let name;
        let value;
        let category;

        if (action && action.value) {
            ({ result_name: name } = action);
            ({ value } = action);
            ({ category } = action);
        }

        return (
            <div className={styles.form}>
                <TextInputElement
                    className={styles.name}
                    ref={onBindWidget}
                    name="Name"
                    showLabel={true}
                    value={name}
                    required
                    helpText="The name of the result, used to reference later, for example: @run.results.my_result_name"
                    ComponentMap={ComponentMap}
                />
                <TextInputElement
                    className={styles.value}
                    ref={onBindWidget}
                    name="Value"
                    showLabel={true}
                    value={value}
                    autocomplete
                    helpText="The value to save for this result or empty to clears it. You can use expressions, for example: @(title(input))"
                    ComponentMap={ComponentMap}
                />
                <TextInputElement
                    className={styles.category}
                    ref={onBindWidget}
                    name="Category"
                    placeholder="Optional"
                    showLabel={true}
                    value={category}
                    autocomplete
                    helpText="An optional category for your result. For age, the value might be 17, but the category might be 'Young Adult'"
                    ComponentMap={ComponentMap}
                />
            </div>
        );
    };

    return renderForm();
};

export default SaveFlowResultFormProps
