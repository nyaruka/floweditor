import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import update from 'immutability-helper';
import { v4 as generateUUID } from 'uuid';
import {
    Wait,
    WaitType,
    Node,
    SwitchRouter,
    Exit,
    AnyAction,
    Case,
    FlowDefinition,
    Router
} from '../../flowTypes';
import { Type, operatorConfigList, getOperatorConfig } from '../../config';
import { FormProps } from '../NodeEditor';
import ComponentMap from '../../services/ComponentMap';
import { Language } from '../LanguageSelector';
import { LocalizedObject } from '../../services/Localization';
import TextInputElement from '../form/TextInputElement';
import CaseElement, { CaseElementProps } from '../form/CaseElement';
import { reorderList } from '../../utils';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GetResultNameField } from '../NodeEditor';
import { WAIT_LABEL, EXPRESSION_LABEL, OPERATOR_LOCALIZATION_LEGEND } from './constants';
import { LocalizationUpdates } from '../../services/FlowMutator';
import { hasCases } from '../NodeEditor/NodeEditor';

import * as styles from './SwitchRouter.scss';

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
}

export type SwitchRouterProps = Partial<FormProps>;

export const getListStyle = (isDraggingOver: boolean, single: boolean): { cursor: DragCursor } => {
    if (single) {
        return null;
    }

    return {
        cursor: isDraggingOver ? DragCursor.move : DragCursor.pointer
    };
};

