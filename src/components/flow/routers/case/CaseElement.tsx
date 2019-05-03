import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Select from 'react-select';
import { hasErrors } from '~/components/flow/actions/helpers';
import * as styles from '~/components/flow/routers/case/CaseElement.scss';
import { initializeForm, validateCase } from '~/components/flow/routers/case/helpers';
import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { isRelativeDate } from '~/components/flow/routers/helpers';
import FormElement from '~/components/form/FormElement';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import { Operator } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { filterOperators } from '~/config/helpers';
import { Operators } from '~/config/interfaces';
import { operatorConfigList } from '~/config/operatorConfigs';
import { Case } from '~/flowTypes';
import { FormState, StringEntry, ValidationFailure } from '~/store/nodeEditor';
import { getSelectClass, hasErrorType } from '~/utils';
import { small } from '~/utils/reactselect';

export interface CaseElementProps {
    kase: Case;
    categoryName: string;
    name?: string; // satisfy form widget props
    onRemove?(uuid: string): void;
    onChange?(c: CaseProps): void;
}

export interface CaseElementState extends FormState {
    errors: string[];
    operatorConfig: Operator;
    categoryName: StringEntry;
    categoryNameEdited: boolean;

    // for string based args
    argument: StringEntry;

    // for numeric operators
    min: StringEntry;
    max: StringEntry;
}

export default class CaseElement extends React.Component<CaseElementProps, CaseElementState> {
    private operators: Operator[];

