import * as React from 'react';
import { Provider as StateProvider, Redux } from 'redux-render';
import axios from 'axios';
import { react as bindCallbacks } from 'auto-bind';
import { jsonEqual } from '../utils';
import { FlowDetails, getFlow, getFlows } from '../external';
import { FlowDefinition, Languages, FlowEditorConfig, Endpoints } from '../flowTypes';
import FlowMutator from '../services/FlowMutator';
import Temba from '../services/Temba';
import ComponentMap from '../services/ComponentMap';
import Flow from './Flow';
import FlowList, { FlowOption } from './FlowList';
import LanguageSelector, { Language } from './LanguageSelector';
import ConfigProvider, { languagesPT, endpointsPT, Config } from '../config';
import {
    store,
    ReduxState,
    Flows,
    updateLanguage,
    updateFetchingFlow,
    updateDefinition,
    updateDependencies,
    fetchFlows,
    fetchFlow,
    Dispatch
} from '../redux';

import '../global.scss';
import * as styles from './index.scss';

export type OnSelectFlow = ({ uuid }: FlowOption) => void;

export interface FlowEditorContainerProps {
    config: FlowEditorConfig;
}

export interface FlowEditorProps {
    assetHost: string;
    endpoints: Endpoints;
    flow: string;
    languages: Languages;
    language: Language;
    baseLanguage: Language;
    translating: boolean;
    fetchingFlow: boolean;
    definition: FlowDefinition;
    nodeDragging: boolean;
    flows: Flows;
    dependencies: FlowDefinition[];
    dispatch: Dispatch;
}

export const getBaseLanguage = (languages: { [iso: string]: string }): Language => {
    const [iso] = Object.keys(languages);
    const name = languages[iso];
    return {
        name,
        iso
    };
};

const IN_PROD = process.env.NODE_ENV === 'production';

const hotStore = store();

const FlowEditorContainer: React.SFC<FlowEditorContainerProps> = ({ config }) => (
    <ConfigProvider config={config}>
        <Config
            render={({ assetHost, endpoints, languages }) => (
                <StateProvider store={hotStore}>
                    <Redux
                        selector={({
                            translating,
                            language,
                            fetchingFlow,
                            definition,
                            nodeDragging,
                            flows,
                            dependencies
                        }: ReduxState) => ({
                            translating,
                            language,
                            fetchingFlow,
                            definition,
                            nodeDragging,
                            flows,
                            dependencies
                        })}>
                        {(
                            {
                                translating,
                                language,
                                fetchingFlow,
                                definition,
                                nodeDragging,
                                flows,
                                dependencies
                            }: ReduxState,
                            dispatch: Dispatch
                        ) => {
                            // Update app state using config
                            return (
                                <FlowEditor
                                    assetHost={assetHost}
                                    endpoints={endpoints}
                                    baseLanguage={getBaseLanguage(languages)}
                                    flow={config.flow}
                                    languages={languages}
                                    language={language}
                                    translating={translating}
                                    fetchingFlow={fetchingFlow}
                                    definition={definition}
                                    nodeDragging={nodeDragging}
                                    flows={flows}
                                    dependencies={dependencies}
                                    dispatch={dispatch}
                                />
                            );
                        }}
                    </Redux>
                </StateProvider>
            )}
        />
    </ConfigProvider>
);

/**
 * A navigable list of flows for an account
 */
class FlowEditor extends React.Component<FlowEditorProps> {
    private Temba: Temba;
    private Mutator: FlowMutator;
    private ComponentMap: ComponentMap;
    private host = process.env.NODE_ENV === 'production' ? this.props.assetHost : '';

    constructor(props: FlowEditorProps) {
        super(props);

        if (IN_PROD) {
            axios.defaults.baseURL = this.props.assetHost;
        }

        bindCallbacks(this, {
            // prettier-ignore
            include: [
                'setDefinition',
                'save'
            ]
        });

        // this.Temba = new Temba('https://your-site.com', '05594lM5uQsTHLlvrBts5lenb5Iyex6P');
    }

    public componentDidMount(): void {
        if (!this.props.language) {
            // prettier-ignore
            this.props.dispatch(
                updateLanguage(this.props.baseLanguage)
            );
        }

        if (!this.props.definition) {
            this.props.dispatch(updateFetchingFlow(true));
            getFlow(this.host + this.props.endpoints.flows, this.props.flow, false)
                .then(({ definition }: FlowDetails) => {
                    this.props.dispatch(updateDefinition(definition));
                    this.props.dispatch(updateFetchingFlow(false));
                    this.initialize(definition);
                })
                .catch((error: any) => console.log(`fetchFlow error: ${error}`));
        } else {
            this.initialize(this.props.definition);
        }

        // prettier-ignore
        fetchFlows(
            this.props.dispatch,
            this.host + this.props.endpoints.flows
        );
    }

    public setDefinition(definition: FlowDefinition, dependencies?: FlowDefinition[]): void {
        if (this.props.fetchingFlow) {
            this.props.dispatch(updateFetchingFlow(false));
        }

        if (!this.props.definition) {
            this.props.dispatch(updateDefinition(definition));
        }

        if (dependencies) {
            this.props.dispatch(updateDependencies(dependencies));
        }
    }

    private save(definition: FlowDefinition): void {
        // this.props.External.saveFlow(definition).catch((error) => {
        // do nothing
        // });
    }

    // TODO: determine full dependency list and fetch those at simulation time
    public initialize(definition: FlowDefinition): void {
        this.ComponentMap = new ComponentMap(definition);

        this.Mutator = new FlowMutator(
            this.ComponentMap,
            definition,
            this.setDefinition,
            this.save
            // this.props,
        );
    }

    private getLanguageSelectorReactNode(): JSX.Element {
        if (this.props.languages) {
            return <LanguageSelector />;
        }
        return null;
    }

    private getFlowReactNode(): JSX.Element {
        const displayFlow =
            this.props.definition &&
            this.props.language &&
            !this.props.fetchingFlow &&
            this.ComponentMap &&
            this.Mutator;

        return displayFlow ? (
            <Flow ComponentMap={this.ComponentMap} Mutator={this.Mutator} />
        ) : null;
    }

    public render(): JSX.Element {
        const flow: JSX.Element = this.getFlowReactNode();
        return (
            <div
                className={this.props.translating ? styles.translating : undefined}
                data-spec="editor-container">
                <div className={styles.editor} data-spec="editor">
                    <FlowList />
                    <LanguageSelector />
                    {flow}
                </div>
            </div>
        );
    }
}

export default FlowEditorContainer;
