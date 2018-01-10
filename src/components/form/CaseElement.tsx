import * as React from 'react';
import Select from 'react-select';
import { v4 as generateUUID } from 'uuid';
import { Operator } from '../../providers/ConfigProvider/operatorConfigs';
import ComponentMap from '../../services/ComponentMap';
import FormElement from './FormElement';
import TextInputElement, { HTMLTextElement } from './TextInputElement';
import {
    operatorConfigListPT,
    getOperatorConfigPT
} from '../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../providers/ConfigProvider/configContext';
import { Case } from '../../flowTypes';
import { ChangedCaseInput } from '../routers/SwitchRouter';
import { jsonEqual, titleCase, hasErrorType } from '../../helpers/utils';

import * as forms from './FormElement.scss';
import * as styles from './CaseElement.scss';

export interface CaseElementProps {
    name?: string; // satisfy form widget props
    onRemove?(c: CaseElement): void;
    ComponentMap?: ComponentMap;
    kase: Case;
    exitName: string;
    empty?: boolean;
    onChange?(c: any, type?: ChangedCaseInput): void;
    focusArgsInput?: boolean;
    focusExitInput?: boolean;
    solo?: boolean;
}

interface CaseElementState {
    errors: string[];
    operatorConfig: Operator;
    arguments: string[];
    exitName: string;
}

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

export const composeExitName = (operator: string, newArgList: string[]): string => {
    const pre: string = prefix(operator);

    if (newArgList.length > 0) {
        const [firstArg] = newArgList;
        const words = firstArg.match(/\w+/g);

        if (words && words.length > 0) {
            const [firstWord] = words;

            return pre + titleCase(firstWord);
        }

        return pre + titleCase(firstArg);
    }

    return pre;
};

export const getExitName = (
    exitName: string,
    operatorConfig: Operator,
    kase: Case,
    newArgList: string[] = []
): string => {
    // Don't reassign func params
    let newExitName = exitName;

    // Some operators don't expect args
    if (newArgList.length >= 0 && !operatorConfig.categoryName) {
        newExitName = composeExitName(operatorConfig.type, newArgList);
    } else {
        // Use the operator's default category name
        ({ categoryName: newExitName } = operatorConfig);
    }

    return newExitName;
};

export const hasArgs = (args: string[] = []): boolean =>
    args.length > 0 && args[0].trim().length > 0;

export default class CaseElement extends React.Component<CaseElementProps, CaseElementState> {
    private category: TextInputElement;
    private operatorConfig: Operator;

    public static contextTypes = {
        operatorConfigList: operatorConfigListPT,
        getOperatorConfig: getOperatorConfigPT
    };

    constructor(props: CaseElementProps, context: ConfigProviderContext) {
        super(props, context);

        const operatorConfig = this.context.getOperatorConfig(this.props.kase.type);

        this.state = {
            errors: [],
            operatorConfig,
            arguments: this.props.kase.arguments || [],
            exitName: this.props.exitName || ''
        };

        this.categoryRef = this.categoryRef.bind(this);
        this.onChangeOperator = this.onChangeOperator.bind(this);
        this.onChangeArguments = this.onChangeArguments.bind(this);
        this.onChangeExitName = this.onChangeExitName.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.validate = this.validate.bind(this);
    }

    private categoryRef(ref: TextInputElement): TextInputElement {
        return (this.category = ref);
    }

    private onChangeOperator(val: Operator): void {
        if (!jsonEqual(val, this.state.operatorConfig)) {
            const exitName = getExitName(
                this.state.exitName,
                val,
                this.props.kase,
                this.state.arguments
            );

            this.setState(
                {
                    operatorConfig: val,
                    exitName
                },
                () => this.category.setState({ value: exitName }, () => this.props.onChange(this))
            );
        }
    }

