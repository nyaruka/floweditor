import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Select from 'react-select';
import { InputToFocus } from '~/components/flow/routers/SwitchRouterForm';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import { getOperatorConfig, Operator, operatorConfigList } from '~/config';
import { Operators } from '~/config/operatorConfigs';
import { Case } from '~/flowTypes';
import { hasErrorType, jsonEqual, titleCase } from '~/utils';

import FormElement from '~/components/form/FormElement';
import * as styles from '~/components/form/case/CaseElement.scss';

export interface CaseElementProps {
    kase: Case;
    exitName: string;
    name?: string; // satisfy form widget props
    onRemove?(c: CaseElement): void;
    empty?: boolean;
    onChange?(c: any, type?: InputToFocus): void;
    focusArgs?: boolean;
    focusExit?: boolean;
    focusMin?: boolean;
    focusMax?: boolean;
    solo?: boolean;
}

interface CaseElementState {
    errors: string[];
    operatorConfig: Operator;
    arguments: string[];
    exitName: string;
    exitNameEdited: boolean;
}

/**
 * Determines prefix for case's exit name
 */
export const prefix = (operatorType: string): string => {
    let pre = '';

    if (operatorType.indexOf('_lt') > -1) {
        if (operatorType.indexOf('date') > -1) {
            pre = 'Before ';
        } else {
            if (operatorType.indexOf('lte') > -1) {
                pre = '<= ';
            } else {
                pre = '< ';
            }
        }
    } else if (operatorType.indexOf('_gt') > -1) {
        if (operatorType.indexOf('date') > -1) {
            pre = 'After ';
        } else {
            if (operatorType.indexOf('gte') > -1) {
                pre = '>= ';
            } else {
                pre = '>';
            }
        }
    }

    return pre;
};

/**
 * Returns min, max values for Operators.has_number_between case
 */
export const getMinMax = (args: string[] = []): { min: string; max: string } => {
    let min = '';
    let max = '';
    if (args.length) {
        if (strContainsNum(args[0])) {
            min = args[0];
        }
        if (args[1]) {
            if (strContainsNum(args[1])) {
                max = args[1];
            }
        }
    }
    return {
        min,
        max
    };
};

export const isFloat = (val: string): boolean => /^[+-]?\d?(\.\d*)?$/.test(val.trim());

export const isInt = (val: string): boolean => /^[\+\-]?\d+$/.test(val.trim());

export const strContainsNum = (str: string): boolean => {
    const trimmed = str.trim();
    if (isFloat(trimmed)) {
        return true;
    } else if (isInt(trimmed)) {
        return true;
    } else {
        return false;
    }
};

export const parseNum = (str: string): number => {
    const trimmed = str.trim();
    if (isFloat(trimmed)) {
        return parseFloat(str);
    } else if (isInt(trimmed)) {
        return parseInt(trimmed, 10);
    }
};

/**
 * Applies prefix, title case to operator
 */
export const composeExitName = (
    operatorType: string,
    newArgList: string[],
    newExitName: string
): string => {
    if (operatorType === Operators.has_number_between) {
        if (newExitName && !/-/.test(newExitName)) {
            return newExitName;
        }
        const { min, max } = getMinMax(newArgList);

        return `${min ? min : newArgList[0] || ''} - ${max ? max : newArgList[1] || ''}`;
    }

    const pre = prefix(operatorType);

    if (newArgList.length) {
        const [firstArg] = newArgList;
        const words = firstArg.match(/\w+/g);

        if (words && words.length > 0) {
            const [firstWord] = words;
            return pre + titleCase(firstWord);
        }

        return pre + titleCase(firstArg);
    } else {
        return pre;
    }
};

/**
 * Returns the right exit name for a given case
 */
export const getExitName = (
    exitName: string,
    operatorConfig: Operator,
    newArgList: string[] = []
): string => {
    // Don't reassign func params
    let newExitName = exitName;

    if (newArgList.length >= 0 && !operatorConfig.categoryName) {
        newExitName = composeExitName(operatorConfig.type, newArgList, newExitName);
    } else if (!newExitName && operatorConfig.categoryName) {
        // Some operators don't expect args
        // Use the operator's default category name
        ({ categoryName: newExitName } = operatorConfig);
    }

    return newExitName;
};

export default class CaseElement extends React.Component<CaseElementProps, CaseElementState> {
    private category: any;
    private operatorConfig: Operator;

