import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Select from 'react-select';
import * as styles from '~/components/flow/routers/case/CaseElement.scss';
import { initializeForm, validateCase } from '~/components/flow/routers/case/helpers';
import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { InputToFocus } from '~/components/flow/routers/response/ResponseRouterForm';
import FormElement from '~/components/form/FormElement';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import { Operator, operatorConfigList } from '~/config';
import { Operators } from '~/config/operatorConfigs';
import { Case } from '~/flowTypes';
import { FormState, StringEntry } from '~/store/nodeEditor';
import { hasErrorType } from '~/utils';
import { small } from '~/utils/reactselect';

export interface CaseElementProps {
    kase: Case;
    exitName: string;
    name?: string; // satisfy form widget props
    onRemove?(uuid: string): void;
    onChange?(c: CaseProps): void;
}

export interface CaseElementState extends FormState {
    errors: string[];
    operatorConfig: Operator;
    exitName: StringEntry;
    exitNameEdited: boolean;

    // for string based args
    argument: StringEntry;

    // for numeric operators
    min: StringEntry;
    max: StringEntry;
}

export default class CaseElement extends React.Component<CaseElementProps, CaseElementState> {
    private category: any;

    constructor(props: CaseElementProps) {
        super(props);

        this.state = initializeForm(props);

        bindCallbacks(this, {
            include: [/Ref$/, /^handle/, /^get/]
        });
    }

    private categoryRef(ref: any): any {
        return (this.category = ref);
    }

    private getArgumentArray(): string[] {
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
            exitName: this.state.exitName.value,
            exitEdited: this.state.exitNameEdited
        });

        this.setState(updates as CaseElementState, () => this.handleChange());
    }

    private handleArgumentChanged(value: string, input?: InputToFocus): void {
        const updates = validateCase({
            operatorConfig: this.state.operatorConfig,
            argument: value,
            exitName: this.state.exitName.value,
            exitEdited: this.state.exitNameEdited
        });

        this.setState(updates as CaseElementState, () => this.handleChange());
    }

    private handleMinChanged(value: string): void {
        const updates = validateCase({
            operatorConfig: this.state.operatorConfig,
            min: value,
            max: this.state.max.value,
            exitName: this.state.exitName.value,
            exitEdited: this.state.exitNameEdited
        });

        this.setState(updates as CaseElementState, () => this.handleChange());
    }

    private handleMaxChanged(value: string): void {
        const updates = validateCase({
            operatorConfig: this.state.operatorConfig,
            min: this.state.min.value,
            max: value,
            exitName: this.state.exitName.value,
            exitEdited: this.state.exitNameEdited
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
            exitName: this.state.exitName.value,
            kase: {
                arguments: this.getArgumentArray(),
                type: this.state.operatorConfig.type,
                uuid: this.props.kase.uuid,

                // if the exit name changed, we'll need to recompute our exit
                exit_uuid: this.state.exitNameEdited ? null : this.props.kase.exit_uuid
            }
        };
    }

    private handleChange(): void {
        // If the case doesn't have arguments & an exit name, remove it
        if (!this.state.exitName.value) {
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
                    <React.Fragment>
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
                    </React.Fragment>
                );
            } else {
                return (
                    <TextInputElement
                        data-spec="args-input"
                        name="arguments"
                        onChange={this.handleArgumentChanged}
                        entry={this.state.argument}
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
                <div className={`${styles.kase} select-medium`}>
                    <span className={`fe-chevrons-expand ${styles.dndIcon}`} />
                    <div className={styles.choice}>
                        <Select
                            styles={small}
                            data-spec="operator-list"
                            isClearable={false}
                            menuPlacement="auto"
                            options={operatorConfigList}
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
                    <div className={styles.categorizeAs}>categorize as</div>
                    <div className={styles.category}>
                        <TextInputElement
                            ref={this.categoryRef}
                            data-spec="exit-input"
                            name="exitName"
                            onChange={this.handleExitChanged}
                            entry={this.state.exitName}
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
