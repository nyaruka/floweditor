import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import { External, FlowDetails } from '../services/External';
import { FlowLoader } from './FlowLoader';
// import { FlowList } from './FlowList';
import { Endpoints, Config } from '../services/Config';

const styles = require('./Editor.scss');

interface EditorProps {
    config: FlowEditorConfig;
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
        this.state = {
            flowUUID: this.props.config.flow
        };
        Config.initialize(this.props.config);
    }

    private onFlowSelect(uuid: string) {
        this.setState({ flowUUID: uuid });
    }

    render() {
        let flow;

        if (this.state.flowUUID) {
            flow = <FlowLoader key={this.state.flowUUID} uuid={this.state.flowUUID} />;
        } else {
            const newUUID = UUID.v4();
            flow = <FlowLoader key={newUUID} uuid={newUUID} />;
        }

        // disable the flow list for now
        //var flowList = (<FlowList
        // temba={this.temba}
        //    onFlowSelect={this.onFlowSelect.bind(this)}
        ///>)

        return <div className={styles.editor}>{flow}</div>;
    }
}
