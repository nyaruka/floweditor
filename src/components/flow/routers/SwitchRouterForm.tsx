// TODO: Remove use of Function
// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import update from 'immutability-helper';
import * as React from 'react';
import {
    DragDropContext,
    Draggable,
    DraggableStyle,
    Droppable,
    DropResult
} from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { v4 as generateUUID } from 'uuid';
import {
    EXPRESSION_LABEL,
    OPERAND_LOCALIZATION_DESC,
    WAIT_LABEL
} from '~/components/flow/routers/constants';
import * as styles from '~/components/flow/routers/SwitchRouterForm.scss';
import CaseElement, { CaseElementProps } from '~/components/form/case/CaseElement';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import {
    GetResultNameField,
    hasCases,
    SaveLocalizations
} from '~/components/nodeeditor/NodeEditor';
import { getOperatorConfig, operatorConfigList, Type } from '~/config';
import { Operators } from '~/config/operatorConfigs';
import { Types } from '~/config/typeConfigs';
import { Case, Exit, FlowNode, SwitchRouter } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { LocalizedObject } from '~/services/Localization';
import { AppState } from '~/store';
import { NodeEditorSettings } from '~/store/nodeEditor';
import { reorderList } from '~/utils';

export enum DragCursor {
    move = 'move',
    pointer = 'pointer'
}

export enum InputToFocus {
    args = 'args',
    min = 'min',
    max = 'max',
    exit = 'exit'
}

export interface SwitchRouterStoreProps {
    language: Asset;
    typeConfig: Type;
    translating: boolean;
    settings: NodeEditorSettings;
    operand: string;
}

export interface SwitchRouterPassedProps {
    showAdvanced: boolean;
    saveLocalizations: SaveLocalizations;
    updateRouter: Function;
    onExpressionChanged: (e: any) => void;
    getExitTranslations(): JSX.Element;
    getResultNameField: GetResultNameField;
    onBindWidget: (ref: any) => void;
    onBindAdvancedWidget: (ref: any) => void;
    removeWidget: (name: string) => void;
}

export interface SwitchRouterState {
    displayableCases: CaseElementProps[];
}

export type SwitchRouterFormProps = SwitchRouterStoreProps & SwitchRouterPassedProps;

export const getListStyle = (isDraggingOver: boolean, single: boolean): { cursor: DragCursor } => {
    if (single) {
        return null;
    }

    return {
        cursor: isDraggingOver ? DragCursor.move : DragCursor.pointer
    };
};

export const getItemStyle = (
    draggableStyle: DraggableStyle,
    isDragging: boolean
): DraggableStyle => ({
    userSelect: 'none',
    outline: 'none',
    ...draggableStyle,
    // Overwriting default draggableStyle object from this point down
    ...(isDragging
        ? {
              background: '#f2f9fc',
              borderRadius: 4,
              opacity: 0.75,
              top: draggableStyle.top - 90,
              left: 20,
              height: draggableStyle.height + 15
          }
        : {})
});

export const addFocus = (kase: CaseElementProps, inputToFocus: InputToFocus) => {
    switch (inputToFocus) {
        case InputToFocus.args:
            return { ...kase, focusArgs: true };
        case InputToFocus.min:
            return { ...kase, focusMin: true };
        case InputToFocus.max:
            return { ...kase, focusMax: true };
        case InputToFocus.exit:
            return { ...kase, focusExit: true };
    }
};

export const casePropsFromElement = ({
    caseElement,
    inputToFocus
}: {
    caseElement: CaseElement;
    inputToFocus?: InputToFocus;
}): CaseElementProps => {
    let caseProps: CaseElementProps = {
        kase: {
            uuid: caseElement.props.kase.uuid,
            type: caseElement.state.operatorConfig.type,
            exit_uuid: caseElement.props.kase.exit_uuid,
            arguments: caseElement.state.arguments
        },
        exitName: caseElement.state.exitName
    };

    if (inputToFocus) {
        caseProps = addFocus(caseProps, inputToFocus);
    }

    return caseProps;
};

