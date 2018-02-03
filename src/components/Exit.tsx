import * as React from 'react';
import * as classNames from 'classnames/bind';
import { Exit } from '../flowTypes';
import { addCommas } from '../helpers/utils';
import Counter from './Counter';
import ActivityManager from '../services/ActivityManager';
import { LocalizedObject } from '../services/Localization';

import * as styles from './Exit.scss';

export interface ExitProps {
    exit: Exit;
    onDisconnect(exitUUID: string): void;
    localization: LocalizedObject;
    translating: boolean;
    Activity: ActivityManager;
    plumberMakeSource: Function;
    plumberRemove: Function;
    plumberConnectExit: Function;
}

export interface ExitState {
    confirmDelete: boolean;
}

const cx = classNames.bind(styles);

export default class ExitComp extends React.PureComponent<
    ExitProps,
    ExitState
> {
    private timeout: any;
    private clicking: boolean;

    constructor(props: ExitProps) {
        super(props);

        this.state = {
            confirmDelete: false
        };

        this.onClick = this.onClick.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.getCount = this.getCount.bind(this);
        this.onUnmount = this.onUnmount.bind(this);
    }

    public componentDidMount(): void {
        this.props.plumberMakeSource(this.props.exit.uuid);

        if (this.props.exit.destination_node_uuid) {
            this.connect();
        }
    }

    public componentDidUpdate(prevProps: ExitProps): void {
        this.connect();

        if (
            prevProps.exit.destination_node_uuid &&
            !this.props.exit.destination_node_uuid
        ) {
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

        this.props.onDisconnect(this.props.exit.uuid);
    }

    private onMouseUp(event: any): void {
        event.preventDefault();
        event.stopPropagation();
    }

    private onUnmount(key: string): void {
        this.props.Activity.deregister(key);
    }

    private connect(): void {
        const classes: string[] = [];

        if (this.props.translating) {
            classes.push('translating');
        } else if (this.state.confirmDelete) {
            classes.push('confirm_delete');
        }

        this.props.plumberConnectExit(this.props.exit, classes.join(' '));
    }

    private getCount(): number {
        return this.props.Activity.getPathCount(this.props.exit);
    }

    private getActivity(): JSX.Element {
        // Only exits with a destination have activity
        if (this.props.exit.destination_node_uuid) {
            const key = `count:${this.props.exit.uuid}:${
                this.props.exit.destination_node_uuid
            }`;
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

        const connected = this.props.exit.destination_node_uuid
            ? ' jtk-connected'
            : '';

        const dragNodeClasses = cx(styles.endpoint, connected);

        const confirmDelete =
            this.state.confirmDelete &&
            this.props.exit.hasOwnProperty('destination_node_uuid');

        const confirm: JSX.Element = confirmDelete ? (
            <span onClick={this.onDisconnect} className="icon-remove" />
        ) : null;

        const exitClasses: string = cx({
            [styles.exit]: true,
            ['plumb-exit']: true,
            [styles.translating]: this.props.translating,
            [styles.missing_localization]:
                this.props.translating &&
                !('name' in this.props.localization.localizedKeys),
            [styles.confirm_delete]: confirmDelete
        });

        const activity = this.getActivity();

        return (
            <div className={exitClasses}>
                <div className={nameStyle}>{exit.name}</div>
                <div
                    onMouseUp={this.onMouseUp}
                    onClick={this.onClick}
                    id={this.props.exit.uuid}
                    className={dragNodeClasses}>
                    {confirm}
                </div>
                {activity}
            </div>
        );
    }
}
