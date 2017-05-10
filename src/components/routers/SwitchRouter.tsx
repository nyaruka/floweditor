import * as React from 'react';
import {CaseComp} from '../CaseComp';
import {SwitchRouterProps, CaseProps} from '../../interfaces';
import {NodeFormComp} from '../NodeFormComp';
var Select2 = require('react-select2-wrapper');
var UUID = require('uuid');

class SwitchRouterState {

}

export class SwitchRouterForm extends NodeFormComp<SwitchRouterProps, SwitchRouterState> {

    props: SwitchRouterProps

    onCaseChanged(c: CaseComp) {
        console.log("case changed", c, c.state);
    }

    renderForm(): JSX.Element {
        
        var cases: JSX.Element[] = [];
        this.props.cases.map((c: CaseProps) => {
            if (c.exit) {
                for (let exit of this.props.exits) {
                    if (exit.uuid == c.exit) {
                        c.exitProps = exit;
                        break;
                    }
                }
            }
            cases.push(<CaseComp onChanged={this.onCaseChanged.bind(this)} key={c.uuid} {...c}/>);
        });

        var newCaseUUID = UUID.v4()
        cases.push(<CaseComp onChanged={this.onCaseChanged.bind(this)} key={newCaseUUID} uuid={newCaseUUID} type="contains_any"/>)

        return (
            <div>
                <div className="lead-in">
                    If the message response..
                </div>
                <div>
                    {cases}
                </div>
            </div>
        )
    }
    
    validate(control: any): string {
        return null;
    }

    submit(form: HTMLFormElement) {}

}

export default SwitchRouterForm;