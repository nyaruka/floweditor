import { react as bindCallbacks } from 'auto-bind';
import * as axios from 'axios';
import update from 'immutability-helper';
import * as React from 'react';
import { ReactNode } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getTime, isMessage, isMT } from '~/components/simulator/helpers';
import LogEvent, { EventProps } from '~/components/simulator/LogEvent';
import * as styles from '~/components/simulator/Simulator.scss';
import { ConfigProviderContext } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { getURL } from '~/external';
import { FlowDefinition, Group, Wait } from '~/flowTypes';
import { Activity } from '~/store/editor';
import { AssetStore, RenderNodeMap } from '~/store/flowContext';
import { getCurrentDefinition } from '~/store/helpers';
import AppState from '~/store/state';
import { DispatchWithState, MergeEditorState } from '~/store/thunks';
import { createUUID } from '~/utils';

const MESSAGE_DELAY_MS = 200;

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
    mergeEditorState: MergeEditorState;

    // TODO: take away responsibility of simulator for resetting this
    liveActivity: Activity;
}

export type SimulatorProps = SimulatorStoreProps & SimulatorPassedProps;

enum DrawerType {
    audio = 'audio',
    images = 'images',
    videos = 'videos',
    location = 'location',
    digit = 'digit',
    digits = 'digits',
    quickReplies = 'quickReplies'
}

interface SimulatorState {
    visible: boolean;
    session?: Session;
    contact: Contact;
    channel: string;
    events: EventProps[];
    active: boolean;
    time: string;

    keypadEntry: string;

    quickReplies?: string[];

    // are we currently simulating a sprint
    sprinting: boolean;

    // is our drawer open
    drawerOpen: boolean;

    // what type of drawer are we looking at
    drawerType?: DrawerType;

    // how tall our drawer is
    drawerHeight: number;

    // is our attachment type selection open
    attachmentOptionsVisible: boolean;

    // are we at a wait hint, ie, a forced attachment
    waitingForHint: boolean;
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

    private drawerEle: HTMLDivElement;

    // marks the bottom of our chat
    private bottom: any;

    public static contextTypes = {
        config: fakePropType
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
            keypadEntry: '',
            drawerHeight: 0,
            channel: createUUID(),
            time: getTime(),
            waitingForHint: false,
            drawerOpen: false,
            attachmentOptionsVisible: false,
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

                if (run.status === 'waiting' && finalStep) {
                    let count = active[finalStep.node_uuid];
                    if (!count) {
                        count = 0;
                    }
                    active[finalStep.node_uuid] = ++count;
                    activeFlow = run.flow_uuid;
                }
            }

            const activity: Activity = { segments: paths, nodes: active };
            this.props.mergeEditorState({ activity });

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

            let quickReplies: string[] = null;

            let messageFound = false;
            while (events.length > 0 && !messageFound) {
                const event = events.shift();

                if (isMessage(event)) {
                    messageFound = true;

                    if (isMT(event)) {
                        // save off any quick replies we might have
                        if (event.msg.quick_replies) {
                            quickReplies = event.msg.quick_replies;
                        }
                    }
                }

                toAdd.push(event);
            }

            const newEvents = update(this.state.events, { $push: toAdd }) as EventProps[];
            const newState: Partial<SimulatorState> = { events: newEvents };

            if (quickReplies !== null) {
                newState.quickReplies = quickReplies;
            }

            this.scrollToBottom();

