import * as React from 'react';
import {
    IType,
    IOperator,
    TGetTypeConfig,
    TGetOperatorConfig,
    IEndpoints
} from '../../services/EditorConfig';
import { INode, IAction } from '../../flowTypes';
import { LocalizedObject } from '../../services/Localization';
import ComponentMap from '../../services/ComponentMap';
import Widget from './Widget';
import TypeChooser from './TypeChooser';

const formStyles = require('./NodeEditor.scss');

export interface INodeEditorFormProps {
    config: IType;
    node: INode;
    localizations?: LocalizedObject[];
    action?: IAction;
    advanced?: boolean;

    typeConfigList: IType[];
    operatorConfigList: IOperator[];
    getTypeConfig: TGetTypeConfig;
    getOperatorConfig: TGetOperatorConfig;
    endpoints: IEndpoints;
    ComponentMap: ComponentMap;

    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    onToggleAdvanced(): void;
    onKeyPress(event: React.KeyboardEvent<HTMLFormElement>): void;
    triggerFormUpdate(): void;
    removeWidget(name: string): void;

    onTypeChange(config: IType): void;
    updateLocalizations(language: string, changes: { uuid: string; translations: any }[]): void;
    updateAction(action: IAction): void;
    updateRouter(node: INode, type: string, previousAction: IAction): void;
}

export interface INodeEditorFormState {}

abstract class NodeEditorForm<S extends INodeEditorFormState> extends React.PureComponent<
    INodeEditorFormProps,
    S
> {
    abstract onValid(widgets: { [name: string]: Widget }): void;
    abstract renderForm(ref: any): JSX.Element;

    /** Update our form according to current widget state, noop by default */
    public onUpdateForm(widgets: { [name: string]: Widget }) {}

    public isTranslating() {
        return this.props.localizations && this.props.localizations.length > 0;
    }

    public renderAdvanced(ref: any): JSX.Element {
        return null;
    }

    render() {
        var form: JSX.Element;
        var chooser = null;

        var classes = [formStyles.form];
        if (this.props.advanced) {
            form = this.renderAdvanced(this.props.onBindAdvancedWidget);
            classes.push(formStyles.advanced);
        } else {
            if (!this.props.localizations || this.props.localizations.length == 0) {
                chooser = (
                    <TypeChooser
                        className={formStyles.type_chooser}
                        initialType={this.props.config}
                        typeConfigList={this.props.typeConfigList}
                        onChange={this.props.onTypeChange}
                    />
                );
            }
            form = this.renderForm(this.props.onBindWidget);
        }

        if (!form) {
            return null;
        }

        return (
            <div className={classes.join(' ')}>
                <div className={formStyles.node_editor}>
                    <form onKeyPress={this.props.onKeyPress}>
                        {chooser}
                        {form}
                    </form>
                </div>
            </div>
        );
    }
}

export default NodeEditorForm;
