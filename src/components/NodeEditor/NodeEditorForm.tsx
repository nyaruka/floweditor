import * as React from 'react';
import * as UUID from 'uuid';
import { INode, IRouter, IExit, TAnyAction } from '../../flowTypes';
import {
    IType,
    IOperator,
    TGetTypeConfig,
    TGetOperatorConfig,
    IEndpoints
} from '../../services/EditorConfig';
import { ILanguage } from '../LanguageSelector';
import { LocalizedObject } from '../../services/Localization';
import ComponentMap from '../../services/ComponentMap';
import Widget from './Widget';
import TypeChooser from './TypeChooser';
import { TextInputElement } from '../form/TextInputElement';

import { IReplyFormProps } from '../actions/Reply/ReplyForm';
import { IChangeGroupFormProps } from '../actions/ChangeGroup/ChangeGroupForm';
import { ISaveFlowResultFormProps } from '../actions/SaveFlowResult/SaveFlowResultForm';
import { ISendEmailFormProps } from '../actions/SendEmail/SendEmailForm';
import { ISaveToContactFormProps } from '../actions/SaveToContact/SaveToContactForm';

import { ISubflowRouterFormProps } from '../routers/SubflowRouter';
import { ISwitchRouterFormProps } from '../routers/SwitchRouter';
import { IWebhookRouterFormProps } from '../routers/WebhookRouter';

export type TFormProps =
    | IReplyFormProps
    | IChangeGroupFormProps
    | ISaveFlowResultFormProps
    | ISendEmailFormProps
    | ISaveToContactFormProps
    | ISubflowRouterFormProps
    | ISwitchRouterFormProps
    | IWebhookRouterFormProps;

const formStyles = require('./NodeEditor.scss');

export interface INodeEditorFormChildProps {
    advanced: boolean;
    node: INode;
    action: TAnyAction;
    endpoints: IEndpoints;
    config: IType;
    ComponentMap: ComponentMap;
    updateAction(action: TAnyAction): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateLocalizations(language: string, changes: { uuid: string; translations: any }[]): void;
    updateRouter(node: INode, type: string, previousAction: TAnyAction): void;
    removeWidget(name: string): void;
    renderExitTranslations(): JSX.Element;
    operatorConfigList: IOperator[];
    getOperatorConfig: TGetOperatorConfig;
    triggerFormUpdate(): void;
    onToggleAdvanced(): void;
    getInitialAction(): TAnyAction;
    getInitialRouter(): IRouter;
    validationCallback: Function;
    updateFormCallback: Function;
    getLocalizedObject: Function;
    getActionUUID: Function;
    isTranslating: boolean;
    saveLocalizedExits(widgets: { [name: string]: Widget }): void;
}

export interface INodeEditorFormProps {
    config: IType;
    node: INode;
    localizations?: LocalizedObject[];
    action?: TAnyAction;
    isTranslating: boolean;

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
    updateAction(action: TAnyAction): void;
    updateRouter(node: INode, type: string, previousAction: TAnyAction): void;

    advanced: boolean;
    children(childProps: INodeEditorFormChildProps): JSX.Element;
}

export default class NodeEditorForm extends React.Component<INodeEditorFormProps> {
    public onValid: Function;
    public onUpdateForm: Function;

    constructor(props: INodeEditorFormProps) {
        super(props);

        this.getLocalizedObject = this.getLocalizedObject.bind(this);
        this.validationCallback = this.validationCallback.bind(this);
        this.updateFormCallback = this.updateFormCallback.bind(this);
        this.getActionUUID = this.getActionUUID.bind(this);
        this.renderExitTranslations = this.renderExitTranslations.bind(this);
        this.getLocalizedExits = this.getLocalizedExits.bind(this);
        this.saveLocalizedExits = this.saveLocalizedExits.bind(this);
        this.getInitialAction = this.getInitialAction.bind(this);
        this.getInitialRouter = this.getInitialRouter.bind(this);
    }

    private validationCallback(callback: Function): Function {
        return (this.onValid = callback);
    }

    private updateFormCallback(callback: Function): Function {
        return (this.onUpdateForm = callback);
    }

    private getLocalizedObject() {
        if (this.props.localizations && this.props.localizations.length === 1) {
            return this.props.localizations[0];
        }
        return;
    }

    private getActionUUID(): string {
        if (this.props.action) {
            if (this.props.action.hasOwnProperty('uuid') && this.props.action.uuid) {
                return this.props.action.uuid;
            } else {
                return UUID.v4();
            }
        }
    }

