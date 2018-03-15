import * as React from 'react';
import { Type } from '../../../config';
import { SetRunResult } from '../../../flowTypes';
import ComponentMap from '../../../services/ComponentMap';
import TextInputElement from '../../form/TextInputElement';
import { FormProps } from '../../NodeEditor';
import * as styles from './SetRunResult.scss';

export interface SetRunResultProps extends FormProps {
    action: SetRunResult;
    config: Type;
    updateAction(action: SetRunResult): void;
    getInitialAction(): SetRunResult;
    onBindWidget(ref: any): void;
    ComponentMap: ComponentMap;
}

export default class SetRunResultForm extends React.PureComponent<SetRunResultProps> {
    constructor(props: SetRunResultProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { state: { value: resultName } } = widgets.Name as TextInputElement;
        const { state: { value } } = widgets.Value as TextInputElement;
        const { state: { value: category } } = widgets.Category as TextInputElement;

        const newAction: SetRunResult = {
            uuid: this.props.action.uuid,
            type: this.props.config.type,
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
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
                />
                <TextInputElement
                    __className={styles.value}
                    ref={this.props.onBindWidget}
                    name="Value"
                    showLabel={true}
                    value={this.props.action.value}
                    autocomplete={true}
                    helpText="The value to save for this result or empty to clears it. You can use expressions, for example: @(title(input))"
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
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
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
                />
            </div>
        );
    }
}
