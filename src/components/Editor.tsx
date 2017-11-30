import * as React from 'react';
import { FlowDetails, GetFlow } from '../providers/external';
import { FlowDefinition, Languages } from '../flowTypes';
import FlowMutator from '../services/FlowMutator';
import Temba from '../services/Temba';
import ComponentMap from '../services/ComponentMap';
import FlowList from './FlowList';
import LanguageSelectorComp, { Language } from './LanguageSelector';
import Flow from './Flow';
import { flowPT, baseLanguagePT, languagesPT, getFlowPT } from '../providers/propTypes';
import { ConfigProviderContext } from '../providers/ConfigProvider';

const styles = require('./Editor.scss');

export interface EditorState {
    fetching: boolean;
    language: Language;
    translating: boolean;
    nodeDragging: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
}

/**
 * A navigable list of flows for an account
 */
export default class Editor extends React.PureComponent<{}, EditorState> {
    private Temba: Temba;
    private Mutator: FlowMutator;
    private ComponentMap: ComponentMap;

    public static contextTypes = {
        flow: flowPT,
        baseLanguage: baseLanguagePT,
        languages: languagesPT,
        getFlow: getFlowPT
    };

    constructor(props: {}, context: ConfigProviderContext) {
        super(props, context);

        const { baseLanguage: language } = this.context;

        this.state = {
            language,
            translating: false,
            fetching: false,
            nodeDragging: false,
            definition: null,
            dependencies: null
        };

        // this.Temba = new Temba('https://your-site.com', '05594lM5uQsTHLlvrBts5lenb5Iyex6P');

        this.onFlowSelect = this.onFlowSelect.bind(this);
        this.setLanguage = this.setLanguage.bind(this);
        this.setDefinition = this.setDefinition.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.save = this.save.bind(this);
    }

    private onFlowSelect(uuid: any): void {
        this.setState({ fetching: true }, () => this.fetchFlow(uuid));
    }

    private setDefinition(definition: FlowDefinition, dependencies?: FlowDefinition[]): void {
        console.log(`\nDEFINITION: \n${JSON.stringify(definition, null, 2)}\n`);

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

    private onDrag(dragging: boolean): void {
        if (this.state.nodeDragging !== dragging) {
            this.setState({ nodeDragging: dragging });
        }
    }

    private save(definition: FlowDefinition) {
        // this.props.External.saveFlow(definition).catch((error) => {
        // do nothing
        //});
    }

    /** TODO: determine full dependency list and fetch those at simulation time */
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
        const { getFlow } = this.context;
        getFlow(uuid, false)
            .then(({ definition }: FlowDetails) => this.initialize(definition))
            .catch((error: {}) => console.log(error));
    }

    private setLanguage(language: Language): void {
        const { baseLanguage } = this.context;
        const translating: boolean =
            baseLanguage.iso !== language.iso && baseLanguage.name !== language.name;
        this.setState({
            language,
            translating
        });
    }

    private getLanguageSelector(): JSX.Element {
        let languageSelector: JSX.Element = null;
        const { languages } = this.context;

        if (languages) {
            languageSelector = (
                <LanguageSelectorComp
                    languages={languages}
                    iso={this.state.language.iso}
                    onChange={this.setLanguage}
                />
            );
        }

        return languageSelector;
    }

    public componentDidMount(): void {
        const { flow } = this.context;
        this.fetchFlow(flow);
    }

    public render(): JSX.Element {
        const languageSelector: JSX.Element = this.getLanguageSelector();

        return (
            <div
                className={this.state.translating ? styles.translating : null}
                data-spec="editor-container">
                <div className={styles.editor} data-spec="editor">
                    <FlowList onFlowSelect={this.onFlowSelect} />
                    {languageSelector}
                    {this.state.definition && !this.state.fetching ? (
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
                    ) : null}
                </div>
            </div>
        );
    }
}
