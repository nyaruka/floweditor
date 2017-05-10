import * as React from 'react';
import * as axios from 'axios';
import {FlowStore} from '../services/FlowStore';

interface Message {
    text: string;
    inbound: boolean;
}

interface SimulatorProps {
    engineURL: string;
}

interface SimulatorState {
    context?: Context;
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

interface Context {
    path: Step[];
    wait?: Wait;
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
        this.state = {};

        this.onReset = this.onReset.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    private execute(text?: string) {
        console.log('Execute', text);

        let context = this.state.context;
        if (!text) {
            context = null;
        } else {
            context.input = { text: text, type: "msg" };
        }

        var body: any = {
            flow: FlowStore.get().loadFromStorage()
        };

        if (context) {
            body.context = context;
        } else {
            body.context = {};
        }

        axios.default.post(this.props.engineURL + '/execute', JSON.stringify(body, null, 2)).then((response: axios.AxiosResponse) => {
            this.setState({ context: eval(response.data) as Context })
        });

        this.scrollToBottom();
    }

    private onReset(event: any) {
        this.execute();
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
            console.log(this);
            this.execute(text);
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

        if (this.state.context) {
            for (let step of this.state.context.path) {
                for (let event of step.events) {
                    var classes = "msg"
                    if (event.type == "msg_input") {
                        classes += " outbound";
                    } else if (event.type == "msg") {
                        classes += " inbound";
                    }
                    if (event.text) {
                        messages.push(<div className={classes} key={String(event.created_on)}>{event.text}</div>)
                    }
                }
            }
        }

        return (
            <div className="simulator" >
              <a className="reset" onClick={this.onReset}/>
              <div className="icon-simulator"/>
              <div className="screen">
                <div className="messages">
                    {messages}
                    {this.getBottomMarker()}
                </div>
                <div className="controls">
                    <input type="text" onKeyUp={this.onKeyUp}/>
                </div>
              </div>
            </div>
        )
    }
}

export default SimulatorComp;