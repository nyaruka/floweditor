import * as React from 'react';
import * as axios from 'axios';
import * as Interfaces from '../interfaces';
import {Plumber, DragEvent} from '../services/Plumber';
import FlowStore from '../services/FlowStore';
import Config from '../services/Config';
import {NodeModal} from './Modal';
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

    public ele: any;
    private modal: any;
    private firstAction: ActionComp<Interfaces.ActionProps>;

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
        this.onDrag = this.onDrag.bind(this);
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

        var position = $(event.target).position();
        // update our coordinates
        this.context.flow.updateNodeUI(this.props.uuid, { 
            position: { $set: { 
                x: event.finalPos[0],
                y: event.finalPos[1]
            }}
        });
    }

    isDragNode() {
        return this.props.uuid == 'drag-node';
    }

    shouldComponentUpdate(nextProps: Interfaces.NodeProps, nextState: NodeState) {

        // TODO: these should be inverse evaluations since things can be batched
        if (nextProps._ui.position.x != this.props._ui.position.x || nextProps._ui.position.y != this.props._ui.position.y) {
            return false;
        }

        if (nextState.dragging != this.state.dragging) {
            return false;
        }

        return shallowCompare(this, nextProps, nextState);
    }

    componentDidMount() {

        let plumber = Plumber.get();
        plumber.draggable(this.ele,
           (event: DragEvent) => {this.onDragStart(event)},
           (event: DragEvent) => {this.onDrag(event)}, 
           (event: DragEvent) => {this.onDragStop(event)}
        );

        // make ourselves a target
        // console.log('Mounting', this.props.uuid);
        plumber.makeTarget(this.props.uuid);

        // $(this.ele).find('.exits').on('mouseup', this.onClick);
    }

    componentWillUnmount() {
        console.log('unmounted', this.props.uuid);
        Plumber.get().remove(this.props.uuid);
    }

    componentWillUpdate() {}

    componentDidUpdate(prevProps: Interfaces.NodeProps, prevState: NodeState) {
        console.log(this.props.uuid, 'updated');
        
        // TODO: determine why individual plumb repaint doesn't work
        // Plumber.get().repaint(this.props.uuid);
        Plumber.get().repaint();
    }

    setEditing(editing: boolean) {
        this.setState({editing: editing});
    }

    onClick (event: any) {
        if (!this.state.dragging) {
            // if we have one action, defer to it
            if (this.props.actions && this.props.actions.length == 1) {
                this.firstAction.onClick(event);
            } else {
                this.modal.open();
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

        // console.log('Rendering node', this.props.uuid);
        var actions = [];
        if (this.props.actions) {
            // save the first reference off to manage our clicks
            var firstRef: any = {ref:(ele: any)=>{this.firstAction = ele}};
            for (let definition of this.props.actions) {
                actions.push(<ActionComp key={definition.uuid} {...definition} {...firstRef}/>);
                firstRef = {};
            }
        }

        var events = {}
        if (!this.isDragNode()) {
            events = {onMouseUpCapture: (event: any)=>{this.onClick(event)}}
        }


        var header = null;
        var modal = null;
        if (this.props.router) {
            let config = Config.get().getTypeConfig(this.props.router.type);
            let renderer = new config.renderer(this.props.router);
            header = <div className={"split-title " + this.props.router.type} {...events}>{config.name}</div>
            modal = <NodeModal 
                ref={(ele: any) => {this.modal = ele}} 
                initial={this.props.router}
                renderer={renderer}
                changeType={false}
            />
        } else {
            if (actions.length == 0) {
                header = <div className={"split-title " + this.props.router.type} {...events}>Split</div>
            }
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
                <div className={"node " + depth}
                    ref={(ele: any) => { this.ele = ele }}
                    id={this.props.uuid}
                    style={{
                        left: this.props._ui.position.x,
                        top: this.props._ui.position.y
                    }}>
                    <div>
                        {header} 
                        <div className="actions">
                            {actions}
                        </div>
                        <div className="exit-table">
                            <div className="exits" {...events}>
                                {exits}
                            </div>
                        </div>
                    </div>
                    {modal}

                    {/*<textarea defaultValue={JSON.stringify({router: this.props.router, exits: this.props.exits}, null, 2)}></textarea>*/}

                </div>

        )
    }
}

export default NodeComp;