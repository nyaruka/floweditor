import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { jsonEqual } from '../utils';
import { getFlow, getFlows, FlowDetails } from '../external';
import { FlowDefinition, Languages } from '../flowTypes';
import FlowMutator from '../services/FlowMutator';
import Temba from '../services/Temba';
import ComponentMap from '../services/ComponentMap';
import Flow from './Flow';
import FlowList, { FlowOption } from './FlowList';
import LanguageSelectorComp, { Language } from './LanguageSelector';
import { languagesPT, endpointsPT, ConfigProvider } from '../config';

import * as styles from './FlowEditor.scss';

export type OnSelectFlow = ({ uuid }: FlowOption) => void;

export interface FlowEditorProps {
    config: FlowEditorConfig;
}

export interface EditorState {
    fetching: boolean;
    language: Language;
    baseLanguage: Language;
    translating: boolean;
    nodeDragging: boolean;
    definition: FlowDefinition;
    flows: Array<{ uuid: string; name: string }>;
    dependencies: FlowDefinition[];
}

export const getBaseLanguage = (languages: {
    [iso: string]: string;
}): Language => {
    const [iso] = Object.keys(languages);
    const name = languages[iso];
    return {
        name,
        iso
    };
};

/**
 * A navigable list of flows for an account
 */
export default class Editor extends React.PureComponent<
    FlowEditorProps,
    EditorState
> {
    private Temba: Temba;
    private Mutator: FlowMutator;
    private ComponentMap: ComponentMap;

    public static contextTypes = {
        languages: languagesPT,
        endpoints: endpointsPT
    };

    constructor(props: FlowEditorProps) {
        super(props);

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

        // this.Temba = new Temba('https://your-site.com', '05594lM5uQsTHLlvrBts5lenb5Iyex6P');

        bindCallbacks(this, {
            include: [
                'onSelectFlow',
                'setLanguage',
                'setDefinition',
                'onDrag',
                'save'
            ]
        });
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

    private setDefinition(
        definition: FlowDefinition,
        dependencies?: FlowDefinition[]
    ): void {
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
        getFlow(this.props.config.endpoints.flows, uuid, false)
            .then(({ definition }: FlowDetails) => this.initialize(definition))
            .catch((error: any) => console.log(`fetchFlow error: ${error}`));
    }

    private fetchFlowList(): void {
        getFlows(this.props.config.endpoints.flows)
            .then((flows: FlowDetails[]) =>
                this.setState({
                    flows: flows.map(({ uuid, name }) => ({
                        uuid,
                        name
                    }))
                })
            )
            .catch((error: any) =>
                console.log(`fetchFlowList error: ${error}`)
            );
    }

    private setLanguage(language: Language): void {
        const translating: boolean = !jsonEqual(
            this.state.baseLanguage,
            language
        );

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

        const translatingStyle = this.state.translating
            ? styles.translating
            : null;

        return (
            <ConfigProvider
                languages={this.props.config.languages}
                endpoints={this.props.config.endpoints}>
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
            </ConfigProvider>
        );
    }
}
