import * as React from 'react';
import { Plumber } from '../services/Plumber';
import { Exit } from '../FlowDefinition';

var styles = require('./Exit.scss');

export interface ExitProps {
    exit: Exit;
    onDisconnect(exit: Exit): void;
}

export interface ExitState {
    confirmDelete: boolean;
}

export class ExitComp extends React.PureComponent<ExitProps, ExitState> {

    private timeout: any;

    constructor(props: ExitProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);

        this.state = {
            confirmDelete: false
        }
    }

    private onClick(event: React.MouseEvent<HTMLDivElement>) {

        event.preventDefault();
        event.stopPropagation();

        if (this.props.exit.destination_node_uuid) {
            this.setState({
                confirmDelete: true
            }, () => {
                this.timeout = window.setTimeout(() => {
                    this.setState({
                        confirmDelete: false
                    })
                }, 2000);
            });
        }
    }

    private onDisconnect(event: React.MouseEvent<HTMLDivElement>) {
        event.stopPropagation();
        event.preventDefault();
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }
        this.props.onDisconnect(this.props.exit);
    }

    componentDidMount() {
        Plumber.get().makeSource(this.props.exit.uuid);
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
            Plumber.get().remove(this.props.exit.uuid);
        }
    }

    private connect() {
        Plumber.get().connectExit(this.props.exit, this.state.confirmDelete);
    }

    render() {
        var classes: string[] = [styles.exit, "plumb-exit"]
        var confirm: JSX.Element = null;
        if (this.state.confirmDelete && this.props.exit.destination_node_uuid) {
            confirm = <span onMouseUp={this.onDisconnect} className="icon-remove" />
            classes.push(styles.confirm_delete);
        }
        // console.log('Rendering exit', this.props.uuid);
        var connected = this.props.exit.destination_node_uuid ? " jtk-connected" : "";

        return (
            <div key={this.props.exit.uuid} className={classes.join(" ")}>
                <div className={styles.name}>
                    {this.props.exit.name}
                </div>
                <div onMouseUp={this.onClick} id={this.props.exit.uuid} className={styles.endpoint + " " + connected}>
                    {confirm}
                </div>
            </div>
        )
    }
}

export default Exit;