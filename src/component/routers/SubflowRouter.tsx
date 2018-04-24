import * as React from 'react';
import { connect } from 'react-redux';
import { ConfigProviderContext, fakePropType } from '../../config';
import { StartFlow } from '../../flowTypes';
import { AppState } from '../../store';
import FlowElement from '../form/FlowElement';
import { SaveLocalizations } from '../NodeEditor/NodeEditor';

export interface SubflowRouterStoreProps {
    translating: boolean;
}

export interface SubflowRouterPassedProps {
    action: StartFlow;
    saveLocalizations: SaveLocalizations;
    updateRouter: Function;
    getExitTranslations(): JSX.Element;
    onBindWidget(ref: any): void;
}

export type SubflowRouterProps = SubflowRouterStoreProps & SubflowRouterPassedProps;

export class SubflowRouter extends React.PureComponent<SubflowRouterProps> {
    public static contextTypes = {
        endpoints: fakePropType
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

        return (
            <div>
                <p>Select a flow to run</p>
                <FlowElement
                    ref={this.props.onBindWidget}
                    name="Flow"
                    endpoint={this.context.endpoints.flows}
                    flow={this.props.action.flow}
                    required={true}
                />
            </div>
        );
    }
}

const mapStateToProps = ({ flowEditor: { editorUI: { translating } } }: AppState) => ({
    translating
});

const ConnectedSubflowRouterForm = connect(mapStateToProps, null, null, { withRef: true })(
    SubflowRouter
);

export default ConnectedSubflowRouterForm;
