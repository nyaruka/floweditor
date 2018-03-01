import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import Select from 'react-select';
import { v4 as generateUUID } from 'uuid';
import ComponentMap from '../../services/ComponentMap';
import { InputToFocus } from '../routers/SwitchRouter';
import { Case } from '../../flowTypes';
import TextInputElement, { HTMLTextElement } from './TextInputElement';
import { Type, Operator, operatorConfigList, getOperatorConfig } from '../../config';
import { jsonEqual, titleCase, hasErrorType } from '../../utils';
import FormElement from './FormElement';
import * as forms from './FormElement.scss';
import * as styles from './CaseElement.scss';

export interface CaseElementProps {
    kase: Case;
    exitName: string;
    config?: Type;
    name?: string; // satisfy form widget props
    onRemove?(c: CaseElement): void;
    ComponentMap?: ComponentMap;
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
 * Applies prefix, title case to operator
 */
export const composeExitName = (
    operatorType: string,
    newArgList: string[],
    newExitName: string
): string => {
    if (operatorType === 'has_number_between') {
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
    kase: Case,
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

/**
 * Returns min, max values for 'has_number_between' case
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

export default class CaseElement extends React.Component<CaseElementProps, CaseElementState> {
    private category: TextInputElement;
    private operatorConfig: Operator;

    constructor(props: CaseElementProps) {
        super(props);

        const operatorConfig = getOperatorConfig(this.props.kase.type);

        this.state = {
            errors: [],
            operatorConfig,
            arguments: this.props.kase.arguments || [],
            exitName: this.props.exitName || ''
        };

        bindCallbacks(this, {
            include: [/Ref$/, /^on/, 'validate']
        });
    }

    private categoryRef(ref: TextInputElement): TextInputElement {
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
                exitName: getExitName(
                    this.state.exitName,
                    operatorConfig,
                    this.props.kase,
                    this.state.arguments
                )
            };

            if (operatorConfig.type === 'has_number_between') {
                updates.arguments = ['', ''];
            }

            this.setState(updates as CaseElementState, () =>
                this.category.setState({ value: updates.exitName }, () => this.props.onChange(this))
            );
        }
    }

    private onChangeArgument(
        { target: { value } }: React.ChangeEvent<HTMLTextElement>,
        input?: InputToFocus
    ): void {
        let toFocus: InputToFocus;
        const updates: Partial<CaseElementState> = {};

        if (input) {
            if (input === InputToFocus.min) {
                toFocus = InputToFocus.min;
                updates.arguments = this.state.arguments.length
                    ? [value, this.state.arguments[1] || null]
                    : [value];
            } else if (input === InputToFocus.max) {
                toFocus = InputToFocus.max;
                updates.arguments = this.state.arguments.length
                    ? [this.state.arguments[0], value]
                    : [value];
            }

            updates.exitName = getExitName(
                this.state.exitName,
                this.state.operatorConfig,
                this.props.kase,
                updates.arguments
            );

            this.setState(updates as CaseElementState, () => this.handleChange(toFocus));
        } else {
            toFocus = InputToFocus.args;
            updates.arguments = [value];
            updates.exitName = getExitName(
                this.state.exitName,
                this.state.operatorConfig,
                this.props.kase,
                updates.arguments
            );

            this.setState(updates as CaseElementState, () => {
                this.category.setState({ value: updates.exitName }, () =>
                    this.handleChange(toFocus)
                );
            });
        }
    }

    private onChangeExitName({
        target: { value: exitName }
    }: React.ChangeEvent<HTMLTextElement>): void {
        this.setState(
            {
                exitName
            },
            () => this.handleChange(InputToFocus.exit)
        );
    }

    private onRemove(): void {
        this.props.onRemove(this);
    }

    private onChangeMin(e: any): void {
        this.onChangeArgument(e, InputToFocus.min);
    }

    private onChangeMax(e: any): void {
        this.onChangeArgument(e, InputToFocus.max);
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
        // prettier-ignore
        const INVALID_EXIT_ERR = `A category name is required when using "${
            this.state.operatorConfig.verboseName
        }."`;

        if (/between$/.test(this.state.operatorConfig.type)) {
            if (
                !this.state.arguments.length ||
                this.state.arguments.length !== 2 ||
                (!this.state.arguments[0] && !this.state.arguments[0])
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
                errors.push(INVALID_EXIT_ERR);
            }
        } else {
            if (this.state.arguments.length) {
                if (!this.category || !this.category.state.value) {
                    errors.push(INVALID_EXIT_ERR);
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
            // First pass at displaying, handling 'has_number_between' inputs
            if (this.state.operatorConfig.operands > 1) {
                const { min: minVal, max: maxVal } = getMinMax(this.props.kase.arguments);
                return (
                    <React.Fragment>
                        <TextInputElement
                            name="arguments"
                            onChange={this.onChangeMin}
                            value={minVal}
                            focus={this.props.focusMin}
                            ComponentMap={this.props.ComponentMap}
                            showInvalid={hasErrorType(this.state.errors, [
                                /Minimum value must/,
                                /argument/,
                                /rules/,
                                /equal/,
                                /more/
                            ])}
                            config={this.props.config || null}
                        />
                        <span className={styles.divider}>and</span>
                        <TextInputElement
                            name="arguments"
                            onChange={this.onChangeMax}
                            value={maxVal}
                            focus={this.props.focusMax}
                            ComponentMap={this.props.ComponentMap}
                            showInvalid={hasErrorType(this.state.errors, [
                                /Maximum value must/,
                                /argument/,
                                /rules/
                            ])}
                            config={this.props.config || null}
                        />
                    </React.Fragment>
                );
            } else {
                return (
                    <TextInputElement
                        data-spec="args-input"
                        name="arguments"
                        onChange={this.onChangeArgument}
                        value={this.state.arguments.length ? this.state.arguments[0] : ''}
                        focus={this.props.focusArgs}
                        autocomplete={true}
                        ComponentMap={this.props.ComponentMap}
                        showInvalid={hasErrorType(this.state.errors, [
                            /argument/,
                            /rules/,
                            /number/
                        ])}
                        config={this.props.config || null}
                    />
                );
            }
        }

        return null;
    }

    private getDndIco(): JSX.Element {
        if (!this.props.empty && !this.props.solo) {
            return (
                <div className={styles.dndIcon}>
                    <span>&#8597;</span>
                </div>
            );
        }

        return <div className={styles.empty} />;
    }

    private getRemoveIco(): JSX.Element {
        if (!this.props.empty) {
            return <span className={`icon-remove ${styles.removeIcon}`} onClick={this.onRemove} />;
        }

        return null;
    }

    public render(): JSX.Element {
        return (
            <FormElement
                data-spec="case-form"
                name={this.props.name}
                errors={this.state.errors}
                __className={styles.group}
                kaseError={this.state.errors.length > 0}>
                <div className={`${styles.kase} select-medium`}>
                    {this.getDndIco()}
                    <div className={styles.choice}>
                        <Select
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
                            this.state.operatorConfig.type === 'has_number_between'
                                ? styles.multiOperand
                                : styles.singleOperand
                        }>
                        {this.getArgs()}
                    </div>
                    <div className={styles.categorizeAs}>categorize as</div>
                    <div className={styles.category}>
                        <TextInputElement
                            ref={this.categoryRef}
                            data-spec="exit-input"
                            name="exitName"
                            onChange={this.onChangeExitName}
                            value={this.state.exitName}
                            focus={this.props.focusExit}
                            ComponentMap={this.props.ComponentMap}
                            showInvalid={hasErrorType(this.state.errors, [/category/])}
                            config={this.props.config || null}
                        />
                    </div>
                    {this.getRemoveIco()}
                </div>
            </FormElement>
        );
    }
}
