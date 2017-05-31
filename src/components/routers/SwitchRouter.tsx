import * as React from 'react';
import * as UUID from 'uuid';

//import {Case} from '../Case';
import { CaseElement, CaseElementProps } from '../form/CaseElement';
import { SwitchRouterProps, CaseProps, NodeProps, ExitProps } from '../../interfaces';
import { InputElement } from '../form/InputElement';
import { NodeForm } from '../NodeForm';
import { NodeModalProps } from '../NodeModal';
import { Config } from '../../services/Config';

import { DragDropContext } from 'react-dnd';


let HTML5Backend = require('react-dnd-html5-backend');
let update = require('immutability-helper');
var styles = require('./SwitchRouter.scss');

class SwitchRouterState {
    cases: CaseProps[]
    setName: boolean
}

/**
 * Given a set of cases and previous exits, determines correct merging of cases
 * and the union of exits
 * @param newCases 
 * @param previousExits 
 */
export function resolveExits(newCases: CaseProps[], previous: SwitchRouterProps): { cases: CaseProps[], exits: ExitProps[], defaultExit: string } {

    // create mapping of our old exit uuids to old exit settings
    var previousExitMap: { [uuid: string]: ExitProps } = {};
    for (let exit of previous.exits) {
        previousExitMap[exit.uuid] = exit
    }

    var exits: ExitProps[] = [];
    var cases: CaseProps[] = [];


    // map our new cases to an appropriate exit
    for (let kase of newCases) {

        // skip missing names
        if (kase.exitName.trim().length == 0) {
            continue;
        } else {

            // skip missing arguments
            let config = Config.get().getOperatorConfig(kase.type);
            if (config.operands == 1) {
                if (kase.arguments[0].trim().length == 0) {
                    continue;
                }
            }
        }

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

    return { cases: cases, exits: exits, defaultExit: defaultUUID };
}

export class SwitchRouterForm extends NodeForm<SwitchRouterProps, SwitchRouterState> {

    constructor(props: SwitchRouterProps) {
        super(props);

        var cases: CaseProps[] = [];
        if (this.props.cases) {
            cases = this.props.cases;
        }

        this.state = {
            cases: cases,
            setName: false
        }

        this.onCaseChanged = this.onCaseChanged.bind(this);
    }

    private onShowNameField() {
        this.setState({
            setName: true
        })
    }

    onCaseRemoved(c: CaseElement) {
        let idx = this.state.cases.findIndex((kase: CaseProps) => { return kase.uuid == c.props.uuid });
        var cases = update(this.state.cases, { $splice: [[idx, 1]] });
        this.setState({ cases: cases });
    }

    onCaseChanged(c: CaseElement) {
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
                cases = update(this.state.cases, { [idx]: { $set: newCase } });
                found = true;
                break;
            }
        }

        if (!found) {
            cases = update(this.state.cases, { $push: [newCase] });
        }

        this.setState({
            cases: cases
        })
    }

    renderForm(): JSX.Element {
        this.elements = [];
        var ref = this.ref.bind(this);

        var cases: JSX.Element[] = [];
        var needsEmpty = true;
        if (this.state.cases) {
            this.state.cases.map((c: CaseElementProps) => {

                // is this case empty?
                if ((!c.exitName || c.exitName.trim().length == 0) && (!c.arguments || c.arguments[0].trim().length == 0)) {
                    needsEmpty = false;
                }

                if (c.exit) {
                    for (let exit of this.props.exits) {
                        if (!c.exitName && exit.uuid == c.exit) {
                            c.exitName = exit.name;
                            break;
                        }
                    }
                }
                cases.push(<CaseElement
                    key={c.uuid}
                    ref={ref}
                    name="Case"
                    onRemove={this.onCaseRemoved.bind(this)}
                    onChanged={this.onCaseChanged.bind(this)}
                    moveCase={this.moveCase.bind(this)}
                    {...c}
                />);
            });
        }

        if (needsEmpty) {
            var newCaseUUID = UUID.v4()
            cases.push(<CaseElement
                onRemove={this.onCaseRemoved.bind(this)}
                name="Case"
                onChanged={this.onCaseChanged.bind(this)}
                ref={ref}
                key={newCaseUUID}
                uuid={newCaseUUID}
                exit={null}
                type="has_any_word"
            />);
        }

        var nameField = null;
        if (this.state.setName || this.props.name) {
            nameField = <InputElement
                ref={this.ref.bind(this)}
                name="Result Name"
                showLabel={true}
                value={this.props.name}
                helpText="By naming the result, you can reference it later using @run.results.whatever_the_name_is"
            />
        } else {
            nameField = <span className={styles.save_link} onClick={this.onShowNameField.bind(this)}>Save as..</span>
        }

        return (
            <div className={styles.switch}>
                <div className={styles.instructions}>
                    If the message response..
                </div>
                <div className={styles.cases}>
                    {cases}
                </div>

                <div className={styles.save_as}>
                    {nameField}
                </div>
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

    submit(modal: NodeModalProps) {
        const { cases, exits, defaultExit } = resolveExits(this.state.cases, this.props);

        var lastElement = this.elements[this.elements.length - 1];
        var optional = {}
        if (lastElement instanceof InputElement) {
            optional = {
                name: lastElement.state.value
            }
        }

        modal.onUpdateRouter({
            uuid: this.props.uuid,
            router: {
                type: "switch",
                default: defaultExit,
                cases: cases,
                operand: "@input",
                ...optional
            },
            wait: { type: "msg" },
            exits: exits
        } as NodeProps);
    }
}

export default DragDropContext(HTML5Backend)(SwitchRouterForm);
