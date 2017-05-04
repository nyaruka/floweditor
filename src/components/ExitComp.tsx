import * as React from 'react';
import * as Interfaces from '../interfaces';
import Plumber from '../services/Plumber';

class ExitComp extends React.PureComponent<Interfaces.ExitProps, {}> {

    componentDidMount() {
        // we can be dragged from
        Plumber.get().makeSource(this.props.uuid);
    }

    componentDidUpdate(prevProps: Interfaces.ExitProps) {
        if (this.props.destination) {
            Plumber.get().connectExit(this.props);
        }
    }

    componentWillUnmount() {
        Plumber.get().remove(this.props.uuid);
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

export default ExitComp;