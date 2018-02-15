import * as React from 'react';
import axios from 'axios';
import { FlowDetails, GetFlow } from '../providers/ConfigProvider/external';
import { FlowDefinition, Languages } from '../flowTypes';
import FlowMutator from '../services/FlowMutator';
import Temba from '../services/Temba';
import ComponentMap from '../services/ComponentMap';
import FlowList, { FlowOption } from './FlowList';
import LanguageSelectorComp, { Language } from './LanguageSelector';
import Flow from './Flow';
import {
    flowPT,
    baseLanguagePT,
    languagesPT,
    getFlowPT,
    getFlowsPT,
    endpointsPT,
    assetHostPT
} from '../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../providers/ConfigProvider/configContext';

import * as styles from './Editor.scss';

export interface EditorState {
    fetching: boolean;
    language: Language;
    translating: boolean;
    nodeDragging: boolean;
    definition: FlowDefinition;
    flows: Array<{ uuid: string; name: string }>;
    dependencies: FlowDefinition[];
}

const IN_PROD = process.env.NODE_ENV === 'production';

/**
 * A navigable list of flows for an account
 */
export default class Editor extends React.PureComponent<{}, EditorState> {
    private Temba: Temba;
    private Mutator: FlowMutator;
    private ComponentMap: ComponentMap;

    public static contextTypes = {
        assetHost: assetHostPT,
        flow: flowPT,
        baseLanguage: baseLanguagePT,
        languages: languagesPT,
        getFlow: getFlowPT,
        getFlows: getFlowsPT
    };

    constructor(props: {}, context: ConfigProviderContext) {
        super(props, context);

        if (IN_PROD) {
            axios.defaults.baseURL = this.context.assetHost;
        }

        this.state = {
            language: this.context.baseLanguage,
            translating: false,
            fetching: false,
            nodeDragging: false,
            definition: null,
            flows: [],
            dependencies: null
        };

        // this.Temba = new Temba('https://your-site.com', '05594lM5uQsTHLlvrBts5lenb5Iyex6P');

        this.onSelectFlow = this.onSelectFlow.bind(this);
        this.setLanguage = this.setLanguage.bind(this);
        this.setDefinition = this.setDefinition.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.save = this.save.bind(this);
    }

    public componentDidMount(): void {
        this.fetchFlow(this.context.flow);
        this.fetchFlowList();
    }

    private onSelectFlow({ uuid }: { uuid: string; name: string }): void {
        if (this.state.flows.length) {
            if (uuid !== this.state.definition.uuid) {
                this.setState({ fetching: true }, () => this.fetchFlow(uuid));
            }
        }
    }

    private onDrag(dragging: boolean): void {
        if (this.state.nodeDragging !== dragging) {
            this.setState({ nodeDragging: dragging });
        }
    }

    private setDefinition(definition: FlowDefinition, dependencies?: FlowDefinition[]): void {
        // console.log(`\nDEFINITION: \n${JSON.stringify(definition, null, 2)}\n`);

        if (dependencies) {
            this.setState({
                fetching: false,
                definition,
                dependencies
            });
        } else {
            this.setState({
                fetching: false,
                definition
            });
        }
    }

    private save(definition: FlowDefinition): void {
        // this.props.External.saveFlow(definition).catch((error) => {
        // do nothing
        // });
    }

    // TODO: determine full dependency list and fetch those at simulation time
    private initialize(definition: FlowDefinition): void {
        this.ComponentMap = new ComponentMap(definition);

        this.Mutator = new FlowMutator(
            this.ComponentMap,
            definition,
            this.setDefinition,
            this.save
            // this.props,
        );

        this.setDefinition(definition);
    }

    private fetchFlow(uuid: string): void {
        this.context
            .getFlow(uuid, false)
            .then(({ definition }: FlowDetails) => this.initialize(definition))
            .catch((error: {}) => console.log(error));
    }

    private fetchFlowList(): void {
        this.context.getFlows().then((flows: FlowDetails[]) =>
            this.setState({
                flows: flows.map(({ uuid, name }) => ({
                    uuid,
                    name
                }))
            })
        );
    }

    private setLanguage(language: Language): void {
        const translating: boolean =
            this.context.baseLanguage.iso !== language.iso &&
            this.context.baseLanguage.name !== language.name;

        this.setState({
            language,
            translating
        });
    }

    private getLanguageSelector(): JSX.Element {
        if (this.context.languages) {
            return (
                <LanguageSelectorComp
                    languages={this.context.languages}
                    iso={this.state.language.iso}
                    onChange={this.setLanguage}
                />
            );
        }

        return null;
    }

    private getFlow(): JSX.Element {
        if (this.state.definition && !this.state.fetching) {
            return (
                <Flow
                    nodeDragging={this.state.nodeDragging}
                    onDrag={this.onDrag}
                    language={this.state.language}
                    translating={this.state.translating}
                    definition={this.state.definition}
                    dependencies={this.state.dependencies}
                    ComponentMap={this.ComponentMap}
                    Mutator={this.Mutator}
                />
            );
        }

        return null;
    }

    public render(): JSX.Element {
        const languageSelector: JSX.Element = this.getLanguageSelector();

        const flowOption: FlowOption = this.state.definition
            ? { uuid: this.state.definition.uuid, name: this.state.definition.name }
            : null;

        const flow: JSX.Element = this.getFlow();

        const translatingStyle = this.state.translating ? styles.translating : null;

        return (
            <div className={translatingStyle} data-spec="editor-container">
                <div className={styles.editor} data-spec="editor">
                    <FlowList
                        flowOption={flowOption}
                        flowOptions={this.state.flows}
                        onSelectFlow={this.onSelectFlow}
                    />
                    {languageSelector}
                    {flow}
                </div>
            </div>
        );
    }
}
