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
import {FlowDefinition} from '../interfaces';

var FORCE_FETCH = true;
var QUIET_UI = 10;
var QUIET_SAVE = 2000;

export interface FlowLoaderProps {
    flowURL?: string;
    engineURL?: string;
    contactsURL?: string;
    fieldsURL?: string;

    uuid?: string;
    temba?: Temba;

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
        FlowStore.get().save(definition);
    }

    private componentDidMount() {

        if (!this.props.temba) {
            var definition = FlowStore.get().getFlowFromStore(this.props.uuid)
            this.mutator = new FlowMutator(
                definition,
                this.setDefinition.bind(this), 
                this.save.bind(this), 
                this.props,
                QUIET_UI, QUIET_SAVE
            );
            this.setDefinition(definition);

        } else {
            this.props.temba.fetchLegacyFlows(this.props.uuid, false).then((defs: FlowDefinition[]) => {

                var definition: FlowDefinition = null;
                var dependencies: FlowDefinition[] = [];
                for (let def of defs) {
                    if (def.uuid == this.props.uuid) {
                        definition = def;
                    } else {
                        dependencies.push(def);
                    }
                }

                this.mutator = new FlowMutator(
                    definition,
                    this.setDefinition.bind(this), 
                    this.save.bind(this), 
                    this.props,
                    QUIET_UI, QUIET_SAVE
                );

                this.setDefinition(definition, dependencies);
            });
        }
    }

    private setDefinition(definition: FlowDefinition, dependencies?: FlowDefinition[]) {
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
                    engineURL={this.props.engineURL}
                    definition={this.state.definition}
                    dependencies={this.state.dependencies}
                    mutator={this.mutator}/>
        }

        return(
            <div className="flow-loader">
              {flow}
            </div>
        )
    }
}

export default FlowLoader;