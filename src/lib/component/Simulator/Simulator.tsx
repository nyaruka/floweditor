import * as React from 'react';
import * as axios from 'axios';
import * as update from 'immutability-helper';
import { react as bindCallbacks } from 'auto-bind';
import { v4 as generateUUID } from 'uuid';
import { FlowDetails } from '../../external';
import { FlowDefinition, Group } from '../../flowTypes';
import ActivityManager, { Activity } from '../../services/ActivityManager';
import LogEvent, { EventProps } from './LogEvent';
import { endpointsPT } from '../../config';

import * as styles from './Simulator.scss';

const ACTIVE = 'A';

interface Message {
    text: string;
    inbound: boolean;
}

export interface SimulatorProps {
    definition: FlowDefinition;
    showDefinition(definition: FlowDefinition): void;
    plumberRepaint: Function;
    Activity: any;
}

interface SimulatorState {
    visible: boolean;
    session?: Session;
    contact: Contact;
    channel: string;
    events: EventProps[];
    active: boolean;
}

interface Contact {
    uuid: string;
    urns: string[];
    fields: {};
    groups: Group[];
}

interface Step {
    arrived_on: Date;
    events: EventProps[];
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
    events: EventProps[];
}

interface Session {
    runs: Run[];
    events: EventProps[];
    input?: any;
}

/**
 * Our dev console for simulating or testing expressions
 */
export default class Simulator extends React.Component<
    SimulatorProps,
    SimulatorState
