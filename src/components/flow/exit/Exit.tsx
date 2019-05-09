import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Counter from '~/components/counter/Counter';
import DragHelper from '~/components/draghelper/DragHelper';
import * as styles from '~/components/flow/exit/Exit.scss';
import { getExitActivityKey } from '~/components/flow/exit/helpers';
import { fakePropType } from '~/config/ConfigProvider';
import { Cancel, getRecentMessages } from '~/external';
import { Category, Exit, FlowNode, LocalizationMap } from '~/flowTypes';
import { RecentMessage } from '~/store/editor';
import { Asset } from '~/store/flowContext';
import AppState from '~/store/state';
import { DisconnectExit, disconnectExit, DispatchWithState } from '~/store/thunks';
import { createClickHandler, getLocalization, renderIf } from '~/utils';

export interface ExitPassedProps {
    exit: Exit;
    categories: Category[];
    node: FlowNode;
    showDragHelper: boolean;
    plumberMakeSource: (id: string) => void;
    plumberRemove: (id: string) => void;
    plumberConnectExit: (node: FlowNode, exit: Exit) => void;
    plumberUpdateClass: (
        node: FlowNode,
        exit: Exit,
        className: string,
        confirmDelete: boolean
    ) => void;
}

export interface ExitStoreProps {
    translating: boolean;
    dragging: boolean;
    language: Asset;
    localization: LocalizationMap;
    disconnectExit: DisconnectExit;
    segmentCount: number;
}

export type ExitProps = ExitPassedProps & ExitStoreProps;

export interface ExitState {
    confirmDelete: boolean;
    recentMessages: RecentMessage[];
    fetchingRecentMessages: boolean;
    showDragHelper: boolean;
}

const cx = classNames.bind(styles);

export class ExitComp extends React.PureComponent<ExitProps, ExitState> {
    private timeout: number;
    private hideDragHelper: number;
    private pendingMessageFetch: Cancel = {};
    private ele: HTMLDivElement;

    constructor(props: ExitProps) {
        super(props);

        this.state = {
            confirmDelete: false,
            recentMessages: [],
            fetchingRecentMessages: false,
            showDragHelper: props.showDragHelper
        };

        bindCallbacks(this, {
            include: [/^on/, /^get/, /^handle/, /^connect/]
        });
    }

    public static contextTypes = {
        config: fakePropType
    };

    public getSourceId(): string {
        return `${this.props.node.uuid}:${this.props.exit.uuid}`;
    }

    public handleDisconnect(): void {
        this.setState({ showDragHelper: false });
    }

    public componentDidMount(): void {
        this.props.plumberMakeSource(this.getSourceId());

        if (this.ele) {
            this.ele.addEventListener('disconnect', this.handleDisconnect);
        }

        if (this.props.exit.destination_uuid) {
            this.connect();
        }
    }

    public componentDidUpdate(prevProps: ExitProps): void {
        if (
            !this.props.exit.destination_uuid ||
            this.props.exit.destination_uuid !== prevProps.exit.destination_uuid
        ) {
            this.connect();
            if (this.state.confirmDelete) {
                this.setState({ confirmDelete: false });
            }
        }

        this.props.plumberUpdateClass(
            this.props.node,
            this.props.exit,
            'confirm-delete',
            this.state.confirmDelete
        );
    }

    public componentWillUnmount(): void {
        if (this.props.exit.destination_uuid) {
            this.props.plumberRemove(this.getSourceId());
        }

        if (this.ele) {
            this.ele.removeEventListener('disconnect', this.handleDisconnect);
        }
    }

    private handleMouseDown(event: React.MouseEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();
    }

    private handleClick(event: React.MouseEvent<HTMLDivElement>): void {
        if (!this.props.translating) {
            if (this.props.exit.destination_uuid) {
                event.preventDefault();
                event.stopPropagation();
                this.setState(
                    {
                        confirmDelete: true
                    },
                    () => {
                        this.timeout = window.setTimeout(() => {
                            this.setState({
                                confirmDelete: false
                            });
                        }, 2000);
                    }
                );
            } else {
                event.preventDefault();
                event.stopPropagation();
                if (!this.state.showDragHelper) {
                    this.setState({ showDragHelper: true }, () => {
                        if (this.hideDragHelper) {
                            window.clearTimeout(this.hideDragHelper);
                        }
                        this.hideDragHelper = window.setTimeout(() => {
                            this.setState({ showDragHelper: false });
                        }, 3000);
                    });
                }
            }
        }
    }

    private onDisconnect(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }

        if (this.hideDragHelper) {
            window.clearTimeout(this.hideDragHelper);
        }

