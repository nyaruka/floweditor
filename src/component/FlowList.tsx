import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Config } from '../config';
import { Endpoints, FlowDefinition } from '../flowTypes';
import { DispatchWithState, fetchFlow, Flows, AppState, FetchFlow } from '../store';
import { flowList } from './FlowList.scss';
import { bindActionCreators } from 'redux';

export interface FlowOption {
    uuid: string;
    name: string;
}

export interface FlowListPassedProps {
    assetHost: string;
    endpoints: Endpoints;
}

export interface FlowListStoreProps {
    definition: FlowDefinition;
    flows: Flows;
    fetchFlow: FetchFlow;
}

export type FlowListProps = FlowListPassedProps & FlowListStoreProps;

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
    fetchFlow
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
                fetchFlow(endpoints.flows, uuid);
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

const mapStateToProps = ({
    flowContext: { definition },
    flowEditor: { editorUI: { flows } }
}: AppState) => ({
    definition,
    flows
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ fetchFlow }, dispatch);

const ConnectedFlowList = connect(mapStateToProps, mapDispatchToProps)(FlowList);

export default FlowListContainer;