> {
    private debug: Session[] = [];
    private flows: FlowDefinition[] = [];
    private currentFlow: string;
    private inputBox: HTMLInputElement;

    // marks the bottom of our chat
    private bottom: any;

    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: SimulatorProps) {
        super(props);

        this.state = {
            active: false,
            visible: false,
            events: [],
            contact: {
                uuid: generateUUID(),
                urns: ['tel:+12065551212'],
                fields: {},
                groups: []
            },
            channel: generateUUID()
        };

        bindCallbacks(this, {
            include: ['onBottomRef', 'onInputBoxRef', 'currentFlow']
        });
    }

    private onBottomRef(ref: any) {
        return (this.bottom = ref);
    }

    private onInputBoxRef(ref: any) {
        this.inputBox = ref;
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
                        var key = lastExit + ':' + step.node_uuid;
                        var count = paths[key];
                        if (!count) {
                            count = 0;
                        }
                        paths[key] = ++count;
                    }
                    lastExit = step.exit_uuid;
                    finalStep = step;
                }

                if (run.status == ACTIVE && finalStep) {
                    var count = active[finalStep.node_uuid];
                    if (!count) {
                        count = 0;
                    }
                    active[finalStep.node_uuid] = ++count;
                    activeFlow = run.flow_uuid;
                }
            }

            var activity: Activity = { segments: paths, nodes: active };

            // console.log(JSON.stringify(activity, null, 1));
            this.props.Activity.setSimulation(activity);

            if (activeFlow && activeFlow != this.currentFlow) {
                var [flow] = this.flows.filter((flow: FlowDefinition) => {
                    return flow.uuid == activeFlow;
                });
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
        var events = update(this.state.events, { $push: runContext.events });

        var activeRuns = false;
        for (let run of runContext.session.runs) {
            if (run.status == 'A') {
                activeRuns = true;
                break;
            }
        }

        if (!activeRuns) {
            events.push({
                type: 'info',
                text: 'Exited flow'
            });
        }

        this.setState(
            {
                session: runContext.session,
                contact: runContext.contact,
                events: events,
                active: activeRuns
            },
            () => {
                this.updateActivity();
                this.inputBox.focus();
            }
        );
    }

    private startFlow() {
        // reset our events and contact
        this.setState(
            {
                events: [],
                contact: {
                    uuid: generateUUID(),
                    urns: ['tel:+12065551212'],
                    fields: {},
                    groups: []
                }
            },
            () => {
                this.context
                    .getFlow(this.props.definition.uuid, true)
                    .then((details: FlowDetails) => {
                        this.flows = [this.props.definition].concat(
                            details.dependencies
                        );
                        var body: any = {
                            flows: this.flows,
                            contact: this.state.contact
                        };

                        axios.default
                            .post(
                                `${this.context.endpoints.engine}/flow/start`,
                                JSON.stringify(body, null, 2)
                            )
                            .then((response: axios.AxiosResponse) => {
                                this.updateRunContext(
                                    body,
                                    response.data as RunContext
                                );
                            });
                    });
            }
        );
    }

    private resume(text: string) {
        if (text == '\\debug') {
            console.log(JSON.stringify(this.debug, null, 2));
            return;
        }

        if (text == '\\recalc') {
            console.log('recal..');
            this.props.plumberRepaint();
            return;
        }

        this.context
            .getFlow(this.props.definition.uuid, true)
            .then((details: FlowDetails) => {
                this.flows = [this.props.definition].concat(
                    details.dependencies
                );
                var body: any = {
                    flows: this.flows,
                    session: this.state.session,
                    contact: this.state.contact,
                    event: {
                        type: 'msg_received',
                        text: text,
                        urn: this.state.contact.urns[0],
                        channel_uuid: this.state.channel,
                        contact_uuid: this.state.contact.uuid,
                        created_on: new Date()
                    }
                };

                axios.default
                    .post(
                        `${this.context.endpoints.engine}/flow/resume`,
                        JSON.stringify(body, null, 2)
                    )
                    .then((response: axios.AxiosResponse) => {
                        this.updateRunContext(
                            body,
                            response.data as RunContext
                        );
                    })
                    .catch(error => {
                        var events = update(this.state.events, {
                            $push: [
                                {
                                    type: 'error',
                                    text: error.response.data.error
                                }
                            ]
                        });
                        this.setState({ events: events });
                    });
            });
    }

    private onReset(event: any) {
        this.startFlow();
    }

    componentDidUpdate(prevProps: SimulatorProps) {
        if (this.bottom) {
            this.bottom.scrollIntoView(false);
        }
    }

    private onKeyUp(event: any) {
        if (event.key === 'Enter') {
            var ele = event.target;
            var text = ele.value;
            ele.value = '';
            this.resume(text);
        }
    }

    private toggle(event: any) {
        var newVisible = !this.state.visible;
        this.setState({ visible: newVisible }, () => {
            // clear our viewing definition
            if (!this.state.visible) {
                this.props.showDefinition(null);
                window.setTimeout(() => {
                    this.props.Activity.clearSimulation();
                }, 500);
            } else {
                this.updateActivity();

                // start our flow if we haven't already
                if (this.state.events.length == 0) {
                    this.startFlow();
                }

                this.inputBox.focus();
            }
        });
    }

    public render() {
        var messages: JSX.Element[] = [];
        for (let event of this.state.events) {
            messages.push(
                <LogEvent {...event} key={String(event.created_on)} />
            );
        }

        var simHidden = !this.state.visible ? styles.sim_hidden : '';
        var tabHidden = this.state.visible ? styles.tab_hidden : '';

        return (
            <div>
                <div>
                    <div
                        className={styles.simulator + ' ' + simHidden}
                        key={'sim'}>
                        <a
                            className={
                                styles.reset +
                                ' ' +
                                (this.state.active
                                    ? styles.active
                                    : styles.inactive)
                            }
                            onClick={this.onReset.bind(this)}
                        />
                        <div
                            className={
                                styles.icon_simulator + ' icon-simulator'
                            }
                        />
                        <div
                            className={styles.icon_close + ' icon-remove'}
                            onClick={this.toggle.bind(this)}
                        />
                        <div className={styles.screen}>
                            <div className={styles.messages}>
                                {messages}
                                <div
                                    id="bottom"
                                    style={{ float: 'left', clear: 'both' }}
                                    ref={this.onBottomRef}
                                />
                            </div>
                            <div className={styles.controls}>
                                <input
                                    ref={this.onInputBoxRef}
                                    type="text"
                                    onKeyUp={this.onKeyUp.bind(this)}
                                    disabled={!this.state.active}
                                    placeholder={
                                        this.state.active
                                            ? 'Enter message'
                                            : 'Press home to start again'
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={styles.simulator_tab + ' ' + tabHidden}
                    onClick={this.toggle.bind(this)}>
                    <div
                        className={
                            styles.simulator_tab_icon + ' icon-simulator'
                        }
                    />
                    <div className={styles.simulator_tab_text}>
                        Run in<br />Simulator
                    </div>
                </div>
            </div>
        );
    }
}
