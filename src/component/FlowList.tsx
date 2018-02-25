import * as React from 'react';
import Select from 'react-select';

import { flowList } from './FlowList.scss';

export interface FlowOption {
    uuid: string;
    name: string;
}

export interface FlowListProps {
    onSelectFlow({ uuid }: FlowOption): void;
    flowOption: FlowOption;
    flowOptions: FlowOption[];
}

// Navigable list of flows for an account
const FlowList: React.SFC<FlowListProps> = ({
    flowOption,
    flowOptions,
    onSelectFlow
}): JSX.Element => {
    const isLoading = !flowOption || !flowOptions;

    return (
        <div id="flow-list" className={flowList}>
            <Select
                /** FlowList */
                placeholder="Select a flow..."
                onChange={onSelectFlow}
                searchable={false}
                clearable={false}
                labelKey="name"
                valueKey="uuid"
                value={flowOption}
                options={flowOptions}
                isLoading={isLoading}
            />
        </div>
    );
};

export default FlowList;
