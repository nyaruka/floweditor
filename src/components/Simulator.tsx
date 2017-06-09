import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import * as update from 'immutability-helper';
import * as urljoin from 'url-join';
import * as ReactDOM from 'react-dom';

import { Modal } from './Modal';
import { FlowStore } from '../services/FlowStore';
import { Plumber } from '../services/Plumber';
import { External, FlowDetails } from '../services/External';
import { FlowDefinition, Group } from '../FlowDefinition';
import { ActivityManager, Activity } from "../services/ActivityManager";

var styles = require("./Simulator.scss");

const ACTIVE = "A";

interface Message {
    text: string;
    inbound: boolean;
}

interface SimulatorProps {
    engineURL: string;
    external: External;
    flowUUID: string;
    showDefinition(definition: FlowDefinition): void;
}

interface SimulatorState {
    visible: boolean;
    session?: Session;
    contact: Contact;
    channel: string;
    events: Event[];
}

interface Contact {
    uuid: string,
    urns: string[],
    fields: {},
    groups: Group[]
}

interface Event {
    uuid: string;
    created_on?: Date;
    type: string;
    text?: string;
    name?: string;
    value?: string;
    body?: string;
    email?: string;
    subject?: string;
    url?: string;
    status?: string;
    status_code?: number;
    request?: string;
    response?: string;
    groups?: Group[];
    field_name: string;
    field_uuid: string;
}

interface Step {
    arrived_on: Date;
    events: Event[];
    node: string;
    exit_uuid: string;
    node_uuid: string;
}

interface Wait {
    timeout: number;
    type: string;
}

interface Run {
    path: Step[];
    flow_uuid: string;
    status: string;
    wait?: Wait;
}

interface RunContext {
    contact: Contact;
    session: Session;
}

interface Session {
    runs: Run[];
    events: Event[];
    input?: any;
}

interface LogEventState {
    detailsVisible: boolean;
}

/**
 * Viewer for log events
 */
class LogEvent extends React.Component<Event, LogEventState> {

    constructor(props: Event) {
        super(props);
        this.state = {
            detailsVisible: false
        }
        this.showDetails = this.showDetails.bind(this);
    }

    showDetails() {
        this.setState({ detailsVisible: true });
    }

    render() {
        var classes = [];
        var text = "";
        var details: JSX.Element = null;
        var detailTitle = "";

        if (this.props.type == "msg_received") {
            text = this.props.text
            classes.push(styles.msg_received);
        } else if (this.props.type == "send_msg") {
            text = this.props.text
            classes.push(styles.send_msg);
        } else if (this.props.type == "error") {
            text = this.props.text
            classes.push(styles.error);
        } else if (this.props.type == "msg_wait") {
            text = "Waiting for reply"
            classes.push(styles.info);
        } else if (this.props.type == "add_to_group") {
            text = "Added to "
            var delim = " "
            for (let group of this.props.groups) {
                text += delim + "\"" + group.name + "\""
                delim = ", "
            }
            classes.push(styles.info);
        } else if (this.props.type == "remove_from_group") {
            text = "Removed from "
            var delim = " "
            for (let group of this.props.groups) {
                text += delim + "\"" + group.name + "\""
                delim = ", "
            }
            classes.push(styles.info);
        } else if (this.props.type == "save_contact_field") {
            text = "Set contact field \"" + this.props.field_name + "\" to \"" + this.props.value + "\"";
            classes.push(styles.info);
        } else if (this.props.type == "update_contact") {
            text = "Updated contact " + this.props.field_name + " to \"" + this.props.value + "\"";
            classes.push(styles.info);
        } else if (this.props.type == "send_email") {
            text = "Sent email to \"" + this.props.email + "\" with subject \"" + this.props.subject + "\" and body \"" + this.props.body + "\""
            classes.push(styles.info);
        } else if (this.props.type == "webhook_called") {
            text = "Called webhook " + this.props.url
            classes.push(styles.info);
            detailTitle = "Webhook Details";
            details = (
                <pre>
                    {this.props.request}
                    {this.props.response}
                </pre>
            )
        }

        classes.push(styles.evt);

        if (details) {
            classes.push(styles.has_detail)
            return (
                <div>
                    <div className={classes.join(" ")} onClick={this.showDetails}>{text}</div>
                    <Modal
                        className={styles["detail_" + this.props.type]}
                        title={<div>{detailTitle}</div>}
                        show={this.state.detailsVisible}
                        onClickPrimary={() => {
                            this.setState({ detailsVisible: false })
                        }}>
                        <div className={styles.event_viewer}>
                            {details}
                        </div>
                    </Modal>
                </div >
            )
        } else {
            return (
                <div>
                    <div className={classes.join(" ")}>{text}</div>
                </div >
            )
        }
    }
}

/**
 * Our dev console for simulating or testing expressions
 */
export class Simulator extends React.Component<SimulatorProps, SimulatorState> {

    private debug: Session[] = [];
    private flows: FlowDefinition[] = [];
    private currentFlow: string;

    // marks the bottom of our chat
    private bottom: any;

    constructor(props: SimulatorProps) {
        super(props);
        this.state = {
            visible: false,
            events: [],
            contact: {
                uuid: UUID.v4(),
                urns: ["tel:+12065551212"],
                fields: {},
                groups: []
            },
            channel: UUID.v4(),
        }
        this.currentFlow = this.props.flowUUID;
    }

