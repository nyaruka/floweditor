import * as React from 'react';
import * as UUID from 'uuid';

import {Case} from '../Case';
import {SwitchRouterProps, CaseProps} from '../../interfaces';
import {NodeForm} from '../NodeForm';
import {DragDropContext} from 'react-dnd';


let HTML5Backend = require('react-dnd-html5-backend');
let Select2 = require('react-select2-wrapper');
let update = require('immutability-helper');

class SwitchRouterState {
    cases: CaseProps[]
}

export class SwitchRouterForm extends NodeForm<SwitchRouterProps, SwitchRouterState> {

    constructor(props: SwitchRouterProps) {
        super(props);

        var cases: CaseProps[] = [];
        if (this.props.cases) {
            cases = this.props.cases;
        }

        this.state = {
            cases: cases
        }

        this.onCaseChanged = this.onCaseChanged.bind(this);
    }

    onCaseChanged(c: Case) {
        var cases = this.state.cases;
        var newCase: CaseProps = {
            uuid: c.props.uuid,
            type: c.state.operator,
            arguments: c.state.arguments,
            exitName: c.state.exitName
        }

        var found = false;
        for (var idx in this.state.cases) {
            var kase = this.state.cases[idx];
            if (kase.uuid == c.props.uuid) {
                cases = update(this.state.cases, {[idx]: {$set:newCase}});
                found = true;
                break;
            }
        }

        if (!found) {
            cases = update(this.state.cases, {$push:[newCase]});
        }

        this.setState({
            cases: cases
        })
    }

    renderForm(): JSX.Element {
        
        var cases: JSX.Element[] = [];
        if (this.state.cases){
            this.state.cases.map((c: CaseProps) => {
                if (c.exit) {
                    for (let exit of this.props.exits) {
                        if (exit.uuid == c.exit) {
                            c.exitName = exit.name;
                            break;
                        }
                    }
                }
                cases.push(<Case onChanged={this.onCaseChanged.bind(this)} key={c.uuid} {...c} moveCase={this.moveCase.bind(this)}/>);
            });
        }

        var newCaseUUID = UUID.v4()
        cases.push(<Case onChanged={this.onCaseChanged.bind(this)} key={newCaseUUID} uuid={newCaseUUID} type="has_any_word"/>)

        return (
            <div className="switch">
                <div className="lead-in">
                    If the message response..
                </div>
                <div>
                    {cases}
                </div>
                <div className="errors"/>
            </div>
        )
    }

    moveCase(dragIndex: number, hoverIndex: number) {
        const { cases } = this.state;
        const dragCase = cases[dragIndex];

        this.setState(update(this.state, {
            cards: {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragCase],
                ],
            },
        }));
    }
    
    validate(c: any): string {
        if (c.name == "exitName") {
            // look at our associated arguments to see if we are required
            var args = $(c).parents(".case").find(".operand input")[0] as HTMLInputElement;
            if (args.value.length > 0) {
                var control: HTMLInputElement = c;
                if (!control.value) {
                    return "a category name is required";
                }
            }
        }

        else if (c.name == "arguments") {
            var exitName = $(c).parents(".case").find(".category input")[0] as HTMLInputElement;
            if (exitName.value.length > 0) {
                var control: HTMLInputElement = c;
                if (!control.value) {
                    return "a rule value is required";
                }
            }
            
        }
        return null;
    }

    submit(form: HTMLFormElement) {

    }

}

export default DragDropContext(HTML5Backend)(SwitchRouterForm);