            this.setState(newState as SimulatorState, () => {
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
        this.setState({ quickReplies: [] }, () => {
            this.updateEvents(runContext.events, () => {
                let active = false;
                for (const run of runContext.session.runs) {
                    if (run.status === 'waiting') {
                        active = true;
                        break;
                    }
                }

                let newEvents = this.state.events;

                if (!active) {
                    newEvents = update(this.state.events, {
                        $push: [
                            {
                                type: 'info',
                                text: 'Exited flow'
                            }
                        ]
                    }) as EventProps[];
                }

                const waitingForHint =
                    runContext.session &&
                    runContext.session.wait &&
                    runContext.session.wait.hint !== undefined;

                let drawerType = null;
                if (waitingForHint) {
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
                        case 'digits':
                            drawerType = DrawerType.digit;
                            if (runContext.session.wait.hint.count !== 1) {
                                drawerType = DrawerType.digits;
                            }
                            break;
                        default:
                            console.log('Unknown hint', runContext.session.wait.hint.type);
                    }
                }

                let drawerOpen = waitingForHint;

                // if we have quick replies, open our drawe with attachment options
                if (!drawerType && this.hasQuickReplies()) {
                    drawerType = DrawerType.quickReplies;
                    drawerOpen = true;
                }

                this.setState(
                    {
                        active,
                        sprinting: false,
                        session: runContext.session,
                        events: newEvents,
                        // attachmentOptionsVisible: !waitingForHint,
                        drawerOpen,
                        drawerType,
                        waitingForHint
                    },
                    () => {
                        this.updateActivity();
                        this.handleFocusUpdate();
                    }
                );
            });
        });
    }

    private startFlow(): void {
        // reset our events and contact
        this.setState(
            {
                sprinting: true,
                drawerOpen: false,
                attachmentOptionsVisible: false,
                events: []
            },
            () => {
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
                            name: this.props.definition.name
                        },
                        params: {},
                        triggered_on: now
                    }
                };

                axios.default
                    .post(
                        getURL(this.context.config.endpoints.simulateStart),
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

        this.setState(
            { sprinting: true, attachmentOptionsVisible: false, drawerOpen: false },
            () => {
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
                    .post(
                        getURL(this.context.config.endpoints.simulateResume),
                        JSON.stringify(body, null, 2)
                    )
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
            }
        );
    }

    private onReset(event: any): void {
        this.startFlow();
    }

    private scrollToBottom(delay?: number): void {
        const wait = delay || 0;
        if (this.bottom) {
            window.setTimeout(() => {
                if (this.bottom) {
                    this.bottom.scrollIntoView(false);
                }
            }, wait);
        }
    }

