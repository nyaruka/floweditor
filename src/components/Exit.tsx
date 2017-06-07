import * as React from 'react';
import { Plumber } from '../services/Plumber';
import { Exit } from '../FlowDefinition';

var styles = require('./Exit.scss');

export interface ExitProps {
    exit: Exit;
}

export class ExitComp extends React.PureComponent<ExitProps, {}> {

    componentDidMount() {
        Plumber.get().makeSource(this.props.exit.uuid);
        this.connect();
    }

    componentDidUpdate(prevProps: ExitProps) {
        this.connect();
    }

    componentWillUnmount() {
        if (this.props.exit.destination_node_uuid) {
            Plumber.get().remove(this.props.exit.uuid);
        }
    }

    private connect() {
        if (this.props.exit.destination_node_uuid) {
            Plumber.get().connectExit(this.props.exit);
        }
    }

    render() {
        // console.log('Rendering exit', this.props.uuid);
        var connected = this.props.exit.destination_node_uuid ? " jtk-connected" : "";

        return (
            <div key={this.props.exit.uuid} className={styles.exit + " plumb-exit"}>
                <div className={styles.name}>
                    {this.props.exit.name}
                </div>
                <div id={this.props.exit.uuid} className={styles.endpoint + " " + connected} />
            </div>
        )
    }
}

export default Exit;