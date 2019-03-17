import { react as bindCallbacks } from 'auto-bind';
import * as axios from 'axios';
import update from 'immutability-helper';
import * as React from 'react';
import { ReactNode } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getTime } from '~/components/simulator/helpers';
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

const MESSAGE_DELAY_MS = 300;

const MAP_THUMB = require('static/images/map.jpg');
const IMAGE_A = 'https://s3.amazonaws.com/floweditor-assets.temba.io/simulator/sim_image_a.jpg';
const IMAGE_B = 'https://s3.amazonaws.com/floweditor-assets.temba.io/simulator/sim_image_b.jpg';
const IMAGE_C = 'https://s3.amazonaws.com/floweditor-assets.temba.io/simulator/sim_image_c.jpg';
const AUDIO_A = 'https://s3.amazonaws.com/floweditor-assets.temba.io/simulator/sim_audio_a.mp3';
const VIDEO_A = 'https://s3.amazonaws.com/floweditor-assets.temba.io/simulator/sim_video_a.mp4';

const VIDEO_A_THUMB =
    'https://s3.amazonaws.com/floweditor-assets.temba.io/simulator/sim_video_a_thumb.jpg';

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
}

export type SimulatorProps = SimulatorStoreProps & SimulatorPassedProps;

enum DrawerType {
    audio,
    images,
    videos,
    location,
    digit,
    digits
}

