import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Config } from '../config';
import { Endpoints, FlowDefinition } from '../flowTypes';
import { DispatchWithState, fetchFlow, Flows, ReduxState } from '../redux';
import { flowList } from './FlowList.scss';

export interface FlowOption {
    uuid: string;
    name: string;
}

interface FlowListProps {
    assetHost: string;
    endpoints: Endpoints;
    definition: FlowDefinition;
    flows: Flows;
    fetchFlowAC: (endpoint: string, uuid: string) => Promise<void>;
}

const FlowListContainer: React.SFC = () => (
    <Config
        render={({ assetHost, endpoints }) =>
            // prettier-ignore
            <ConnectedFlowList
                assetHost={assetHost}
                endpoints={endpoints}
            />
        }
    />
);

// Navigable list of flows for an account
const FlowList: React.SFC<FlowListProps> = ({
    assetHost,
    endpoints,
    definition,
    flows,
    fetchFlowAC
}) => {
    const flowOption: FlowOption = definition
        ? {
              uuid: definition.uuid,
              name: definition.name
          }
        : null;

    const onChange = ({ uuid }: { uuid: string; name: string }) => {
        if (flows.length) {
            if (uuid !== definition.uuid) {
                fetchFlowAC(endpoints.flows, uuid);
            }
        }
    };

    return (
        <div id="flow-list" className={flowList}>
            <Select
                /** FlowList */
                placeholder="Select a flow..."
                onChange={onChange}
                searchable={false}
                clearable={false}
                labelKey="name"
                valueKey="uuid"
                value={flowOption}
                options={flows}
                isLoading={!flowOption || (!flows || !flows.length)}
            />
        </div>
    );
};

const mapStateToProps = ({ definition, flows }: ReduxState) => ({ definition, flows });

const mapDispatchToProps = (dispatch: DispatchWithState) => ({
    fetchFlowAC: (endpoint: string, uuid: string) => dispatch(fetchFlow(endpoint, uuid))
});

const ConnectedFlowList = connect(mapStateToProps, mapDispatchToProps)(FlowList);

export default FlowListContainer;