        this.props.disconnectExit(this.props.node.uuid, this.props.exit.uuid);
    }

    private connect(): void {
        this.props.plumberConnectExit(this.props.node, this.props.exit);
    }

    private handleShowRecentMessages(): void {
        this.setState({ fetchingRecentMessages: true }, () => {
            getRecentMessages(
                this.context.config.endpoints.recents,
                this.props.exit,
                this.pendingMessageFetch
            ).then((recentMessages: RecentMessage[]) => {
                this.setState({ recentMessages, fetchingRecentMessages: false });
            });
        });
    }

    private handleHideRecentMessages(): void {
        if (this.pendingMessageFetch.reject) {
            this.pendingMessageFetch.reject();
            this.pendingMessageFetch = {};
        }

        this.setState({ fetchingRecentMessages: false, recentMessages: [] });
    }

    private getSegmentCount(): JSX.Element {
        // Only exits with a destination have activity
        if (this.props.exit.destination_uuid) {
            const key = `count:${this.props.exit.uuid}:${this.props.exit.destination_uuid}`;
            return (
                <>
                    <Counter
                        key={key}
                        count={this.props.segmentCount}
                        containerStyle={styles.activity}
                        countStyle={styles.count}
                        keepVisible={false}
                        onMouseEnter={this.handleShowRecentMessages}
                        onMouseLeave={this.handleHideRecentMessages}
                    />
                    {this.getRecentMessages()}
                </>
            );
        }
        return null;
    }

    public getName(): { name: string; localized?: boolean } {
        if (this.props.translating) {
            let name: string = '';
            let delim: string = '';

            let localized: boolean = false;

            this.props.categories.forEach((category: Category) => {
                const localization = getLocalization(
                    category,
                    this.props.localization,
                    this.props.language
                );

                localized = localized || 'name' in localization.localizedKeys;
                const localizedObject = localization.getObject() as Category;
                name += delim + localizedObject.name;
                delim = ', ';
            });

            return { name, localized };
        } else {
            return {
                name: this.props.categories.map((category: Category) => category.name).join(', ')
            };
        }
    }

    private getRecentMessages(): JSX.Element {
        if (this.state.fetchingRecentMessages || this.state.recentMessages.length > 0) {
            return (
                <div className={styles.recentMessages}>
                    <div className={styles.title}>Recent Messages</div>
                    {this.state.recentMessages.map((recentMessage: RecentMessage, idx: number) => (
                        <div key={'recent_' + idx} className={styles.message}>
                            <div className={styles.text}>{recentMessage.text}</div>
                            <div className={styles.sent}>{recentMessage.sent}</div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    }

    public render(): JSX.Element {
        const { name, localized } = this.getName();

        const nameStyle = name ? styles.name : '';
        const connected = this.props.exit.destination_uuid ? ' jtk-connected' : '';
        const dragNodeClasses = cx(styles.endpoint, connected);
        const confirmDelete =
            this.state.confirmDelete && this.props.exit.hasOwnProperty('destination_uuid');
        const confirm: JSX.Element = confirmDelete ? (
            <div
                className={styles.confirmX + ' fe-x'}
                {...createClickHandler(this.onDisconnect, () => this.props.dragging)}
            />
        ) : null;
        const exitClasses: string = cx({
            [styles.exit]: true,
            ['plumb-exit']: true,
            [styles.translating]: this.props.translating,
            [styles.unnamed_exit]: name == null,
            [styles.missing_localization]: name && this.props.translating && !localized,
            [styles.confirmDelete]: confirmDelete
        });
        const activity = this.getSegmentCount();
        return (
            <div className={exitClasses}>
                {name ? <div className={nameStyle}>{name}</div> : null}
                <div
                    ref={(ref: HTMLDivElement) => (this.ele = ref)}
                    {...createClickHandler(
                        this.handleClick,
                        () => {
                            return this.props.dragging;
                        },
                        this.handleMouseDown
                    )}
                    id={`${this.props.node.uuid}:${this.props.exit.uuid}`}
                    className={dragNodeClasses}
                >
                    {confirm}
                </div>
                {activity}
                {renderIf(this.state.showDragHelper)(<DragHelper />)}
            </div>
        );
    }
}

const mapStateToProps = (
    {
        flowContext: {
            definition: { localization }
        },
        editorState: { translating, language, dragActive, activity }
    }: AppState,
    props: ExitPassedProps
) => {
    const segmentCount = activity.segments[getExitActivityKey(props.exit)] || 0;
    return {
        dragging: dragActive,
        segmentCount,
        translating,
        language,
        localization
    };
};

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ disconnectExit }, dispatch);

const ConnectedExit = connect(
    mapStateToProps,
    mapDispatchToProps
)(ExitComp);

export default ConnectedExit;