    constructor(props: CaseElementProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^handle/, /^get/]
        });

        this.state = initializeForm(props);
    }

    public static contextTypes = {
        config: fakePropType
    };

    private getOperators(): Operator[] {
        if (this.operators === undefined) {
            this.operators = filterOperators(operatorConfigList, this.context.config.flowType);
        }

        return this.operators;
    }

    private getArgumentArray(): string[] {
        if (this.state.operatorConfig.operands === 0) {
            return [];
        }

        return this.state.operatorConfig.type === Operators.has_number_between
            ? [this.state.min.value, this.state.max.value]
            : [this.state.argument.value];
    }

    private handleOperatorChanged(operatorConfig: Operator): void {
        const updates = validateCase({
            operatorConfig,
            argument: this.state.argument.value,
            min: this.state.min.value,
            max: this.state.max.value,
            exitName: this.state.categoryName.value,
            exitEdited: this.state.categoryNameEdited
        });

        this.setState(updates as CaseElementState, () => this.handleChange());
    }

    private handleArgumentChanged(value: string): void {
        const updates = validateCase({
            operatorConfig: this.state.operatorConfig,
            argument: value,
            exitName: this.state.categoryName.value,
            exitEdited: this.state.categoryNameEdited
        });

        this.setState(updates as CaseElementState, () => this.handleChange());
    }

    private handleMinChanged(value: string): void {
        const updates = validateCase({
            operatorConfig: this.state.operatorConfig,
            min: value,
            max: this.state.max.value,
            exitName: this.state.categoryName.value,
            exitEdited: this.state.categoryNameEdited
        });

        this.setState(updates as CaseElementState, () => this.handleChange());
    }

    private handleMaxChanged(value: string): void {
        const updates = validateCase({
            operatorConfig: this.state.operatorConfig,
            min: this.state.min.value,
            max: value,
            exitName: this.state.categoryName.value,
            exitEdited: this.state.categoryNameEdited
        });

        this.setState(updates as CaseElementState, () => this.handleChange());
    }

    private handleExitChanged(value: string): void {
        const updates = validateCase({
            operatorConfig: this.state.operatorConfig,
            argument: this.state.argument.value,
            min: this.state.min.value,
            max: this.state.max.value,
            exitName: value,
            exitEdited: true
        });

        this.setState(updates as CaseElementState, () => this.handleChange());
    }

    private handleRemoveClicked(): void {
        this.props.onRemove(this.props.kase.uuid);
    }

    private getCaseProps(): CaseProps {
        return {
            uuid: this.props.kase.uuid,
            categoryName: this.state.categoryName.value,
            kase: {
                arguments: this.getArgumentArray(),
                type: this.state.operatorConfig.type,
                uuid: this.props.kase.uuid,

                // if the exit name changed, we'll need to recompute our exit
                category_uuid: this.state.categoryNameEdited ? null : this.props.kase.category_uuid
            },
            valid: this.state.valid
        };
    }

    private handleChange(): void {
        // If the case doesn't have arguments & an exit name, remove it
        if (!this.state.categoryName.value) {
            // see if we are clearing out a between
            if (this.state.operatorConfig.type === Operators.has_number_between) {
                if (!this.state.min.value && !this.state.max.value) {
                    // this.handleRemoveClicked();
                    // return;
                }
            }
            // see if we are clearing out a single operand
            else {
                if (!this.state.argument.value) {
                    // this.handleRemoveClicked();
                    // return;
                }
            }
        }

        this.props.onChange(this.getCaseProps());
    }

    private renderArguments(): JSX.Element {
        if (this.state.operatorConfig.operands > 0) {
            // First pass at displaying, handling Operators.has_number_between inputs
            if (this.state.operatorConfig.operands > 1) {
                return (
                    <>
                        <TextInputElement
                            name="arguments"
                            onChange={this.handleMinChanged}
                            entry={this.state.min}
                        />
                        <span className={styles.divider}>and</span>
                        <TextInputElement
                            name="arguments"
                            onChange={this.handleMaxChanged}
                            entry={this.state.max}
                        />
                    </>
                );
            } else if (isRelativeDate(this.state.operatorConfig.type)) {
                return (
                    <>
                        <span className={styles.divider}>today + </span>
                        <TextInputElement
                            __className={styles.relativeDate}
                            name="arguments"
                            onChange={this.handleArgumentChanged}
                            entry={this.state.argument}
                            autocomplete={false}
                        />
                        <span className={styles.divider}>days</span>
                    </>
                );
            } else {
                return (
                    <TextInputElement
                        data-spec="args-input"
                        name="arguments"
                        onChange={this.handleArgumentChanged}
                        entry={this.state.argument}
                        onFieldFailures={(persistantFailures: ValidationFailure[]) => {
                            const argument = { ...this.state.argument, persistantFailures };
                            this.setState({
                                argument,
                                valid: this.state.valid && !hasErrors(argument)
                            });
                        }}
                        autocomplete={true}
                    />
                );
            }
        }

        return null;
    }

    public render(): JSX.Element {
        return (
            <FormElement
                data-spec="case-form"
                name={this.props.name}
                __className={styles.group}
                kaseError={this.state.errors.length > 0}
            >
                <div className={`${styles.kase}`} data-draggable={true}>
                    <span
                        className={`fe-chevrons-expand ${styles.dndIcon}`}
                        data-draggable={true}
                    />
                    <div className={styles.choice + ' select-medium'}>
                        <Select
                            className={getSelectClass(0)}
                            styles={small}
                            data-spec="operator-list"
                            isClearable={false}
                            menuPlacement="auto"
                            options={this.getOperators()}
                            getOptionLabel={(option: Operator) => option.verboseName}
                            getOptionValue={(option: Operator) => option.type}
                            isSearchable={false}
                            name="operator"
                            onChange={this.handleOperatorChanged}
                            value={this.state.operatorConfig}
                        />
                    </div>
                    <div
                        className={
                            this.state.operatorConfig.type === Operators.has_number_between
                                ? styles.multiOperand
                                : styles.singleOperand
                        }
                    >
                        {this.renderArguments()}
                    </div>
                    <div className={styles.categorizeAs} data-draggable={true}>
                        categorize as
                    </div>
                    <div className={styles.category}>
                        <TextInputElement
                            data-spec="exit-input"
                            name="exitName"
                            onChange={this.handleExitChanged}
                            entry={this.state.categoryName}
                            showInvalid={hasErrorType(this.state.errors, [/category/])}
                        />
                    </div>
                    <span
                        className={`fe-x ${styles.removeIcon}`}
                        onClick={this.handleRemoveClicked}
                    />
                </div>
            </FormElement>
        );
    }
}
