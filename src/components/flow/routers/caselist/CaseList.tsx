import arrayMove from 'array-move';
import { react as bindCallbacks } from 'auto-bind';
import CaseElement from 'components/flow/routers/case/CaseElement';
import { createEmptyCase } from 'components/flow/routers/caselist/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { Case } from 'flowTypes';
import * as React from 'react';
import { SortableContainer, SortableElement, SortEnd } from 'react-sortable-hoc';
import { FormState, mergeForm } from 'store/nodeEditor';

import styles from './CaseList.module.scss';
import { Operator } from 'config/interfaces';
import { Asset } from 'store/flowContext';

export enum DragCursor {
  move = 'move',
  pointer = 'pointer'
}

export interface CaseProps {
  uuid: string;
  kase: Case;
  categoryName: string;
  valid: boolean;
  operators?: Operator[];
  classifier?: Asset;
}

export interface CaseListProps {
  cases: CaseProps[];
  onCasesUpdated(cases: CaseProps[]): void;
  operators?: Operator[];
  classifier?: Asset;
  createEmptyCase?: () => CaseProps;
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
        operators={this.props.operators}
        classifier={this.props.classifier}
      />
    </div>
  ));

  private sortableList = SortableContainer(({ items }: any) => {
    return (
      <div className={styles.case_list}>
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
      caseProps.push(this.createEmptyCase());
    }

    // initialize our cases
    this.state = {
      currentCases: caseProps,
      valid: true
    };
  }

  private createEmptyCase(): CaseProps {
    return this.props.createEmptyCase ? this.props.createEmptyCase() : createEmptyCase();
  }

  public static contextTypes = {
    config: fakePropType
  };

  private handleUpdate(keys: { caseProps?: CaseProps; removeCase?: any }) {
    const updates: Partial<CaseListState> = {};

    let ensureEmptyCase = false;

    if (keys.hasOwnProperty('caseProps')) {
      updates.currentCases = [keys.caseProps];
      ensureEmptyCase = true;
      if (!keys.caseProps.valid) {
        // TODO: refactor this to be a form entry
        // mock our case to have validation failures, this is so the case list sees
        // the existence of errors which mergeForm uses when merging form validity
        // (keys.caseProps as any).validationFailures = [{ message: 'invalid case' }];
        updates.valid = false;
      }
    }

    let toRemove: any[] = [];
    if (keys.hasOwnProperty('removeCase')) {
      toRemove = [{ currentCases: [keys.removeCase] }];
      ensureEmptyCase = true;
    }

    // update our form
    this.setState(
      (prevState: CaseListState) => {
        const updated = mergeForm(prevState, updates, toRemove) as CaseListState;

        // notify our listener
        this.props.onCasesUpdated(updated.currentCases);
        return updated;
      },
      () => {
        // if we no longer have an empty case, add one
        if (ensureEmptyCase) {
          if (!this.hasEmptyCase(this.state.currentCases)) {
            this.handleUpdate({ caseProps: this.createEmptyCase() });
          }
        }
      }
    );
  }

  private hasEmptyCase(cases: CaseProps[]): boolean {
    return cases.find((caseProps: CaseProps) => caseProps.categoryName.trim().length === 0) != null;
  }

  private handleRemoveCase(uuid: string) {
    return this.handleUpdate({
      removeCase: { uuid }
    });
  }

  private handleUpdateCase(caseProps: CaseProps) {
    this.handleUpdate({ caseProps });
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