export const casePropsFromNode = ({
    nodeToEdit,
    handleCaseChanged,
    handleCaseRemoved
}: {
    nodeToEdit: FlowNode;
    handleCaseChanged: (c: CaseElement, inputToFocus?: InputToFocus) => void;
    handleCaseRemoved: (c: CaseElement) => void;
}): CaseElementProps[] =>
    (nodeToEdit.router as SwitchRouter).cases.reduce((displayableCases, kase) => {
        let exitName: string = null;

        if (kase.exit_uuid) {
            const [exit] = nodeToEdit.exits.filter(({ uuid }: Exit) => uuid === kase.exit_uuid);

            if (exit) {
                ({ name: exitName } = exit);
            }
        }

        try {
            if (getOperatorConfig(kase.type).verboseName) {
                displayableCases.push({
                    kase,
                    exitName,
                    onChange: this.handleCaseChanged,
                    onRemove: this.handleCaseRemoved
                } as any);
            }
        } catch (error) {
            // Ignore missing cases
        }

        return displayableCases;
    }, []);

export const leadInSpecId = 'lead-in';

export class SwitchRouterForm extends React.Component<SwitchRouterFormProps, SwitchRouterState> {
    constructor(props: SwitchRouterFormProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });

        this.state = this.getInitialState();
    }

    public onValid(widgets: { [name: string]: any }): void {
        if (this.props.translating) {
            return this.props.saveLocalizations(widgets, this.state.displayableCases);
        }

        this.props.updateRouter(this.state.displayableCases);
    }

    public validate(): boolean {
        return true;
    }

    private handleCaseRemoved(c: CaseElement): void {
        const idx = this.state.displayableCases.findIndex(
            (props: CaseElementProps) => props.kase.uuid === c.props.kase.uuid
        );

        const displayableCases = update(this.state.displayableCases, {
            $splice: [[idx, 1]]
        }) as CaseElementProps[];

        this.setState({ displayableCases }, () => this.props.removeWidget(c.props.name));
    }

    private handleCaseChanged(c: CaseElement, inputToFocus?: InputToFocus): void {
        const newCase = casePropsFromElement({ caseElement: c, inputToFocus });

        const { displayableCases } = this.state;

        let found = false;
        for (const key in displayableCases) {
            if (displayableCases.hasOwnProperty(key)) {
                const props = displayableCases[key];
                if (props.kase.uuid === c.props.kase.uuid) {
                    displayableCases[key] = newCase as CaseElementProps;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            // Add new case
            displayableCases[displayableCases.length] = newCase as CaseElementProps;
        }

        this.setState({
            displayableCases
        });
    }

    private onDragEnd(result: DropResult): void {
        if (!result.destination) {
            return;
        }

        const displayableCases = reorderList(
            this.state.displayableCases,
            result.source.index,
            result.destination.index
        );

        this.setState({
            displayableCases
        });
    }

    private getInitialState(): SwitchRouterState {
        const displayableCases = [];

        const router = this.props.settings.originalNode.router as SwitchRouter;

        if (router && hasCases(this.props.settings.originalNode)) {
            const existingCases = casePropsFromNode({
                nodeToEdit: this.props.settings.originalNode,
                handleCaseChanged: this.handleCaseChanged,
                handleCaseRemoved: this.handleCaseRemoved
            });

            displayableCases.push(...existingCases);
        }

        return {
            displayableCases
        };
    }

    private getCasesToRender(): JSX.Element[] {
        const casesToRender: JSX.Element[] = [];
        let needsEmpty: boolean = true;
        const lastCase = this.state.displayableCases[this.state.displayableCases.length - 1];

        if (this.state.displayableCases) {
            // Cases shouldn't be draggable unless they have fully-formed siblings
            if (this.state.displayableCases.length === 1) {
                const [caseProps] = this.state.displayableCases;
                const operator = getOperatorConfig(caseProps.kase.type);
                if (operator) {
                    casesToRender.push(
                        <CaseElement
                            data-spec="case"
                            key={caseProps.kase.uuid}
                            ref={this.props.onBindWidget}
                            name={`case_${caseProps.kase.uuid}`}
                            onRemove={this.handleCaseRemoved}
                            onChange={this.handleCaseChanged}
                            solo={true}
                            exitName={caseProps.exitName}
                            kase={caseProps.kase}
                            focusArgs={caseProps.focusArgs}
                            focusExit={caseProps.focusExit}
                            focusMin={caseProps.focusMin}
                            focusMax={caseProps.focusMax}
                        />
                    );
                }
            } else if (
                // If we have 2 displayable cases but the second isn't fully formed (e.g. only the operator has been changed)
                this.state.displayableCases.length === 2 &&
                (lastCase.kase.type !== Operators.has_any_word &&
                    !lastCase.kase.arguments.length &&
                    !lastCase.exitName.length)
            ) {
                needsEmpty = false;
                this.state.displayableCases.forEach((caseProps: CaseElementProps) => {
                    const operator = getOperatorConfig(caseProps.kase.type);
                    if (operator) {
                        casesToRender.push(
                            <CaseElement
                                key={caseProps.kase.uuid}
                                data-spec="case"
                                ref={this.props.onBindWidget}
                                name={`case_${caseProps.kase.uuid}`}
                                onRemove={this.handleCaseRemoved}
                                onChange={this.handleCaseChanged}
                                exitName={caseProps.exitName}
                                kase={caseProps.kase}
                                focusArgs={caseProps.focusArgs}
                                focusExit={caseProps.focusExit}
                                focusMin={caseProps.focusMin}
                                focusMax={caseProps.focusMax}
                            />
                        );
                    }
                });
            } else {
                this.state.displayableCases.forEach((caseProps: CaseElementProps, idx) => {
                    // If a displayable case's operator expects 1 or more operands
                    // and its arguments and exitName are empty,
                    // we don't need an empty case.
                    const operator = getOperatorConfig(caseProps.kase.type);
                    if (
                        operator.operands > 0 &&
                        !caseProps.kase.arguments.length &&
                        !caseProps.exitName.length
                    ) {
                        needsEmpty = false;
                        // It also shouldn't be draggable
                        casesToRender.push(
                            <CaseElement
                                key={caseProps.kase.uuid}
                                data-spec="case"
                                ref={this.props.onBindWidget}
                                name={`case_${caseProps.kase.uuid}`}
                                onRemove={this.handleCaseRemoved}
                                onChange={this.handleCaseChanged}
                                exitName={caseProps.exitName}
                                kase={caseProps.kase}
                                focusArgs={caseProps.focusArgs}
                                focusExit={caseProps.focusExit}
                                focusMin={caseProps.focusMin}
                                focusMax={caseProps.focusMax}
                            />
                        );
                    } else {
                        casesToRender.push(
                            <Draggable key={caseProps.kase.uuid} draggableId={caseProps.kase.uuid}>
                                {(provided, snapshot) => (
                                    <div data-spec="case-draggable">
                                        <div
                                            ref={provided.innerRef}
                                            style={getItemStyle(
                                                provided.draggableStyle,
                                                snapshot.isDragging
                                            )}
                                            {...provided.dragHandleProps}
                                        >
                                            <CaseElement
                                                data-spec="case"
                                                ref={this.props.onBindWidget}
                                                name={`case_${caseProps.kase.uuid}`}
                                                onRemove={this.handleCaseRemoved}
                                                onChange={this.handleCaseChanged}
                                                exitName={caseProps.exitName}
                                                kase={caseProps.kase}
                                                focusArgs={caseProps.focusArgs}
                                                focusExit={caseProps.focusExit}
                                                focusMin={caseProps.focusMin}
                                                focusMax={caseProps.focusMax}
                                            />
                                        </div>
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Draggable>
                        );
                    }
                });
            }
        }

        if (needsEmpty) {
            const newCaseUUID = generateUUID();
            casesToRender.push(
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
                    onRemove={this.handleCaseRemoved}
                    onChange={this.handleCaseChanged}
                />
            );
        }

        return casesToRender;
    }

    public getCasesForLocalization(): JSX.Element[] {
        return (this.props.settings.originalNode.router as SwitchRouter).cases.reduce(
            (casesForLocalization: JSX.Element[], kase) => {
                // only allow translations for cases with arguments that aren't numeric
                if (kase.arguments && kase.arguments.length > 0 && !/number/.test(kase.type)) {
                    const [localized] = this.props.settings.localizations.filter(
                        (localizedObject: LocalizedObject) =>
                            localizedObject.getObject().uuid === kase.uuid
                    );

                    if (localized) {
                        let value = '';
                        if ('arguments' in localized.localizedKeys) {
                            const localizedCase = localized.getObject() as Case;
                            if (localizedCase.arguments && localizedCase.arguments.length) {
                                [value] = localizedCase.arguments;
                            }
                        }

                        const { verboseName } = getOperatorConfig(kase.type);
                        const [argument] = kase.arguments;

                        casesForLocalization.push(
                            <div
                                key={`translate_${kase.uuid}`}
                                data-spec="operator-field"
                                className={styles.translating_operator_container}
                            >
                                <div
                                    data-spec="verbose-name"
                                    className={styles.translating_operator}
                                >
                                    {verboseName}
                                </div>
                                <div
                                    data-spec="argument-to-translate"
                                    className={styles.translating_from}
                                >
                                    {argument}
                                </div>
                                <div className={styles.translating_to}>
                                    <TextInputElement
                                        ref={this.props.onBindAdvancedWidget}
                                        data-spec="translation-input"
                                        name={kase.uuid}
                                        placeholder={`${this.props.language.name} Translation`}
                                        showLabel={false}
                                        entry={{ value }}
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

    private getLeadIn(): JSX.Element {
        let leadIn: JSX.Element | string = null;
        if (this.props.typeConfig.type === Types.wait_for_response) {
            leadIn = WAIT_LABEL;
        } else if (this.props.typeConfig.type === Types.split_by_expression) {
            leadIn = (
                <>
                    <p>{EXPRESSION_LABEL}</p>
                    <TextInputElement
                        ref={this.props.onBindWidget}
                        key={this.props.settings.originalNode.uuid}
                        name="Expression"
                        showLabel={false}
                        entry={{ value: this.props.operand }}
                        onChange={this.props.onExpressionChanged}
                        autocomplete={true}
                        // required={true}
                    />
                </>
            );
        }
        return (
            <div data-spec={leadInSpecId} className={styles.instructions}>
                {leadIn}
            </div>
        );
    }

    private getCaseContext(): JSX.Element {
        const cases = this.getCasesToRender();
        if (cases.length > 1) {
            const draggableCases = cases.slice(0, cases.length - 1);
            const emptyCase = cases[cases.length - 1];
            return (
                <>
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId="droppable">
                            {({ innerRef, placeholder }, { isDraggingOver }) => (
                                <div
                                    ref={innerRef}
                                    style={getListStyle(
                                        isDraggingOver,
                                        draggableCases.length === 1
                                    )}
                                >
                                    {draggableCases}
                                    {placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    {emptyCase}
                </>
            );
        } else {
            return <>{cases}</>;
        }
    }

    private renderForm(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        } else {
            return (
                <>
                    {this.getLeadIn()}
                    {this.getCaseContext()}
                    {this.props.getResultNameField()}
                </>
            );
        }
    }

    private renderAdvanced(): JSX.Element {
        const operands = this.getCasesForLocalization();
        return (
            <>
                <div data-spec="advanced-title" className={styles.translatingOperatorTitle}>
                    Rules
                </div>
                <div
                    data-spec="advanced-instructions"
                    className={styles.translatingOperatorInstructions}
                >
                    {OPERAND_LOCALIZATION_DESC}
                </div>
                {operands}
            </>
        );
    }

    public render(): JSX.Element {
        return this.props.showAdvanced && this.props.translating
            ? this.renderAdvanced()
            : this.renderForm();
    }
}

/* istanbul ignore next */
const mapStateToProps = ({
    flowEditor: {
        editorUI: { language, translating }
    },
    nodeEditor: { typeConfig, settings, operand }
}: AppState) => ({ language, typeConfig, translating, settings, operand });

const ConnectedSwitchRouterForm = connect(
    mapStateToProps,
    null,
    null,
    { withRef: true }
)(SwitchRouterForm);

export default ConnectedSwitchRouterForm;
