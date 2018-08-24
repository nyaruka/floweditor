import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import CaseElement from '~/components/flow/routers/case/CaseElement';
import {
    createEmptyCase,
    getItemStyle,
    getListStyle
} from '~/components/flow/routers/caselist/helpers';
import { Case } from '~/flowTypes';
import { FormState, mergeForm } from '~/store/nodeEditor';
import { reorderList } from '~/utils';

import * as styles from './CaseList.scss';

export enum DragCursor {
    move = 'move',
    pointer = 'pointer'
}

export interface CaseProps {
    uuid: string;
    kase: Case;
    exitName: string;
}

export interface CaseListProps {
    cases: CaseProps[];
    onCasesUpdated(cases: CaseProps[]): void;
}

export interface CaseListState extends FormState {
    currentCases: CaseProps[];
}

/**
 * CaseList is a component made up of case elements that lets
 * the user configure rules and drag and drop to set their order.
 */
export default class CaseList extends React.Component<CaseListProps, CaseListState> {
    constructor(props: CaseListProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^handle/]
        });

        const caseProps = this.props.cases;

        if (!this.hasEmptyCase(caseProps)) {
            caseProps.push(createEmptyCase());
        }

        // initialize our cases
        this.state = {
            currentCases: caseProps,
            valid: true
        };
    }

    private handleUpdate(keys: { caseProps?: CaseProps; removeCase?: any }): boolean {
        const updates: Partial<CaseListState> = {};

        let ensureEmptyCase = false;

        if (keys.hasOwnProperty('caseProps')) {
            updates.currentCases = [keys.caseProps];
            ensureEmptyCase = true;
        }

        let toRemove: any[] = [];
        if (keys.hasOwnProperty('removeCase')) {
            toRemove = [{ currentCases: [keys.removeCase] }];
            ensureEmptyCase = true;
        }

        const updated = mergeForm(this.state, updates, toRemove) as CaseListState;

        // notify our listener
        this.props.onCasesUpdated(updated.currentCases);

        // update our form
        this.setState(updated, () => {
            // if we no longer have an empty case, add one
            if (ensureEmptyCase) {
                if (!this.hasEmptyCase(this.state.currentCases)) {
                    this.handleUpdate({ caseProps: createEmptyCase() });
                }
            }
        });
        return updated.valid;
    }

    private hasEmptyCase(cases: CaseProps[]): boolean {
        return cases.find((caseProps: CaseProps) => caseProps.exitName.trim().length === 0) != null;
    }

    private handleRemoveCase(uuid: string): boolean {
        return this.handleUpdate({
            removeCase: { uuid }
        });
    }

    private handleUpdateCase(caseProps: CaseProps): boolean {
        return this.handleUpdate({ caseProps });
    }

    private renderCases(): JSX.Element[] {
        const cases = this.state.currentCases.map((caseProps: CaseProps, index: number) => {
            // the last element isn't draggable
            const dragDisabled = index === this.state.currentCases.length - 1;

            // if it's not the last one, then it's draggable
            return (
                <Draggable
                    key={caseProps.uuid}
                    draggableId={caseProps.uuid}
                    isDragDisabled={dragDisabled}
                >
                    {(provided, snapshot) => (
                        <div data-spec="case-draggable">
                            <div
                                ref={provided.innerRef}
                                style={getItemStyle(provided.draggableStyle, snapshot.isDragging)}
                                {...provided.dragHandleProps}
                            >
                                <CaseElement
                                    key={caseProps.uuid}
                                    {...caseProps}
                                    onRemove={this.handleRemoveCase}
                                    onChange={this.handleUpdateCase}
                                />
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Draggable>
            );
        });
        return cases;
    }

    private handleDragEnd(result: DropResult): void {
        if (!result.destination) {
            return;
        }

        const currentCases = reorderList(
            this.state.currentCases,
            result.source.index,
            Math.min(result.destination.index, this.state.currentCases.length - 2)
        );

        this.setState({
            currentCases
        });
    }

    public render(): JSX.Element {
        const cases = this.renderCases();
        return (
            <div className={styles.caseList}>
                <DragDropContext onDragEnd={this.handleDragEnd}>
                    <Droppable droppableId="droppable">
                        {({ innerRef, placeholder }, { isDraggingOver }) => (
                            <div
                                ref={innerRef}
                                style={getListStyle(isDraggingOver, cases.length === 1)}
                            >
                                {cases}
                                {placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        );
    }
}
