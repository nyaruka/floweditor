import * as React from 'react';
import { Fragment } from 'react';
import * as FlipMove from 'react-flip-move';
import * as update from 'immutability-helper';
import { v4 as generateUUID } from 'uuid';
import {
    Wait,
    Node,
    SwitchRouter,
    Exit,
    AnyAction,
    Case,
    FlowDefinition,
    Router
} from '../../flowTypes';
import { Type } from '../../providers/ConfigProvider/typeConfigs';
import { FormProps } from '../NodeEditor';
import ComponentMap, { SearchResult } from '../../services/ComponentMap';
import { Language } from '../LanguageSelector';
import { LocalizedObject } from '../../services/Localization';
import TextInputElement, { HTMLTextElement } from '../form/TextInputElement';
import GroupElement, { GroupList, GroupElementProps } from '../form/GroupElement';
import {
    GetOperatorConfig,
    operatorConfigList
} from '../../providers/ConfigProvider/operatorConfigs';
import {
    getOperatorConfigPT,
    operatorConfigListPT,
    endpointsPT
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
    ComponentMap: ComponentMap;
    translating: boolean;
    config: Type;
    definition: FlowDefinition;
    updateRouter: (node: Node, type: string, previousAction: AnyAction) => void;
    onBindWidget: (ref: any) => void;
    onBindAdvancedWidget: (ref: any) => void;
    removeWidget: (name: string) => void;
    updateLocalizations: (
        language: string,
        changes: Array<{ uuid: string; translations?: any }>
    ) => void;
    getLocalizedExits: (
        widgets: { [name: string]: any }
    ) => Array<{ uuid: string; translations: any }>;
    getExitTranslations: () => JSX.Element;
    action?: AnyAction;
    localizations?: LocalizedObject[];
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
            let destination = null;
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
    /** Overwriting default draggableStyle object from this point down */
    ...draggableStyle,
    top: isDragging && draggableStyle.top - 90,
    left: isDragging && 20,
    height: isDragging && draggableStyle.height + 15,
    width: isDragging && draggableStyle.width - 5
});

export const isSwitchRouterNode = (node: Node): boolean =>
    node.wait &&
    (node.wait.type === 'exp' || node.wait.type === 'group' || node.wait.type === 'msg');

export const hasGroupCase = (cases: CaseElementProps[]): boolean => {
    for (const { kase: { type } } of cases) {
        if (type === 'has_group') {
            return true;
        }
    }
    return false;
};

export const extractGroups = ({ exits, router }: Node): GroupList =>
    (router as SwitchRouter).cases.map(kase => {
        const resultName = exits.reduce((result, { name, uuid }) => {
            if (uuid === kase.exit_uuid) {
                result += name;
            }

            return result;
        }, '');

        return { name: resultName, group: kase.arguments[0] };
    });

export const DEFAULT_OPERAND: string = '@input';
export const GROUP_OPERAND: string = '@contact.groups';
export const WAIT_LABEL: string = 'If the message response...';
export const EXPRESSION_LABEL: string = 'If the expression...';
export const GROUP_LABEL: string = "Select the group(s) you'd like to split by below";
export const GROUP_PLACEHOLDER: string = 'Enter the name of an existing group...';
export const GROUP_NOT_FOUND: string = 'Enter the name of an existing group';
export const OPERATOR_LOCALIZATION_LEGEND: string =
    'Sometimes languages need special rules to route things properly. If a translation is not provided, the original rule will be used.';

export default class SwitchRouterForm extends React.Component<
    SwitchRouterFormProps,
    SwitchRouterState
