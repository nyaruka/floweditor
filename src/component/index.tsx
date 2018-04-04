import '../global.scss';
import axios from 'axios';
import * as React from 'react';
import { connect, Provider as ReduxProvider } from 'react-redux';
import { bindActionCreators } from 'redux';
import ConfigProvider, {
    assetHostPT,
    ConfigProviderContext,
    endpointsPT,
    flowPT,
    languagesPT
} from '../config';
import { FlowDefinition, FlowEditorConfig } from '../flowTypes';
import {
    AppState,
    createStore,
    DispatchWithState,
    FetchFlow,
    fetchFlow,
    FetchFlows,
    fetchFlows,
    UpdateLanguage,
    updateLanguage
} from '../store';
import { getBaseLanguage } from '../utils';
import ConnectedFlow from './Flow';
import ConnectedFlowList, { FlowOption } from './FlowList';
import * as styles from './index.scss';
import ConnectedLanguageSelector, { Language } from './LanguageSelector';

export type OnSelectFlow = ({ uuid }: FlowOption) => void;

export interface FlowEditorContainerProps {
    config: FlowEditorConfig;
}

export interface FlowEditorStoreProps {
    language: Language;
    translating: boolean;
    fetchingFlow: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    updateLanguage: UpdateLanguage;
    fetchFlow: FetchFlow;
    fetchFlows: FetchFlows;
}

const hotStore = createStore();

// Root container, wires up context-providers/sets baseURL
const FlowEditorContainer: React.SFC<FlowEditorContainerProps> = ({ config }) => (
    <ConfigProvider config={config}>
        <ReduxProvider store={hotStore}>
            <ConnectedFlowEditor />
        </ReduxProvider>
    </ConfigProvider>
);

export const contextTypes = {
    assetHost: assetHostPT,
    endpoints: endpointsPT,
    languages: languagesPT,
    flow: flowPT
};

export const editorContainerSpecId = 'editor-container';

export const editorSpecId = 'editor';

/**
 * A navigable list of flows for an account
 */
export class FlowEditor extends React.Component<FlowEditorStoreProps> {
    public static contextTypes = contextTypes;

    constructor(props: FlowEditorStoreProps, context: ConfigProviderContext) {
        super(props, context);

        if (process.env.NODE_ENV === 'production') {
            axios.defaults.baseURL = context.assetHost;
        }
    }

    public componentDidMount(): void {
        this.props.updateLanguage(getBaseLanguage(this.context.languages));
        this.props.fetchFlow(this.context.endpoints.flows, this.context.flow);
        this.props.fetchFlows(this.context.endpoints.flows);
    }

    public render(): JSX.Element {
        const translatingClass = this.props.translating ? styles.translating : undefined;
        const renderFlow = this.props.definition && this.props.language && !this.props.fetchingFlow;
        return (
            <div
                id={editorContainerSpecId}
                className={translatingClass}
                data-spec={editorContainerSpecId}>
                <div className={styles.editor} data-spec={editorSpecId}>
                    <ConnectedFlowList />
                    <ConnectedLanguageSelector />
                    {renderFlow && <ConnectedFlow />}
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({
    flowContext: { definition, dependencies },
    flowEditor: { editorUI: { translating, language, fetchingFlow } }
}: AppState) => ({
    translating,
    language,
    fetchingFlow,
    definition,
    dependencies
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateLanguage,
            fetchFlow,
            fetchFlows
        },
        dispatch
    );

export const ConnectedFlowEditor = connect(mapStateToProps, mapDispatchToProps)(FlowEditor);

export default FlowEditorContainer;
