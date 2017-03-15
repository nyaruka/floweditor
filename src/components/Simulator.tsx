import * as React from "react";
import * as axios from 'axios';
import {FlowStore} from '../services/FlowStore';

interface Message {
    text: string;
    inbound: boolean;
}

interface SimulatorProps {
    engineUrl: string;
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
export class Simulator extends React.Component<SimulatorProps, SimulatorState> {

    constructor(props: SimulatorProps) {
        super(props);
        this.state = {};
        this.execute();
    }

    private execute(text?: string) {

        let context = this.state.context;
        if (text) {
            context.input = { text: text, type: "msg" };
        }

        // console.log('Simulating', FlowStore.get().getCurrentDefinition());

        var body: any = {
            flow: FlowStore.get().loadFromStorage()
        };

        if (context) {
            body.context = context;
        } else {
            body.context = {};
        }

        axios.default.post(this.props.engineUrl + '/execute', JSON.stringify(body, null, 2)).then((response: axios.AxiosResponse) => {
            this.setState({ context: eval(response.data) as Context })
        });
    }

    private handleInput(event: any) {
        if (event.key === 'Enter') {
            var ele = event.target;
            var text = ele.value
            ele.value = "";

            // pass it to the engine
            console.log(this);
            this.execute(text);
        }
    }

    public render() {
        var messages: JSX.Element[] = [];

        if (this.state.context) {
            for (let step of this.state.context.path) {
                for (let event of step.events) {
                    if (event.text) {
                        messages.push(<div key={Math.random()}>{event.text}</div>)
                    }
                }
                // var className = .inbound ? "inbound" : "outbound"
            }
        }

        return (
            <div className="simulator">
              <div className="screen">
                <div className="messages">
                    {messages}
                </div>
              </div>
              <div className="icon-simulator"/>
              <div className="controls">
                <input type="text" className="browser-default" onKeyUp={(event)=>this.handleInput(event)}/>
              </div>
            </div>
        )
    }
}