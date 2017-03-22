import * as React from 'react';
import * as axios from 'axios';
import * as Interfaces from '../interfaces';
import {Plumber, DragEvent} from '../services/Plumber';
import FlowStore from '../services/FlowStore';
import Config from '../services/Config';
import Modal from './Modal';
import ActionComp from './ActionComp';
import ExitComp from './ExitComp';

var UUID = require('uuid');
var shallowCompare = require('react-addons-shallow-compare');

export interface NodeState {
    editing: boolean;
    dragging: boolean;
}

/**
 * A single node in the rendered flow
 */
export class NodeComp extends React.Component<Interfaces.NodeProps, NodeState> {

    private modal: any;
    public ele: any;

    context: Interfaces.FlowContext;
    
    static childContextTypes = {
        flow: React.PropTypes.object,
        node: React.PropTypes.object
    }

    static contextTypes = {
        flow: React.PropTypes.object
    }
       
    getChildContext(): Interfaces.FlowContext {
        return {
            flow: this.context.flow,
            node: this
        }
    }

    constructor(props: Interfaces.NodeProps){
        super(props);
        this.state = { editing: false, dragging: false }
        this.onDragStart = this.onDragStart.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.onModalClose = this.onModalClose.bind(this);
    }

    onDragStart(event: any) {
        this.setState({dragging: true});
        $('#root').addClass('dragging');
    }

    onDrag(event: DragEvent) {

    }

    onDragStop(event: DragEvent) {
        this.setState({dragging: false});
        $('#root').removeClass('dragging');

        // update our coordinates
        this.context.flow.updateNode(this.props.uuid, { _ui: { 
            location: { $set: { 
                x: event.finalPos[0], 
                y: event.finalPos[1]
            }}
        }});
    }

    shouldComponentUpdate(nextProps: Interfaces.NodeProps, nextState: NodeState) {

        // TODO: these should be inverse evaluations since things can be batched
        if (nextProps._ui.location.x != this.props._ui.location.x || nextProps._ui.location.y != this.props._ui.location.y) {
            return false;
        }

        if (nextState.dragging != this.state.dragging) {
            return false;
        }

        return shallowCompare(this, nextProps, nextState);
    }

    componentDidMount() {

        let plumber = Plumber.get();

        // wire up our drag events
        plumber.draggable(this.ele, 
            (event: DragEvent) => {this.onDragStart(event)},
            (event: DragEvent) => {this.onDrag(event)}, 
            (event: DragEvent) => {this.onDragStop(event)}
        );

        // make ourselves a target
        plumber.makeTarget(this.props.uuid);

        // $(this.ele).find('.exits').on('mouseup', this.onClick);
    }

    componentWillUpdate() {}

    componentDidUpdate(prevProps: Interfaces.NodeProps, prevState: NodeState) {}

    setEditing(editing: boolean) {
        this.setState({editing: editing});
    }

    onClick (event: any) {
        if (event.target) {

            if (this.props.actions.length == 1) {

            }

            if (!this.state.dragging) {
                this.setEditing(true);
            }
        }
    }

    onModalOpen() {
        // console.log('modal open');
    }

    onModalClose() {
        // console.log('modal close');
        this.setEditing(false);
    }

    render() {
        console.log('Rendering node', this.props.uuid);
        var actions = [];
        if (this.props.actions) {
            for (let definition of this.props.actions) {
                actions.push(<ActionComp key={definition.uuid} {...definition}/>);
            }
        }

        var header = null;
        if (actions.length == 0) {
            header = <div className="split-title">Split</div>
        }

        var exits = []
        if (this.props.exits) {
            var first = true;
            for (let exit of this.props.exits) {
                exits.push(<ExitComp {...exit} first={first} totalExits={this.props.exits.length} key={exit.uuid}/>);
                first = false;
            }
        }

        var modalTitle = <div>Router</div>
        var depth = this.state.dragging ? "z-depth-4" : "z-depth-1"

        return(
            <div>
                <div className={"node " + depth}
                    ref={(ele: any) => { this.ele = ele; }}
                    id={this.props.uuid}
                    style={{
                        left: this.props._ui.location.x,
                        top: this.props._ui.location.y
                    }}>
                    <div>
                        {header} 
                        <div className="actions">
                            {actions}
                        </div>
                        <div className="exit-table">
                            <div className="exits" onMouseUp={this.onClick}>
                                {exits}
                            </div>
                        </div>
                    </div>
                </div>

                <Modal 
                    title={modalTitle}
                    className='exits'
                    show={this.state.editing && this.props.actions.length == 0} 
                    onModalClose={this.onModalClose} 
                    onModalOpen={this.onModalOpen}>
                    
                    <textarea defaultValue={JSON.stringify({router: this.props.router, exits: this.props.exits}, null, 2)}></textarea>

                </Modal>
            </div>
        )
    }
}

export default NodeComp;