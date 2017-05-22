import * as React from 'react';
import * as UUID from 'uuid';

import {Case} from '../Case';
import {SwitchRouterProps, CaseProps, NodeProps, ExitProps} from '../../interfaces';
import {NodeForm} from '../NodeForm';
import {NodeModalProps} from '../NodeModal';
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

        // TODO: lots of smelliness here, may want to take a more reacty approach to validation
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
            var control: HTMLInputElement = c;
            var exitName = $(c).parents(".case").find(".category input")[0] as HTMLInputElement;
            if (exitName.value.length > 0) {
                if (!control.value) {
                    return "a rule value is required";
                }
            }

            // check dates and numbers if we aren't a variable
            if (c.value.trim()[0] != "@") {
                var operator = $(c).parents(".case").find(".choice input")[0] as HTMLInputElement;
                if (operator.value.indexOf("number") > -1) {
                    if (isNaN(parseInt(c.value))) {
                        return "enter a number when using numeric rules";
                    }
                } else if (operator.value.indexOf("date") > -1)  {
                    if (isNaN(Date.parse(c.value))) {
                        return "enter a date when using date rules (e.g. 1/1/2017)";
                    }
                }
            }
        }
        return null;
    }

    submit(form: HTMLFormElement, modal: NodeModalProps) {
        var exits: ExitProps[] = [];
        var cases: CaseProps[] = [];

        for (let kase of this.state.cases) {
            var found = false;
            if (this.props.exits) {
                for (let exit of this.props.exits) {
                    if (exit.name.toLowerCase() == kase.exitName.toLowerCase()) {
                        exits.push(exit);
                        kase.exit = exit.uuid;
                        found = true;
                        break;
                    }
                }
            }

            // couldnt find an exit, add a new one
            if (!found) {
                var exitUUID = UUID.v4();
                exits.push({
                    uuid: exitUUID,
                    name: kase.exitName
                });
                kase.exit = exitUUID;
            }

            cases.push({
                uuid: kase.uuid,
                arguments: kase.arguments,
                type: kase.type,
                exit: kase.exit
            });
        }

        modal.onUpdateRouter({
            uuid: this.props.uuid,
            router: { 
                type: "switch",
                cases: cases,
                operand: "@input.text"
            },
            exits: exits
        } as NodeProps);
    }
}

export default DragDropContext(HTML5Backend)(SwitchRouterForm);
