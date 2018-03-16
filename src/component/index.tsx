import '../global.scss';
import * as React from 'react';
import axios from 'axios';
import { connect, Provider as ReduxProvider } from 'react-redux';
import ConfigProvider, { Config } from '../config';
import { Endpoints, FlowDefinition, FlowEditorConfig, Languages } from '../flowTypes';
import {
    configureStore,
    DispatchWithState,
    fetchFlow,
    fetchFlows,
    ReduxState,
    setLanguage,
    UpdateFlows
} from '../redux';
import Flow from './Flow';
import FlowList, { FlowOption } from './FlowList';
import * as styles from './index.scss';
import LanguageSelector, { Language } from './LanguageSelector';

export type OnSelectFlow = ({ uuid }: FlowOption) => void;

export interface FlowEditorContainerProps {
    config: FlowEditorConfig;
}

export interface FlowEditorProps {
    endpoints: Endpoints;
    baseLanguage: Language;
    flow: string;
    languages: Languages;
    language: Language;
    translating: boolean;
    fetchingFlow: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    setLanguageAC: (language: Language) => void;
    fetchFlowAC: (endpoint: string, uuid: string) => Promise<void>;
    fetchFlowsAC: (endpoint: string) => Promise<void | UpdateFlows>;
}

export const getBaseLanguage = (languages: { [iso: string]: string }): Language => {
    const [iso] = Object.keys(languages);
    const name = languages[iso];
    return {
        name,
        iso
    };
};

const hotStore = configureStore();

// Root container, wires up context-providers/sets baseURL
const FlowEditorContainer: React.SFC<FlowEditorContainerProps> = ({ config }) => (
    <ConfigProvider config={config}>
        <Config
            render={({ assetHost, endpoints, languages }) => {
                if (process.env.NODE_ENV === 'production') {
                    axios.defaults.baseURL = assetHost;
                }
                const baseLanguage = getBaseLanguage(languages);
                return (
                    <ReduxProvider store={hotStore}>
                        <ConnectedFlowEditor
                            endpoints={endpoints}
                            baseLanguage={baseLanguage}
                            flow={config.flow}
                            languages={languages}
                        />
                    </ReduxProvider>
                );
            }}
        />
    </ConfigProvider>
);

/**
 * A navigable list of flows for an account
 */
export class FlowEditor extends React.Component<FlowEditorProps> {
    public componentDidMount(): void {
        this.props.setLanguageAC(this.props.baseLanguage);
        this.props.fetchFlowAC(this.props.endpoints.flows, this.props.flow);
        // prettier-ignore
        this.props.fetchFlowsAC(
            this.props.endpoints.flows
        );
    }

    public render(): JSX.Element {
        const translatingClass = this.props.translating ? styles.translating : undefined;
        return (
            <div id="editor-container" className={translatingClass} data-spec="editor-container">
                <div className={styles.editor} data-spec="editor">
                    <FlowList />
                    <LanguageSelector />
                    {this.props.definition &&
                        this.props.language &&
                        !this.props.fetchingFlow && <Flow />}
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({
    translating,
    language,
    fetchingFlow,
    definition,
    dependencies
}: ReduxState) => ({
    translating,
    language,
    fetchingFlow,
    definition,
    dependencies
});

const mapDispatchToProps = (dispatch: DispatchWithState) => ({
    setLanguageAC: (language: Language) => dispatch(setLanguage(language)),
    fetchFlowAC: (endpoint: string, uuid: string) => dispatch(fetchFlow(endpoint, uuid)),
    fetchFlowsAC: (endpoint: string) => dispatch(fetchFlows(endpoint))
});

const ConnectedFlowEditor = connect(mapStateToProps, mapDispatchToProps)(FlowEditor);

export default FlowEditorContainer;
