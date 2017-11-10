import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import { FlowDetails } from '../services/Temba';

export interface FlowListProps {
    getFlows: Function;
    onFlowSelect: Function;
}

interface FlowListState {
    flows?: FlowDetails[];
    show: boolean;
}

/**
 * A navigable list of flows for an account
 */
export default class FlowList extends React.PureComponent<FlowListProps, FlowListState> {
    constructor(props: FlowListProps) {
        super(props);

        this.state = {
            show: false
        };

        this.onFlowSelect = this.onFlowSelect.bind(this);
        this.onToggle = this.onFlowSelect.bind(this);
    }

    componentDidMount() {
        this.props.getFlows().then((flows: FlowDetails[]) => this.setState({ flows, show: true }));
    }

    onFlowSelect(uuid: string) {
        this.setState({ show: false });
        this.props.onFlowSelect(uuid);
    }

    onToggle() {
        this.setState({ show: !this.state.show });
    }

    render() {
        let flows: JSX.Element[] = [];

        if (this.state.flows) {
            flows = this.state.flows.map(({ uuid, name }) => (
                <div key={uuid} style={{ background: 'rgba(255,255,255,.8)' }}>
                    <a href="javscript:void(0);" onClick={() => this.onFlowSelect(uuid)}>
                        {name}
                    </a>
                </div>
            ));
        }

        if (this.state.show) {
            return (
                <div id="flow-list" style={{ position: 'absolute', zIndex: 2000 }}>
                    {flows}
                </div>
            );
        }

        if (this.state.flows) {
            return (
                <div style={{ position: 'absolute', zIndex: 2000 }}>
                    <a href="javascript:void(0);" onClick={this.onToggle}>
                        Flows
                    </a>
                </div>
            );
        }

        return null;
    }
};
