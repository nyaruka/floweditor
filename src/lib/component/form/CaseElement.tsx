import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import Select from 'react-select';
import { v4 as generateUUID } from 'uuid';
import ComponentMap from '../../services/ComponentMap';
import { Case } from '../../flowTypes';
import { ChangedCaseInput } from '../routers/SwitchRouter';
import { Type, Operator, getOperatorConfig, operatorConfigList } from '../../config';
import TextInputElement, { HTMLTextElement } from './TextInputElement';
import { jsonEqual, titleCase, hasErrorType } from '../../utils';
import FormElement from './FormElement';

import * as forms from './FormElement.scss';
import * as styles from './CaseElement.scss';

export interface CaseElementProps {
    kase: Case;
    exitName: string;
    config: Type;
    name?: string; // satisfy form widget props
    onRemove?(c: CaseElement): void;
    ComponentMap?: ComponentMap;
    empty?: boolean;
    onChange?: (c: any, type?: ChangedCaseInput) => void;
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

export const composeExitName = (
    operator: string,
    newArgList: string[]
): string => {
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

export default class CaseElement extends React.Component<
    CaseElementProps,
    CaseElementState
> {
    private category: TextInputElement;
    private operatorConfig: Operator;

    constructor(props: CaseElementProps) {
        super(props);

        const operatorConfig = getOperatorConfig(this.props.kase.type);
        const args = this.props.kase.arguments || [];
        const exitName = this.props.exitName || '';

        this.state = {
            errors: [],
            operatorConfig,
            arguments: args,
            exitName
        };

        bindCallbacks(this, {
            include: [
                'onCategoryRef',
                'onChangeOperator',
                'onChangeArguments',
                'onChangeExitName',
                'onRemove',
                'validate'
            ]
        });
    }

    private onCategoryRef(ref: TextInputElement): TextInputElement {
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
                () =>
                    this.category.setState({ value: exitName }, () =>
                        this.props.onChange(this)
                    )
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

        // If the case doesn't expect arguments
        if (this.state.operatorConfig.operands === 0) {
            if (this.state.exitName.trim().length === 0) {
                const { verboseName } = this.state.operatorConfig;

                errors.push(
                    `A category name is required when using "${verboseName}."`
                );
            }
        } else {
            // If we have an exit name we need arguments
            if (this.state.exitName) {
                if (!hasArgs(this.state.arguments)) {
                    const { verboseName } = this.state.operatorConfig;

                    errors.push(
                        `When using "${verboseName}", an argument is required.`
                    );
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
                            errors.push(
                                'Enter a number when using numeric rules.'
                            );
                        }
                    }
                }

                if (this.state.operatorConfig.type.indexOf('date') > -1) {
                    if (this.state.arguments[0]) {
                        if (isNaN(Date.parse(this.state.arguments[0]))) {
                            errors.push(
                                'Enter a date when using date rules (e.g. 1/1/2017).'
                            );
                        }
                    }
                }
            }

            // Check our argument list.
            // If we have arguments, we need an exit name.
            if (hasArgs(this.state.arguments)) {
                if (!this.category || !this.category.state.value) {
                    errors.push('A category name is required.');
                }
            }
        }

        if (this.state.errors.length === 0 && errors.length === 0) {
            return true;
        } else {
            this.setState({ errors });

            return errors.length === 0;
        }
    }

    private getArgsEle(): JSX.Element {
        if (
            this.state.operatorConfig &&
            this.state.operatorConfig.operands > 0
        ) {
            const value = this.state.arguments.length
                ? this.state.arguments[0]
                : '';
            const hasArgError: boolean = hasErrorType(this.state.errors, [
                'argument',
                'rules'
            ]);

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
                    config={this.props.config}
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
        const kaseError: boolean = this.state.errors.length > 0;
        const hasExitError: boolean = hasErrorType(this.state.errors, [
            'category'
        ]);

        return (
            <FormElement
                data-spec="case-form"
                name={this.props.name}
                errors={this.state.errors}
                __className={styles.group}
                kaseError={kaseError}>
                <div className={`${styles.kase} select-medium`}>
                    {dndIco}
                    <div className={styles.choice}>
                        <Select
                            data-spec="operator-list"
                            name="operator"
                            clearable={false}
                            options={operatorConfigList}
                            value={this.state.operatorConfig}
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
                            ref={this.onCategoryRef}
                            data-spec="exit-input"
                            name="exitName"
                            onChange={this.onChangeExitName}
                            value={this.state.exitName}
                            focus={this.props.focusExitInput}
                            ComponentMap={this.props.ComponentMap}
                            showInvalid={hasExitError}
                            config={this.props.config}
                        />
                    </div>
                    {removeIco}
                </div>
            </FormElement>
        );
    }
}
