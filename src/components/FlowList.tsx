import * as React from 'react';
import Select from 'react-select';
import { FlowDetails, GetFlows } from '../providers/external';
import { Endpoints } from '../flowTypes';
import { getFlowsPT, endpointsPT } from '../providers/propTypes';
import { ConfigProviderContext } from '../providers/ConfigProvider';

export interface FlowListProps {
    onFlowSelect({ uuid }: { uuid: string; name: string }): void;
    flow: { uuid: string; name: string };
    flows: { uuid: string; name: string }[];
}

/**
 * A navigable list of flows for an account
 */
const FlowList: React.SFC<FlowListProps> = ({ flow, flows, onFlowSelect }): JSX.Element => (
    <div id="flow-list" style={{ position: 'absolute', zIndex: 2000, padding: 15, width: 300 }}>
        <Select
            /** FlowList */
            placeholder="Select a flow..."
            onChange={onFlowSelect}
            searchable={false}
            clearable={false}
            labelKey="name"
            valueKey="uuid"
            value={flow}
            options={flows}
            isLoading={!flow || !flows}
        />
    </div>
);

export default FlowList;