export const getItemStyle = (draggableStyle: any, isDragging: boolean) => ({
    userSelect: 'none',
    outline: 'none',
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
    SwitchRouterProps,
    SwitchRouterState
> {
    constructor(props: SwitchRouterProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/]
        });

        const initialState = this.getInitialState();

        this.state = initialState;
    }

    public onValid(widgets: { [name: string]: any }): void {
        if (this.props.translating) {
            return this.props.saveLocalizations(widgets, this.state.cases);
        }

        this.props.updateRouter(this.state.cases);
    }

    private onCaseRemoved(c: any): void {
        const idx = this.state.cases.findIndex(
            (props: CaseElementProps) => props.kase.uuid === c.props.kase.uuid
        );

        if (idx > -1) {
            const cases = update(this.state.cases, { $splice: [[idx, 1]] }) as CaseElementProps[];

            this.setState({ cases });
        }

        this.props.removeWidget(c.props.name);
    }

    private onCaseChanged(c: CaseElement, inputToFocus?: ChangedCaseInput): void {
        const newCase: Pick<
            CaseElementProps,
            'kase' | 'exitName' | 'focusArgsInput' | 'focusExitInput'
        > = {
            kase: {
                uuid: c.props.kase.uuid,
                type: c.state.operatorConfig.type,
                exit_uuid: c.props.kase.exit_uuid,
                arguments: c.state.arguments
            },
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
                    cases[key] = newCase as CaseElementProps;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            // Add new case
            cases[cases.length] = newCase as CaseElementProps;
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

    private composeCaseProps(): CaseElementProps[] {
        return (this.props.node.router as SwitchRouter).cases.reduce((caseList, kase) => {
            let exitName: string = null;

            if (kase.exit_uuid) {
                const [exit] = this.props.node.exits.filter(
                    ({ uuid }: Exit) => uuid === kase.exit_uuid
                );

                if (exit) {
                    ({ name: exitName } = exit);
                }
            }

            try {
                const config = getOperatorConfig(kase.type);

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
        const cases = [];

        const router = this.props.node.router as SwitchRouter;

        if (router && hasCases(this.props.node)) {
            const existingCases = this.composeCaseProps();

            cases.push(...existingCases);
        }

        return {
            cases
        };
    }

    private getCases(): JSX.Element[] {
        const cases: JSX.Element[] = [];
        let needsEmpty: boolean = true;
        const lastCase = this.state.cases[this.state.cases.length - 1];

        if (this.state.cases) {
            // Cases shouldn't be draggable unless they have fully-formed siblings
            if (this.state.cases.length === 1) {
                const [{ kase, exitName, focusArgsInput, focusExitInput }] = this.state.cases;
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
                        focusArgsInput={focusArgsInput}
                        focusExitInput={focusExitInput}
                        config={this.props.config}
                    />
                );
            } else if (
                // If we have 2 cases but the second isn't fully formed (e.g. only the operator has been changed)
                this.state.cases.length === 2 &&
                (lastCase.kase.type !== operatorConfigList[0].type &&
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
                                config={this.props.config}
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
                            getOperatorConfig(kase.type).operands > 0 &&
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
                                    config={this.props.config}
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
                                                    config={this.props.config}
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
                        type: operatorConfigList[0].type,
                        exit_uuid: null
                    }}
                    ref={this.props.onBindWidget}
                    name={`case_${newCaseUUID}`}
                    exitName={''}
                    empty={true}
                    onRemove={this.onCaseRemoved}
                    onChange={this.onCaseChanged}
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
                />
            );
        }

        return cases;
    }

    public getOperatorsForLocalization(): JSX.Element[] {
        const { cases } = this.props.node.router as SwitchRouter;
        return cases.reduce((casesForLocalization: JSX.Element[], kase) => {
            if (kase.arguments && kase.arguments.length > 0) {
                const [localized] = this.props.localizations.filter(
                    (localizedObject: LocalizedObject) =>
                        localizedObject.getObject().uuid === kase.uuid
                );
                if (localized) {
                    let value = '';
                    if ('arguments' in localized.localizedKeys) {
                        const localizedCase = localized.getObject() as Case;
                        if (localizedCase.arguments && localizedCase.arguments) {
                            [value] = localizedCase.arguments;
                        }
                    }
                    const { verboseName } = getOperatorConfig(kase.type);
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
                                    placeholder={`${this.props.language.name} Translation`}
                                    showLabel={false}
                                    value={value}
                                    ComponentMap={this.props.ComponentMap}
                                    config={this.props.config}
                                />
                            </div>
                        </div>
                    );
                }
            }
            return casesForLocalization;
        }, []);
    }

    private getLeadIn(): JSX.Element {
        let leadIn: JSX.Element | string = null;
        if (this.props.config.type === 'wait_for_response') {
            leadIn = WAIT_LABEL;
        } else if (this.props.config.type === 'split_by_expression') {
            leadIn = (
                <React.Fragment>
                    <p>{EXPRESSION_LABEL}</p>
                    <TextInputElement
                        ref={this.props.onBindWidget}
                        key={this.props.node.uuid}
                        name="Expression"
                        showLabel={false}
                        value={this.props.operand}
                        onChange={this.props.onExpressionChanged}
                        autocomplete={true}
                        required={true}
                        ComponentMap={this.props.ComponentMap}
                        config={this.props.config}
                    />
                </React.Fragment>
            );
        }
        return (
            <div data-spec="lead-in" className={styles.instructions}>
                {leadIn}
            </div>
        );
    }

    private getCaseContext(): JSX.Element {
        const cases: JSX.Element[] = this.getCases();

        if (cases.length > 1) {
            const draggableCases: JSX.Element[] = cases.slice(0, cases.length - 1);
            const emptyCase: JSX.Element = cases[cases.length - 1];
            return (
                <React.Fragment>
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId="droppable">
                            {({ innerRef, placeholder }, { isDraggingOver }) => (
                                <div
                                    ref={innerRef}
                                    style={getListStyle(
                                        isDraggingOver,
                                        draggableCases.length === 1
                                    )}>
                                    {draggableCases}
                                    {placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    {emptyCase}
                </React.Fragment>
            );
        } else {
            return <React.Fragment>{cases}</React.Fragment>;
        }
    }

    private renderForm(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        } else {
            const leadIn: JSX.Element = this.getLeadIn();
            const caseContext: JSX.Element = this.getCaseContext();
            const nameField: JSX.Element = this.props.getResultNameField();

            return (
                <React.Fragment>
                    {leadIn}
                    {caseContext}
                    {nameField}
                </React.Fragment>
            );
        }
    }
    private renderAdvanced(): JSX.Element {
        const operators: JSX.Element[] = this.getOperatorsForLocalization();
        return (
            <React.Fragment>
                <div data-spec="advanced-title" className={styles.translatingOperatorTitle}>
                    Rules
                </div>
                <div
                    data-spec="advanced-instructions"
                    className={styles.translatingOperatorInstructions}>
                    {OPERATOR_LOCALIZATION_LEGEND}
                </div>
                {operators}
            </React.Fragment>
        );
    }
    public render(): JSX.Element {
        return this.props.showAdvanced && this.props.translating
            ? this.renderAdvanced()
            : this.renderForm();
    }
}
