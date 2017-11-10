import * as React from 'react';
import { Exit } from '../flowTypes';
import { addCommas } from '../helpers/utils';
import Counter from './Counter';
import ActivityManager from '../services/ActivityManager';
import { LocalizedObject } from '../services/Localization';

const styles = require('./Exit.scss');

export interface ExitProps {
    exit: Exit;
    onDisconnect(exitUUID: string): void;

    Localization: LocalizedObject;
    isMutable(): boolean;

    Activity: ActivityManager;

    plumberMakeSource: Function;
    plumberRemove: Function;
    plumberConnectExit: Function;
}

export interface ExitState {
    confirmDelete: boolean;
}

export default class ExitComp extends React.PureComponent<ExitProps, ExitState> {
    private timeout: any;
    private clicking: boolean;

    constructor(props: ExitProps) {
        super(props);

        this.state = {
            confirmDelete: false
        };

        this.onClick = this.onClick.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
    }

    private onClick(event: React.MouseEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();

        if (this.props.exit.destination_node_uuid && this.props.isMutable()) {
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
        }
    }

    private onDisconnect(event: React.MouseEvent<HTMLDivElement>) {
        event.stopPropagation();
        event.preventDefault();
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }
        this.props.onDisconnect(this.props.exit.uuid);
    }

    componentDidMount() {
        this.props.plumberMakeSource(this.props.exit.uuid);
        if (this.props.exit.destination_node_uuid) {
            this.connect();
        }
    }

    componentDidUpdate(prevProps: ExitProps) {
        this.connect();
        if (prevProps.exit.destination_node_uuid && !this.props.exit.destination_node_uuid) {
            if (this.state.confirmDelete) {
                this.setState({ confirmDelete: false });
            }
        }
    }

    componentWillUnmount() {
        if (this.props.exit.destination_node_uuid) {
            this.props.plumberRemove(this.props.exit.uuid);
        }
    }

    private connect() {
        var classes: string[] = [];
        if (this.state.confirmDelete) {
            classes.push('confirm_delete');
        }

        if (this.props.Localization != null) {
            classes.push('translating');
        }

        this.props.plumberConnectExit(this.props.exit, classes.join(' '));
    }

    private renderActivity(): JSX.Element {
        // only exits with a destination have activity
        if (this.props.exit.destination_node_uuid) {
            var key = 'count:' + this.props.exit.uuid + ':' + this.props.exit.destination_node_uuid;
            return (
                <Counter
                    key={key}
                    ref={this.props.Activity.registerListener}
                    getCount={() => {
                        return this.props.Activity.getPathCount(this.props.exit);
                    }}
                    onUnmount={(key: string) => {
                        this.props.Activity.deregister(key);
                    }}
                    containerStyle={styles.activity}
                    countStyle={styles.count}
                />
            );
        }
        return null;
    }

    render() {
        var classes: string[] = [styles.exit, 'plumb-exit'];

        var confirm: JSX.Element = null;

        if (this.state.confirmDelete && this.props.exit.destination_node_uuid) {
            confirm = <span onClick={this.onDisconnect} className="icon-remove" />;
            classes.push(styles.confirm_delete);
        }
        // console.log('Rendering exit', this.props.exit.uuid);
        var connected = this.props.exit.destination_node_uuid ? ' jtk-connected' : '';

        var nameStyle = '';

        var exit = this.props.exit;
        if (this.props.Localization) {
            classes.push(styles.translating);
            exit = this.props.Localization.getObject() as Exit;
            if (!('name' in this.props.Localization.localizedKeys)) {
                classes.push(styles.missing_localization);
            }
        }

        if (exit.name) {
            nameStyle = styles.name;
        }

        return (
            <div className={classes.join(' ')}>
                <div className={nameStyle}>{exit.name}</div>
                <div
                    onMouseUp={(event: any) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                    onClick={this.onClick}
                    id={this.props.exit.uuid}
                    className={styles.endpoint + ' ' + connected}>
                    {confirm}
                </div>
                {this.renderActivity()}
            </div>
        );
    }
};
