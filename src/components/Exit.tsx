import * as React from 'react';
import {ExitProps} from '../interfaces';
import {Plumber} from '../services/Plumber';

export class Exit extends React.PureComponent<ExitProps, {}> {

    componentDidMount() {
        Plumber.get().makeSource(this.props.uuid);

        // we need to make sure our elements exist when 
        // creating new routed exits
        if (this.props.destination) {
            window.setTimeout(()=>{
                Plumber.get().connectExit(this.props);
            }, 0);
        }   
    }

    componentDidUpdate(prevProps: ExitProps) {
        // console.log("exit updated", this.props.uuid);
        if (this.props.destination) {
            Plumber.get().connectExit(this.props);
        }
    }

    componentWillUnmount() {
        if (this.props.destination) {
            Plumber.get().remove(this.props.uuid);
        }
    }

    render() {
        // console.log('Rendering exit', this.props.uuid);
        var connected = this.props.destination ? " jtk-connected" : "";

        return (
            <div key={this.props.uuid} className={"exit"}>
                <div className="name">
                    {this.props.name}
                </div>
                <div id={this.props.uuid} className={"endpoint" + connected}/>
            </div>
        )
    }
}

export default Exit;