    private onChangeArguments(val: React.ChangeEvent<HTMLTextElement>): void {
        const args = [val.target.value];
        const exitName = getExitName(
            this.state.exitName,
            this.state.operatorConfig,
            this.props.kase,
            args
        );

        this.setState(
            {
                arguments: args,
                exitName
            },
            () => {
                this.category.setState({ value: exitName }, () => {
                    // If the case doesn't have both an argument & an exit name, remove it */
                    if (!this.state.arguments[0] && !this.state.exitName) {
                        this.onRemove();
                    } else {
                        this.props.onChange(this, ChangedCaseInput.ARGS);
                    }
                });
            }
        );
    }

    private onChangeExitName(val: React.ChangeEvent<HTMLTextElement>): void {
        this.setState(
            {
                exitName: val.target.value
            },
            () => this.props.onChange(this, ChangedCaseInput.EXIT)
        );
    }

    private onRemove(): void {
        this.props.onRemove(this);
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.state.operatorConfig.operands === 0) {
            if (this.state.exitName.trim().length === 0) {
                const { verboseName } = this.state.operatorConfig;

                errors.push(`A category name is required when using "${verboseName}."`);
            }
        } else {
            // Check our argument list.
            // If we have arguments, we need an exit name.
            if (hasArgs(this.state.arguments)) {
                if (!this.category || !this.category.state.value) {
                    errors.push('A category name is required.');
                }
            }

            // If we have an exit name we need arguments
            if (this.state.exitName) {
                if (!hasArgs(this.state.arguments)) {
                    const { verboseName } = this.state.operatorConfig;

                    errors.push(`When using "${verboseName}", an argument is required.`);
                }
            }

            // Validate numeric and date operators
            if (
                hasArgs(this.state.arguments) &&
                this.state.arguments[0].trim().indexOf('@') !== 0
            ) {
                if (this.state.operatorConfig.type.indexOf('number') > -1) {
                    if (this.state.arguments[0]) {
                        if (isNaN(parseInt(this.state.arguments[0], 10))) {
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

        if (this.state.errors.length === 0 && errors.length === 0) {
            return true;
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    private getArgsEle(): JSX.Element {
        if (this.state.operatorConfig && this.state.operatorConfig.operands > 0) {
            const value = this.state.arguments.length ? this.state.arguments[0] : '';
            const hasArgError: boolean = hasErrorType(this.state.errors, ['argument', 'rules']);

            return (
                <TextInputElement
                    data-spec="args-input"
                    name="arguments"
                    onChange={this.onChangeArguments}
                    value={value}
                    focus={this.props.focusArgsInput}
                    autocomplete={true}
                    ComponentMap={this.props.ComponentMap}
                    showInvalid={hasArgError}
                />
            );
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
            return (
                <div className={styles.removeIcon} onClick={this.onRemove}>
                    <span className="icon-remove" />
                </div>
            );
        }

        return null;
    }

    public render(): JSX.Element {
        const args: JSX.Element = this.getArgsEle();
        const dndIco: JSX.Element = this.getDndIco();
        const removeIco: JSX.Element = this.getRemoveIco();
        const hasExitError: boolean = hasErrorType(this.state.errors, ['category']);

        return (
            <FormElement
                data-spec="case-form"
                name={this.props.name}
                errors={this.state.errors}
                __className={styles.group}
                kase={true}>
                <div className={`${styles.kase} select-medium`}>
                    {dndIco}
                    <div className={styles.choice}>
                        <Select
                            data-spec="operator-list"
                            name="operator"
                            clearable={false}
                            options={this.context.operatorConfigList}
                            value={this.state.operatorConfig.type}
                            valueKey="type"
                            labelKey="verboseName"
                            optionClassName="operator"
                            searchable={false}
                            onChange={this.onChangeOperator}
                        />
                    </div>
                    <div className={styles.operand}>{args}</div>
                    <div className={styles.categorizeAs}>categorize as</div>
                    <div className={styles.category}>
                        <TextInputElement
                            ref={this.categoryRef}
                            data-spec="exit-input"
                            name="exitName"
                            onChange={this.onChangeExitName}
                            value={this.state.exitName}
                            focus={this.props.focusExitInput}
                            ComponentMap={this.props.ComponentMap}
                            showInvalid={hasExitError}
                        />
                    </div>
                    {removeIco}
                </div>
            </FormElement>
        );
    }
}
