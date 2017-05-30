import * as React from 'react';
import * as UUID from 'uuid';
import * as update from 'immutability-helper';

import {Temba} from '../services/Temba';
import {Node} from './Node';
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {Simulator} from './Simulator';
import {Config} from '../services/Config';
import {NodeModal} from './NodeModal';
import {FlowMutator} from './FlowMutator';
import {Flow} from './Flow';
import {FlowDefinition, Endpoints} from '../interfaces';
import {External} from '../services/External';

var FORCE_FETCH = true;
var QUIET_UI = 10;
var QUIET_SAVE = 1000;

export interface FlowLoaderProps {
    endpoints?: Endpoints;
    uuid?: string;
    external?: External;
}

export interface FlowLoaderState {
    definition?: FlowDefinition;
    dependencies?: FlowDefinition[];
}

/**
 * Our top level flow. This class is responsible for state and 
 * calling into our Plumber as necessary.
 */
export class FlowLoader extends React.PureComponent<FlowLoaderProps, FlowLoaderState> {

    private mutator: FlowMutator;

    constructor(props: FlowLoaderProps) {
        super(props);
        this.state = {}
    }

    private save(definition: FlowDefinition) {
        if (this.props.external) {
            this.props.external.saveFlow(definition);
        } else {
            FlowStore.get().save(definition);
        }
    }

    componentDidMount() {
        this.props.external.getFlow(this.props.uuid).then((definition: FlowDefinition) =>{
            this.mutator = new FlowMutator(
                definition,
                this.setDefinition.bind(this), 
                this.save.bind(this), 
                this.props,
                QUIET_UI, QUIET_SAVE
            );
            this.setDefinition(definition);
        });
    }

    private setDefinition(definition: FlowDefinition, dependencies?: FlowDefinition[]) {
        // TODO: determine full dependency list and fetch those at simulation time
        if (!dependencies) {
            this.setState({definition: definition});
        } else {
            this.setState({definition: definition, dependencies: dependencies});
        }
    }

    render() {
        var flow = null;
        if (this.state.definition) {
            flow = <Flow
                    endpoints={this.props.endpoints}
                    definition={this.state.definition}
                    dependencies={this.state.dependencies}
                    mutator={this.mutator}/>
        }
        return flow;
    }
}

export default FlowLoader;