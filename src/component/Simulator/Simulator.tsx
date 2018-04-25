// TODO: Remove use of Function
// tslint:disable:ban-types
import * as React from 'react';
import * as axios from 'axios';
import { react as bindCallbacks } from 'auto-bind';
import update from 'immutability-helper';
import { v4 as generateUUID } from 'uuid';
import { FlowDefinition, Group, FlowNode } from '../../flowTypes';
import ActivityManager, { Activity } from '../../services/ActivityManager';
import { FlowDetails, getFlow } from '../../external';
import LogEvent, { EventProps } from './LogEvent';
import { ConfigProviderContext } from '../../config';
import { connect } from 'react-redux';

import * as styles from './Simulator.scss';
import { ReactNode } from 'react';
import { AppState, DispatchWithState, SearchResult } from '../../store';
import { bindActionCreators } from 'redux';
import { RenderNodeMap, RenderNode } from '../../store/flowContext';
import { getOrderedNodes } from '../../store/helpers';
import { dump } from '../../utils';
import { fakePropType } from '../../config/ConfigProvider';

const ACTIVE = 'A';

interface Message {
    text: string;
    inbound: boolean;
}

export interface SimulatorStoreProps {
    contactFields: SearchResult[];
    groups: SearchResult[];
    nodes: RenderNodeMap;
    definition: FlowDefinition;
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
    contact: Contact;
}

interface Asset {
    type: string;
    url: string;
    content: any;
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
                uuid: generateUUID(),
                urns: ['tel:+12065551212'],
                fields: {},
                groups: []
            },
            channel: generateUUID()
        };
        this.bottomRef = this.bottomRef.bind(this);
        this.inputBoxRef = this.inputBoxRef.bind(this);
        this.currentFlow = this.props.definition.uuid;

        bindCallbacks(this, {
            include: [/^on/]
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

    private getAssetServer(): any {
        return {
            type_urls: {
                flow: 'http://localhost:9000/flow/{uuid}/',
                field_set: 'http://localhost:9000/fields/',
                channel_set: 'http://localhost:9000/channels/',
                group_set: 'http://localhost:9000/groups/'
            }
        };
    }

    private getAssets(): Asset[] {
        const renderNodes = getOrderedNodes(this.props.nodes);
        const nodes: FlowNode[] = [];
        renderNodes.map((renderNode: RenderNode) => {
            nodes.push(renderNode.node);
        });

        this.props.definition.nodes = nodes;

        return [
            {
                type: 'flow',
                url: 'http://localhost:9000/flow/' + this.props.definition.uuid + '/',
                content: this.props.definition
            },
            {
                type: 'field_set',
                url: 'http://localhost:9000/fields/',
                content: this.props.contactFields.map((field: SearchResult) => {
                    return { key: field.id, name: field.name, value_type: 'text' };
                })
            },
            {
                type: 'group_set',
                url: 'http://localhost:9000/groups/',
                content: this.props.groups.map((group: SearchResult) => {
                    return { uuid: group.id, name: group.name };
                })
            },
            {
                type: 'channel_set',
                url: 'http://localhost:9000/channels/',
                content: [
                    {
                        uuid: '57f1078f-88aa-46f4-a59a-948a5739c03d',
                        name: 'Simulator',
                        address: '+12345671111',
                        schemes: ['tel'],
                        roles: ['send', 'receive']
                    }
                ]
            }
        ];
    }

    private startFlow() {
        // reset our events and contact

        dump(this.getAssets());
        this.setState(
            {
                events: []
                /*contact: {
                    uuid: generateUUID(),
                    urns: ['tel:+12065551212'],
                    fields: {},
                    groups: []
                }*/
            },
            () => {
                getFlow(this.context.endpoints.flows, this.props.definition.uuid, true).then(
                    (details: FlowDetails) => {
                        this.flows = [this.props.definition].concat(details.dependencies);
                        const body: any = {
                            assets: this.getAssets(),
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
                                    uuid: generateUUID(),
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
                            asset_server: this.getAssetServer()
                        };

                        axios.default
                            .post(
                                `${this.context.endpoints.engine}/flow/start`,
                                JSON.stringify(body, null, 2)
                            )
                            .then((response: axios.AxiosResponse) => {
                                this.updateRunContext(body, response.data as RunContext);
                            });
                    }
                );
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
                uuid: generateUUID(),
                urn: this.state.session.contact.urns[0]
            },
            channel_uuid: this.state.channel,
            contact_uuid: this.state.session.contact.uuid,
            created_on: new Date()
        };

        let events = update(this.state.events, { $push: [newMessage] }) as EventProps[];
        this.setState({ events });

        getFlow(this.context.endpoints.flows, this.props.definition.uuid, true).then(
            (details: FlowDetails) => {
                const body: any = {
                    assets: this.getAssets(),
                    asset_server: this.getAssetServer(),
                    session: this.state.session,
                    contact: this.state.session.contact,
                    events: [newMessage]
                };

                axios.default
                    .post(
                        `${this.context.endpoints.engine}/flow/resume`,
                        JSON.stringify(body, null, 2)
                    )
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
        );
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

        const simHidden = !this.state.visible ? styles.sim_hidden : '';
        const tabHidden = this.state.visible ? styles.tab_hidden : '';

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
                        <div className={styles.icon_simulator + ' icon-simulator'} />
                        <div
                            className={styles.icon_close + ' icon-remove'}
                            onClick={this.onToggle}
                        />
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
                <div className={styles.simulator_tab + ' ' + tabHidden} onClick={this.onToggle}>
                    <div className={styles.simulator_tab_icon + ' icon-simulator'} />
                    <div className={styles.simulator_tab_text}>
                        Run in<br />Simulator
                    </div>
                </div>
            </div>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: { definition, nodes, contactFields, groups }
}: AppState) => ({
    definition,
    nodes,
    contactFields,
    groups
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Simulator);
