import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import {FlowStore} from '../services/FlowStore';
import {FlowDefinition} from '../interfaces';



interface Message {
    text: string;
    inbound: boolean;
}

interface SimulatorProps {
    engineURL: string;
    definition: FlowDefinition;
}

interface SimulatorState {
    runOutput?: RunOutput;
    contact: Contact;
}

interface Contact {
    uuid: string,
}

interface Event {
    created_on: Date;
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

interface RunOutput {
    runs: Run[];
    events: Event[];
    input?: any;
}

/**
 * Our dev console for simulating or testing expressions
 */
export class SimulatorComp extends React.Component<SimulatorProps, SimulatorState> {

    // marks the bottom of our chat
    private bottom: any;

    constructor(props: SimulatorProps) {
        super(props);
        this.state = {
            contact: {uuid: UUID.v4()}
        };
    }

    private startFlow() {
        var body: any = {
            flows: [this.props.definition],
            contact: this.state.contact
        };

        axios.default.post(this.props.engineURL + '/flow/start', JSON.stringify(body, null, 2)).then((response: axios.AxiosResponse) => {
            console.log(JSON.stringify(response.data, null, 2));
            this.setState({ runOutput: response.data as RunOutput })
        });
    }

    private resume(text: string) {
        
        var body: any = {
            flows: [this.props.definition],
            run_output: this.state.runOutput,
            contact: this.state.contact,
            event: { text: text, type: "msg_in" }
        };

        axios.default.post(this.props.engineURL + '/flow/resume', JSON.stringify(body, null, 2)).then((response: axios.AxiosResponse) => {
            console.log(JSON.stringify(response.data, null, 2));
            this.setState({ runOutput: response.data as RunOutput })
        });

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
        if (this.state.runOutput) {
            for (let run of this.state.runOutput.runs) {
                for (let step of run.path) {
                    for (let event of step.events) {
                        var classes = "msg"
                        if (event.type == "msg_in") {
                            classes += " outbound";
                        } else if (event.type == "msg") {
                            classes += " inbound";
                        }
                        if (event.text) {
                            messages.push(<div className={classes} key={String(event.created_on)}>{event.text}</div>)
                        } else {
                            // messages.push(<div style={{wordWrap:"break-word", fontSize:"9px", paddingRight: "5px"}}>{JSON.stringify(event)}</div>)
                        }
                    }
                }
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

export default SimulatorComp;