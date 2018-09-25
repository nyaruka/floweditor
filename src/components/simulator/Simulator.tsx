import { react as bindCallbacks } from 'auto-bind';
import * as axios from 'axios';
import update from 'immutability-helper';
import * as React from 'react';
import { ReactNode } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getSimulationAssets } from '~/components/simulator/helpers';
import LogEvent, { EventProps } from '~/components/simulator/LogEvent';
import * as styles from '~/components/simulator/Simulator.scss';
import { ConfigProviderContext } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { getURL } from '~/external';
import { FlowDefinition, Group, Wait } from '~/flowTypes';
import { Activity } from '~/services/ActivityManager';
import { AssetStore, RenderNodeMap } from '~/store/flowContext';
import { getCurrentDefinition } from '~/store/helpers';
import AppState from '~/store/state';
import { DispatchWithState } from '~/store/thunks';
import { createUUID } from '~/utils';

// TODO: Remove use of Function
// tslint:disable:ban-types
const ACTIVE = 'A';

interface Message {
    text: string;
    inbound: boolean;
}

export interface SimulatorStoreProps {
    nodes: RenderNodeMap;
    definition: FlowDefinition;
    assetStore: AssetStore;
}

export interface SimulatorPassedProps {
    Activity: any;
    plumberDraggable: Function;
}

export type SimulatorProps = SimulatorStoreProps & SimulatorPassedProps;

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
    contact: Contact;
}

/**
 * Our dev console for simulating or testing expressions
 */
export class Simulator extends React.Component<SimulatorProps, SimulatorState> {
    private debug: Session[] = [];
    private flows: FlowDefinition[] = [];
    private currentFlow: string;
    private inputBox: HTMLInputElement;

    // marks the bottom of our chat
    private bottom: any;

    public static contextTypes = {
        endpoints: fakePropType
    };

    constructor(props: SimulatorProps, context: ConfigProviderContext) {
        super(props);
        this.state = {
            active: false,
            visible: false,
            events: [],
            contact: {
                uuid: createUUID(),
                urns: ['tel:+12065551212'],
                fields: {},
                groups: []
            },
            channel: createUUID()
        };
        this.bottomRef = this.bottomRef.bind(this);
        this.inputBoxRef = this.inputBoxRef.bind(this);
        this.currentFlow = this.props.definition.uuid;

        bindCallbacks(this, {
            include: [/^on/, /^get/]
        });
    }

    private bottomRef(ref: any): void {
        return (this.bottom = ref);
    }

    private inputBoxRef(ref: any): void {
        this.inputBox = ref;
    }

    private updateActivity(): void {
        if (this.state.session) {
            let lastExit: string = null;
            const paths: { [key: string]: number } = {};
            const active: { [nodeUUID: string]: number } = {};
            let activeFlow: string;

            for (const run of this.state.session.runs) {
                let finalStep: Step = null;

                for (const step of run.path) {
                    if (lastExit) {
                        const key = lastExit + ':' + step.node_uuid;
                        let pathCount = paths[key];
                        if (!pathCount) {
                            pathCount = 0;
                        }
                        paths[key] = ++pathCount;
                    }
                    lastExit = step.exit_uuid;
                    finalStep = step;
                }

                if (run.status === ACTIVE && finalStep) {
                    let count = active[finalStep.node_uuid];
                    if (!count) {
                        count = 0;
                    }
                    active[finalStep.node_uuid] = ++count;
                    activeFlow = run.flow_uuid;
                }
            }

            const activity: Activity = { segments: paths, nodes: active };

            // console.log(JSON.stringify(activity, null, 1));
            this.props.Activity.setSimulation(activity);

            if (activeFlow && activeFlow !== this.currentFlow) {
                const flow = this.flows.find((other: FlowDefinition) => {
                    return other.uuid === activeFlow;
                });
                this.currentFlow = activeFlow;
            }
        }
    }

    private updateRunContext(body: any, runContext: RunContext): void {
        const events = update(this.state.events, { $push: runContext.events }) as EventProps[];

        let activeRuns = false;
        for (const run of runContext.session.runs) {
            if (run.status === 'waiting') {
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
                events,
                active: activeRuns
            },
            () => {
                this.updateActivity();
                this.inputBox.focus();
            }
        );
    }

