import * as React from 'react';
import * as FlipMove from 'react-flip-move';
import * as update from 'immutability-helper';
import { v4 as generateUUID } from 'uuid';
import { Node, SwitchRouter, Exit, AnyAction, Case, FlowDefinition } from '../../flowTypes';
import { Type } from '../../providers/ConfigProvider/typeConfigs';
import { FormProps } from '../NodeEditor';
import ComponentMap from '../../services/ComponentMap';
import { Language } from '../LanguageSelector';
import { LocalizedObject } from '../../services/Localization';
import TextInputElement, { HTMLTextElement } from '../form/TextInputElement';
import {
    GetOperatorConfig,
    operatorConfigList
} from '../../providers/ConfigProvider/operatorConfigs';
import {
    getOperatorConfigPT,
    operatorConfigListPT
} from '../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../providers/ConfigProvider/configContext';
import CaseElement, { CaseElementProps } from '../form/CaseElement';
import { reorderList } from '../../helpers/utils';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import * as styles from './SwitchRouter.scss';

export interface CombinedExits {
    cases: Case[];
    exits: Exit[];
    defaultExit: string;
}

export enum DragCursor {
    move = 'move',
    pointer = 'pointer'
}

export enum ChangedCaseInput {
    ARGS = 'ARGS',
    EXIT = 'EXIT'
}

export interface SwitchRouterState {
    cases: CaseElementProps[];
    resultName: string;
    setResultName: boolean;
    operand: string;
}

export interface SwitchRouterFormProps {
    showAdvanced: boolean;
    language: Language;
    node: Node;
    action?: AnyAction;
    config: Type;
    definition: FlowDefinition;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    removeWidget(name: string): void;
    localizations?: LocalizedObject[];
    updateLocalizations(
        language: string,
        changes: Array<{ uuid: string; translations?: any }>
    ): void;
    ComponentMap: ComponentMap;
    translating: boolean;
    getLocalizedExits(widgets: { [name: string]: any }): Array<{ uuid: string; translations: any }>;
    getExitTranslations(): JSX.Element;
}

/**
 * Given a set of cases and previous exits, determines correct merging of cases
 * and the union of exits
 * @param newCases
 * @param previousExits
 */
export const resolveExits = (newCases: CaseElementProps[], previous: Node): CombinedExits => {
    // create mapping of our old exit uuids to old exit settings
    const previousExitMap: { [uuid: string]: Exit } = {};

    if (previous.exits) {
        for (const exit of previous.exits) {
            previousExitMap[exit.uuid] = exit;
        }
    }

    const exits: Exit[] = [];
    const cases: Case[] = [];

    // map our new cases to an appropriate exit
    for (const newCase of newCases) {
        // see if we have a suitable exit for our case already
        let existingExit: Exit = null;

        // use our previous exit name if it isn't set
        if (!newCase.exitName && newCase.kase.exit_uuid in previousExitMap) {
            newCase.exitName = previousExitMap[newCase.kase.exit_uuid].name;
        }

        // ignore cases with empty names
        if (!newCase.exitName || newCase.exitName.trim().length === 0) {
            continue;
        }

        if (newCase.exitName) {
            // look through our new exits to see if we've already created one
            for (const exit of exits) {
                if (newCase.exitName && exit.name) {
                    if (exit.name.toLowerCase() === newCase.exitName.trim().toLowerCase()) {
                        existingExit = exit;
                        break;
                    }
                }
            }

            // couldn't find a new exit, look through our old ones
            if (!existingExit) {
                // look through our previous cases for a match
                if (previous.exits) {
                    for (const exit of previous.exits) {
                        if (newCase.exitName && exit.name) {
                            if (exit.name.toLowerCase() === newCase.exitName.trim().toLowerCase()) {
                                existingExit = exit;
                                exits.push(existingExit);
                                break;
                            }
                        }
                    }
                }
            }
        }

        // we found a suitable exit, point our case to it
        if (existingExit) {
            newCase.kase.exit_uuid = existingExit.uuid;
        } else {
            // no existing exit, create a new one
            // find our previous destination if we have one
            var destination = null;
            if (newCase.kase.exit_uuid in previousExitMap) {
                destination = previousExitMap[newCase.kase.exit_uuid].destination_node_uuid;
            }

            newCase.kase.exit_uuid = generateUUID();

            exits.push({
                name: newCase.exitName,
                uuid: newCase.kase.exit_uuid,
                destination_node_uuid: destination
            });
        }

        // remove exitName from our case
        cases.push(newCase.kase);
    }

    // add in our default exit
    let defaultUUID = generateUUID();
    if (previous.router && previous.router.type === 'switch') {
        const router = previous.router as SwitchRouter;
        if (router && router.default_exit_uuid) {
            defaultUUID = router.default_exit_uuid;
        }
    }

    let defaultName = 'All Responses';
    if (exits.length > 0) {
        defaultName = 'Other';
    }

    let defaultDestination = null;
    if (defaultUUID in previousExitMap) {
        defaultDestination = previousExitMap[defaultUUID].destination_node_uuid;
    }

    exits.push({
        uuid: defaultUUID,
        name: defaultName,
        destination_node_uuid: defaultDestination
    });

    return { cases, exits, defaultExit: defaultUUID };
};

