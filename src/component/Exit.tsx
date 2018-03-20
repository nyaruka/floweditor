import * as React from 'react';
import * as classNames from 'classnames/bind';
import { react as bindCallbacks } from 'auto-bind';
import { connect } from 'react-redux';
import { Exit } from '../flowTypes';
import { disconnectExit, DispatchWithState, ReduxState } from '../redux';
import ActivityManager from '../services/ActivityManager';
import { LocalizedObject } from '../services/Localization';
import Counter from './Counter';
import * as styles from './Exit.scss';
import { createClickHandler } from '../utils';

export interface ExitProps {
    exit: Exit;
    translating: boolean;
    localization: LocalizedObject;
    Activity: ActivityManager;
    plumberMakeSource: Function;
    plumberRemove: Function;
    plumberConnectExit: Function;
    disconnectExitAC: (exitUUID: string) => void;
}

export interface ExitState {
    confirmDelete: boolean;
}

const cx = classNames.bind(styles);

export class ExitComp extends React.PureComponent<ExitProps, ExitState> {
    private timeout: any;

    constructor(props: ExitProps) {
        super(props);

        this.state = {
            confirmDelete: false
        };

        bindCallbacks(this, {
            include: [/^on/, 'getCount']
        });
    }

    public componentDidMount(): void {
        this.props.plumberMakeSource(this.props.exit.uuid);

        if (this.props.exit.destination_node_uuid) {
            this.connect();
        }
    }

    public componentDidUpdate(prevProps: ExitProps): void {
        this.connect();

        if (prevProps.exit.destination_node_uuid && !this.props.exit.destination_node_uuid) {
            if (this.state.confirmDelete) {
                this.setState({ confirmDelete: false });
            }
        }
    }

    public componentWillUnmount(): void {
        if (this.props.exit.destination_node_uuid) {
            this.props.plumberRemove(this.props.exit.uuid);
        }
    }

    private onClick(event: React.MouseEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();

        if (this.props.exit.destination_node_uuid && !this.props.translating) {
            this.setState(
                {
                    confirmDelete: true
                },
                () => {
                    this.timeout = window.setTimeout(
                        () =>
                            this.setState({
                                confirmDelete: false
                            }),
                        2000
                    );
                }
            );
        }
    }

    private onDisconnect(event: React.MouseEvent<HTMLDivElement>): void {
        event.stopPropagation();
        event.preventDefault();

        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }

        this.props.disconnectExitAC(this.props.exit.uuid);
    }

    private onUnmount(key: string): void {
        this.props.Activity.deregister(key);
    }

    private connect(): void {
        const classes: string[] = [];

        if (this.props.translating) {
            classes.push('translating');
        } else if (this.state.confirmDelete) {
            classes.push('confirm-delete');
        }

        this.props.plumberConnectExit(this.props.exit, classes.join(' '));
    }

    private getCount(): number {
        return this.props.Activity.getPathCount(this.props.exit);
    }

    private getActivity(): JSX.Element {
        // Only exits with a destination have activity
        if (this.props.exit.destination_node_uuid) {
            const key = `count:${this.props.exit.uuid}:${this.props.exit.destination_node_uuid}`;
            return (
                <Counter
                    key={key}
                    ref={this.props.Activity.registerListener}
                    getCount={this.getCount}
                    onUnmount={this.onUnmount}
                    containerStyle={styles.activity}
                    countStyle={styles.count}
                />
            );
        }
        return null;
    }

    public render(): JSX.Element {
        const exit = this.props.translating
            ? (this.props.localization.getObject() as Exit)
            : this.props.exit;

        const nameStyle = exit.name ? styles.name : '';

        const connected = this.props.exit.destination_node_uuid ? ' jtk-connected' : '';
        const dragNodeClasses = cx(styles.endpoint, connected);

        const confirmDelete =
            this.state.confirmDelete && this.props.exit.hasOwnProperty('destination_node_uuid');

        const confirm: JSX.Element = confirmDelete ? (
            <span {...createClickHandler(this.onDisconnect)} className="icon-remove" />
        ) : null;

        const exitClasses: string = cx({
            [styles.exit]: true,
            ['plumb-exit']: true,
            [styles.translating]: this.props.translating,
            [styles.unnamed_exit]: exit.name == null,
            [styles.missing_localization]:
                exit.name &&
                this.props.translating &&
                !('name' in this.props.localization.localizedKeys),
            [styles.confirmDelete]: confirmDelete
        });

        const activity = this.getActivity();

        return (
            <div className={exitClasses}>
                <div className={nameStyle}>{exit.name}</div>
                <div
                    {...createClickHandler(this.onClick)}
                    id={this.props.exit.uuid}
                    className={dragNodeClasses}>
                    {confirm}
                </div>
                {activity}
            </div>
        );
    }
}

const mapStateToProps = ({ translating }: ReduxState) => ({
    translating
});

const mapDispatchToProps = (dispatch: DispatchWithState) => ({
    disconnectExitAC: (exitUUID: string) => dispatch(disconnectExit(exitUUID))
});

const ConnectedExit = connect(mapStateToProps, mapDispatchToProps)(ExitComp);

export default ConnectedExit;