    constructor(props: CaseElementProps) {
        super(props);

        const operatorConfig = getOperatorConfig(this.props.kase.type);

        this.state = {
            errors: [],
            operatorConfig,
            arguments: this.props.kase.arguments || [],
            exitName: this.props.exitName || '',
            exitNameEdited: false
        };

        bindCallbacks(this, {
            include: [/Ref$/, /^on/, 'validate', /^handle/]
        });
    }

    private categoryRef(ref: any): any {
        return (this.category = ref);
    }

    public shouldComponentUpdate(
        nextProps: CaseElementProps,
        nextState: CaseElementState
    ): boolean {
        if (!jsonEqual(nextProps, this.props) || !jsonEqual(nextState, this.state)) {
            return true;
        }
        return false;
    }

    private onChangeOperator(operatorConfig: Operator): void {
        if (!jsonEqual(operatorConfig, this.state.operatorConfig)) {
            const updates: Partial<CaseElementState> = {
                operatorConfig,
                exitName: this.state.exitNameEdited
                    ? this.state.exitName
                    : getExitName(this.state.exitName, operatorConfig, this.state.arguments)
            };

            if (operatorConfig.type === Operators.has_number_between) {
                updates.arguments = ['', ''];
            }

            this.setState(updates as CaseElementState, () =>
                this.category.wrappedInstance.setState({ value: updates.exitName }, () =>
                    this.props.onChange(this)
                )
            );
        }
    }

    private handleChangeArgument(value: string, input?: InputToFocus): void {
        let toFocus: InputToFocus;
        const updates: Partial<CaseElementState> = {};

        if (input) {
            if (input === InputToFocus.min) {
                toFocus = InputToFocus.min;
                updates.arguments = this.state.arguments.length
                    ? [value, this.state.arguments[1] || '']
                    : [value];
            } else if (input === InputToFocus.max) {
                toFocus = InputToFocus.max;
                updates.arguments = this.state.arguments.length
                    ? [this.state.arguments[0], value]
                    : [value];
            }

            updates.exitName = this.state.exitNameEdited
                ? this.state.exitName
                : getExitName(this.state.exitName, this.state.operatorConfig, updates.arguments);

            this.setState(updates as CaseElementState, () => this.handleChange(toFocus));
        } else {
            toFocus = InputToFocus.args;
            updates.arguments = [value];
            updates.exitName = this.state.exitNameEdited
                ? this.state.exitName
                : getExitName(this.state.exitName, this.state.operatorConfig, updates.arguments);

            this.setState(updates as CaseElementState, () => {
                this.category.wrappedInstance.setState({ value: updates.exitName }, () =>
                    this.handleChange(toFocus)
                );
            });
        }
    }

    private handleChangeExitName(exitName: string): void {
        this.setState(
            {
                exitName,
                exitNameEdited: true
            },
            () => this.handleChange(InputToFocus.exit)
        );
    }

    private onRemove(): void {
        this.props.onRemove(this);
    }

    private handleChangeMin(value: string): void {
        this.handleChangeArgument(value, InputToFocus.min);
    }

    private handleChangeMax(value: string): void {
        this.handleChangeArgument(value, InputToFocus.max);
    }

    private handleChange(focus: InputToFocus): void {
        // If the case doesn't have arguments & an exit name, remove it
        if (
            (!this.state.arguments.length ||
                // Accounting for two-arg cases
                (!this.state.arguments[0] && !this.state.arguments[1])) &&
            !this.state.exitName
        ) {
            this.onRemove();
        } else {
            this.props.onChange(this, focus);
        }
    }

