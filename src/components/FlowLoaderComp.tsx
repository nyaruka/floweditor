import * as React from 'react';
import * as UUID from 'uuid';
import * as update from 'immutability-helper';

import {Temba} from '../services/Temba';
import {NodeComp} from './NodeComp';
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {SimulatorComp} from './SimulatorComp';
import {Config} from '../services/Config';
import {NodeModal} from './NodeModal';
import {FlowMutator} from './FlowMutator';
import {FlowComp} from './FlowComp';
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
}

/**
 * Our top level flow. This class is responsible for state and 
 * calling into our Plumber as necessary.
 */
export class FlowLoaderComp extends React.PureComponent<FlowLoaderProps, FlowLoaderState> {

    private mutator: FlowMutator;

    constructor(props: FlowLoaderProps) {
        super(props);
        this.state = {}
    }

    private save(definition: FlowDefinition) {
        FlowStore.get().save(definition);
    }

    private componentDidMount() {
        this.props.temba.fetchLegacyFlows(this.props.uuid, true).then((defs: FlowDefinition[]) => {

            var definition: FlowDefinition = null;
            for (let def of defs) {
                if (def.uuid == this.props.uuid) {
                    definition = def;
                }
            }

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

    private setDefinition(definition: FlowDefinition) {
        this.setState({definition: definition});
    }

    render() {
        var flow = null;
        var nodes: JSX.Element[] = [];
        if (this.state.definition) {
            for (let node of this.state.definition.nodes) {
                var uiNode = this.state.definition._ui.nodes[node.uuid];
                nodes.push(<NodeComp {...node} _ui={uiNode} mutator={this.mutator} key={node.uuid}/>)
            }
            flow = <FlowComp 
                        engineURL={this.props.engineURL}
                        definition={this.state.definition} 
                        mutator={this.mutator}/>
        }

        return(
            <div className="flow-loader">
              {flow}
            </div>
        )
    }
}

export default FlowLoaderComp;