import * as React from 'react';
import Select from 'react-select';
import EditorConfig from '../services/EditorConfig';
import External, { FlowDetails } from '../services/External';

export interface FlowListProps {
    fetching: boolean;
    EditorConfig: EditorConfig;
    External: External;
    onFlowSelect: Function;
}

interface FlowListState {
    flows?: FlowDetails[];
}

/**
 * A navigable list of flows for an account
 */
export default class FlowList extends React.PureComponent<FlowListProps, FlowListState> {
    constructor(props: FlowListProps) {
        super(props);

        this.state = {
            flows: []
        };

        this.onFlowSelect = this.onFlowSelect.bind(this);
    }

    private onFlowSelect({ uuid }: any): void {
        this.props.onFlowSelect(uuid);
    }

    public componentDidMount(): void {
        this.props.External.getFlows(this.props.EditorConfig.endpoints.flows).then(
            (flows: FlowDetails[]) =>
                this.setState({
                    flows
                })
        );
    }

    public render(): JSX.Element {
        const flows: { uuid: string; name: string }[] = this.state.flows.map(({ uuid, name }) => ({
            uuid,
            name
        }));

        return (
            <div
                id="flow-list"
                style={{ position: 'absolute', zIndex: 2000, padding: 15, width: 300 }}>
                <Select
                    placeholder="Select a flow"
                    onChange={this.onFlowSelect}
                    searchable={false}
                    clearable={false}
                    labelKey="name"
                    valueKey="uuid"
                    options={flows}
                    isLoading={this.props.fetching}
                />
            </div>
        );
    }
}
