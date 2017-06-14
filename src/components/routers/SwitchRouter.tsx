import * as React from 'react';
import * as UUID from 'uuid';

//import {Case} from '../Case';
import { CaseElement, CaseElementProps } from '../form/CaseElement';
import { NodeProps } from '../Node';
import { TextInputElement, HTMLTextElement } from '../form/TextInputElement';
import { NodeForm } from '../NodeForm';
import { NodeEditorProps, NodeModal } from '../NodeModal';
import { Config } from '../../services/Config';
import { Node, SwitchRouter, Exit, Case, UINode, Action } from '../../FlowDefinition';

import { DragDropContext } from 'react-dnd';


let HTML5Backend = require('react-dnd-html5-backend');
let update = require('immutability-helper');
var styles = require('./SwitchRouter.scss');

export class SwitchRouterState {
    cases: CaseProps[]
    resultName: string;
    setResultName: boolean
    operand: string;
}

export interface CaseProps {
    kase: Case;

    exitName: string;
    onChanged: Function;
    moveCase: Function;
}

export interface CombinedExits {
    cases: Case[];
    exits: Exit[];
    defaultExit: string;
}
/**
 * Given a set of cases and previous exits, determines correct merging of cases
 * and the union of exits
 * @param newCases 
 * @param previousExits 
 */
export function resolveExits(newCases: CaseProps[], previous: SwitchRouterProps): CombinedExits {

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

        // see if we have a suitable exit for our case already
        var existingExit: Exit = null;

        // use our previous exit name if it isn't set
        if (!props.exitName && props.kase.exit_uuid in previousExitMap) {
            props.exitName = previousExitMap[props.kase.exit_uuid].name;
        }

        // ignore cases with empty names
        if (!props.exitName || props.exitName.trim().length == 0) {
            continue;
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
                if (previous.exits) {
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
        }

        // we found a suitable exit, point our case to it
        if (existingExit) {
            props.kase.exit_uuid = existingExit.uuid;
        }

        // no existing exit, create a new one
        else {

            // find our previous destination if we have one
            var destination = null;
            if (props.kase.exit_uuid in previousExitMap) {
                destination = previousExitMap[props.kase.exit_uuid].destination_node_uuid
            }

            props.kase.exit_uuid = UUID.v4();

            exits.push({
                name: props.exitName,
                uuid: props.kase.exit_uuid,
                destination_node_uuid: destination
            });
        }

        // remove exitName from our case
        cases.push(props.kase);
    }

    // add in our default exit
    var defaultUUID = UUID.v4();
    if (previous.router && previous.router.default_exit_uuid) {
        defaultUUID = previous.router.default_exit_uuid;
    }

    var defaultName = "All Responses";
    if (exits.length > 0) {
        defaultName = "Other";
    }

    var defaultDestination = null;
    if (defaultUUID in previousExitMap) {
        defaultDestination = previousExitMap[defaultUUID].destination_node_uuid;
    }

    exits.push({
        uuid: defaultUUID,
        name: defaultName,
        destination_node_uuid: defaultDestination
    });

    return { cases: cases, exits: exits, defaultExit: defaultUUID };
}

export interface SwitchRouterProps extends NodeEditorProps {
    action: Action;
    router: SwitchRouter;
    exits: Exit[];
}

export class SwitchRouterForm<P extends SwitchRouterProps, S extends SwitchRouterState> extends NodeForm<P, S> {

    constructor(props: P) {
        super(props);

        var cases: CaseProps[] = [];

        if (this.props.router && this.props.router.cases) {
            for (let kase of this.props.router.cases) {

                var exitName = null;
                if (kase.exit_uuid) {
                    var exit = this.props.exits.find((exit) => { return exit.uuid == kase.exit_uuid });
                    if (exit) {
                        exitName = exit.name;
                    }
                }

                try {
                    var config = Config.get().getOperatorConfig(kase.type);
                    cases.push({
                        kase: kase,
                        exitName: exitName,
                        onChanged: this.onCaseChanged.bind(this),
                        moveCase: this.moveCase.bind(this)
                    });
                } catch (error) {
                    // ignore missing cases
                }
            }
        }


        var resultName = "";
        if (this.props.router) {
            resultName = this.props.router.result_name;
        }

        var operand = "@input";
        if (this.props.router && this.props.router.operand) {
            operand = this.props.router.operand;
        }

        this.state = {
            cases: cases,
            setResultName: false,
            resultName: resultName,
            operand: operand
        } as S

        this.onCaseChanged = this.onCaseChanged.bind(this);
        this.onExpressionChanged = this.onExpressionChanged.bind(this);
    }

    private onShowNameField() {
        this.setState({
            setResultName: true
        })
    }

    onExpressionChanged(event: React.SyntheticEvent<HTMLTextElement>) {
        this.setState({
            operand: event.currentTarget.value
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
                exit_uuid: c.props.kase.exit_uuid,
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
                    exit_uuid: null
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
        if (this.state.setResultName || this.state.resultName) {
            nameField = <TextInputElement
                ref={this.ref.bind(this)}
                name="Result Name"
                showLabel={true}
                defaultValue={this.state.resultName}
                helpText="By naming the result, you can reference it later using @run.results.whatever_the_name_is"
            />
        } else {
            nameField = <span className={styles.save_link} onClick={this.onShowNameField.bind(this)}>Save as..</span>
        }

        var leadIn = null;

        if (this.props.config.type == "wait_for_response") {
            leadIn = (
                <div className={styles.instructions}>
                    If the message response..
                </div>
            );
        }

        else if (this.props.config.type == "expression") {
            leadIn = (
                <div className={styles.instructions}>
                    <p>If the expression..</p>
                    <TextInputElement
                        ref={this.ref.bind(this)}
                        key={"expression_" + this.props.uuid}
                        name="Expression"
                        showLabel={false}
                        defaultValue={this.state.operand}
                        onChange={this.onExpressionChanged}
                        autocomplete
                        required
                    />
                </div>
            )
        }

        return (
            <div className={styles.switch}>
                {leadIn}
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

    submit(modal: NodeModal) {
        const { cases, exits, defaultExit } = resolveExits(this.state.cases, this.props);
        var lastElement = this.elements[this.elements.length - 1];
        var optionalRouter = {}
        if (lastElement instanceof TextInputElement) {
            optionalRouter = {
                result_name: lastElement.state.value
            }
        }

        var optionalNode = {}
        if (this.props.config.type == "wait_for_response") {
            optionalNode = {
                wait: { type: "msg" }
            }
        }

        var router: SwitchRouter = {
            type: "switch",
            default_exit_uuid: defaultExit,
            cases: cases,
            operand: this.state.operand,
            ...optionalRouter
        }

        modal.onUpdateRouter({
            uuid: this.props.uuid,
            router: router,
            exits: exits,
            ...optionalNode
        }, this.props.config.type);
    }
}

export default DragDropContext(HTML5Backend)(SwitchRouterForm);
