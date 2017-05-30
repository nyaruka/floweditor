import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
// import {Temba, FlowDetails} from '../services/Temba';
import {FlowBase, FlowDetails} from '../services/FlowBase';
import {FlowLoader} from './FlowLoader';
import {FlowList} from './FlowList';
import {Flow} from './Flow';
import {Endpoints} from '../interfaces';

var styles = require("./Editor.scss");

interface EditorProps {
    site: string;
    token: string;
    endpoints: Endpoints;
}

interface EditorState {
    flowUUID?: string;
}

/**
 * A navigable list of flows for an account
 */
export class Editor extends React.PureComponent<EditorProps, EditorState> {

    // private temba: Temba;
    private flowbase: FlowBase = new FlowBase(null);

    constructor(props: EditorProps) {
        super(props);
        // this.temba = new Temba(this.props.site, this.props.token);
        this.state = {}

        this.flowbase.getFlows().then((results: FlowDetails[]) => {
            console.log(results)
        }).catch((reason: any) =>{
            console.log(reason);
        });
    }

    private onFlowSelect(uuid: string) {
        this.setState({flowUUID: uuid});
    }
    
    render() {
        var flow = null;

        if (this.state.flowUUID) {
            flow = <FlowLoader
                key={this.state.flowUUID}
                endpoints={this.props.endpoints}
                uuid={this.state.flowUUID}
                // temba={this.temba}
            />
        } else {
            var newUUID = UUID.v4()
            flow = <FlowLoader
                key={newUUID}
                endpoints={this.props.endpoints}
                uuid={newUUID}
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