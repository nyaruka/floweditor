import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
import { External, FlowDetails } from '../services/External';
import { FlowLoader } from './FlowLoader';
import { FlowList } from './FlowList';
import { Flow } from './Flow';
import { Endpoints } from '../interfaces';

var styles = require("./Editor.scss");

interface EditorProps {
    endpoints: Endpoints;
    flowUUID: string;
}

interface EditorState {
    flowUUID?: string;
}

/**
 * A navigable list of flows for an account
 */
export class Editor extends React.PureComponent<EditorProps, EditorState> {

    private external: External;

    constructor(props: EditorProps) {
        super(props);
        this.external = new External(this.props.endpoints);
        this.state = {
            flowUUID: this.props.flowUUID
        }
    }

    private onFlowSelect(uuid: string) {
        this.setState({ flowUUID: uuid });
    }

    render() {
        var flow = null;

        if (this.state.flowUUID) {
            flow = <FlowLoader
                key={this.state.flowUUID}
                endpoints={this.props.endpoints}
                uuid={this.state.flowUUID}
                external={this.external}
            />
        } else {
            var newUUID = UUID.v4()
            flow = <FlowLoader
                key={newUUID}
                endpoints={this.props.endpoints}
                uuid={newUUID}
                external={this.external}
            />

        }

        // disable the flow list for now
        //var flowList = (<FlowList 
        // temba={this.temba}
        //    onFlowSelect={this.onFlowSelect.bind(this)}
        ///>)

        return (
            <div className={styles.editor}>
                {flow}
            </div>
        )
    }
}