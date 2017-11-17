import * as React from 'react';
import Select from 'react-select';
import { FlowDefinition } from '../flowtypes';
import EditorConfig from '../services/EditorConfig';
import External, { FlowDetails } from '../services/External';

export interface FlowListProps {
    EditorConfig: EditorConfig;
    External: External;
    onFlowSelect: Function;
}

interface FlowListState {
    flows: { uuid: string; name: string }[];
    selected: Partial<FlowDetails>;
}

/**
 * A navigable list of flows for an account
 */
export default class FlowList extends React.Component<FlowListProps, FlowListState> {
    constructor(props: FlowListProps) {
        super(props);

        this.state = {
            flows: [],
            selected: null
        };

        this.onChange = this.onChange.bind(this);
    }

    private onChange(flow: any) {
        const { flows, selected } = this.state;
        if (flows.length) {
            if (selected) {
                if (flow.uuid === selected.uuid) {
                    return;
                }
            }
            this.setState({ selected: flow }, () => this.props.onFlowSelect(flow.uuid));
        }
    }

    public componentDidMount(): void {
        this.props.External.getFlows(this.props.EditorConfig.endpoints.flows).then(
            (flows: FlowDetails[]) => {
                const flowList = flows.map(({ uuid, name }) => ({
                    uuid,
                    name
                }));

                this.setState({
                    flows: flowList
                });
            }
        );
    }

    public render(): JSX.Element {
        return (
            <div
                id="flow-list"
                style={{ position: 'absolute', zIndex: 2000, padding: 15, width: 300 }}>
                <Select
                    /** FlowList */
                    placeholder="Select a flow"
                    onChange={this.onChange}
                    searchable={false}
                    clearable={false}
                    labelKey="name"
                    valueKey="uuid"
                    value={this.state.selected}
                    options={this.state.flows}
                    isLoading={!this.state.flows.length}
                />
            </div>
        );
    }
}
