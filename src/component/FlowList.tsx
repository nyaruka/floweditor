import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { bindActionCreators } from 'redux';
import { ConfigProviderContext, fakePropType } from '../config';
import { AppState, DispatchWithState, FetchFlow, fetchFlow, Flows } from '../store';
import { flowList } from './FlowList.scss';

export interface FlowOption {
    uuid: string;
    name: string;
}

export interface FlowListStoreProps {
    flowUUID: string;
    flowName: string;
    flows: Flows;
    fetchFlow: FetchFlow;
}

export const getFlowOption = (uuid: string, name: string): FlowOption => ({
    uuid: uuid ? uuid : '',
    name: name ? name : ''
});

export const shouldDisplayLoading = (flowOption: FlowOption, flows: Flows) =>
    !(flowOption.name && flowOption.uuid) || (!flows || !flows.length);

export const flowListContainerSpecId = 'flow-list';
export const PLACEHOLDER = 'Select a flow...';
export const labelKey = 'name';
export const valueKey = 'uuid';

export class FlowList extends React.Component<FlowListStoreProps> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: FlowListStoreProps, context: ConfigProviderContext) {
        super(props, context);

        this.onChange = this.onChange.bind(this);
    }

    public onChange({ uuid }: { uuid: string; name: string }): void {
        if (this.props.flows.length && uuid !== this.props.flowUUID) {
            this.props.fetchFlow(this.context.endpoints.flows, uuid, this.context.assetService);
        }
    }

    public render(): JSX.Element {
        const flowOption = getFlowOption(this.props.flowUUID, this.props.flowName);
        const isLoading = shouldDisplayLoading(flowOption, this.props.flows);
        return (
            <div
                id={flowListContainerSpecId}
                className={flowList + ' select-small'}
                data-spec={flowListContainerSpecId}
            >
                <Select
                    placeholder={PLACEHOLDER}
                    onChange={this.onChange}
                    searchable={false}
                    clearable={false}
                    labelKey={labelKey}
                    valueKey={valueKey}
                    value={flowOption}
                    options={this.props.flows}
                    isLoading={isLoading}
                />
            </div>
        );
    }
}

const mapStateToProps = ({
    flowContext: { definition },
    flowEditor: { editorUI: { flows } }
}: AppState) => {
    const props = {} as FlowListStoreProps;
    if (definition && definition.uuid && definition.name) {
        props.flowUUID = definition.uuid;
        props.flowName = definition.name;
    }
    if (flows) {
        props.flows = flows;
    }
    return props;
};

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ fetchFlow }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FlowList);