    public componentDidUpdate(prevProps: SimulatorProps, prevState: SimulatorState): void {
        if (this.drawerEle !== null) {
            if (
                prevState.drawerHeight !== this.drawerEle.clientHeight ||
                prevState.drawerOpen !== this.state.drawerOpen
            ) {
                this.setState({ drawerHeight: this.drawerEle.clientHeight }, () => {
                    this.scrollToBottom(800);
                });
            }
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

        this.props.mergeEditorState({ simulating: newVisible });

        this.setState({ visible: newVisible }, () => {
            // clear our viewing definition
            if (!this.state.visible) {
                window.setTimeout(() => {
                    this.props.mergeEditorState({ activity: this.props.liveActivity });
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
        this.setState({ drawerOpen: false, attachmentOptionsVisible: false }, () => {
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

    private getQuickRepliesDrawer(): JSX.Element {
        return (
            <div className={styles.quickReplies}>
                {this.state.quickReplies.map(reply => (
                    <div
                        className={styles.quickReply}
                        onClick={() => {
                            this.resume(reply);
                        }}
                        key={`reply_${reply}`}
                    >
                        {reply}
                    </div>
                ))}
            </div>
        );
    }

    private handleKeyPress(btn: string, multiple: boolean): void {
        if (!multiple) {
            this.resume(btn);
        } else {
            if (btn === '#') {
                this.resume(this.state.keypadEntry);
                this.setState({ keypadEntry: '' });
            } else {
                this.setState((prevState: SimulatorState) => {
                    return { keypadEntry: (prevState.keypadEntry += btn) };
                });
            }
        }
    }

    private getKeyRow(keys: string[], multiple: boolean): JSX.Element {
        return (
            <div className={styles.row}>
                {keys.map((key: string) => {
                    return (
                        <div
                            key={'btn_' + key}
                            onClick={() => {
                                this.handleKeyPress(key, multiple);
                            }}
                            className={styles.key}
                        >
                            {key}
                        </div>
                    );
                })}
            </div>
        );
    }

    private getKeypadDrawer(multiple: boolean): JSX.Element {
        return (
            <div className={styles.keypad}>
                {multiple ? (
                    <div className={styles.keypadEntry}>{this.state.keypadEntry}</div>
                ) : null}
                <div className={styles.keys}>
                    {this.getKeyRow(['1', '2', '3'], multiple)}
                    {this.getKeyRow(['4', '5', '6'], multiple)}
                    {this.getKeyRow(['7', '8', '9'], multiple)}
                    {this.getKeyRow(['*', '0', '#'], multiple)}
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
            case DrawerType.quickReplies:
                return this.getQuickRepliesDrawer();
            case DrawerType.digits:
            case DrawerType.digit:
                return this.getKeypadDrawer(this.state.drawerType === DrawerType.digits);
        }
        return null;
    }

    private handleDrawerRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.drawerEle = ref);
    }

    public getDrawer(): JSX.Element {
        const style: any = {};

        if (this.state.drawerOpen) {
            style.bottom = 50;

            // are we being forced open
            if (this.state.waitingForHint) {
                style.bottom = 25;
                style.zIndex = 150;
                style.paddingBottom = 10;
            }
        } else {
            style.bottom = -this.state.drawerHeight;
        }

        return (
            <div
                ref={this.handleDrawerRef}
                style={style}
                className={
                    styles.drawer +
                    ' ' +
                    (this.state.drawerOpen ? styles.drawerVisible : '') +
                    ' ' +
                    (this.state.attachmentOptionsVisible ? '' : styles.forced)
                }
            >
                {this.getDrawerContents()}
            </div>
        );
    }

    private hasQuickReplies(): boolean {
        return (this.state.quickReplies || []).length > 0;
    }

    private handleHideAttachments(): void {
        this.setState(
            {
                attachmentOptionsVisible: false,
                drawerOpen: false
            },
            () => {
                if (this.hasQuickReplies()) {
                    window.setTimeout(() => {
                        this.showAttachmentDrawer(DrawerType.quickReplies);
                    }, 300);
                }
            }
        );
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
                    (this.state.attachmentOptionsVisible ? styles.visible : '')
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
        this.setState({ drawerOpen: false });
    }

    private showAttachmentDrawer(drawerType: DrawerType): void {
        // if we are already open but a different type, hide ourselves and reopen with the new type
        if (this.state.drawerOpen) {
            // if that type is already open, its a noop
            if (drawerType === this.state.drawerType) {
                return;
            }

            this.handleHideAttachmentDrawer();
            window.setTimeout(() => {
                this.showAttachmentDrawer(drawerType);
            }, 300);
        } else {
            this.setState((prevState: SimulatorState) => {
                return { drawerOpen: true, drawerType };
            });
        }
    }

    public render(): ReactNode {
        const messages: JSX.Element[] = [];
        for (const event of this.state.events) {
            messages.push(<LogEvent {...event} key={String(event.created_on)} />);
        }

        const simHidden = !this.state.visible ? styles.simHidden : '';
        const tabHidden = this.state.visible ? styles.tabHidden : '';

        const messagesStyle: any = {
            height: 366 - (this.state.drawerOpen ? this.state.drawerHeight - 20 : 0)
        };

        // if attachments are forced open, account for missing attachment choice panel
        if (this.state.drawerOpen && this.state.waitingForHint) {
            messagesStyle.height += 25;
        }

        return (
            <div className={styles.simContainer}>
                <div>
                    <div id="simulator" className={styles.simulator + ' ' + simHidden} key={'sim'}>
                        <div className={styles.screen}>
                            <div className={styles.header}>
                                <div className={styles.close + ' fe-x'} onClick={this.onToggle} />
                            </div>
                            <div className={styles.messages} style={messagesStyle}>
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
                                    disabled={this.state.sprinting}
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
                                            this.setState({
                                                attachmentOptionsVisible: true,
                                                drawerOpen: false
                                            });
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
const mapStateToProps = ({
    flowContext: { definition, nodes, assetStore },
    editorState: { liveActivity }
}: AppState) => ({
    liveActivity,
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