interface SimulatorState {
    visible: boolean;
    session?: Session;
    contact: Contact;
    channel: string;
    events: EventProps[];
    active: boolean;
    time: string;
    sprinting: boolean;
    attachmentsVisible: boolean;
    drawerVisible: boolean;
    waitingForAttachment: boolean;
    drawerType?: DrawerType;
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
    contact: Contact;
    input?: any;
    wait?: Wait;
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
            channel: createUUID(),
            time: getTime(),
            waitingForAttachment: false,
            drawerVisible: false,
            attachmentsVisible: false,
            sprinting: false
        };
        this.bottomRef = this.bottomRef.bind(this);
        this.inputBoxRef = this.inputBoxRef.bind(this);
        this.currentFlow = this.props.definition.uuid;

        bindCallbacks(this, {
            include: [/^on/, /^get/, /^handle/]
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

    private updateEvents(events: EventProps[], callback: () => void): void {
        if (events.length > 0) {
            const toAdd = [];

            let messageFound = false;
            while (events.length > 0 && !messageFound) {
                const eventType = events[0].type;
                if (
                    eventType === 'msg_created' ||
                    eventType === 'msg_received' ||
                    eventType === 'ivr_created'
                ) {
                    messageFound = true;
                }

                toAdd.push(events.shift());
            }

            const newEvents = update(this.state.events, { $push: toAdd }) as EventProps[];
            this.setState({ events: newEvents }, () => {
                if (events.length === 0) {
                    callback();
                } else {
                    window.setTimeout(() => {
                        this.updateEvents(events, callback);
                    }, MESSAGE_DELAY_MS);
                }
            });
        } else {
            callback();
        }
    }

    private updateRunContext(body: any, runContext: RunContext): void {
        this.updateEvents(runContext.events, () => {
            let activeRuns = false;
            for (const run of runContext.session.runs) {
                if (run.status === 'waiting') {
                    activeRuns = true;
                    break;
                }
            }

            let newEvents = this.state.events;

            if (!activeRuns) {
                newEvents = update(this.state.events, {
                    $push: [
                        {
                            type: 'info',
                            text: 'Exited flow'
                        }
                    ]
                }) as EventProps[];
            }

            const waitingForAttachment =
                runContext.session &&
                runContext.session.wait &&
                runContext.session.wait.hint !== undefined;

            let drawerType = null;
            if (waitingForAttachment) {
                switch (runContext.session.wait.hint.type) {
                    case 'audio':
                        drawerType = DrawerType.audio;
                        break;
                    case 'video':
                        drawerType = DrawerType.videos;
                        break;
                    case 'image':
                        drawerType = DrawerType.images;
                        break;
                    case 'location':
                        drawerType = DrawerType.location;
                        break;
                    default:
                        console.log('Unknown hint', runContext.session.wait.hint.type);
                }
            }

            this.setState(
                {
                    session: runContext.session,
                    events: newEvents,
                    active: activeRuns,
                    drawerType,
                    drawerVisible: waitingForAttachment,
                    waitingForAttachment,
                    sprinting: false
                },
                () => {
                    this.updateActivity();
                    this.handleFocusUpdate();
                }
            );
        });

        /*
        const events = update(this.state.events, { $push: runContext.events }) as EventProps[];

        */
    }

    private startFlow(): void {
        // reset our events and contact
        this.setState(
            {
                sprinting: true,
                drawerVisible: false,
                attachmentsVisible: false,
                events: []
            },
            () => {
                // this.props.definition.uuid,
                // getCurrentDefinition(this.props.definition, this.props.nodes)
                const now = new Date().toISOString();
                const body: any = {
                    contact: this.state.contact,
                    flow: getCurrentDefinition(this.props.definition, this.props.nodes, false),
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
                            groups: [],
                            created_on: now
                        },
                        flow: {
                            uuid: this.props.definition.uuid,
                            name: this.props.definition.uuid
                        },
                        params: {},
                        triggered_on: now
                    }
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

    private resume(text: string, attachment?: string): void {
        if ((!text || text.trim().length === 0) && !attachment) {
            return;
        }

        if (text === '\\debug') {
            console.log(JSON.stringify(this.debug, null, 2));
            return;
        }

        if (text === '\\recalc') {
            console.log('recal..');
            // this.props.plumberRepaint();
            return;
        }

        this.setState({ sprinting: true, attachmentsVisible: false, drawerVisible: false }, () => {
            const now = new Date().toISOString();
            const body: any = {
                flow: getCurrentDefinition(this.props.definition, this.props.nodes, false),
                session: this.state.session,
                resume: {
                    type: 'msg',
                    msg: {
                        text,
                        uuid: createUUID(),
                        urn: this.state.session.contact.urns[0],
                        attachments: attachment ? [attachment] : []
                    },
                    resumed_on: now,
                    contact: this.state.session.contact
                }
            };

            axios.default
                .post(getURL(this.context.endpoints.simulateResume), JSON.stringify(body, null, 2))
                .then((response: axios.AxiosResponse) => {
                    this.updateRunContext(body, response.data as RunContext);
                })
                .catch(error => {
                    const events = update(this.state.events, {
                        $push: [
                            {
                                type: 'error',
                                text: error.response.data.error
                            }
                        ]
                    }) as EventProps[];
                    this.setState({ events });
                });
        });
    }

    private onReset(event: any): void {
        this.startFlow();
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

                this.handleFocusUpdate();
            }
        });
    }

    private handleFocusUpdate(): void {
        if (this.inputBox) {
            this.inputBox.focus();
        }
    }

    private sendAttachment(attachment: string): void {
        this.setState({ drawerVisible: false, attachmentsVisible: false }, () => {
            window.setTimeout(() => {
                this.resume(null, attachment);
            }, 200);
        });
    }

    private getImageDrawer(): JSX.Element {
        return (
            <div className={styles.drawerItems}>
                <div
                    className={styles.drawerItem}
                    onClick={() => {
                        this.sendAttachment('image/jpeg:' + IMAGE_A);
                    }}
                >
                    <img src={IMAGE_A} />
                </div>
                <div
                    className={styles.drawerItem}
                    onClick={() => {
                        this.sendAttachment('image/jpeg:' + IMAGE_B);
                    }}
                >
                    <img src={IMAGE_B} />
                </div>
                <div
                    className={styles.drawerItem}
                    onClick={() => {
                        this.sendAttachment('image/jpeg:' + IMAGE_C);
                    }}
                >
                    <img src={IMAGE_C} />
                </div>
            </div>
        );
    }

    public getLocationDrawer(): JSX.Element {
        return (
            <div
                className={styles.mapThumb}
                onClick={() => {
                    this.sendAttachment('geo:2.904194,-79.003418');
                }}
            >
                <img src={MAP_THUMB} />
            </div>
        );
    }

    private getAudioDrawer(): JSX.Element {
        return (
            <div
                className={styles.audioPicker}
                onClick={() => {
                    this.sendAttachment('audio/mp3:' + AUDIO_A);
                }}
            >
                <div className={styles.audioIcon + ' fe-mic'} />
                <div className={styles.audioMessage}>Upload Audio</div>
            </div>
        );
    }

    private getVideoDrawer(): JSX.Element {
        return (
            <div className={styles.drawerItems}>
                <div
                    className={styles.drawerItem}
                    onClick={() => {
                        this.sendAttachment('video/mp4:' + VIDEO_A);
                    }}
                >
                    <img src={VIDEO_A_THUMB} />
                </div>
                <div
                    className={styles.drawerItem}
                    onClick={() => {
                        this.sendAttachment('video/mp4:' + VIDEO_A);
                    }}
                >
                    <img src={VIDEO_A_THUMB} />
                </div>
                <div
                    className={styles.drawerItem}
                    onClick={() => {
                        this.sendAttachment('video/mp4:' + VIDEO_A);
                    }}
                >
                    <img src={VIDEO_A_THUMB} />
                </div>
            </div>
        );
    }

    private getDrawerContents(): JSX.Element {
        switch (this.state.drawerType) {
            case DrawerType.location:
                return this.getLocationDrawer();
            case DrawerType.audio:
                return this.getAudioDrawer();
            case DrawerType.images:
                return this.getImageDrawer();
            case DrawerType.videos:
                return this.getVideoDrawer();
        }
        return null;
    }

    public getDrawer(): JSX.Element {
        return (
            <div
                className={
                    styles.attachmentDrawer +
                    ' ' +
                    (this.state.drawerVisible ? styles.attachmentDrawerVisible : '') +
                    ' ' +
                    (this.state.attachmentsVisible ? '' : styles.forced)
                }
            >
                {this.getDrawerContents()}
            </div>
        );
    }

    private handleHideAttachments(): void {
        this.setState({
            attachmentsVisible: false,
            drawerVisible: false
        });
    }

    private getAttachmentButton(icon: string, drawerType: DrawerType): JSX.Element {
        return (
            <div
                className={icon}
                onClick={() => {
                    this.showAttachmentDrawer(drawerType);
                }}
            />
        );
    }

    private getAttachmentOptions(): JSX.Element {
        return (
            <div
                className={
                    styles.attachmentButtons +
                    ' ' +
                    (this.state.attachmentsVisible ? styles.visible : '')
                }
            >
                <div className="fe-x" onClick={this.handleHideAttachments} />
                {this.getAttachmentButton('fe-picture2', DrawerType.images)}
                {this.getAttachmentButton('fe-video', DrawerType.videos)}
                {this.getAttachmentButton('fe-mic', DrawerType.audio)}
                {this.getAttachmentButton('fe-map-marker', DrawerType.location)}
            </div>
        );
    }

    private handleHideAttachmentDrawer(): void {
        this.setState({ drawerVisible: false });
    }

    private showAttachmentDrawer(drawerType: DrawerType): void {
        if (this.state.drawerVisible) {
            this.handleHideAttachmentDrawer();
            window.setTimeout(() => {
                this.showAttachmentDrawer(drawerType);
            }, 300);
        } else {
            this.setState(
                (prevState: SimulatorState) => {
                    return { drawerVisible: true, drawerType };
                },
                () => {
                    if (this.bottom) {
                        window.setTimeout(() => {
                            this.bottom.scrollIntoView(true);
                        }, 200);
                    }
                }
            );
        }
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
                        <div className={styles.screen}>
                            <div className={styles.header}>
                                <div className={styles.close + ' fe-x'} onClick={this.onToggle} />
                            </div>
                            <div
                                className={
                                    styles.messages +
                                    ' ' +
                                    (this.state.drawerVisible ? styles.short : '')
                                }
                            >
                                {messages}
                                <div
                                    id="bottom"
                                    style={{ float: 'left', clear: 'both', marginTop: 20 }}
                                    ref={this.bottomRef}
                                />
                            </div>
                            <div className={styles.controls}>
                                <input
                                    ref={this.inputBoxRef}
                                    type="text"
                                    onKeyUp={this.onKeyUp}
                                    disabled={
                                        this.state.waitingForAttachment || this.state.sprinting
                                    }
                                    placeholder={
                                        this.state.active
                                            ? 'Enter message'
                                            : 'Press home to start again'
                                    }
                                />
                                <div className={styles.showAttachmentsButton}>
                                    <div
                                        className="fe-paperclip"
                                        onClick={() => {
                                            this.setState({ attachmentsVisible: true });
                                        }}
                                    />
                                </div>
                            </div>
                            {this.getAttachmentOptions()}
                            {this.getDrawer()}
                            <div className={styles.footer}>
                                <a
                                    className={
                                        styles.reset +
                                        ' ' +
                                        (this.state.active ? styles.active : styles.inactive)
                                    }
                                    onClick={this.onReset}
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