export const composeExitMap = (exits: Exit[]): { [uuid: string]: Exit } =>
    exits.reduce(
        (map, exit) => {
            map[exit.uuid] = exit;
            return map;
        },
        {} as { [uuid: string]: Exit }
    );

export const getListStyle = (isDraggingOver: boolean): { cursor: DragCursor } => ({
    cursor: isDraggingOver ? DragCursor.move : DragCursor.pointer
});

export const getItemStyle = (draggableStyle: any, isDragging: boolean) => ({
    userSelect: 'none',
    background: isDragging && '#f2f9fc',
    borderRadius: isDragging && 4,
    opacity: isDragging && 0.75,
    ...draggableStyle,
    // Overwriting default draggableStyle object from this point down
    top: isDragging && draggableStyle.top - 90,
    left: isDragging && 20,
    height: isDragging && draggableStyle.height + 15,
    width: isDragging && draggableStyle.width - 5
});

export default class SwitchRouterForm extends React.Component<
    SwitchRouterFormProps,
    SwitchRouterState
> {
    public static contextTypes = {
        getOperatorConfig: getOperatorConfigPT,
        operatorConfigList: operatorConfigListPT
    };

    constructor(props: SwitchRouterFormProps, context: ConfigProviderContext) {
        super(props, context);

        this.onCaseChanged = this.onCaseChanged.bind(this);
        this.onCaseRemoved = this.onCaseRemoved.bind(this);

        const { cases, resultName, operand } = this.composeCaseProps();

        this.state = {
            cases,
            setResultName: false,
            resultName,
            operand
        };

        this.onValid = this.onValid.bind(this);
        this.onShowNameField = this.onShowNameField.bind(this);
        this.onExpressionChanged = this.onExpressionChanged.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        // Is the user translating this router?
        if (this.props.translating) {
            return this.saveLocalizations(widgets);
        }

        // If the user has a localized 'All Responses' case and they're adding another case,
        // bump off the translation for the initial case.
        if (
            this.props.definition.localization &&
            Object.keys(this.props.definition.localization).length &&
            this.state.cases.length === 1
        ) {
            const { uuid: nodeUUID, exits: nodeExits } = this.props.node;

            const exitMap: { [uuid: string]: Exit } = composeExitMap(nodeExits);

            Object.keys(this.props.definition.localization).forEach(iso => {
                const language = this.props.definition.localization[iso];

                Object.keys(language).forEach(localizationUUID => {
                    if (exitMap[localizationUUID]) {
                        const exitMatch = exitMap[localizationUUID];

                        if (exitMatch.name) {
                            if (exitMatch.name === 'All Responses') {
                                this.props.updateLocalizations(iso, [{ uuid: localizationUUID }]);
                            }
                        }
                    }
                });
            });
        }

        // If the user is going from 1 or more cases to 0 and this router has a translation for the 'Other' case, lose it
        if (
            !this.state.cases.length &&
            this.props.definition.localization &&
            Object.keys(this.props.definition.localization).length
        ) {
            const { uuid: nodeUUID, exits: nodeExits } = this.props.node;

            const exitMap: { [uuid: string]: Exit } = composeExitMap(nodeExits);

            Object.keys(this.props.definition.localization).forEach(iso => {
                const language = this.props.definition.localization[iso];

                Object.keys(language).forEach(localizationUUID => {
                    if (exitMap[localizationUUID]) {
                        const exitMatch = exitMap[localizationUUID];

                        if (exitMatch.name) {
                            if (exitMatch.name === 'Other') {
                                this.props.updateLocalizations(iso, [{ uuid: localizationUUID }]);
                            }
                        }
                    }
                });
            });
        }

        const { cases, exits, defaultExit } = resolveExits(this.state.cases, this.props.node);

        let optionalRouter = {};

        const resultNameEle = widgets['Result Name'] as TextInputElement;

        if (resultNameEle) {
            optionalRouter = {
                result_name: resultNameEle.state.value
            };
        }

        let optionalNode = {};

        if (this.props.config.type === 'wait_for_response') {
            optionalNode = {
                wait: { type: 'msg' }
            };
        } else if (this.props.config.type === 'expression') {
            optionalNode = {
                wait: { type: 'exp' }
            };
        }

        const router: SwitchRouter = {
            type: 'switch',
            default_exit_uuid: defaultExit,
            cases,
            operand: this.state.operand,
            ...optionalRouter
        };

        this.props.updateRouter(
            {
                uuid: this.props.node.uuid,
                router,
                exits,
                ...optionalNode
            },
            this.props.config.type,
            this.props.action
        );
    }

    private onShowNameField(): void {
        this.setState({
            setResultName: true
        });
    }

    private onExpressionChanged(event: React.SyntheticEvent<HTMLTextElement>): void {
        this.setState({
            operand: event.currentTarget.value
        });
    }

    private onCaseRemoved(c: any): void {
        const idx = this.state.cases.findIndex(
            (props: CaseElementProps) => props.kase.uuid === c.props.kase.uuid
        );

        if (idx > -1) {
            const cases = update(this.state.cases, { $splice: [[idx, 1]] });

            this.setState({ cases });
        }

        this.props.removeWidget(c.props.name);
    }

    private onCaseChanged(c: any, inputToFocus?: ChangedCaseInput): void {
        const newCase: CaseElementProps = {
            kase: {
                uuid: c.props.kase.uuid,
                type: c.state.operatorConfig.type,
                exit_uuid: c.props.kase.exit_uuid,
                arguments: c.state.arguments
            },
            onChange: c.props.onChange,
            exitName: c.state.exitName
        };

        if (inputToFocus) {
            if (inputToFocus === ChangedCaseInput.ARGS) {
                newCase.focusArgsInput = true;
            } else if (inputToFocus === ChangedCaseInput.EXIT) {
                newCase.focusExitInput = true;
            }
        }

        const { cases } = this.state;

        let found: boolean = false;

        for (const key in cases) {
            if (cases.hasOwnProperty(key)) {
                const props = cases[key];
                if (props.kase.uuid === c.props.kase.uuid) {
                    cases[key] = newCase;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            // Add new case
            cases[cases.length] = newCase;
            // Ensure new case has focus
            Object.keys(cases).forEach((key, idx, arr) => {
                if (idx === arr.length - 1) {
                    if (inputToFocus) {
                        if (inputToFocus === ChangedCaseInput.ARGS) {
                            cases[idx].focusArgsInput = true;
                        } else if (inputToFocus === ChangedCaseInput.EXIT) {
                            cases[idx].focusExitInput = true;
                        }
                    }
                }
            });
        }

        this.setState({
            cases
        });
    }

    private onDragEnd(result: any): void {
        if (!result.destination) {
            return;
        }

        const cases = reorderList(this.state.cases, result.source.index, result.destination.index);

        this.setState({
            cases
        });
    }

    private isSwitchRouterNode(): boolean {
        return (
            this.props.node.wait &&
            (this.props.node.wait.type === 'exp' || this.props.node.wait.type === 'msg')
        );
    }

    private composeCaseProps(): {
        cases: CaseElementProps[];
        resultName: string;
        operand: string;
    } {
        const cases: CaseElementProps[] = [];
        let resultName = '';
        let operand = '@input';

        const router = this.props.node.router as SwitchRouter;

        if (this.isSwitchRouterNode() && router.cases) {
            ({ operand } = router);

            if (router.result_name) {
                ({ result_name: resultName } = router);
            }

            router.cases.forEach(kase => {
                let exitName: string = null;

                if (kase.exit_uuid) {
                    const exit = this.props.node.exits.find(({ uuid }) => uuid === kase.exit_uuid);

                    if (exit) {
                        ({ name: exitName } = exit);
                    }
                }

                try {
                    const config = this.context.getOperatorConfig(kase.type);

                    cases.push({
                        kase,
                        exitName,
                        onChange: this.onCaseChanged,
                        onRemove: this.onCaseRemoved
                    } as any);
                } catch (error) {
                    /** Ignore missing cases */
                }
            });
        }

        return {
            cases,
            resultName,
            operand
        };
    }

    private saveLocalizations(widgets: { [name: string]: any }): void {
        const updates = [
            ...this.props.getLocalizedExits(widgets),
            ...this.getLocalizedCases(widgets)
        ] as Array<{
            uuid: string;
            translations: any;
        }>;

        this.props.updateLocalizations(this.props.language.iso, updates);
    }

    private getLocalizedCases(widgets: {
        [name: string]: any;
    }): Array<{ uuid: string; translations: any }> {
        const results: Array<{ uuid: string; translations: any }> = [];

        const { cases } = this.props.node.router as SwitchRouter;

        cases.forEach(({ uuid: caseUUID }) => {
            const input = widgets[caseUUID] as TextInputElement;

            if (input) {
                const value = input.state.value.trim();

                if (value) {
                    results.push({ uuid: caseUUID, translations: { arguments: [value] } });
                } else {
                    results.push({ uuid: caseUUID, translations: null });
                }
            }
        });

        return results;
    }

    private getLanguage(): Language {
        let language: Language;

        if (this.props.localizations && this.props.localizations.length) {
            language = this.props.localizations[0].getLanguage();
        }

        return language;
    }

    private getOperatorsForLocalization({ name: languageName }: Language): JSX.Element[] {
        const { cases } = this.props.node.router as SwitchRouter;

        return cases.reduce((casesForLocalization: JSX.Element[], kase) => {
            if (kase.arguments && kase.arguments.length) {
                const localized = this.props.localizations.find(
                    (localizedObject: LocalizedObject) =>
                        localizedObject.getObject().uuid === kase.uuid
                );

                if (localized) {
                    let value: string = '';

                    if ('arguments' in localized.localizedKeys) {
                        const localizedCase = localized.getObject() as Case;

                        if (localizedCase.arguments.length) {
                            [value] = localizedCase.arguments;
                        }
                    }

                    const { verboseName } = this.context.getOperatorConfig(kase.type);

                    const [argument] = kase.arguments;

                    casesForLocalization.push(
                        <div
                            key={`translate_${kase.uuid}`}
                            data-spec="operator-field"
                            className={styles.translating_operator_container}>
                            <div data-spec="verbose-name" className={styles.translating_operator}>
                                {verboseName}
                            </div>
                            <div
                                data-spec="argument-to-translate"
                                className={styles.translating_from}>
                                {argument}
                            </div>
                            <div className={styles.translating_to}>
                                <TextInputElement
                                    ref={this.props.onBindAdvancedWidget}
                                    data-spec="translation-input"
                                    name={kase.uuid}
                                    placeholder={`${languageName} Translation`}
                                    showLabel={false}
                                    value={value}
                                    ComponentMap={this.props.ComponentMap}
                                />
                            </div>
                        </div>
                    );
                }
            }

            return casesForLocalization;
        }, []);
    }

    private getCases(): JSX.Element[] {
        const cases: JSX.Element[] = [];
        let needsEmpty: boolean = true;

        if (this.state.cases) {
            const lastCase: CaseElementProps = this.state.cases[this.state.cases.length - 1];

            // Cases shouldn't be draggable unless they have fully-formed siblings
            if (this.state.cases.length === 1) {
                const [{ kase, exitName }] = this.state.cases;

                cases.push(
                    <CaseElement
                        data-spec="case"
                        key={kase.uuid}
                        kase={kase}
                        ref={this.props.onBindWidget}
                        name={`case_${kase.uuid}`}
                        exitName={exitName}
                        onRemove={this.onCaseRemoved}
                        onChange={this.onCaseChanged}
                        ComponentMap={this.props.ComponentMap}
                        solo={true}
                    />
                );
            } else if (
                // If we have 2 cases but the second isn't fully formed (e.g. only the operator has been changed)
                this.state.cases.length === 2 &&
                (lastCase.kase.type !== this.context.operatorConfigList[0].type &&
                    !lastCase.kase.arguments.length &&
                    !lastCase.exitName.length)
            ) {
                needsEmpty = false;

                this.state.cases.forEach(
                    ({ kase, exitName, focusArgsInput, focusExitInput }: CaseElementProps) => {
                        cases.push(
                            <CaseElement
                                key={kase.uuid}
                                data-spec="case"
                                ref={this.props.onBindWidget}
                                kase={kase}
                                name={`case_${kase.uuid}`}
                                exitName={exitName}
                                onRemove={this.onCaseRemoved}
                                onChange={this.onCaseChanged}
                                ComponentMap={this.props.ComponentMap}
                                focusArgsInput={focusArgsInput}
                                focusExitInput={focusExitInput}
                            />
                        );
                    }
                );
            } else {
                this.state.cases.forEach(
                    ({ kase, exitName, focusArgsInput, focusExitInput }: CaseElementProps, idx) => {
                        // If a case's operator expects 1 or more operands
                        // and its arguments and exitName are empty,
                        // we don't need an empty case.
                        if (
                            this.context.getOperatorConfig(kase.type).operands > 0 &&
                            !kase.arguments.length &&
                            !exitName.length
                        ) {
                            needsEmpty = false;
                            // It also shouldn't be draggable
                            cases.push(
                                <CaseElement
                                    key={kase.uuid}
                                    data-spec="case"
                                    ref={this.props.onBindWidget}
                                    kase={kase}
                                    name={`case_${kase.uuid}`}
                                    exitName={exitName}
                                    onRemove={this.onCaseRemoved}
                                    onChange={this.onCaseChanged}
                                    ComponentMap={this.props.ComponentMap}
                                    focusArgsInput={focusArgsInput}
                                    focusExitInput={focusExitInput}
                                />
                            );
                        } else {
                            cases.push(
                                <Draggable key={kase.uuid} draggableId={kase.uuid}>
                                    {(provided, snapshot) => (
                                        <div data-spec="case-draggable">
                                            <div
                                                ref={provided.innerRef}
                                                style={getItemStyle(
                                                    provided.draggableStyle,
                                                    snapshot.isDragging
                                                )}
                                                {...provided.dragHandleProps}>
                                                <CaseElement
                                                    data-spec="case"
                                                    ref={this.props.onBindWidget}
                                                    kase={kase}
                                                    name={`case_${kase.uuid}`}
                                                    exitName={exitName}
                                                    onRemove={this.onCaseRemoved}
                                                    onChange={this.onCaseChanged}
                                                    ComponentMap={this.props.ComponentMap}
                                                    focusArgsInput={focusArgsInput}
                                                    focusExitInput={focusExitInput}
                                                />
                                            </div>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Draggable>
                            );
                        }
                    }
                );
            }
        }

        if (needsEmpty) {
            const newCaseUUID = generateUUID();

            cases.push(
                <CaseElement
                    data-spec="case"
                    key={newCaseUUID}
                    kase={{
                        uuid: newCaseUUID,
                        type: this.context.operatorConfigList[0].type,
                        exit_uuid: null
                    }}
                    ref={this.props.onBindWidget}
                    name={`case_${newCaseUUID}`}
                    exitName={''}
                    empty={true}
                    onRemove={this.onCaseRemoved}
                    onChange={this.onCaseChanged}
                    ComponentMap={this.props.ComponentMap}
                />
            );
        }

        return cases;
    }

    private getNameField(): JSX.Element {
        let nameField: JSX.Element = null;

        if (this.state.setResultName || this.state.resultName) {
            nameField = (
                <TextInputElement
                    data-spec="name-field"
                    ref={this.props.onBindWidget}
                    name="Result Name"
                    showLabel={true}
                    value={this.state.resultName}
                    helpText="By naming the result, you can reference it later using @run.results.whatever_the_name_is"
                    ComponentMap={this.props.ComponentMap}
                />
            );
        } else {
            nameField = (
                <span
                    data-spec="name-field"
                    className={styles.save_link}
                    onClick={this.onShowNameField}>
                    Save as..
                </span>
            );
        }

        return nameField;
    }

    private getLeadIn(): JSX.Element {
        let leadIn: JSX.Element = null;

        if (this.props.config.type === 'wait_for_response') {
            leadIn = (
                <div data-spec="lead-in" className={styles.instructions}>
                    If the message response...
                </div>
            );
        } else if (this.props.config.type === 'expression') {
            leadIn = (
                <div data-spec="lead-in" className={styles.instructions}>
                    <p>If the expression...</p>
                    <TextInputElement
                        ref={this.props.onBindWidget}
                        key={this.props.node.uuid}
                        name="Expression"
                        showLabel={false}
                        value={this.state.operand}
                        onChange={this.onExpressionChanged}
                        autocomplete={true}
                        required={true}
                        ComponentMap={this.props.ComponentMap}
                    />
                </div>
            );
        }

        return leadIn;
    }

    private renderForm(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        } else {
            const cases: JSX.Element[] = this.getCases();
            const nameField: JSX.Element = this.getNameField();
            const leadIn: JSX.Element = this.getLeadIn();

            let caseContext: JSX.Element[] | JSX.Element;

            if (cases.length <= 2) {
                caseContext = cases;
            } else {
                const draggableCases: JSX.Element[] = cases.slice(0, cases.length - 1);
                const emptyCase: JSX.Element = cases[cases.length - 1];

                caseContext = (
                    <div>
                        <DragDropContext onDragEnd={this.onDragEnd}>
                            <Droppable droppableId="droppable">
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        style={getListStyle(snapshot.isDraggingOver)}>
                                        {draggableCases}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        {emptyCase}
                    </div>
                );
            }

            return (
                <div>
                    {leadIn}
                    <div className={styles.cases}>{caseContext}</div>
                    <div className={styles.save_as}>{nameField}</div>
                </div>
            );
        }
    }

    private renderAdvanced(): JSX.Element {
        const language: Language = this.getLanguage();

        if (!language) {
            return null;
        }

        const operators: JSX.Element[] = this.getOperatorsForLocalization(language);

        if (!operators.length) {
            return null;
        }

        return (
            <div>
                <div data-spec="advanced-title" className={styles.translating_operator_title}>
                    Rules
                </div>
                <div
                    data-spec="advanced-instructions"
                    className={styles.translating_operator_instructions}>
                    Sometimes languages need special rules to route things properly. If a
                    translation is not provided, the original rule will be used.
                </div>
                <div>{operators}</div>
            </div>
        );
    }

    public render(): JSX.Element {
        return this.props.showAdvanced && this.props.translating
            ? this.renderAdvanced()
            : this.renderForm();
    }
}
