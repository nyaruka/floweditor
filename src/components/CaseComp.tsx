import * as React from 'react';
import {CaseProps, Operator} from '../interfaces';
import {Config} from '../services/Config';

var UUID = require('uuid');
var Select = require('react-select');

export interface CaseState {
    selected: string;
}

/**
 * A single rule in the rule editor
 */
export class CaseComp extends React.PureComponent<CaseProps, CaseState> {

    constructor(props: CaseProps) {
        super(props);
        this.state = {
            selected: props.type
        }
    }

    private onChange(val: Operator){
        this.setState({
            selected: val.type
        });

        this.props.onChanged(this);
    }

    render() {
        return (
            <div className="case">
                <div className="choice">
                    <Select
                        name="operator"
                        clearable={false}
                        options={Config.get().operators}
                        value={this.state.selected}                        
                        valueKey="type"
                        labelKey="verboseName"
                        optionClassName="operator"
                        searchable={false}
                        onChange={this.onChange.bind(this)}
                    />
                </div>
                <div className="operand">
                    <input type="text" defaultValue={this.props.arguments}/>
                </div>
                <div className="categorize-as">
                    categorize as
                </div>
                <div className="category">
                    <input type="text" defaultValue={this.props.exitProps ? this.props.exitProps.name : ""}/>
                </div>
            </div>
        );
    }
}