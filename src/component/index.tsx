import * as React from 'react';
import axios from 'axios';
import { react as bindCallbacks } from 'auto-bind';
import { jsonEqual } from '../utils';
import { FlowDetails, getFlow, getFlows } from '../external';
import { FlowDefinition, Languages, FlowEditorConfig } from '../flowTypes';
import FlowMutator from '../services/FlowMutator';
import Temba from '../services/Temba';
import ComponentMap from '../services/ComponentMap';
import Flow from './Flow';
import FlowList, { FlowOption } from './FlowList';
import LanguageSelectorComp, { Language } from './LanguageSelector';
import ConfigProvider, { languagesPT, endpointsPT } from '../config';

import '../global.scss';
import * as styles from './index.scss';

export type OnSelectFlow = ({ uuid }: FlowOption) => void;

export interface FlowEditorProps {
    config: FlowEditorConfig;
}

export interface FlowEditorState {
    fetching: boolean;
    language: Language;
    baseLanguage: Language;
    translating: boolean;
    nodeDragging: boolean;
    definition: FlowDefinition;
    flows: Array<{ uuid: string; name: string }>;
    dependencies?: FlowDefinition[];
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

/**
 * A navigable list of flows for an account
 */
export default class FlowEditor extends React.Component<FlowEditorProps, FlowEditorState> {
    private Temba: Temba;
    private Mutator: FlowMutator;
    private ComponentMap: ComponentMap;
    private host: string = process.env.NODE_ENV === 'production' ? this.props.config.assetHost : '';

    public static contextTypes = {
        languages: languagesPT,
        endpoints: endpointsPT
    };

    constructor(props: FlowEditorProps) {
        super(props);

        if (IN_PROD) {
            axios.defaults.baseURL = this.props.config.assetHost;
        }

        const language = getBaseLanguage(props.config.languages);

        this.state = {
            language,
            baseLanguage: language,
            translating: false,
            fetching: false,
            nodeDragging: false,
            definition: null,
            flows: [],
            dependencies: null
        };

        bindCallbacks(this, {
            include: ['onSelectFlow', 'setLanguage', 'setDefinition', 'onDrag', 'save']
        });

        // this.Temba = new Temba('https://your-site.com', '05594lM5uQsTHLlvrBts5lenb5Iyex6P');
    }

    public componentDidMount(): void {
        this.fetchFlow(this.props.config.flow);
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

    public setDefinition(definition: FlowDefinition, dependencies?: FlowDefinition[]): void {
        // console.log(`\nDEFINITION: \n${JSON.stringify(definition, null, 2)}\n`);

        const updates = {
            fetching: false,
            definition
        } as Partial<FlowEditorState>;

        if (dependencies) {
            updates.dependencies = dependencies;
        }

        this.setState(updates as FlowEditorState);
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

        this.setDefinition(definition);
    }

    public fetchFlow(uuid: string): void {
        getFlow(this.host + this.props.config.endpoints.flows, uuid, false)
            .then(({ definition }: FlowDetails) => this.initialize(definition))
            .catch((error: any) => console.log(`fetchFlow error: ${error}`));
    }

    public fetchFlowList(): void {
        getFlows(this.host + this.props.config.endpoints.flows)
            .then((flows: FlowDetails[]) =>
                this.setState({
                    flows: flows.map(({ uuid, name }) => ({
                        uuid,
                        name
                    }))
                })
            )
            .catch((error: any) => console.log(`fetchFlowList error: ${error}`));
    }

    private setLanguage(language: Language): void {
        const translating = !jsonEqual(this.state.baseLanguage, language);

        this.setState({
            language,
            translating
        });
    }

    private getLanguageSelector(): JSX.Element {
        if (this.props.config.languages) {
            return (
                <LanguageSelectorComp
                    languages={this.props.config.languages}
                    iso={this.state.language.iso}
                    onChange={this.setLanguage}
                />
            );
        }
        return null;
    }

    private getFlow(): JSX.Element {
        const displayFlow = this.state.definition && !this.state.fetching;
        if (displayFlow) {
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
            ? {
                  uuid: this.state.definition.uuid,
                  name: this.state.definition.name
              }
            : null;

        const flow: JSX.Element = this.getFlow();
        const style = this.state.translating ? styles.translating : null;

        return (
            <ConfigProvider config={this.props.config}>
                <div id="editor-container" className={style} data-spec="editor-container">
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
            </ConfigProvider>
        );
    }
}
