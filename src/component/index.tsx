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
    updateLanguage,
    UpdateFlows,
    UpdateLanguage,
    FetchFlow,
    FetchFlows,
    GetState
} from '../redux';
import Flow from './Flow';
import FlowList, { FlowOption } from './FlowList';
import * as styles from './index.scss';
import LanguageSelector, { Language } from './LanguageSelector';
import { bindActionCreators } from 'redux';

export type OnSelectFlow = ({ uuid }: FlowOption) => void;

export interface FlowEditorContainerProps {
    config: FlowEditorConfig;
}

export interface FlowEditorDuxProps {
    language: Language;
    translating: boolean;
    fetchingFlow: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    updateLanguage: UpdateLanguage;
    fetchFlow: FetchFlow;
    fetchFlows: FetchFlows;
}

export interface FlowEditorPassedProps {
    endpoints: Endpoints;
    baseLanguage: Language;
    flow: string;
    languages: Languages;
}

export type FlowEditorProps = FlowEditorPassedProps & FlowEditorDuxProps;

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
        this.props.updateLanguage(this.props.baseLanguage);
        this.props.fetchFlow(this.props.endpoints.flows, this.props.flow);
        // prettier-ignore
        this.props.fetchFlows(
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

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateLanguage,
            fetchFlow,
            fetchFlows
        },
        dispatch
    );

const ConnectedFlowEditor = connect(mapStateToProps, mapDispatchToProps)(FlowEditor);

export default FlowEditorContainer;