    private updateActivity() {

        if (this.state.session) {
            var lastExit: string = null;
            var paths: { [key: string]: number } = {};
            var active: { [nodeUUID: string]: number } = {};
            var activeFlow: string;


            for (let run of this.state.session.runs) {
                var finalStep: Step = null;

                for (let step of run.path) {
                    if (lastExit) {
                        var key = lastExit + ":" + step.node_uuid;
                        var count = paths[key]
                        if (!count) { count = 0 }
                        paths[key] = ++count;
                    }
                    lastExit = step.exit_uuid;
                    finalStep = step;

                }

                if (run.status == ACTIVE && finalStep) {
                    var count = active[finalStep.node_uuid];
                    if (!count) { count = 0 }
                    active[finalStep.node_uuid] = ++count;
                    activeFlow = run.flow_uuid;
                }
            }

            var activity: Activity = { paths: paths, active: active };

            // console.log(JSON.stringify(activity, null, 1));
            ActivityManager.get().setSimulation(activity);

            if (activeFlow && activeFlow != this.currentFlow) {
                var flow = this.flows.find((flow: FlowDefinition) => { return flow.uuid == activeFlow });
                if (flow) {
                    this.props.showDefinition(flow);
                }
                this.currentFlow = activeFlow;
            } else if (!activeFlow) {
                this.props.showDefinition(null);
            }
        }
    }

    private updateRunContext(body: any, runContext: RunContext) {
        var events = update(this.state.events, { $push: runContext.session.events });
        this.setState({
            session: runContext.session,
            contact: runContext.contact,
            events: events
        }, () => {
            this.updateActivity();
        });
    }

    private startFlow() {

        // reset our events and contact
        this.setState({
            events: [],
            contact: {
                uuid: UUID.v4(),
                urns: ["tel:+12065551212"],
                fields: {},
                groups: []
            }
        }, () => {

            this.props.external.getFlow(this.props.flowUUID, true).then((details: FlowDetails) => {
                this.flows = [details.definition].concat(details.dependencies)
                var body: any = {
                    flows: this.flows,
                    contact: this.state.contact,
                };

                axios.default.post(urljoin(this.props.engineURL + '/flow/start'), JSON.stringify(body, null, 2)).then((response: axios.AxiosResponse) => {
                    this.updateRunContext(body, response.data as RunContext);
                });
            });

        });
    }

    private resume(text: string) {
        if (text == "\\debug") {
            console.log(JSON.stringify(this.debug, null, 2));
            return;
        }

        if (text == "\\recalc") {
            console.log("recal..");
            Plumber.get().repaint();
            return;
        }

        this.props.external.getFlow(this.props.flowUUID, true).then((details: FlowDetails) => {
            this.flows = [details.definition].concat(details.dependencies)
            var body: any = {
                flows: this.flows,
                session: this.state.session,
                contact: this.state.contact,
                event: {
                    type: "msg_received",
                    text: text,
                    urn: this.state.contact.urns[0],
                    channel_uuid: this.state.channel,
                    contact_uuid: this.state.contact.uuid,
                    created_on: new Date(),
                }
            };

            axios.default.post(this.props.engineURL + '/flow/resume', JSON.stringify(body, null, 2)).then((response: axios.AxiosResponse) => {
                this.updateRunContext(body, response.data as RunContext);
            }).catch((error) => {
                var events = update(this.state.events, {
                    $push: [{
                        type: "error",
                        text: error.response.data.error
                    }]
                });
                this.setState({ events: events });
            });;
        });
    }

    private onReset(event: any) {
        this.startFlow();
    }

    componentDidUpdate(prevProps: SimulatorProps) {
        const node = ReactDOM.findDOMNode(this.bottom);
        if (node != null) {
            node.scrollIntoView(false);
        }
    }

    private onKeyUp(event: any) {
        if (event.key === 'Enter') {
            var ele = event.target;
            var text = ele.value;
            ele.value = "";
            this.resume(text);
        }
    }

    private toggle(event: any) {
        var newVisible = !this.state.visible;
        this.setState({ visible: newVisible }, () => {

            // clear our viewing definition
            if (!this.state.visible) {
                this.props.showDefinition(null);
                ActivityManager.get().clearSimulation();
            } else {
                this.updateActivity();

                // start our flow if we haven't already
                if (this.state.events.length == 0) {
                    this.startFlow();
                }
            }
        });

    }

    public render() {
        var messages: JSX.Element[] = [];
        for (let event of this.state.events) {
            messages.push(<LogEvent {...event} key={String(event.created_on)} />);
        }

        var simHidden = !this.state.visible ? styles.sim_hidden : "";
        var tabHidden = this.state.visible ? styles.tab_hidden : "";

        return (
            <div>
                <div className={styles.simulator_container}>
                    <div className={styles.simulator + " " + simHidden} key={"sim"}>
                        <a className={styles.reset} onClick={this.onReset.bind(this)} />
                        <div className={styles.icon_simulator + " icon-simulator"} />
                        <div className={styles.icon_close + " icon-remove"} onClick={this.toggle.bind(this)} />
                        <div className={styles.screen}>
                            <div className={styles.messages}>
                                {messages}
                                <div id="bottom" style={{ float: "left", clear: "both" }} ref={(el) => { this.bottom = el; }}></div>
                            </div>
                            <div className={styles.controls}>
                                <input type="text" onKeyUp={this.onKeyUp.bind(this)} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.simulator_tab + " " + tabHidden} onClick={this.toggle.bind(this)}>
                    <div className={styles.simulator_tab_icon + " icon-simulator"} />
                    <div className={styles.simulator_tab_text}>
                        Run in<br />Simulator
                    </div>
                </div>
            </div>
        )
    }
}

export default Simulator;