    private renderExitTranslations(): JSX.Element {
        let exits: JSX.Element[] = [];
        let language: ILanguage;

        if (this.props.localizations.length > 0) {
            language = this.props.localizations[0].getLanguage();
        }

        if (!language) {
            return null;
        }

        this.props.node.exits.forEach(exit => {
            const localized = this.props.localizations.find(
                (localizedObject: LocalizedObject) => localizedObject.getObject().uuid === exit.uuid
            );

            if (localized) {
                let value;

                if ('name' in localized.localizedKeys) {
                    let localizedExit: IExit = localized.getObject();
                    value = localizedExit.name;
                }

                exits = [
                    ...exits,
                    <div key={'translate_' + exit.uuid} className={formStyles.translating_exit}>
                        <div className={formStyles.translating_from}>{exit.name}</div>
                        <div className={formStyles.translating_to}>
                            <TextInputElement
                                ref={this.props.onBindWidget}
                                name={exit.uuid}
                                placeholder={`${language.name} Translation`}
                                showLabel={false}
                                value={value}
                                ComponentMap={this.props.ComponentMap}
                            />
                        </div>
                    </div>
                ];
            }
        });

        return (
            <div>
                <div className={formStyles.title}>Categories</div>
                <div className={formStyles.instructions}>
                    When category names are referenced later in the flow, the appropriate language
                    for the category will be used. If no translation is provided, the original text
                    will be used.
                </div>
                <div className={formStyles.translating_exits}>{exits}</div>
            </div>
        );
    }

    private getLocalizedExits(widgets: { [name: string]: Widget }): { uuid: string; translations: any }[] {
        let results: { uuid: string; translations: any }[] = [];

        this.props.node.exits.forEach(({ uuid: exitUUID }) => {
            let input = widgets[exitUUID] as TextInputElement;
            let value = input.state.value.trim();
            if (value) {
                results = [...results, { uuid: exitUUID, translations: { name: [value] } }];
            } else {
                results = [...results, { uuid: exitUUID, translations: null }];
            }
        });

        return results;
    }

    private saveLocalizedExits(widgets: { [name: string]: Widget }): void {
        const exits = this.getLocalizedExits(widgets);
        const language = this.props.localizations[0].getLanguage().iso;
        this.props.updateLocalizations(language, exits);
    }

    private getInitialAction(): TAnyAction {
        if (this.props.action) {
            return this.props.action;
        }
        return;
    }

    private getInitialRouter(): IRouter {
        if (this.props.node.router) {
            return this.props.node.router;
        }
    }

    public render(): JSX.Element {
        let chooser: JSX.Element;

        let classes = [formStyles.form];

        const injectedProps = {
            advanced: this.props.advanced,
            node: this.props.node,
            action: this.props.action,
            config: this.props.config,
            endpoints: this.props.endpoints,
            ComponentMap: this.props.ComponentMap,
            updateAction: this.props.updateAction,
            onBindWidget: this.props.onBindWidget,
            onBindAdvancedWidget: this.props.onBindAdvancedWidget,
            updateLocalizations: this.props.updateLocalizations,
            updateRouter: this.props.updateRouter,
            removeWidget: this.props.removeWidget,
            getOperatorConfig: this.props.getOperatorConfig,
            operatorConfigList: this.props.operatorConfigList,
            triggerFormUpdate: this.props.triggerFormUpdate,
            onToggleAdvanced: this.props.onToggleAdvanced,
            isTranslating: this.props.isTranslating,
            renderExitTranslations: this.renderExitTranslations,
            validationCallback: this.validationCallback,
            updateFormCallback: this.updateFormCallback,
            getLocalizedObject: this.getLocalizedObject,
            getActionUUID: this.getActionUUID,
            saveLocalizedExits: this.saveLocalizedExits,
            getInitialAction: this.getInitialAction,
            getInitialRouter: this.getInitialRouter
        };

        if (this.props.advanced) {
            classes = [classes, ...formStyles.advanced];
        } else {
            if (!this.props.localizations || this.props.localizations.length === 0) {
                chooser = (
                    <TypeChooser
                        className={formStyles.type_chooser}
                        initialType={this.props.config}
                        typeConfigList={this.props.typeConfigList}
                        onChange={this.props.onTypeChange}
                    />
                );
            }
        }

        return (
            <div className={classes.join(' ')}>
                <div className={formStyles.node_editor}>
                    <form onKeyPress={this.props.onKeyPress}>
                        {chooser}
                        {this.props.children(injectedProps)}
                    </form>
                </div>
            </div>
        );
    }
};
