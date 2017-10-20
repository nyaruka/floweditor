import * as React from 'react';
import * as UUID from 'uuid';

import { Config, Endpoints } from '../services/Config';
import { FlowMutator } from './FlowMutator';
import { Flow } from './Flow';
import { FlowDefinition } from '../FlowDefinition';
import { FlowDetails } from '../services/External';

const FORCE_FETCH = true;
const QUIET_UI = 10;
const QUIET_SAVE = 1000;

export interface FlowLoaderProps {
    uuid?: string;
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
        this.state = {};
    }

    private save(definition: FlowDefinition) {
        //Config.get().external.saveFlow(definition).catch((error) => {
        // do nothing
        //});
    }

    private initialize(definition: FlowDefinition) {
        this.mutator = new FlowMutator(
            definition,
            this.setDefinition.bind(this),
            this.save.bind(this),
            this.props,
            QUIET_UI,
            QUIET_SAVE
        );
        this.setDefinition(definition);
    }

    componentDidMount() {
        Config.get()
            .external.getFlow(this.props.uuid, false)
            .then((details: FlowDetails) => this.initialize(details.definition));
    }

    private setDefinition(definition: FlowDefinition, dependencies?: FlowDefinition[]) {
        // TODO: determine full dependency list and fetch those at simulation time
        if (!dependencies) {
            this.setState({ definition });
        } else {
            this.setState({ definition, dependencies });
        }
    }

    render() {
        if (this.state.definition) {
            return (
                <Flow
                    definition={this.state.definition}
                    dependencies={this.state.dependencies}
                    mutator={this.mutator}
                />
            );
        }
        return null;
    }
}

export default FlowLoader;