    public validate(): boolean {
        const errors: string[] = [];

        const invalidExitErr = `A category name is required when using "${
            this.state.operatorConfig.verboseName
        }."`;

        if (/between$/.test(this.state.operatorConfig.type)) {
            if (
                !this.state.arguments.length ||
                this.state.arguments.length !== 2 ||
                (!this.state.arguments[0].trim() || !this.state.arguments[1].trim())
            ) {
                errors.push(
                    // prettier-ignore
                    `When using "${
                        this.state.operatorConfig.verboseName}
                    ", both arguments are required.`
                );
            } else {
                if (!strContainsNum(this.state.arguments[0])) {
                    errors.push('Minimum value must be a number.');
                }

                if (!strContainsNum(this.state.arguments[1])) {
                    errors.push('Maximum value must be a number.');
                }

                if (
                    strContainsNum(this.state.arguments[0]) &&
                    strContainsNum(this.state.arguments[1])
                ) {
                    const arg1 = parseNum(this.state.arguments[0]);
                    const arg2 = parseNum(this.state.arguments[1]);

                    if (arg1 > arg2) {
                        errors.push('Minimum value cannot be more than maximum value.');
                    } else if (arg1 === arg2) {
                        errors.push('Minimum value cannot equal maximum value.');
                    }
                }
            }
        } else if (/number/.test(this.state.operatorConfig.type)) {
            if (
                !strContainsNum(this.state.arguments[0]) &&
                this.state.operatorConfig.operands !== 0
            ) {
                errors.push('Argument must contain a number.');
            }
        } else {
            if (
                (!this.state.arguments.length || !this.state.arguments[0].length) &&
                !this.props.empty
            ) {
                errors.push(
                    // prettier-ignore
                    `When using "${
                        this.state.operatorConfig.verboseName}
                    ", an argument is required.`
                );
            }

            // Validate numeric and date operators
            if (this.state.arguments.length && this.state.arguments[0].trim().indexOf('@') !== 0) {
                if (this.state.operatorConfig.type.indexOf('number') > -1) {
                    if (this.state.arguments[0]) {
                        if (strContainsNum(this.state.arguments[0])) {
                            errors.push('Enter a number when using numeric rules.');
                        }
                    }
                }

                if (this.state.operatorConfig.type.indexOf('date') > -1) {
                    if (this.state.arguments[0]) {
                        if (isNaN(Date.parse(this.state.arguments[0]))) {
                            errors.push('Enter a date when using date rules (e.g. 1/1/2017).');
                        }
                    }
                }
            }
        }

        // Address exit name
        if (this.state.operatorConfig.operands < 1) {
            if (this.state.exitName.trim().length === 0) {
                errors.push(invalidExitErr);
            }
        } else {
            if (this.state.arguments.length) {
                if (!this.category || !this.category.wrappedInstance.state.value) {
                    errors.push(invalidExitErr);
                }
            }
        }

        if (this.state.errors.length === 0 && errors.length === 0) {
            return true;
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    private getArgs(): JSX.Element {
        if (this.state.operatorConfig.operands > 0) {
            // First pass at displaying, handling Operators.has_number_between inputs
            if (this.state.operatorConfig.operands > 1) {
                const { min: minVal, max: maxVal } = getMinMax(this.props.kase.arguments);
                return (
                    <React.Fragment>
                        <TextInputElement
                            name="arguments"
                            onChange={this.handleChangeMin}
                            entry={{ value: minVal }}
                            focus={this.props.focusMin}
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
                            onChange={this.handleChangeMax}
                            entry={{ value: maxVal }}
                            focus={this.props.focusMax}
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
                        onChange={this.handleChangeArgument}
                        entry={{
                            value: this.state.arguments.length ? this.state.arguments[0] : ''
                        }}
                        focus={this.props.focusArgs}
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

    private getDndIco(): JSX.Element {
        if (!this.props.empty && !this.props.solo) {
            return <span className={`fe-chevrons-expand ${styles.dndIcon}`} />;
        }

        return <div className={styles.empty} />;
    }

    private getRemoveIco(): JSX.Element {
        if (!this.props.empty) {
            return <span className={`fe-x ${styles.removeIcon}`} onClick={this.onRemove} />;
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
                    {this.getDndIco()}
                    <div className={styles.choice}>
                        <Select
                            joinValues={true}
                            data-spec="operator-list"
                            name="operator"
                            clearable={false}
                            options={operatorConfigList}
                            value={this.state.operatorConfig.type}
                            valueKey="type"
                            labelKey="verboseName"
                            optionClassName="operator"
                            searchable={false}
                            onChange={this.onChangeOperator}
                        />
                    </div>
                    <div
                        className={
                            this.state.operatorConfig.type === Operators.has_number_between
                                ? styles.multiOperand
                                : styles.singleOperand
                        }
                    >
                        {this.getArgs()}
                    </div>
                    <div className={styles.categorizeAs}>categorize as</div>
                    <div className={styles.category}>
                        <TextInputElement
                            ref={this.categoryRef}
                            data-spec="exit-input"
                            name="exitName"
                            onChange={this.handleChangeExitName}
                            entry={{ value: this.state.exitName }}
                            focus={this.props.focusExit}
                            showInvalid={hasErrorType(this.state.errors, [/category/])}
                        />
                    </div>
                    {this.getRemoveIco()}
                </div>
            </FormElement>
        );
    }
}
