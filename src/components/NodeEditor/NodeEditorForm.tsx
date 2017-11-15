import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { Node, Router, SwitchRouter, Exit, AnyAction } from '../../flowTypes';
import {
    Type,
    Operator,
    GetTypeConfig,
    GetOperatorConfig,
    Endpoints
} from '../../services/EditorConfig';
import { Language } from '../LanguageSelector';
import { LocalizedObject } from '../../services/Localization';
import ComponentMap from '../../services/ComponentMap';
import TypeListComp from './TypeList';
import TextInputElement from '../form/TextInputElement';
import { ReplyFormProps } from '../actions/Reply/ReplyForm';
import { ChangeGroupFormProps } from '../actions/ChangeGroup/ChangeGroupForm';
import { SaveFlowResultFormProps } from '../actions/SaveFlowResult/SaveFlowResultForm';
import { SendEmailFormProps } from '../actions/SendEmail/SendEmailForm';
import { SaveToContactFormProps } from '../actions/SaveToContact/SaveToContactForm';
import { SubflowRouterFormProps } from '../routers/SubflowRouter';
import { SwitchRouterFormProps } from '../routers/SwitchRouter';
import { WebhookRouterFormProps } from '../routers/WebhookRouter';

export type AnyFormProps =
    | ReplyFormProps
    | ChangeGroupFormProps
    | SaveFlowResultFormProps
    | SendEmailFormProps
    | SaveToContactFormProps
    | SubflowRouterFormProps
    | SwitchRouterFormProps
    | WebhookRouterFormProps;

const formStyles = require('./NodeEditor.scss');

export interface NodeEditorFormChildProps {
    advanced: boolean;
    node: Node;
    nodeUUID: string;
    exits: Exit[];
    router: Router | SwitchRouter;
    action: AnyAction;
    fieldsEndpoint: string;
    groupsEndpoint: string;
    localizations?: LocalizedObject[];
    type: string;
    ComponentMap: ComponentMap;
    updateAction(action: AnyAction): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateLocalizations(language: string, changes: { uuid: string; translations: any }[]): void;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    removeWidget(name: string): void;
    renderExitTranslations(): JSX.Element;
    operatorConfigList: Operator[];
    getOperatorConfig: GetOperatorConfig;
    triggerFormUpdate(): void;
    onToggleAdvanced(): void;
    onValidCallback: Function;
    onUpdateFormCallback: Function;
    getLocalizedObject: Function;
    getLocalizedExits(widgets: { [name: string]: any }): { uuid: string; translations: any }[];
    getActionUUID: Function;
    isTranslating: boolean;
    saveLocalizedExits(widgets: { [name: string]: any }): void;
}

export interface NodeEditorFormProps {
    config: Type;
    node: Node;
    localizations?: LocalizedObject[];
    action?: AnyAction;
    isTranslating: boolean;

    typeConfigList: Type[];
    operatorConfigList: Operator[];
    getTypeConfig: GetTypeConfig;
    getOperatorConfig: GetOperatorConfig;
    endpoints: Endpoints;
    ComponentMap: ComponentMap;

    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    onToggleAdvanced(): void;
    onKeyPress(event: React.KeyboardEvent<HTMLFormElement>): void;
    triggerFormUpdate(): void;
    removeWidget(name: string): void;

    onTypeChange(config: Type): void;
    updateLocalizations(language: string, changes: { uuid: string; translations: any }[]): void;
    updateAction(action: AnyAction): void;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;

    advanced: boolean;
    children(childProps: NodeEditorFormChildProps): JSX.Element;
}

export default class NodeEditorForm extends React.Component<NodeEditorFormProps> {
    public onValid: Function;
    public onUpdateForm: Function;

    constructor(props: NodeEditorFormProps) {
        super(props);

        this.getLocalizedObject = this.getLocalizedObject.bind(this);
        this.onValidCallback = this.onValidCallback.bind(this);
        this.onUpdateFormCallback = this.onUpdateFormCallback.bind(this);
        this.getActionUUID = this.getActionUUID.bind(this);
        this.renderExitTranslations = this.renderExitTranslations.bind(this);
        this.getLocalizedExits = this.getLocalizedExits.bind(this);
        this.saveLocalizedExits = this.saveLocalizedExits.bind(this);
    }

    private onValidCallback(callback: Function) {
        return (this.onValid = callback);
    }

    private onUpdateFormCallback(callback: Function) {
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
            }
            return generateUUID();
        }
        return generateUUID();
    }

    private renderExitTranslations(): JSX.Element {
        let exits: JSX.Element[] = [];
        let language: Language;

        if (this.props.localizations.length > 0) {
            language = this.props.localizations[0].getLanguage();
        }

        if (!language) {
            return null;
        }

        this.props.node.exits.forEach((exit: Exit) => {
            const localized = this.props.localizations.find(
                (localizedObject: LocalizedObject) => localizedObject.getObject().uuid === exit.uuid
            );

            if (localized) {
                let value;

                if ('name' in localized.localizedKeys) {
                    let localizedExit: Exit = localized.getObject();
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

    private getLocalizedExits(widgets: { [name: string]: any }): { uuid: string; translations: any }[] {
        let results: { uuid: string; translations: any }[] = [];

        this.props.node.exits.forEach(({ uuid: exitUUID }: Exit) => {
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

    private saveLocalizedExits(widgets: { [name: string]: any }): void {
        const exits = this.getLocalizedExits(widgets);
        const language = this.props.localizations[0].getLanguage().iso;
        this.props.updateLocalizations(language, exits);
    }

    public render(): JSX.Element {
        let chooser: JSX.Element;

        let classes = [formStyles.form];

        const injectedProps: NodeEditorFormChildProps = {
            advanced: this.props.advanced,
            node: this.props.node,
            nodeUUID: this.props.node.uuid,
            exits: this.props.node.exits,
            router: this.props.node.router,
            action: this.props.action,
            type: this.props.config.type,
            groupsEndpoint: this.props.endpoints.groups,
            fieldsEndpoint: this.props.endpoints.fields,
            localizations: this.props.localizations,
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
            onValidCallback: this.onValidCallback,
            onUpdateFormCallback: this.onUpdateFormCallback,
            getLocalizedObject: this.getLocalizedObject,
            getActionUUID: this.getActionUUID,
            getLocalizedExits: this.getLocalizedExits,
            saveLocalizedExits: this.saveLocalizedExits,
        };

        if (this.props.advanced) {
            classes = [classes, ...formStyles.advanced];
        } else {
            if (!this.props.localizations || this.props.localizations.length === 0) {
                chooser = (
                    <TypeListComp
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
