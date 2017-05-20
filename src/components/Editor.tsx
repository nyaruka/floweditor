import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
import {Temba, FlowDetails} from '../services/Temba';
import {FlowLoader} from './FlowLoader';
import {FlowList} from './FlowList';
import {Flow} from './Flow';

interface EditorProps {
    site: string;
    token: string;
    
    engineURL?: string;
    contactsURL?: string;
    fieldsURL?: string;
}

interface EditorState {
    flowUUID?: string;
}

/**
 * A navigable list of flows for an account
 */
export class Editor extends React.PureComponent<EditorProps, EditorState> {

    private temba: Temba;

    constructor(props: EditorProps) {
        super(props);
        this.temba = new Temba(this.props.site, this.props.token);
        this.state = {}
    }

    private onFlowSelect(uuid: string) {
        console.log(uuid);
        this.setState({flowUUID: uuid});
    }
    
    render() {
        var flow = null;
        if (this.state.flowUUID) {
            flow = <FlowLoader
                key={this.state.flowUUID}
                engineURL={this.props.engineURL}
                contactsURL={this.props.contactsURL}
                fieldsURL={this.props.fieldsURL}
                uuid={this.state.flowUUID}
                temba={this.temba}
            />
        } else {
            var newUUID = UUID.v4()
            flow = <FlowLoader
                key={newUUID}
                engineURL={this.props.engineURL}
                contactsURL={this.props.contactsURL}
                fieldsURL={this.props.fieldsURL}
                uuid={newUUID}
            />

        }

        // disable the flow list for now
        var flowList = (<FlowList 
            temba={this.temba}
            onFlowSelect={this.onFlowSelect.bind(this)}
        />)

        return (
            <div>
                {flow}
            </div>
        )
    }
}