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
import { getOperatorConfigPT } from '../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../providers/ConfigProvider/configContext';
import CaseElement, { CaseElementProps } from '../form/CaseElement';
import { reorderList } from '../../helpers/utils';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import flow = require('lodash.flow');

const styles = require('./SwitchRouter.scss');

export interface CombinedExits {
    cases: Case[];
    exits: Exit[];
    defaultExit: string;
}

/**
 * Given a set of cases and previous exits, determines correct merging of cases
 * and the union of exits
 * @param newCases
 * @param previousExits
 */
export function resolveExits(newCases: CaseElementProps[], previous: Node): CombinedExits {
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
}

export enum DragCursor {
    move = 'move',
    pointer = 'pointer'
}

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
    opacity: isDragging && 0.65,
    /** Overwriting default draggableStyle object from this point down */
    ...draggableStyle,
    top: isDragging && draggableStyle.top - 105,
    left: isDragging && 20,
    height: isDragging && draggableStyle.height + 27,
    width: isDragging && draggableStyle.width - 5
});

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
    iso: string;
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
    renderExitTranslations(): JSX.Element;
}

export default class SwitchRouterForm extends React.Component<
    SwitchRouterFormProps,
    SwitchRouterState
> {
    public static contextTypes = {
        getOperatorConfig: getOperatorConfigPT
    };

    constructor(props: SwitchRouterFormProps, context: ConfigProviderContext) {
        super(props, context);

        this.onCaseChanged = this.onCaseChanged.bind(this);
        this.onCaseRemoved = this.onCaseRemoved.bind(this);

        const { cases, resultName, operand } = this.composeCaseProps(
            this.onCaseChanged,
            this.onCaseRemoved
        );

        this.state = {
            cases,
            setResultName: false,
            resultName,
            operand
        };

        this.onDragEnd = this.onDragEnd.bind(this);

        this.onValid = this.onValid.bind(this);
        this.onExpressionChanged = this.onExpressionChanged.bind(this);
        this.onShowNameField = this.onShowNameField.bind(this);
    }

    private composeCaseProps(
        onChanged: (c: any, type?: ChangedCaseInput) => void,
        onRemove: (c: any) => void
    ): {
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
                        onChanged,
                        onRemove
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

    private isSwitchRouterNode(): boolean {
        return (
            this.props.node.wait &&
            this.props.node.wait.type &&
            (this.props.node.wait.type === 'exp' || this.props.node.wait.type === 'msg')
        );
    }

    public onValid(widgets: { [name: string]: any }): void {
        /** Is the user translating this router? */
        if (this.props.translating) {
            return this.saveLocalizations(widgets);
        }

        /**
         * If the user has a localized 'All Responses' case and they're adding another case,
         * bump off the translation for the initial case.
         */
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
                                /** Bingo */
                                this.props.updateLocalizations(iso, [{ uuid: localizationUUID }]);
                            }
                        }
                    }
                });
            });
        }

        /** If the user is going from 1 or more cases to 0 and this router has a translation for the 'Other' case, lose it */
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
                                /** Listo */
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
            // prettier-ignore
            const cases = update(
                this.state.cases,
                { $splice: [[idx, 1]] }
            );
            this.setState({ cases });
        }

        this.props.removeWidget(c.props.name);
    }

    private onCaseChanged(c: any, type?: ChangedCaseInput): void {
        const newCase: CaseElementProps = {
            kase: {
                uuid: c.props.kase.uuid,
                type: c.state.operator,
                exit_uuid: c.props.kase.exit_uuid,
                arguments: c.state.arguments
            },
            onChanged: c.props.onChanged,
            exitName: c.state.exitName
        };

        const { cases } = this.state;
        let found = false;

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
            /** Add new case */
            cases[cases.length] = newCase;
            /** Ensure new case has focus */
            Object.keys(cases).forEach((key, idx, arr) => {
                if (idx === arr.length - 1) {
                    if (type) {
                        if (type === ChangedCaseInput.ARGS) {
                            cases[idx].focusArgsInput = true;
                        } else if (type === ChangedCaseInput.EXIT) {
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

    private saveLocalizations(widgets: { [name: string]: any }): void {
        const { iso: language } = this.props.localizations[0].getLanguage();

        const updates = [
            ...this.props.getLocalizedExits(widgets),
            ...this.getLocalizedCases(widgets)
        ] as Array<{
            uuid: string;
            translations: any;
        }>;

        this.props.updateLocalizations(language, updates);
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

    private getCasesForLocalization(language: Language): JSX.Element[] {
        const { cases } = this.props.node.router as SwitchRouter;
        return cases.reduce(
            (casesForLocalization: JSX.Element[], kase) => {
                if (kase.arguments && kase.arguments.length) {
                    const localized = this.props.localizations.find(
                        (localizedObject: LocalizedObject) =>
                            localizedObject.getObject().uuid === kase.uuid
                    );

                    if (localized) {
                        let value: string = null;

                        if ('arguments' in localized.localizedKeys) {
                            const localizedCase: Case = localized.getObject() as Case;

                            if (localizedCase.arguments.length) {
                                [value] = localizedCase.arguments;
                            }
                        }

                        const { verboseName } = this.context.getOperatorConfig(kase.type);
                        const [argument] = kase.arguments;

                        casesForLocalization.push(
                            <div key={`translate_${kase.uuid}`} className={styles.translating_item}>
                                <div className={styles.translating_operator}>{verboseName}</div>
                                <div className={styles.translating_from}>{argument}</div>
                                <div className={styles.translating_to}>
                                    <TextInputElement
                                        ref={this.props.onBindAdvancedWidget}
                                        name={kase.uuid}
                                        placeholder={`${language.name} Translation`}
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
            },
            []
        );
    }

    private renderAdvanced(): JSX.Element {
        const language: Language = this.getLanguage();

        if (!language) {
            return null;
        }

        const cases: JSX.Element[] = this.getCasesForLocalization(language);

        if (!cases.length) {
            return null;
        }

        return (
            <div>
                <div className={styles.title}>Rules</div>
                <div className={styles.instructions}>
                    Sometimes languages need special rules to route things properly. If a
                    translation is not provided, the original rule will be used.
                </div>
                <div>{cases}</div>
            </div>
        );
    }

    private getCases(): JSX.Element[] {
        let needsEmpty: boolean = true;
        let cases: JSX.Element[] = [];

        if (this.state.cases) {
            /** Cases shouldn't be draggable unless they have siblings */
            if (this.state.cases.length === 1) {
                const [{ kase, exitName }] = this.state.cases;
                const { uuid: caseUUID } = kase;
                cases.push(
                    <CaseElement
                        data-spec="case"
                        key={kase.uuid}
                        kase={kase}
                        ref={this.props.onBindWidget}
                        name={`case_${caseUUID}`}
                        exitName={exitName}
                        onRemove={this.onCaseRemoved}
                        onChanged={this.onCaseChanged}
                        ComponentMap={this.props.ComponentMap}
                        solo={true}
                    />
                );
            } else {
                cases = this.state.cases.map((c: CaseElementProps, idx) => {
                    /** Is this case empty? */
                    if (
                        (!c.exitName || c.exitName.trim().length === 0) &&
                        (!c.kase.arguments || c.kase.arguments[0].trim().length === 0)
                    ) {
                        needsEmpty = false;
                    }

                    const { kase: { uuid: caseUUID } } = c;

                    return (
                        <Draggable key={caseUUID} draggableId={caseUUID}>
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
                                            kase={c.kase}
                                            name={`case_${caseUUID}`}
                                            exitName={c.exitName}
                                            onRemove={this.onCaseRemoved}
                                            onChanged={this.onCaseChanged}
                                            ComponentMap={this.props.ComponentMap}
                                            focusArgsInput={c.focusArgsInput}
                                            focusExitInput={c.focusExitInput}
                                        />
                                    </div>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Draggable>
                    );
                });
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
                        type: 'has_any_word',
                        exit_uuid: null
                    }}
                    ref={this.props.onBindWidget}
                    name={`case_${newCaseUUID}`}
                    exitName={null}
                    empty={true}
                    onRemove={this.onCaseRemoved}
                    onChanged={this.onCaseChanged}
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

    private onDragEnd(result: any): void {
        if (!result.destination) {
            return;
        }

        const cases = reorderList(this.state.cases, result.source.index, result.destination.index);

        this.setState({
            cases
        });
    }

    private renderForm(): JSX.Element {
        if (this.props.translating) {
            return this.props.renderExitTranslations();
        } else {
            const cases: JSX.Element[] = this.getCases();
            const nameField: JSX.Element = this.getNameField();
            const leadIn: JSX.Element = this.getLeadIn();

            return (
                <div className={styles.switch}>
                    {leadIn}
                    <div className={styles.cases}>
                        <DragDropContext onDragEnd={this.onDragEnd}>
                            <Droppable droppableId="droppable">
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        style={getListStyle(snapshot.isDraggingOver)}>
                                        {cases}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                    <div className={styles.save_as}>{nameField}</div>
                </div>
            );
        }
    }

    public render(): JSX.Element {
        if (this.props.showAdvanced && this.props.translating) {
            return this.renderAdvanced();
        }
        return this.renderForm();
    }
}
