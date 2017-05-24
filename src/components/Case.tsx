import * as React from 'react';
import * as UUID from 'uuid';
import * as Select from 'react-select';

import {CaseProps, Operator} from '../interfaces';
import {Config} from '../services/Config';

export interface CaseState {
    operator: string;
    arguments: string[];
    exitName: string;
}

/**
 * A single rule in the rule editor
 */
export class Case extends React.PureComponent<CaseProps, CaseState> {

    constructor(props: CaseProps) {
        super(props);
        var exitName = "";
        if (this.props.exitName) {
            exitName = this.props.exitName;
        }

        this.state = {
            operator: props.type,
            arguments: props.arguments,
            exitName: exitName
        }
    }

    private generateExitName(args: string[]): string {

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

    private getExitName(args: string[]) {
        var exitName = this.state.exitName;
        if (!exitName || exitName == this.generateExitName(this.props.arguments)) {
            exitName = this.generateExitName(args);
        }
        return exitName;
    }

    private onChangeOperator(val: Operator){
        this.setState({
            operator: val.type,
        }, () => {
            this.props.onChanged(this);
        });
    }

    private onChangeArguments(val: React.ChangeEvent<HTMLInputElement>) {
        var args = [val.target.value]
        this.setState({
            arguments: args,
            exitName: this.getExitName(args)
        }, ()=>{
            this.props.onChanged(this);
        });
    }

    private onChangeExitName(val: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            exitName: val.target.value
        }, () => {
            this.props.onChanged(this);
        });
    }

    render() {
        return (
            <div className="case">
                <div className="choice">
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
                <div className="operand form-group">
                    <input className="form-control" name="arguments" type="text" onChange={this.onChangeArguments.bind(this)} defaultValue={this.state.arguments}/>
                </div>
                <div className="categorize-as">
                    categorize as
                </div>
                <div className="category form-group">
                    <input className="form-control" name="exitName" type="text" onChange={this.onChangeExitName.bind(this)} value={this.state.exitName}/>
                </div>
            </div>
        );
    }
}