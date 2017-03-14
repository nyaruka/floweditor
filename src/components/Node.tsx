import * as React from 'react';
import * as axios from 'axios';
import {ActionComp} from './Actions'
import {NodeProps, ExitProps} from '../interfaces';
import {ModalComp} from './Modal';
import {Plumber, DragEvent} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';

interface NodeState {
    editing: boolean;
    dragging: boolean;
}


class ExitComp extends React.Component<ExitProps, {}> {

    componentDidMount() {
        // we can be dragged from
        Plumber.get().makeSource(this.props.uuid);
        // console.log('Exit mounted..');
    }

    render() {
        var count = this.props.totalExits;
        var pct = Math.floor(100 / count);
        var first = this.props.first ? " first" : "";
        var connected = this.props.destination ? " jtk-connected" : "";
        return (
            <div key={Math.random()} className={"exit width-" + pct + first}>
                <div className="name">
                    {this.props.label}
                </div>
                <div id={this.props.uuid} className={"endpoint" + connected}/>
            </div>
        )
    }
}

/**
 * A single node in the rendered flow
 */
class NodeComp extends React.Component<NodeProps, NodeState> {

    private modal: any;
    private ele: any;

    constructor(props: NodeProps){
      super(props);
      this.state = { editing: false, dragging: false }
    }

    dragStart(event: DragEvent) {
        if (!this.state.dragging) {
            this.setState({dragging: true});
            $('#root').addClass('dragging');
        }
    }

    dragStop(event: DragEvent) {
        FlowStore.get().getCurrentDefinition().updateLocation(this.props.uuid, event.finalPos)
        FlowStore.get().markDirty();
        this.setState({dragging: false});
        $('#root').removeClass('dragging');
    }

    componentDidMount() {

        let plumber = Plumber.get();

        // wire up our drag events
        plumber.draggable(this.ele, 
            (event: DragEvent) => {this.dragStart(event)}, 
            (event: DragEvent) => {this.dragStop(event)}
        );

        // make ourselves a target
        plumber.makeTarget(this.props.uuid);
    }

    componentDidUpdate(prevProps: NodeProps, prevState: NodeState) {
        if (this.props.exits) {
            for (let exit of this.props.exits) {
                Plumber.get().connectExit(exit);
            }
        }
    }

    setEditing(editing: boolean) {
        this.setState({editing: editing});
    }

    onClick (event: any) {
        if (!this.state.dragging) {
            this.setEditing(true);
        }
    }

    render() {

        // console.log('Rendering node', this.props.uuid);

        var actions = [];

        if (this.props.actions) {
            for (let definition of this.props.actions) {
                actions.push(ActionComp.createAction(definition));
            }
        }

        var header
        if (actions.length == 0) {
            header = <div className="split-title">Split</div>
        }

        var exits = []
        if (this.props.exits) {
            var first = true;
            for (let exit of this.props.exits) {
                exits.push(<ExitComp {...exit} first={first} totalExits={this.props.exits.length} key={Math.random()}/>);
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
                        <div className="exits" onClick={(event)=>{ this.onClick(event); }}>
                            {exits}
                        </div>
                    </div>                
                </div>

                <ModalComp className="exits" title={modalTitle}
                           show={this.state.editing} close={() => this.setEditing(false)}>
                    <textarea defaultValue={JSON.stringify({router: this.props.router, exits: this.props.exits}, null, 2)}></textarea>
                </ModalComp>

            </div>
        )
    }
}

export default NodeComp;