import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import * as update from 'immutability-helper';

import {FlowStore} from '../services/FlowStore';
import {FlowDefinition} from '../interfaces';

interface Message {
    text: string;
    inbound: boolean;
}

interface SimulatorProps {
    engineURL: string;
    definitions: FlowDefinition[];
}

interface SimulatorState {
    runOutput?: RunOutput;
    contact: Contact;
    events: Event[];
}

interface Group {
    name: string;
    uuid: string;
}

interface Contact {
    uuid: string,
    fields: {},
    groups: Group[]
}

interface Event {
    created_on?: Date;
    type: string;
    text?: string;
}

interface Step {
    arrived_on: Date;
    events: Event[];
    node: string;
}

interface Wait {
    timeout: number;
    type: string;
}

interface Run {
    path: Step[];
    wait?: Wait;
}

interface RunContext {
    contact: Contact;
    run_output: RunOutput;
}

interface RunOutput {
    runs: Run[];
    events: Event[];
    input?: any;
}

/**
 * Our dev console for simulating or testing expressions
 */
export class Simulator extends React.Component<SimulatorProps, SimulatorState> {

    private debug: RunOutput[] = []

    // marks the bottom of our chat
    private bottom: any;

    constructor(props: SimulatorProps) {
        super(props);
        this.state = {
            events: [],
            contact: {
                uuid: UUID.v4(),
                fields: {},
                groups: []
            }
        }
    }

    private updateRunContext(body: any, runContext: RunContext) {
        var events = update(this.state.events, {$push: runContext.run_output.events});
        this.setState({ 
            runOutput: runContext.run_output,
            contact: runContext.contact,
            events: events
        });

        this.debug.push(runContext.run_output);
    }

    private startFlow() {
        this.setState({events: []});

        var body: any = {
            flows: this.props.definitions,
            contact: {
                uuid: UUID.v4(),
                fields: {},
                groups: []
            }
        };

        axios.default.post(this.props.engineURL + '/flow/start', JSON.stringify(body, null, 2)).then((response: axios.AxiosResponse) => {
            this.updateRunContext(body, response.data as RunContext);
        });
    }

    private resume(text: string) {

        if (text == "debug") {
            console.log(JSON.stringify(this.debug, null, 2))
            return;
        }
        
        var body: any = {
            flows: this.props.definitions,
            run_output: this.state.runOutput,
            contact: this.state.contact,
            event: { text: text, type: "msg_in" }
        };

        axios.default.post(this.props.engineURL + '/flow/resume', JSON.stringify(body, null, 2)).then((response: axios.AxiosResponse) => {
            this.updateRunContext(body, response.data as RunContext);
        }).catch((error) => {
            var events = update(this.state.events, {$push: [{
                type: "error",
                text: error.response.data.error
            }]});
            this.setState({events: events});
        });;

        this.scrollToBottom();

        
    }

    private onReset(event: any) {
        this.startFlow();
    }

    scrollToBottom() {
        var bottom = $("#bottom");
        var top = $('.messages').scrollTop()
        top += bottom.position().top;

        $('.messages').animate({
            scrollTop: top
        }, 200, 'swing');
    }

    private onKeyUp(event: any) {
        if (event.key === 'Enter') {
            var ele = event.target;
            var text = ele.value
            ele.value = "";

            // pass it to the engine
            // console.log(this);
            this.resume(text);
        }
    }

    private getBottomMarker(): JSX.Element {
        if (!this.bottom) {
            this.bottom = <div id="bottom" style={{float:"left", clear: "both"}}></div>;
        }
        return this.bottom;
    }

    public render() {
        var messages: JSX.Element[] = [];
        for (let event of this.state.events) {
            
            var classes = "msg"
            if (event.type == "msg_in") {
                classes += " outbound";
            } else if (event.type == "msg_out") {
                classes += " inbound";
            } else if (event.type == "error") {
                classes += " error";
            }

            if (event.text) {
                messages.push(<div className={classes} key={String(event.created_on)}>{event.text}</div>)
            } else {
                // messages.push(<div style={{wordWrap:"break-word", fontSize:"9px", paddingRight: "5px"}}>{JSON.stringify(event)}</div>)
            }
        }

        return (
            <div className="simulator" >
              <a className="reset" onClick={this.onReset.bind(this)}/>
              <div className="icon-simulator"/>
              <div className="screen">
                <div className="messages">
                    {messages}
                    {this.getBottomMarker()}
                </div>
                <div className="controls">
                    <input type="text" onKeyUp={this.onKeyUp.bind(this)}/>
                </div>
              </div>
            </div>
        )
    }
}

export default Simulator;