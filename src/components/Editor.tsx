import * as React from 'react';
import axios from 'axios';
import FlowList from './FlowList';
import EditorConfig from '../services/EditorConfig';
import External, { FlowDetails } from '../services/External';
import { FlowDefinition } from '../flowTypes';
import FlowMutator from '../services/FlowMutator';
import Temba from '../services/Temba';
import ComponentMap from '../services/ComponentMap';
import { Language } from './LanguageSelector';
import Flow from './Flow';

const styles = require('./Editor.scss');

export interface EditorProps {
    flowUUID: string;
    EditorConfig: EditorConfig;
    External: External;
}

export interface EditorState {
    fetching: boolean;
    language: Language;
    translating: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
}

/**
 * A navigable list of flows for an account
 */
export default class Editor extends React.PureComponent<EditorProps, EditorState> {
    private Temba: Temba;
    private Mutator: FlowMutator;
    private ComponentMap: ComponentMap;

    constructor(props: EditorProps) {
        super(props);
        this.state = {
            language: this.props.EditorConfig.baseLanguage,
            translating: false,
            fetching: false,
            definition: null,
            dependencies: null
        };

        // this.Temba = new Temba('https://your-site.com', '05594lM5uQsTHLlvrBts5lenb5Iyex6P');

        this.onFlowSelect = this.onFlowSelect.bind(this);
        this.setLanguage = this.setLanguage.bind(this);
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
            this.setDefinition.bind(this),
            this.save.bind(this)
            // this.props,
        );

        this.setDefinition(definition);
    }

    private fetchFlow(uuid: string): void {
        this.props.External.getFlow(
            uuid,
            false,
            this.props.EditorConfig.endpoints.flows
        )
            .then(({ definition }: FlowDetails) => this.initialize(definition))
            .catch((error: {}) => console.log(error));

    }

    private setLanguage(language: Language): void {
        const { EditorConfig: { baseLanguage } } = this.props;
        const translating: boolean = JSON.stringify(language) !== JSON.stringify(baseLanguage);

        this.setState({
            language,
            translating
        });
    }

    public componentDidMount(): void {
        this.fetchFlow(this.props.flowUUID);
    }

    public render(): JSX.Element {
        return (
            <div className={styles.editor} data-spec="editor">
                <FlowList
                    EditorConfig={this.props.EditorConfig}
                    External={this.props.External}
                    fetching={this.state.fetching}
                    onFlowSelect={this.onFlowSelect}
                />
                {this.state.definition &&!this.state.fetching ? (
                    <Flow
                        language={this.state.language}
                        translating={this.state.translating}
                        setLanguage={this.setLanguage}
                        EditorConfig={this.props.EditorConfig}
                        External={this.props.External}
                        definition={this.state.definition}
                        dependencies={this.state.dependencies}
                        ComponentMap={this.ComponentMap}
                        Mutator={this.Mutator}
                    />
                ) : null}
            </div>
        );
    }
}
