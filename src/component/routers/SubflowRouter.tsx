import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { Endpoints, Exit, StartFlow, Case, SwitchRouter } from '../../flowTypes';
import { FormProps } from '../NodeEditor';
import { Node, AnyAction } from '../../flowTypes';
import FlowElement from '../form/FlowElement';
import ComponentMap from '../../services/ComponentMap';
import { ConfigProviderContext, Type, endpointsPT } from '../../config';

export type SubflowRouterProps = Partial<FormProps>;

export default class SubflowRouter extends React.PureComponent<SubflowRouterProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: SubflowRouterProps, context: ConfigProviderContext) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        if (this.props.translating) {
            return this.props.saveLocalizations(widgets);
        }

        this.props.updateRouter();
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        }

        const action = this.props.action as StartFlow;

        return (
            <div>
                <p>Select a flow to run</p>
                <FlowElement
                    ref={this.props.onBindWidget}
                    name="Flow"
                    endpoint={this.context.endpoints.flows}
                    flow_name={action.flow_name}
                    flow_uuid={action.flow_uuid}
                    required={true}
                />
            </div>
        );
    }
}