> {
    public static contextTypes = {
        getOperatorConfig: getOperatorConfigPT,
        operatorConfigList: operatorConfigListPT,
        endpoints: endpointsPT
    };

    constructor(props: SwitchRouterFormProps, context: ConfigProviderContext) {
        super(props, context);

        this.onCaseChanged = this.onCaseChanged.bind(this);
        this.onCaseRemoved = this.onCaseRemoved.bind(this);

        const initialState: SwitchRouterState = this.getInitialState();

        this.state = initialState;

        this.onValid = this.onValid.bind(this);
        this.onGroupsChanged = this.onGroupsChanged.bind(this);
        this.onShowNameField = this.onShowNameField.bind(this);
        this.onExpressionChanged = this.onExpressionChanged.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    public componentWillReceiveProps(nextProps: SwitchRouterFormProps): void {
        const updates: Partial<SwitchRouterState> = {};

        if (nextProps.config.type === 'group') {
            if (this.state.operand.indexOf('groups') === -1) {
                updates.operand = GROUP_OPERAND;
            }

            if (!hasGroupCase(this.state.cases)) {
                updates.cases = [];
            }
        } else {
            // If we have an existing switch router node and it has cases
            if (
                isSwitchRouterNode(this.props.node) &&
                (this.props.node.router as SwitchRouter).cases &&
                (this.props.node.router as SwitchRouter).cases.length
            ) {
                // If the existing node has a group switch router and the user has switched to a different switch router form
                if (
                    this.props.node.wait.type === 'group' &&
                    (nextProps.config.type === 'expression' ||
                        nextProps.config.type === 'wait_for_response')
                ) {
                    updates.cases = [];
                } else {
                    updates.cases = this.composeCaseProps();
                }
            }
        }

        this.setState(updates as SwitchRouterState);
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

        const optionalRouter: Pick<Router, 'result_name'> = {};
        const resultNameEle = widgets['Result Name'] as TextInputElement;
        if (resultNameEle) {
            optionalRouter.result_name = resultNameEle.state.value;
        }

        const optionalNode: Pick<Node, 'wait'> = {};
        if (this.props.config.type === 'wait_for_response') {
            optionalNode.wait = { type: 'msg' };
        } else if (this.props.config.type === 'expression') {
            optionalNode.wait = { type: 'exp' };
        } else if (this.props.config.type === 'group') {
            optionalNode.wait = { type: 'group' };
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

    private onGroupsChanged(groups: SearchResult[]): void {
        const cases: CaseElementProps[] = groups.map(({ name, id }, idx) => ({
            kase: {
                uuid: generateUUID(),
                type: 'has_group',
                exit_uuid: null,
                arguments: [id]
            },
            exitName: name
        }));

        this.setState({ cases });
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

    private onCaseChanged(c: any, type?: ChangedCaseInput): void {
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
            // Add new case
            cases[cases.length] = newCase;
            // Ensure new case has focus
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

    private onDragEnd(result: any): void {
        if (!result.destination) {
            return;
        }

        const cases = reorderList(this.state.cases, result.source.index, result.destination.index);

        this.setState({
            cases
        });
    }

    private composeCaseProps(): CaseElementProps[] {
        return (this.props.node.router as SwitchRouter).cases.reduce((caseList, kase) => {
            let exitName: string = null;

            if (kase.exit_uuid) {
                const [exit] = this.props.node.exits.filter(({ uuid }) => uuid === kase.exit_uuid);

                if (exit) {
                    ({ name: exitName } = exit);
                }
            }

            try {
                const config = this.context.getOperatorConfig(kase.type);

                caseList.push({
                    kase,
                    exitName,
                    onChange: this.onCaseChanged,
                    onRemove: this.onCaseRemoved
                } as any);
            } catch (error) {
                // Ignore missing cases
            }

            return caseList;
        }, []);
    }

    private getInitialState(): SwitchRouterState {
        let cases: CaseElementProps[] = [];
        let resultName: string = '';
        let setResultName: boolean = false;
        let operand: string = DEFAULT_OPERAND;

        const router: SwitchRouter = this.props.node.router as SwitchRouter;

        // If a router already exists at this node and it has cases
        if (isSwitchRouterNode(this.props.node) && router.cases && router.cases.length) {
            ({ operand } = router);

            if (router.result_name) {
                ({ result_name: resultName } = router);
                setResultName = true;
            }

            cases = cases.concat(this.composeCaseProps());
            // If we're creating a new node or switching from an action to a router
        } else {
            if (this.props.config.type === 'group') {
                operand = GROUP_OPERAND;
            }
        }

        return {
            cases,
            resultName,
            operand,
            setResultName
        };
    }

    private saveLocalizations(widgets: { [name: string]: any }): void {
        const updates: Array<{
            uuid: string;
            translations: any;
        }> = [...this.props.getLocalizedExits(widgets), ...this.getLocalizedCases(widgets)];

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
                const [localized] = this.props.localizations.filter(
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
        let needsEmpty: boolean = true;
        let cases: JSX.Element[] = [];

        if (this.props.config.type === 'group') {
            return cases;
        } else if (this.state.cases) {
            // Cases shouldn't be draggable unless they have fully-formed siblings
            if (
                // prettier-ignore
                this.state.cases.length === 1 ||
                (
                    this.state.cases.length === 2 &&
                    !this.state.cases[this.state.cases.length - 1].kase.arguments.length &&
                    !this.state.cases[this.state.cases.length - 1].exitName.length
                )
            ) {
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
            } else {
                cases = this.state.cases.map((c: CaseElementProps, idx) => {
                    // If a case's operator expects 1 or more operands
                    // and its arguments and exitName are empty,
                    // we don't need an empty case.
                    if (
                        this.context.getOperatorConfig(c.kase.type).operands > 0 &&
                        !c.kase.arguments.length &&
                        !c.exitName.length
                    ) {
                        needsEmpty = false;
                        // It also shouldn't be draggable
                        return (
                            <CaseElement
                                key={c.kase.uuid}
                                data-spec="case"
                                ref={this.props.onBindWidget}
                                kase={c.kase}
                                name={`case_${c.kase.uuid}`}
                                exitName={c.exitName}
                                onRemove={this.onCaseRemoved}
                                onChange={this.onCaseChanged}
                                ComponentMap={this.props.ComponentMap}
                                focusArgsInput={c.focusArgsInput}
                                focusExitInput={c.focusExitInput}
                            />
                        );
                    }

                    return (
                        <Draggable key={c.kase.uuid} draggableId={c.kase.uuid}>
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
                                            name={`case_${c.kase.uuid}`}
                                            exitName={c.exitName}
                                            onRemove={this.onCaseRemoved}
                                            onChange={this.onCaseChanged}
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
                        type: this.context.operatorConfigList[0].type,
                        exit_uuid: null
                    }}
                    ref={this.props.onBindWidget}
                    name={`case_${newCaseUUID}`}
                    exitName={null}
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
        let leadIn: JSX.Element | string = null;

        if (this.props.config.type === 'wait_for_response') {
            leadIn = WAIT_LABEL;
        } else if (this.props.config.type === 'expression') {
            leadIn = leadIn = (
                <Fragment>
                    <p>{EXPRESSION_LABEL}</p>
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
                </Fragment>
            );
        } else if (this.props.config.type === 'group') {
            const groupProps: Partial<GroupElementProps> = {
                localGroups: this.props.ComponentMap.getGroups()
            };

            if (
                this.props.node.wait &&
                this.props.node.wait.type === 'group' &&
                (this.props.node.router as SwitchRouter).cases.length
            ) {
                groupProps.groups = extractGroups(this.props.node);
            }

            leadIn = (
                <div>
                    <p>{GROUP_LABEL}</p>
                    <GroupElement
                        ref={this.props.onBindWidget}
                        name="Group"
                        placeholder={GROUP_PLACEHOLDER}
                        searchPromptText={GROUP_NOT_FOUND}
                        endpoint={this.context.endpoints.groups}
                        add={false}
                        required={true}
                        onChange={this.onGroupsChanged}
                        {...groupProps}
                    />
                </div>
            );
        }

        return (
            <div data-spec="lead-in" className={styles.instructions}>
                {leadIn}
            </div>
        );
    }

    private renderForm(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        } else {
            const cases: JSX.Element[] = this.getCases();
            const caseContext: JSX.Element = cases.length ? (
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
            ) : null;
            const nameField: JSX.Element = this.getNameField();
            const leadIn: JSX.Element = this.getLeadIn();

            return (
                <div>
                    {leadIn}
                    {caseContext}
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
                    {OPERATOR_LOCALIZATION_LEGEND}
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
