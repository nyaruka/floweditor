import * as React from 'react';
import * as UUID from 'uuid';

//import {Case} from '../Case';
import { CaseElement, CaseElementProps } from '../form/CaseElement';
import { NodeProps } from '../Node';
import { InputElement } from '../form/InputElement';
import { NodeForm } from '../NodeForm';
import { NodeEditorProps, NodeModalProps } from '../NodeModal';
import { Config } from '../../services/Config';
import { SwitchRouter, Exit, Case } from '../../FlowDefinition';

import { DragDropContext } from 'react-dnd';


let HTML5Backend = require('react-dnd-html5-backend');
let update = require('immutability-helper');
var styles = require('./SwitchRouter.scss');

class SwitchRouterState {
    cases: CaseProps[]
    name: string;
    setName: boolean
}

export interface CaseProps {
    kase: Case;

    exitName: string;
    onChanged: Function;
    moveCase: Function;
}

/**
 * Given a set of cases and previous exits, determines correct merging of cases
 * and the union of exits
 * @param newCases 
 * @param previousExits 
 */
export function resolveExits(newCases: CaseProps[], previous: SwitchRouterProps): { cases: Case[], exits: Exit[], defaultExit: string } {

    // create mapping of our old exit uuids to old exit settings
    var previousExitMap: { [uuid: string]: Exit } = {};
    if (previous.exits) {
        for (let exit of previous.exits) {
            previousExitMap[exit.uuid] = exit
        }
    }

    var exits: Exit[] = [];
    var cases: Case[] = [];


    // map our new cases to an appropriate exit
    for (let props of newCases) {

        // skip missing names
        /*if (!kase.exitName || kase.exitName.trim().length == 0) {
            continue;
        } else {
            // skip missing arguments
            if (kase.type) {
                let config = Config.get().getOperatorConfig(kase.type);
                if (config.operands == 1) {
                    if (!kase.arguments || kase.arguments[0].trim().length == 0) {
                        continue;
                    }
                }
            }
        }*/

        // see if we have a suitable exit for our case already
        var existingExit: Exit = null;

        // use our previous exit name if it isn't set
        if (!props.exitName && props.kase.exit in previousExitMap) {
            props.exitName = previousExitMap[props.kase.exit].name;
        }

        if (props.exitName) {
            // look through our new exits to see if we've already created one
            for (let exit of exits) {
                if (props.exitName && exit.name) {
                    if (exit.name.toLowerCase() == props.exitName.trim().toLowerCase()) {
                        existingExit = exit;
                        break;
                    }
                }
            }

            // couldn't find a new exit, look through our old ones
            if (!existingExit) {
                // look through our previous cases for a match
                for (let exit of previous.exits) {
                    if (props.exitName && exit.name) {
                        if (exit.name.toLowerCase() == props.exitName.trim().toLowerCase()) {
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
            props.kase.exit = existingExit.uuid;
        }

        // no existing exit, create a new one
        else {

            // find our previous destination if we have one
            var destination = null;
            if (props.kase.exit in previousExitMap) {
                destination = previousExitMap[props.kase.exit].destination
            }

            props.kase.exit = UUID.v4();

            exits.push({
                name: props.exitName,
                uuid: props.kase.exit,
                destination: destination
            });
        }

        // remove exitName from our case
        cases.push(props.kase);
    }

    // add in our default exit
    var defaultUUID = UUID.v4();
    if (previous.router && previous.router.default) {
        defaultUUID = previous.router.default;
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

export interface SwitchRouterProps extends NodeEditorProps {
    router: SwitchRouter;
    exits: Exit[];
}

export class SwitchRouterForm extends NodeForm<SwitchRouterProps, SwitchRouterState> {

    constructor(props: SwitchRouterProps) {
        super(props);

        var cases: CaseProps[] = [];

        if (this.props.router && this.props.router.cases) {
            for (let kase of this.props.router.cases) {

                var exitName = null;
                if (kase.exit) {
                    var exit = this.props.exits.find((exit) => { return exit.uuid == kase.exit });
                    if (exit) {
                        exitName = exit.name;
                    }
                }
                cases.push({
                    kase: kase,
                    exitName: exitName,
                    onChanged: this.onCaseChanged.bind(this),
                    moveCase: this.moveCase.bind(this)
                });
            }
        }

        var name = "";
        if (this.props.router) {
            name = this.props.router.name;
        }

        this.state = {
            cases: cases,
            setName: false,
            name: name
        }

        this.onCaseChanged = this.onCaseChanged.bind(this);
    }

    private onShowNameField() {
        this.setState({
            setName: true
        })
    }

    onCaseRemoved(c: CaseElement) {
        let idx = this.state.cases.findIndex((props: CaseProps) => { return props.kase.uuid == c.props.kase.uuid });
        if (idx > -1) {
            var cases = update(this.state.cases, { $splice: [[idx, 1]] });
            this.setState({ cases: cases });
        }
    }

    onCaseChanged(c: CaseElement) {
        var cases = this.state.cases;
        var newCase: CaseProps = {
            kase: {
                uuid: c.props.kase.uuid,
                type: c.state.operator,
                exit: c.props.kase.exit,
                arguments: c.state.arguments,
            },
            onChanged: c.props.onChanged,
            moveCase: c.props.moveCase,
            exitName: c.state.exitName
        }

        var found = false;
        for (var idx in this.state.cases) {
            var props = this.state.cases[idx];
            if (props.kase.uuid == c.props.kase.uuid) {
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
            this.state.cases.map((c: CaseProps) => {

                // is this case empty?
                if ((!c.exitName || c.exitName.trim().length == 0) && (!c.kase.arguments || c.kase.arguments[0].trim().length == 0)) {
                    needsEmpty = false;
                }

                cases.push(<CaseElement
                    key={c.kase.uuid}
                    kase={c.kase}
                    ref={ref}
                    name="Case"
                    exitName={c.exitName}
                    onRemove={this.onCaseRemoved.bind(this)}
                    onChanged={this.onCaseChanged.bind(this)}
                    moveCase={this.moveCase.bind(this)}
                />);
            });
        }

        if (needsEmpty) {
            var newCaseUUID = UUID.v4()
            cases.push(<CaseElement
                kase={{
                    uuid: newCaseUUID,
                    type: "has_any_word",
                    exit: null
                }}

                key={newCaseUUID}
                ref={ref}
                name="Case"
                exitName={null}
                onRemove={this.onCaseRemoved.bind(this)}
                moveCase={this.moveCase.bind(this)}
                onChanged={this.onCaseChanged.bind(this)}

            />);
        }

        var nameField = null;
        if (this.state.setName || this.state.name) {
            nameField = <InputElement
                ref={this.ref.bind(this)}
                name="Result Name"
                showLabel={true}
                value={this.state.name}
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
        });
    }
}

export default DragDropContext(HTML5Backend)(SwitchRouterForm);
