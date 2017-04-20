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
            Plumber.get().connect(this.props.uuid, this.props.destination);
            console.log('Connected', this.props.uuid, this.props.destination);
        }
    }

    render() {
        // console.log('Rendering exit', this.props.uuid);
        var count = this.props.totalExits;
        var pct = Math.floor(100 / count);
        var first = this.props.first ? " first" : "";
        var connected = this.props.destination ? " jtk-connected" : "";
        return (
            <div key={this.props.uuid} className={"exit" + first}>
                <div className="name">
                    {this.props.name}
                </div>
                <div id={this.props.uuid} className={"endpoint" + connected}/>
            </div>
        )
    }
}

export default ExitComp;