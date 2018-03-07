import * as React from 'react';
import { Redux } from 'redux-render';
import Select from 'react-select';
import { flowList } from './FlowList.scss';
import {
    ReduxState,
    Dispatch,
    fetchFlow,
    updateDefinition,
    updateFetchingFlow,
    Flows
} from '../redux';
import { Config } from '../config';
import { jsonEqual } from '../utils';
import { getFlow, FlowDetails } from '../external';
import { FlowDefinition, Endpoints } from '../flowTypes';

export interface FlowOption {
    uuid: string;
    name: string;
}

export interface FlowListProps {
    flows: Flows;
    flowOption: FlowOption;
    flowOptions: FlowOption[];
    definition: FlowDefinition;
    endpoints: Endpoints;
    assetHost: string;
    dispatch: Dispatch;
}

const FlowListContainer: React.SFC = () => (
    <Config
        render={({ assetHost, endpoints }) => (
            <Redux
                selector={({ definition, flows }: ReduxState): Partial<ReduxState> => ({
                    definition,
                    flows
                })}>
                {({ definition, flows }: ReduxState, dispatch: Dispatch) => {
                    const flowOption: FlowOption = definition
                        ? {
                              uuid: definition.uuid,
                              name: definition.name
                          }
                        : null;
                    return (
                        <FlowList
                            flows={flows}
                            flowOption={flowOption}
                            flowOptions={flows}
                            definition={definition}
                            assetHost={assetHost}
                            endpoints={endpoints}
                            dispatch={dispatch}
                        />
                    );
                }}
            </Redux>
        )}
    />
);

// Navigable list of flows for an account
class FlowList extends React.Component<FlowListProps> {
    public shouldComponentUpdate(nextProps: FlowListProps): boolean {
        if (!jsonEqual(nextProps, this.props)) {
            return true;
        }
        return false;
    }

    public componentWillUnmount(): void {
        console.log('FlowList unmounting...');
    }

    public render(): JSX.Element {
        const onChange = ({ uuid }: { uuid: string; name: string }) => {
            if (this.props.flows.length) {
                if (uuid !== this.props.definition.uuid) {
                    const host = process.env.NODE_ENV === 'production' ? this.props.assetHost : '';
                    const url = host + this.props.endpoints.flows;
                    this.props.dispatch(updateFetchingFlow(true));
                    getFlow(url, uuid, false)
                        .then((results: FlowDetails) => {
                            this.props.dispatch(updateDefinition(results.definition));
                            this.props.dispatch(updateFetchingFlow(false));
                        })
                        .catch((error: any) => console.log(`fetchFlow error: ${error}`));
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
                    value={this.props.flowOption}
                    options={this.props.flowOptions}
                    isLoading={!this.props.flowOption || !this.props.flowOptions}
                />
            </div>
        );
    }
}

export default FlowListContainer;
