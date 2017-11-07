import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
// import { FlowList } from './FlowList';
import EditorConfig from '../services/EditorConfig';
import External, { IFlowDetails } from '../services/External';
import { IFlowDefinition } from '../flowTypes';
import FlowMutator from '../services/FlowMutator';
import { Temba } from '../services/Temba';
import ComponentMap from '../services/ComponentMap';
import Flow from './Flow';

const styles = require('./Editor.scss');

export interface IEditorProps {
    flowUUID: string;
    EditorConfig: EditorConfig;
    External: External;
}

export interface IEditorState {
    flowUUID: string;
    definition: IFlowDefinition;
    dependencies: IFlowDefinition[];
}

/**
 * A navigable list of flows for an account
 */
class Editor extends React.PureComponent<IEditorProps, IEditorState> {
    private Temba: Temba;
    private Mutator: FlowMutator;
    private ComponentMap: ComponentMap;

    constructor(props: IEditorProps) {
        super(props);
        this.state = {
            flowUUID: this.props.flowUUID,
            definition: null,
            dependencies: null
        };

        // this.Temba = new Temba('https://your-site.com', '05594lM5uQsTHLlvrBts5lenb5Iyex6P');

        this.onFlowSelect = this.onFlowSelect.bind(this);
    }

    private onFlowSelect(uuid: string): void {
        this.setState({ flowUUID: uuid }, () => this.fetchFlow());
    }

    private setDefinition(definition: IFlowDefinition, dependencies?: IFlowDefinition[]): void {
        console.log(`DEFINITION: ${JSON.stringify(definition, null, 2)}`);

        if (dependencies) {
            this.setState({
                definition,
                dependencies
            });
        } else {
            this.setState({
                definition
            });
        }
    }

    private save(definition: IFlowDefinition) {
        // this.props.External.saveFlow(definition).catch((error) => {
        // do nothing
        //});
    }

    /** TODO: determine full dependency list and fetch those at simulation time */
    private initialize(definition: IFlowDefinition): void {
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

    private fetchFlow(): void {
        this.props.External
            .getFlow(this.state.flowUUID, false, this.props.EditorConfig.endpoints.flows)
            .then(({ definition }: IFlowDetails) => this.initialize(definition))
            .catch((error: {}) => console.log(error));
    }

    public componentDidMount(): void {
        this.fetchFlow();
    }

    public render(): JSX.Element {
        return (
            <div className={styles.editor} data-spec="editor">
                {/* disable the flow list for now
                    <FlowList
                        getFlows={this.temba.getFlows}
                        onFlowSelect={this.onFlowSelect.bind(this)}
                    />
                */}
                {this.state.definition ? (
                    <Flow
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

export default Editor;
