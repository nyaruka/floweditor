import arrayMove from 'array-move';
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { SortableContainer, SortableElement, SortEnd } from 'react-sortable-hoc';
import CaseElement from '~/components/flow/routers/case/CaseElement';
import { createEmptyCase } from '~/components/flow/routers/caselist/helpers';
import { fakePropType } from '~/config/ConfigProvider';
import { Case } from '~/flowTypes';
import { FormState, mergeForm } from '~/store/nodeEditor';

import * as styles from './CaseList.scss';

export enum DragCursor {
    move = 'move',
    pointer = 'pointer'
}

export interface CaseProps {
    uuid: string;
    kase: Case;
    categoryName: string;
    valid: boolean;
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
    private sortableItem = SortableElement(({ value: caseProps }: any) => (
        <div className={styles.kase}>
            <CaseElement
                key={caseProps.uuid}
                {...caseProps}
                onRemove={this.handleRemoveCase}
                onChange={this.handleUpdateCase}
            />
        </div>
    ));

    private sortableList = SortableContainer(({ items }: any) => {
        return (
            <div className={styles.caseList}>
                {items.map((value: any, index: any) => (
                    <this.sortableItem
                        key={`item-${index}`}
                        index={index}
                        value={value}
                        disabled={index === this.state.currentCases.length - 1}
                        shouldCancelStart={(e: any) => {
                            console.log(e);
                            return true;
                        }}
                    />
                ))}
            </div>
        );
    });

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

    public static contextTypes = {
        config: fakePropType
    };

    private handleUpdate(keys: { caseProps?: CaseProps; removeCase?: any }): boolean {
        const updates: Partial<CaseListState> = {};

        let ensureEmptyCase = false;

        if (keys.hasOwnProperty('caseProps')) {
            updates.currentCases = [keys.caseProps];
            ensureEmptyCase = true;
            if (!keys.caseProps.valid) {
                updates.valid = false;
            }
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
        return (
            cases.find((caseProps: CaseProps) => caseProps.categoryName.trim().length === 0) != null
        );
    }

    private handleRemoveCase(uuid: string): boolean {
        return this.handleUpdate({
            removeCase: { uuid }
        });
    }

    private handleUpdateCase(caseProps: CaseProps): boolean {
        return this.handleUpdate({ caseProps });
    }

    private handleSortEnd({ oldIndex, newIndex }: SortEnd): void {
        this.setState(
            ({ currentCases }) => ({
                currentCases: arrayMove(
                    currentCases,
                    oldIndex,
                    newIndex === this.state.currentCases.length - 1 ? newIndex - 1 : newIndex
                )
            }),
            () => {
                this.props.onCasesUpdated(this.state.currentCases);
            }
        );
    }

    public render(): JSX.Element {
        return (
            <>
                <this.sortableList
                    items={this.state.currentCases}
                    onSortEnd={this.handleSortEnd}
                    shouldCancelStart={(e: React.MouseEvent<HTMLDivElement>) => {
                        if (!(e.target instanceof HTMLElement)) {
                            return true;
                        }
                        return !e.target.dataset.draggable;
                    }}
                />
            </>
        );
    }
}
