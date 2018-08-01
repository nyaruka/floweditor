// TODO: Remove use of Function
// tslint:disable:ban-types
import * as React from 'react';
import FlowElement from '~/components/form/select/flows/FlowElement';
import { ConfigProviderContext } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { StartFlow } from '~/flowTypes';

export interface SubflowRouterStoreProps {
    translating: boolean;
}

export interface SubflowRouterPassedProps {
    action: StartFlow;
    updateRouter: Function;
    getExitTranslations(): JSX.Element;
    onBindWidget(ref: any): void;
}

export type SubflowRouterProps = SubflowRouterStoreProps & SubflowRouterPassedProps;

export class SubflowRouter extends React.PureComponent<SubflowRouterProps> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: SubflowRouterProps, context: ConfigProviderContext) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        // if (this.props.translating) {
        //    return this.props.saveLocalizations(widgets);
        // }
        this.props.updateRouter();
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        }

        return (
            <div>
                <p>Select a flow to run</p>
                <FlowElement
                    ref={this.props.onBindWidget}
                    name="Flow"
                    assets={this.context.assetService.getFlowAssets()}
                    entry={{ value: this.props.action.flow }}
                    //  flow={this.props.action.flow}
                    // required={true}
                />
            </div>
        );
    }
}
