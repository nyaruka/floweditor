import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import * as update from 'immutability-helper';
import * as urljoin from 'url-join';
import * as ReactDOM from 'react-dom';
import { IFlowDetails, TGetFlow } from '../../services/External';
import { IFlowDefinition, IGroup } from '../../flowTypes';
import ActivityManager, { IActivity } from '../../services/ActivityManager';
import LogEvent, { IEventProps } from './LogEvent';

const styles = require('./Simulator.scss');

const ACTIVE = 'A';

interface IMessage {
    text: string;
    inbound: boolean;
}

export interface ISimulatorProps {
    definition: IFlowDefinition;
    engineURL: string;
    getFlow: TGetFlow;
    showDefinition(definition: IFlowDefinition): void;
    plumberRepaint: Function;
    Activity: any
}

interface ISimulatorState {
    visible: boolean;
    session?: ISession;
    contact: IContact;
    channel: string;
    events: IEventProps[];
    active: boolean;
}

interface IContact {
    uuid: string;
    urns: string[];
    fields: {};
    groups: IGroup[];
}

interface IStep {
    arrived_on: Date;
    events: IEventProps[];
    node: string;
    exit_uuid: string;
    node_uuid: string;
}

interface IWait {
    timeout: number;
    type: string;
}

interface IRun {
    path: IStep[];
    flow_uuid: string;
    status: string;
    wait?: IWait;
}

interface IRunContext {
    contact: IContact;
    session: ISession;
    events: IEventProps[];
}

interface ISession {
    runs: IRun[];
    events: IEventProps[];
    input?: any;
}

/**
 * Our dev console for simulating or testing expressions
 */
class Simulator extends React.Component<ISimulatorProps, ISimulatorState> {
    private debug: ISession[] = [];
    private flows: IFlowDefinition[] = [];
    private currentFlow: string;
    private inputBox: HTMLInputElement;

    // marks the bottom of our chat
    private bottom: any;

    constructor(props: ISimulatorProps) {
        super(props);
        this.state = {
            active: false,
            visible: false,
            events: [],
            contact: {
                uuid: UUID.v4(),
                urns: ['tel:+12065551212'],
                fields: {},
                groups: []
            },
            channel: UUID.v4()
        };
        this.currentFlow = this.props.definition.uuid;
    }

    private updateActivity() {
        if (this.state.session) {
            var lastExit: string = null;
            var paths: { [key: string]: number } = {};
            var active: { [nodeUUID: string]: number } = {};
            var activeFlow: string;

            for (let run of this.state.session.runs) {
                var finalStep: IStep = null;

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

            var activity: IActivity = { segments: paths, nodes: active };

            // console.log(JSON.stringify(activity, null, 1));
            this.props.Activity.setSimulation(activity);

            if (activeFlow && activeFlow != this.currentFlow) {
                var flow = this.flows.find((flow: IFlowDefinition) => {
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

    private updateRunContext(body: any, runContext: IRunContext) {
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
                    uuid: UUID.v4(),
                    urns: ['tel:+12065551212'],
                    fields: {},
                    groups: []
                }
            },
            () => {
                this.props
                    .getFlow(this.props.definition.uuid, true)
                    .then((details: IFlowDetails) => {
                        this.flows = [this.props.definition].concat(details.dependencies);
                        var body: any = {
                            flows: this.flows,
                            contact: this.state.contact
                        };

                        axios.default
                            .post(
                                urljoin(this.props.engineURL + '/flow/start'),
                                JSON.stringify(body, null, 2)
                            )
                            .then((response: axios.AxiosResponse) => {
                                this.updateRunContext(body, response.data as IRunContext);
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

        this.props.getFlow(this.props.definition.uuid, true).then((details: IFlowDetails) => {
            this.flows = [this.props.definition].concat(details.dependencies);
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
                .post(this.props.engineURL + 'flow/resume', JSON.stringify(body, null, 2))
                .then((response: axios.AxiosResponse) => {
                    this.updateRunContext(body, response.data as IRunContext);
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

    componentDidUpdate(prevProps: ISimulatorProps) {
        const node = ReactDOM.findDOMNode(this.bottom);
        if (node != null) {
            node.scrollIntoView(false);
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
            messages.push(<LogEvent {...event} key={String(event.created_on)} />);
        }

        var simHidden = !this.state.visible ? styles.sim_hidden : '';
        var tabHidden = this.state.visible ? styles.tab_hidden : '';

        return (
            <div>
                <div className={styles.simulator_container}>
                    <div className={styles.simulator + ' ' + simHidden} key={'sim'}>
                        <a
                            className={
                                styles.reset +
                                ' ' +
                                (this.state.active ? styles.active : styles.inactive)
                            }
                            onClick={this.onReset.bind(this)}
                        />
                        <div className={styles.icon_simulator + ' icon-simulator'} />
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
                                    ref={el => {
                                        this.bottom = el;
                                    }}
                                />
                            </div>
                            <div className={styles.controls}>
                                <input
                                    ref={ele => {
                                        this.inputBox = ele;
                                    }}
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
                    <div className={styles.simulator_tab_icon + ' icon-simulator'} />
                    <div className={styles.simulator_tab_text}>
                        Run in<br />Simulator
                    </div>
                </div>
            </div>
        );
    }
}

export default Simulator;
