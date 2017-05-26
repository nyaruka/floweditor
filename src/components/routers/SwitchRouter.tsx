import * as React from 'react';
import * as UUID from 'uuid';

import {Case} from '../Case';
import {SwitchRouterProps, CaseProps, NodeProps, ExitProps} from '../../interfaces';
import {NodeForm} from '../NodeForm';
import {NodeModalProps} from '../NodeModal';
import {DragDropContext} from 'react-dnd';

let HTML5Backend = require('react-dnd-html5-backend');
let update = require('immutability-helper');

class SwitchRouterState {
    cases: CaseProps[]
}

/**
 * Given a set of cases and previous exits, determines correct merging of cases
 * and the union of exits
 * @param newCases 
 * @param previousExits 
 */
export function resolveExits(newCases: CaseProps[], previous: SwitchRouterProps): { cases: CaseProps[], exits: ExitProps[], defaultExit: string} {

    // create mapping of our old exit uuids to old exit settings
    var previousExitMap: {[uuid:string]:ExitProps} = {};
    for (let exit of previous.exits) {
        previousExitMap[exit.uuid] = exit
    }

    var exits: ExitProps[] = [];
    var cases: CaseProps[] = [];

    // map our new cases to an appropriate exit
    for (let kase of newCases) {

        // see if we have a suitable exit for our case already
        var existingExit: ExitProps = null;

        // use our previous exit name if it isn't set
        if (!kase.exitName && kase.exit in previousExitMap) {
            kase.exitName = previousExitMap[kase.exit].name;
        }

        if (kase.exitName) {
            // look through our new exits to see if we've already created one
            for (let exit of exits) {
                if (kase.exitName && exit.name) {
                    if (exit.name.toLowerCase() == kase.exitName.trim().toLowerCase()) {
                        existingExit = exit;
                        break;
                    }
                }
            }

            // couldn't find a new exit, look through our old ones
            if (!existingExit) {
                // look through our previous cases for a match
                for (let exit of previous.exits) {
                    if (kase.exitName && exit.name) {
                        if (exit.name.toLowerCase() == kase.exitName.trim().toLowerCase()) {
                            existingExit = exit;
                            exits.push(existingExit);
                            break;
                        }
                    }            
                }
            }
        }

        // we found a suitable exit, point our case to it
        if (existingExit) {
            kase.exit = existingExit.uuid;
        }

        // no existing exit, create a new one
        else {
            
            // find our previous destination if we have one
            var destination = null;
            if (kase.exit in previousExitMap) {
                destination = previousExitMap[kase.exit].destination
            }

            kase.exit = UUID.v4();

            exits.push({
                name: kase.exitName,
                uuid: kase.exit,
                destination: destination
            });
        }
        
        // remove exitName from our case
        delete kase["exitName"];
        cases.push(kase);
    }

    // add in our default exit
    var defaultUUID = previous.default;
    if (!defaultUUID) {
        defaultUUID = UUID.v4();
    }

    var defaultName = "All Responses";
    if (exits.length > 0) {
        defaultName = "Other";
    }

    var defaultDestination = null;
    if (defaultUUID in previousExitMap) {
        defaultDestination = previousExitMap[defaultUUID].destination;
    }

    exits.push({
        uuid: defaultUUID,
        name: defaultName,
        destination: defaultDestination
    });

    return {cases: cases, exits: exits, defaultExit: defaultUUID};
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
            exit: c.props.exit,
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
                        if (!c.exitName && exit.uuid == c.exit) {
                            c.exitName = exit.name;
                            break;
                        }
                    }
                }
                cases.push(<Case onChanged={this.onCaseChanged.bind(this)} key={c.uuid} {...c} moveCase={this.moveCase.bind(this)}/>);
            });
        }

        var newCaseUUID = UUID.v4()
        cases.push(<Case onChanged={this.onCaseChanged.bind(this)} key={newCaseUUID} uuid={newCaseUUID} exit={null} type="has_any_word"/>)

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
        const {cases, exits, defaultExit} = resolveExits(this.state.cases, this.props);

        modal.onUpdateRouter({
            uuid: this.props.uuid,
            router: {
                type: "switch",
                default: defaultExit,
                cases: cases,
                operand: "@input",
            },
            wait: { type: "msg" },
            exits: exits
        } as NodeProps);
    }
}

export default DragDropContext(HTML5Backend)(SwitchRouterForm);
