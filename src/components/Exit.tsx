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

        // we need to make sure our elements exist when 
        // creating new routed exits
        if (this.props.exit.destination) {
            window.setTimeout(() => {
                Plumber.get().connectExit(this.props.exit);
            }, 0);
        }
    }

    componentDidUpdate(prevProps: ExitProps) {
        // console.log("exit updated", this.props.uuid);
        if (this.props.exit.destination) {
            Plumber.get().connectExit(this.props.exit);
        }
    }

    componentWillUnmount() {
        if (this.props.exit.destination) {
            Plumber.get().remove(this.props.exit.uuid);
        }
    }

    render() {
        // console.log('Rendering exit', this.props.uuid);
        var connected = this.props.exit.destination ? " jtk-connected" : "";

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