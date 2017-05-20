import * as React from 'react';
import * as UUID from 'uuid';

import {Case} from '../Case';
import {SwitchRouterProps, CaseProps} from '../../interfaces';
import {NodeFormComp} from '../NodeForm';
import {DragDropContext} from 'react-dnd';


let HTML5Backend = require('react-dnd-html5-backend');
let Select2 = require('react-select2-wrapper');
let update = require('immutability-helper');

class SwitchRouterState {
    cases: CaseProps[]
}

export class SwitchRouterForm extends NodeFormComp<SwitchRouterProps, SwitchRouterState> {

    constructor(props: SwitchRouterProps) {
        super(props);

        this.state = {
            cases: this.props.cases
        }
    }

    onCaseChanged(c: Case) {
        // console.log("case changed", c, c.state);
    }

    renderForm(): JSX.Element {
        
        var cases: JSX.Element[] = [];
        if (this.state.cases){
            this.state.cases.map((c: CaseProps) => {
                if (c.exit) {
                    for (let exit of this.props.exits) {
                        if (exit.uuid == c.exit) {
                            c.exitProps = exit;
                            break;
                        }
                    }
                }
                cases.push(<Case onChanged={this.onCaseChanged.bind(this)} key={c.uuid} {...c} moveCase={this.moveCase.bind(this)}/>);
            });
        }

        var newCaseUUID = UUID.v4()
        cases.push(<Case onChanged={this.onCaseChanged.bind(this)} key={newCaseUUID} uuid={newCaseUUID} type="contains_any"/>)

        return (
            <div>
                <div className="lead-in">
                    If the message response..
                </div>
                <div>
                    {cases}
                </div>
            </div>
        )
    }

    moveCase(dragIndex: number, hoverIndex: number) {
        const { cases } = this.state;
        const dragCase = cases[dragIndex];

        this.setState(update(this.state, {
        cards: {
            $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCase],
            ],
        },
        }));
    }
    
    validate(control: any): string {
        return null;
    }

    submit(form: HTMLFormElement) {}

}

export default DragDropContext(HTML5Backend)(SwitchRouterForm);
