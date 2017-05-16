import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
import {Temba, FlowDetails} from '../services/Temba';

interface FlowListProps {
    temba: Temba;
    onFlowSelect: Function;
}

interface FlowListState {
    flows?: FlowDetails[];
    show: boolean;
}

/**
 * A navigable list of flows for an account
 */
export class FlowList extends React.PureComponent<FlowListProps, FlowListState> {

    constructor(props: FlowListProps) {
        super(props);
        this.onFlowSelect = this.onFlowSelect.bind(this);
        this.state = {
            show: false
        }
    }

    componentDidMount(){
        this.props.temba.getFlows().then((flows: FlowDetails[]) => {
            this.setState({flows: flows, show: true})
        });
    }

    onFlowSelect(uuid: string) {
        this.setState({show: false});
        this.props.onFlowSelect(uuid);
    }

    onToggle() {
        this.setState({show: !this.state.show});
    }

    render() {
        var flows: JSX.Element[] = [];
        if (this.state.flows){
            for (let flow of this.state.flows) {
                flows.push(
                    <div key={flow.uuid} style={{background: "rgba(255,255,255,.8)"}}>
                        <a href="javscript:void(0);" onClick={()=>{this.onFlowSelect(flow.uuid)}}>{flow.name}</a>
                    </div>
                )
            }
        }

        if (this.state.show) {
            return (
                <div id="flow-list" style={{position: "absolute", zIndex:2000}}>
                    {flows}
                </div>
            )
        }
        if (this.state.flows) {
            return <div style={{position: "absolute", zIndex:2000}}><a href="javascript:void(0);" onClick={this.onToggle.bind(this)}>Flows</a></div>
        }
        
        return null;

    }
}