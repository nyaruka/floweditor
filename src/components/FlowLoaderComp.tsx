import * as React from 'react';
import * as Interfaces from '../interfaces';

import NodeComp from './NodeComp';
import Plumber from '../services/Plumber';
import FlowStore from '../services/FlowStore';
import SimulatorComp from './SimulatorComp';
import Config from '../services/Config';
import NodeModal from './NodeModal';
import FlowMutator from './FlowMutator';
import FlowComp from './FlowComp';

import {FlowDefinition} from '../interfaces';

var UUID = require('uuid');
let PropTypes = require("prop-types");
var update = require('immutability-helper');
var forceFetch = true;

export interface FlowLoaderProps {
    flowURL: string;
    engineURL: string;
    contactsURL: string;
    fieldsURL: string;
}

export interface FlowLoaderState {
    definition?: FlowDefinition;
    loading: boolean;
}

/**
 * Our top level flow. This class is responsible for state and 
 * calling into our Plumber as necessary.
 */
export class FlowLoaderComp extends React.PureComponent<FlowLoaderProps, FlowLoaderState> {

    private promises: any[] = [];
    private mutator: FlowMutator;

    constructor(props: FlowLoaderProps) {
        super(props);

        this.state = {
            loading: true
        }
    }

    /**
     * Updates our definition, saving it in the store
     * @param definition the new definition 
     */
    private update(definition: FlowDefinition) {
        console.log("Updating UI");
        this.setState({definition: definition});
    }

    private save(definition: FlowDefinition) {
        FlowStore.get().save(definition);
    }

    private componentDidMount() {
        var promise = FlowStore.get().loadFlow(this.props.flowURL, (definition: FlowDefinition)=>{
            this.mutator = new FlowMutator(definition, this.update.bind(this), this.save.bind(this));
            this.setDefinition(definition);
        }, forceFetch);

        this.promises.push(promise);
    }

    private setDefinition(definition: FlowDefinition) {
        this.setState({definition: definition});
    }

    render() {
        var nodes: JSX.Element[] = [];
        if (this.state.definition) {
            for (let node of this.state.definition.nodes) {
                var uiNode = this.state.definition._ui.nodes[node.uuid];
                nodes.push(<NodeComp {...node} _ui={uiNode} mutator={this.mutator} key={node.uuid}/>)
            }
        }

        var flow = null;
        if (this.state.definition) {
            flow = <FlowComp definition={this.state.definition} mutator={this.mutator}/>
        }

        return(
            <div className="flow-loader">
              {flow}
            </div>
        )
    }
}

export default FlowLoaderComp;