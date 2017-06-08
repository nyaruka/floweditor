import * as React from "react";

import { FormElement, FormElementProps } from './FormElement';
import { FormWidget, FormValueState } from './FormWidget';
import { Config, Operator } from '../../services/Config';
import { CaseProps } from '../routers/SwitchRouter';
import { TextInputElement, HTMLTextElement } from './TextInputElement';

var Select = require('react-select');
var forms = require("./FormElement.scss");
var styles = require("./CaseElement.scss");

export interface CaseElementProps extends CaseProps {
    name: string; // satisfy form widget props
    onRemove(c: CaseElement): void;
}

interface CaseElementState extends FormValueState {
    operator: string;
    arguments: string[];
    exitName: string;
}

export class CaseElement extends FormWidget<CaseElementProps, CaseElementState> {

    private category: TextInputElement;
    private operatorConfig: Operator;

    constructor(props: CaseElementProps) {
        super(props);

        var exitName = "";
        if (this.props.exitName) {
            exitName = this.props.exitName;
        }

        this.hasArguments = this.hasArguments.bind(this);
        this.operatorConfig = Config.get().getOperatorConfig(props.kase.type);
        this.state = {
            errors: [],
            operator: props.kase.type,
            arguments: props.kase.arguments,
            exitName: exitName
        }
    }

    private generateExitNameFromArguments(args: string[]): string {

        var prefix = "";
        if (this.state.operator.indexOf("_lt") > -1) {
            if (this.state.operator.indexOf("date") > -1) {
                prefix = "Before ";
            } else {
                if (this.state.operator.indexOf("lte") > -1) {
                    prefix = "<= ";
                } else {
                    prefix = "< "
                }
            }
        } else if (this.state.operator.indexOf("_gt") > -1) {
            if (this.state.operator.indexOf("date") > -1) {
                prefix = "After ";
            } else {
                if (this.state.operator.indexOf("gte") > -1) {
                    prefix = ">= ";
                } else {
                    prefix = ">";
                }
            }
        }

        if (args && args.length > 0) {
            var words = args[0].match(/\w+/g);
            if (words && words.length > 0) {
                var firstWord = words[0];
                return prefix + firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
            }
            return prefix + args[0].charAt(0).toUpperCase() + args[0].slice(1);
        }

        return null;
    }

    private getExitName(args: string[] = null) {
        var exitName = this.state.exitName;
        if (args == null) {
            // if the category name is specified for our operator, use that
            if (this.operatorConfig.categoryName) {
                exitName = this.operatorConfig.categoryName;
            }
        } else {
            if (!exitName || exitName == this.generateExitNameFromArguments(this.props.kase.arguments)) {
                exitName = this.generateExitNameFromArguments(args);
            }
        }
        return exitName;
    }

    private onChangeOperator(val: Operator) {
        this.operatorConfig = val;
        this.setState({
            operator: val.type,
            exitName: this.getExitName(),
        }, () => {
            this.props.onChanged(this);
        });
    }

    private onChangeArguments(val: React.ChangeEvent<HTMLTextElement>) {
        var args = [val.target.value]
        this.setState({
            arguments: args,
            exitName: this.getExitName(args)
        }, () => {
            this.props.onChanged(this);
        });

    }

    private onChangeExitName(val: React.ChangeEvent<HTMLTextElement>) {
        this.setState({
            exitName: val.target.value
        }, () => {
            this.props.onChanged(this);
        });
    }

    private onRemove(ele: any) {
        this.props.onRemove(this);
    }

    hasArguments(): boolean {
        return this.state.arguments && this.state.arguments.length > 0 && this.state.arguments[0].trim().length > 0;
    }

    validate(): boolean {

        var errors: string[] = [];

        if (this.operatorConfig.operands == 0) {
            if (this.state.exitName.trim().length == 0) {
                errors.push("A category name is required when using \"" + this.operatorConfig.verboseName + "\"");
            }
        }

        // check our argument list
        else {

            // if we have arguments, we need an exit name
            if (this.hasArguments()) {
                if (!this.category.state.value) {
                    errors.push("A category name is required.");
                }
            }

            // if we have an exit name we need arguments
            if (this.state.exitName) {
                if (!this.hasArguments()) {
                    var operator = Config.get().getOperatorConfig(this.state.operator);
                    errors.push("When using \"" + operator.verboseName + "\", an argument is required.");
                }
            }

            // validate numeric and date operators
            if (this.hasArguments() && this.state.arguments[0].trim().indexOf("@") != 0) {
                if (this.state.operator.indexOf("number") > -1) {
                    if (this.state.arguments[0]) {
                        if (isNaN(parseInt(this.state.arguments[0]))) {
                            errors.push("Enter a number when using numeric rules.");
                        }
                    }
                }

                if (this.state.operator.indexOf("date") > -1) {
                    if (this.state.arguments[0]) {
                        if (isNaN(Date.parse(this.state.arguments[0]))) {
                            errors.push("Enter a date when using date rules (e.g. 1/1/2017).");
                        }
                    }
                }
            }
        }

        this.setState({ errors: errors });
        return errors.length == 0;
    }

    render() {
        var classes = [styles.case];
        if (this.state.errors.length > 0) {
            classes.push(forms.invalid);
        }

        var value = this.state.arguments ? this.state.arguments[0] : "";

        var args: JSX.Element = null;
        if (this.operatorConfig.operands == 1) {
            args = <TextInputElement className={styles.input} name="arguments" onChange={this.onChangeArguments.bind(this)} defaultValue={value} autocomplete />
        }

        return (
            <FormElement name={this.props.name} errors={this.state.errors} className={styles.group}>
                <div className={styles.case + " select-small"}>
                    <div className={styles.choice}>
                        <Select
                            name="operator"
                            clearable={false}
                            options={Config.get().operators}
                            value={this.state.operator}
                            valueKey="type"
                            labelKey="verboseName"
                            optionClassName="operator"
                            searchable={false}
                            onChange={this.onChangeOperator.bind(this)}
                        />
                    </div>
                    <div className={styles.operand}>
                        {args}
                    </div>
                    <div className={styles["categorize-as"]}>
                        categorize as
                    </div>
                    <div className={styles.category}>
                        <TextInputElement ref={(ele) => this.category = ele} className={styles.input} name="exitName" onChange={this.onChangeExitName.bind(this)} defaultValue={this.state.exitName} />
                    </div>
                    <div className={styles["remove-button"]} onMouseUp={this.onRemove.bind(this)}><span className="icon-remove" /></div>
                </div>
            </FormElement>
        )
    }
}
