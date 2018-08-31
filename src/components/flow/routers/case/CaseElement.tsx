import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Select from 'react-select';
import * as styles from '~/components/flow/routers/case/CaseElement.scss';
import { getExitName, getMinMax } from '~/components/flow/routers/case/helpers';
import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { InputToFocus } from '~/components/flow/routers/response/ResponseRouterForm';
import FormElement from '~/components/form/FormElement';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import { getOperatorConfig, Operator, operatorConfigList } from '~/config';
import { Operators } from '~/config/operatorConfigs';
import { Case } from '~/flowTypes';
import { FormState, StringArrayEntry, StringEntry } from '~/store/nodeEditor';
import { hasErrorType } from '~/utils';
import { small } from '~/utils/reactselect';

export interface CaseElementProps {
    kase: Case;
    exitName: string;
    name?: string; // satisfy form widget props
    onRemove?(uuid: string): void;
    onChange?(c: CaseProps, type?: InputToFocus): void;
}

interface CaseElementState extends FormState {
    errors: string[];
    operatorConfig: Operator;
    arguments: StringArrayEntry;
    exitName: StringEntry;
    exitNameEdited: boolean;
}

export default class CaseElement extends React.Component<CaseElementProps, CaseElementState> {
    private category: any;

    constructor(props: CaseElementProps) {
        super(props);

        this.state = {
            errors: [],
            operatorConfig: getOperatorConfig(this.props.kase.type),
            arguments: { value: this.props.kase.arguments || [] },
            exitName: { value: this.props.exitName || '' },
            exitNameEdited: false,
            valid: true
        };

        bindCallbacks(this, {
            include: [/Ref$/, /^handle/, /^get/]
        });
    }

    private categoryRef(ref: any): any {
        return (this.category = ref);
    }

    private handleOperatorChanged(operatorConfig: Operator): void {
        const exitName = this.state.exitNameEdited
            ? this.state.exitName.value
            : getExitName(this.state.exitName.value, operatorConfig, this.state.arguments.value);

        const updates: Partial<CaseElementState> = {
            operatorConfig,
            exitName: { value: exitName }
        };

        if (operatorConfig.type === Operators.has_number_between) {
            updates.arguments = { value: ['', ''] };
        }

        this.setState(updates as CaseElementState, () =>
            this.category.wrappedInstance.setState({ value: updates.exitName }, () =>
                this.props.onChange(this.getCaseProps())
            )
        );
    }

    private getCaseProps(): CaseProps {
        return {
            uuid: this.props.kase.uuid,
            exitName: this.state.exitName.value,
            kase: {
                arguments: this.state.arguments.value,
                type: this.state.operatorConfig.type,
                uuid: this.props.kase.uuid,

                // if the exit name changed, we'll need to recompute our exit
                exit_uuid: this.state.exitNameEdited ? null : this.props.kase.exit_uuid
            }
        };
    }

    private handleExitChanged(exitName: string): void {
        this.setState(
            {
                exitName: { value: exitName },
                exitNameEdited: true
            },
            () => this.handleChange(InputToFocus.exit)
        );
    }

    private handleRemoveClicked(): void {
        this.props.onRemove(this.props.kase.uuid);
    }

    private handleMinChanged(value: string): void {
        this.handleArgumentChanged(value, InputToFocus.min);
    }

    private handleMaxChanged(value: string): void {
        this.handleArgumentChanged(value, InputToFocus.max);
    }

    private handleArgumentChanged(value: string, input?: InputToFocus): void {
        let toFocus: InputToFocus;
        const updates: Partial<CaseElementState> = {};

        if (input) {
            if (input === InputToFocus.min) {
                toFocus = InputToFocus.min;
                updates.arguments = {
                    value: this.state.arguments.value.length
                        ? [value, this.state.arguments.value[1] || '']
                        : [value]
                };
            } else if (input === InputToFocus.max) {
                toFocus = InputToFocus.max;
                updates.arguments = {
                    value: this.state.arguments.value.length
                        ? [this.state.arguments.value[0], value]
                        : [value]
                };
            }

            updates.exitName = {
                value: this.state.exitNameEdited
                    ? this.state.exitName.value
                    : getExitName(
                          this.state.exitName.value,
                          this.state.operatorConfig,
                          updates.arguments.value
                      )
            };

            this.setState(updates as CaseElementState, () => this.handleChange(toFocus));
        } else {
            toFocus = InputToFocus.args;
            updates.arguments = { value: [value] };
            updates.exitName = {
                value: this.state.exitNameEdited
                    ? this.state.exitName.value
                    : getExitName(
                          this.state.exitName.value,
                          this.state.operatorConfig,
                          updates.arguments.value
                      )
            };

            this.setState(updates as CaseElementState, () => {
                this.category.wrappedInstance.setState({ value: updates.exitName }, () =>
                    this.handleChange(toFocus)
                );
            });
        }
    }

    private handleChange(focus: InputToFocus): void {
        // If the case doesn't have arguments & an exit name, remove it
        if (
            (!this.state.arguments.value.length ||
                // Accounting for two-arg cases
                (!this.state.arguments.value[0] && !this.state.arguments.value[1])) &&
            !this.state.exitName.value
        ) {
            this.handleRemoveClicked();
        } else {
            this.props.onChange(this.getCaseProps(), focus);
        }
    }

    private renderArguments(): JSX.Element {
        if (this.state.operatorConfig.operands > 0) {
            // First pass at displaying, handling Operators.has_number_between inputs
            if (this.state.operatorConfig.operands > 1) {
                const { min: minVal, max: maxVal } = getMinMax(this.props.kase.arguments);
                return (
                    <React.Fragment>
                        <TextInputElement
                            name="arguments"
                            onChange={this.handleMinChanged}
                            entry={{ value: minVal }}
                            showInvalid={hasErrorType(this.state.errors, [
                                /Minimum value must/,
                                /argument/,
                                /rules/,
                                /equal/,
                                /more/
                            ])}
                        />
                        <span className={styles.divider}>and</span>
                        <TextInputElement
                            name="arguments"
                            onChange={this.handleMaxChanged}
                            entry={{ value: maxVal }}
                            showInvalid={hasErrorType(this.state.errors, [
                                /Maximum value must/,
                                /argument/,
                                /rules/
                            ])}
                        />
                    </React.Fragment>
                );
            } else {
                return (
                    <TextInputElement
                        data-spec="args-input"
                        name="arguments"
                        onChange={this.handleArgumentChanged}
                        entry={{
                            value: this.state.arguments.value.length
                                ? this.state.arguments.value[0]
                                : ''
                        }}
                        autocomplete={true}
                        showInvalid={hasErrorType(this.state.errors, [
                            /argument/,
                            /rules/,
                            /number/
                        ])}
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
