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

import * as forms from './FormElement.scss';
import * as styles from './CaseElement.scss';

export interface CaseElementProps {
    name?: string; // satisfy form widget props
    onRemove?(c: CaseElement): void;
    ComponentMap?: ComponentMap;
    kase: Case;
    exitName: string;
    empty?: boolean;
    onChanged?(c: any, type?: ChangedCaseInput): void;
    focusArgsInput?: boolean;
    focusExitInput?: boolean;
    solo?: boolean;
}

interface CaseElementState {
    errors: string[];
    operator: string;
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
            return pre + firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        }
        return pre + firstArg.charAt(0).toUpperCase() + firstArg.slice(1);
    }
    return pre;
};

export const getExitName = (
    exitName: string,
    operator: string,
    operatorConfig: Operator,
    kase: Case,
    newArgList: string[] = []
): string => {
    // Don't reassign args
    let newExitName = exitName;
    // Some operators don't expect args
    if (newArgList.length) {
        if (!newExitName || newExitName === composeExitName(operator, kase.arguments)) {
            newExitName = composeExitName(operator, newArgList);
        }
    } else {
        // If the operator has a default category name, use that
        if (operatorConfig.categoryName) {
            ({ categoryName: newExitName } = operatorConfig);
        }
    }
    return newExitName;
};

export default class CaseElement extends React.Component<CaseElementProps, CaseElementState> {
    private category: TextInputElement;

    public static contextTypes = {
        operatorConfigList: operatorConfigListPT,
        getOperatorConfig: getOperatorConfigPT
    };

    public state: CaseElementState = {
        errors: [],
        operator: this.props.kase.type,
        arguments: this.props.kase.arguments,
        exitName: this.props.exitName ? this.props.exitName : ''
    };

    private operatorConfig: Operator = this.context.getOperatorConfig(this.props.kase.type);

    private onChangeOperator = (val: Operator): void => {
        this.operatorConfig = val;

        this.setState(
            {
                operator: val.type,
                exitName: getExitName(
                    this.state.exitName,
                    this.state.operator,
                    this.operatorConfig,
                    this.props.kase
                )
            },
            () => this.props.onChanged(this)
        );
    };

    private onChangeArguments = (val: React.ChangeEvent<HTMLTextElement>): void => {
        const args = [val.target.value];
        const exitName = getExitName(
            this.state.exitName,
            this.state.operator,
            this.operatorConfig,
            this.props.kase,
            args
        );

        // prettier-ignore
        this.setState(
            {
                arguments: args,
                exitName
            },
            () => {
                this.props.onChanged(this, ChangedCaseInput.ARGS);
                this.category.setState(
                    {
                        value: exitName
                    },
                    () => {
                        /** If the case doesn't have both an argument & an exit name, remove it */
                        if (!this.state.arguments[0] && !this.state.exitName) {
                            return this.remove();
                        }
                    }
                );
            }
        );
    };

    private onChangeExitName = (val: React.ChangeEvent<HTMLTextElement>): void =>
        this.setState(
            {
                exitName: val.target.value
            },
            () => this.props.onChanged(this, ChangedCaseInput.EXIT)
        );

    private remove = (ele?: any): void => this.props.onRemove(this);

    private hasArguments = (): boolean =>
        this.state.arguments &&
        this.state.arguments.length > 0 &&
        this.state.arguments[0].trim().length > 0;

    public validate(): boolean {
        const errors: string[] = [];

        if (this.operatorConfig.operands === 0) {
            if (this.state.exitName.trim().length === 0) {
                const { verboseName } = this.operatorConfig;
                errors.push(`A category name is required when using "${verboseName}"`);
            }
        } else {
            /**
             * Check our argument list
             * If we have arguments, we need an exit name
             */
            if (this.hasArguments()) {
                if (!this.category || !this.category.state.value) {
                    errors.push('A category name is required');
                }
            }

            /** If we have an exit name we need arguments */
            if (this.state.exitName) {
                if (!this.hasArguments()) {
                    const operator = this.context.getOperatorConfig(this.state.operator);
                    const { verboseName } = operator;
                    errors.push(`When using "${verboseName}", an argument is required.`);
                }
            }

            /** Validate numeric and date operators */
            if (this.hasArguments() && this.state.arguments[0].trim().indexOf('@') !== 0) {
                if (this.state.operator.indexOf('number') > -1) {
                    if (this.state.arguments[0]) {
                        if (isNaN(parseInt(this.state.arguments[0], 10))) {
                            errors.push('Enter a number when using numeric rules.');
                        }
                    }
                }

                if (this.state.operator.indexOf('date') > -1) {
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

    private getArgs(): JSX.Element {
        let args: JSX.Element = null;

        if (this.operatorConfig && this.operatorConfig.operands > 0) {
            const value = this.state.arguments ? this.state.arguments[0] : '';

            args = (
                <TextInputElement
                    data-spec="args-input"
                    name="arguments"
                    onChange={this.onChangeArguments}
                    value={value}
                    focus={this.props.focusArgsInput}
                    autocomplete={true}
                    ComponentMap={this.props.ComponentMap}
                />
            );
        }

        return args;
    }

    private getDndIco(): JSX.Element {
        let dndIco: JSX.Element = null;

        if (!this.props.empty && !this.props.solo) {
            dndIco = (
                <div className={styles.dndIcon}>
                    <span>&#8597;</span>
                </div>
            );
        } else {
            dndIco = <div style={{ display: 'inline-block', width: 15 }} />;
        }

        return dndIco;
    }

    private getRemoveIco(): JSX.Element {
        let removeButton: JSX.Element = null;

        if (!this.props.empty) {
            removeButton = (
                <div className={styles.removeButton} onClick={this.remove}>
                    <span className="icon-remove" />
                </div>
            );
        }

        return removeButton;
    }

    public render(): JSX.Element {
        const args: JSX.Element = this.getArgs();
        const dndIco: JSX.Element = this.getDndIco();
        const removeIco: JSX.Element = this.getRemoveIco();

        return (
            <FormElement
                data-spec="case-form"
                name={this.props.name}
                errors={this.state.errors}
                className={styles.kase}
                case={true}>
                <div className="select-medium">
                    {dndIco}
                    <div className={styles.choice}>
                        <Select
                            data-spec="operator-list"
                            name="operator"
                            clearable={false}
                            options={this.context.operatorConfigList}
                            value={this.state.operator}
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
                            ref={ele => (this.category = ele)}
                            data-spec="exit-input"
                            name="exitName"
                            onChange={this.onChangeExitName}
                            value={this.state.exitName}
                            focus={this.props.focusExitInput}
                            ComponentMap={this.props.ComponentMap}
                        />
                    </div>
                    {removeIco}
                </div>
            </FormElement>
        );
    }
}