    private startFlow(): void {
        // reset our events and contact
        this.setState(
            {
                events: []
            },
            () => {
                // this.props.definition.uuid,
                // getCurrentDefinition(this.props.definition, this.props.nodes)
                const body: any = {
                    contact: this.state.contact,
                    trigger: {
                        type: 'manual',
                        environment: {
                            date_format: 'DD-MM-YYYY',
                            time_format: 'hh:mm',
                            timezone: 'America/New_York',
                            languages: []
                        },
                        contact: {
                            uuid: createUUID(),
                            urns: ['tel:+12065551212'],
                            fields: {},
                            groups: []
                        },
                        flow: {
                            uuid: this.props.definition.uuid,
                            name: this.props.definition.uuid
                        },
                        params: {},
                        triggered_on: new Date().toISOString()
                    },
                    ...getSimulationAssets(
                        this.props.assetStore,
                        getCurrentDefinition(this.props.definition, this.props.nodes)
                    )
                };

                axios.default
                    .post(
                        getURL(this.context.endpoints.simulateStart),
                        JSON.stringify(body, null, 2)
                    )
                    .then((response: axios.AxiosResponse) => {
                        this.updateRunContext(body, response.data as RunContext);
                    });
            }
        );
    }

    private resume(text: string): void {
        if (text === '\\debug') {
            console.log(JSON.stringify(this.debug, null, 2));
            return;
        }

        if (text === '\\recalc') {
            console.log('recal..');
            // this.props.plumberRepaint();
            return;
        }

        const newMessage = {
            type: 'msg_received',
            msg: {
                text,
                uuid: createUUID(),
                urn: this.state.session.contact.urns[0]
            },
            channel_uuid: this.state.channel,
            contact_uuid: this.state.session.contact.uuid,
            created_on: new Date()
        };

        let events = update(this.state.events, { $push: [newMessage] }) as EventProps[];
        this.setState({ events });

        const body: any = {
            session: this.state.session,
            contact: this.state.session.contact,
            events: [newMessage],
            ...getSimulationAssets(
                this.props.assetStore,
                getCurrentDefinition(this.props.definition, this.props.nodes)
            )
        };

        axios.default
            .post(getURL(this.context.endpoints.simulateResume), JSON.stringify(body, null, 2))
            .then((response: axios.AxiosResponse) => {
                this.updateRunContext(body, response.data as RunContext);
            })
            .catch(error => {
                events = update(this.state.events, {
                    $push: [
                        {
                            type: 'error',
                            text: error.response.data.error
                        }
                    ]
                }) as EventProps[];
                this.setState({ events });
            });
    }

    private onReset(event: any): void {
        this.startFlow();
    }

    public componentDidMount(): void {
        this.props.plumberDraggable('simulator');
    }

    public componentDidUpdate(prevProps: SimulatorProps): void {
        if (this.bottom) {
            this.bottom.scrollIntoView(false);
        }
    }

    private onKeyUp(event: any): void {
        if (event.key === 'Enter') {
            const ele = event.target;
            const text = ele.value;
            ele.value = '';
            this.resume(text);
        }
    }

    private onToggle(event: any): void {
        const newVisible = !this.state.visible;
        this.setState({ visible: newVisible }, () => {
            // clear our viewing definition
            if (!this.state.visible) {
                window.setTimeout(() => {
                    this.props.Activity.clearSimulation();
                }, 500);
            } else {
                this.updateActivity();

                // start our flow if we haven't already
                if (this.state.events.length === 0) {
                    this.startFlow();
                }

                this.inputBox.focus();
            }
        });
    }

    public render(): ReactNode {
        const messages: JSX.Element[] = [];
        for (const event of this.state.events) {
            // console.log('EVENT', event);
            messages.push(<LogEvent {...event} key={String(event.created_on)} />);
        }

        const simHidden = !this.state.visible ? styles.simHidden : '';
        const tabHidden = this.state.visible ? styles.tabHidden : '';

        return (
            <div className={styles.simContainer}>
                <div>
                    <div id="simulator" className={styles.simulator + ' ' + simHidden} key={'sim'}>
                        <a
                            className={
                                styles.reset +
                                ' ' +
                                (this.state.active ? styles.active : styles.inactive)
                            }
                            onClick={this.onReset}
                        />
                        <div className={styles.close + ' fe-x'} onClick={this.onToggle} />
                        <div className={styles.screen}>
                            <div className={styles.messages}>
                                {messages}
                                <div
                                    id="bottom"
                                    style={{ float: 'left', clear: 'both' }}
                                    ref={this.bottomRef}
                                />
                            </div>
                            <div className={styles.controls}>
                                <input
                                    ref={this.inputBoxRef}
                                    type="text"
                                    onKeyUp={this.onKeyUp}
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
                <div className={styles.simulatorTab + ' ' + tabHidden} onClick={this.onToggle}>
                    <div className={styles.simulatorTabIcon + ' fe-smartphone'} />
                    <div className={styles.simulatorTabText}>
                        Run in
                        <br />
                        Simulator
                    </div>
                </div>
            </div>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({ flowContext: { definition, nodes, assetStore } }: AppState) => ({
    assetStore,
    definition,
    nodes
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) => bindActionCreators({}, dispatch);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Simulator);
