import * as React from 'react';
import Select from 'react-select';
import { v4 as generateUUID } from 'uuid';
import { titleCase } from '../../helpers/utils';
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
    // Don't reassign args
    let newExitName = exitName;
    // Some operators don't expect args
    if (newArgList.length) {
        if (!newExitName || newExitName === composeExitName(operatorConfig.type, kase.arguments)) {
            newExitName = composeExitName(operatorConfig.type, newArgList);
        }
    } else {
        // If the operator has a default category name, use that
        if (operatorConfig.categoryName) {
            ({ categoryName: newExitName } = operatorConfig);
        }
    }
    return newExitName;
};

export const hasArgs = (args: string[] = []): boolean =>
    args.length > 0 && args[0].trim().length > 0;

export const getArgsEle = (
    operatorConfig: Operator,
    args: string[],
    onChangeArguments: (val: React.ChangeEvent<HTMLTextElement>) => void,
    focusArgsInput: boolean,
    ComponentMap: ComponentMap
): JSX.Element => {
    let argsEl: JSX.Element = null;

    if (operatorConfig && operatorConfig.operands > 0) {
        const value = hasArgs(args) ? args[0] : '';

        argsEl = (
            <TextInputElement
                data-spec="args-input"
                name="arguments"
                onChange={onChangeArguments}
                value={value}
                focus={focusArgsInput}
                autocomplete={true}
                ComponentMap={ComponentMap}
            />
        );
    }

    return argsEl;
};

export const getDndIco = (empty: boolean = false, solo: boolean = false): JSX.Element => {
    let dndIco: JSX.Element = null;

    if (!empty && !solo) {
        dndIco = (
            <div className={styles.dndIcon}>
                <span>&#8597;</span>
            </div>
        );
    } else {
        dndIco = <div style={{ display: 'inline-block', width: 15 }} />;
    }

    return dndIco;
};

export const getRemoveIco = (empty: boolean = false): JSX.Element => {
    let removeIcon: JSX.Element = null;

    if (!empty) {
        removeIcon = (
            <div className={styles.removeIcon} onClick={this.remove}>
                <span className="icon-remove" />
            </div>
        );
    }

    return removeIcon;
};

export default class CaseElement extends React.Component<CaseElementProps, CaseElementState> {
    private category: TextInputElement;

    public static contextTypes = {
        operatorConfigList: operatorConfigListPT,
        getOperatorConfig: getOperatorConfigPT
    };

    public state: CaseElementState = {
        errors: [],
        operatorConfig: this.context.getOperatorConfig(this.props.kase.type),
        arguments: this.props.kase.arguments,
        exitName: this.props.exitName ? this.props.exitName : ''
    };

    private onChangeOperator = (val: Operator): void => {
        this.setState(
            {
                operatorConfig: val,
                exitName: getExitName(
                    this.state.exitName,
                    val,
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
            this.state.operatorConfig,
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

    public validate(): boolean {
        const errors: string[] = [];

        if (this.state.operatorConfig.operands === 0) {
            if (this.state.exitName.trim().length === 0) {
                const { verboseName } = this.state.operatorConfig;
                errors.push(`A category name is required when using "${verboseName}"`);
            }
        } else {
            /**
             * Check our argument list
             * If we have arguments, we need an exit name
             */
            if (hasArgs(this.state.arguments)) {
                if (!this.category || !this.category.state.value) {
                    errors.push('A category name is required');
                }
            }

            /** If we have an exit name we need arguments */
            if (this.state.exitName) {
                if (!hasArgs(this.state.arguments)) {
                    const { verboseName } = this.state.operatorConfig;
                    errors.push(`When using "${verboseName}", an argument is required.`);
                }
            }

            /** Validate numeric and date operators */
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

    public render(): JSX.Element {
        const args: JSX.Element = getArgsEle(
            this.state.operatorConfig,
            this.state.arguments,
            this.onChangeArguments,
            this.props.focusArgsInput,
            this.props.ComponentMap
        );
        const dndIco: JSX.Element = getDndIco(this.props.empty, this.props.solo);
        const removeIco: JSX.Element = getRemoveIco(this.props.empty);

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
