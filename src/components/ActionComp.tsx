import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
import {ActionProps} from '../interfaces'
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {Config} from '../services/Config';
import {NodeModal} from './NodeModal';
import {TitleBar} from './TitleBar';

/**
 * Base Action class for the rendered flow
 */
export class ActionComp<P extends ActionProps> extends React.PureComponent<P, {}> {

    public form: HTMLFormElement;
    private modal: NodeModal;

    constructor(props: P) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    setEditing(editing: boolean) {
        this.setState({editing: editing})
    }

    onClick (event: React.SyntheticEvent<MouseEvent>) {
        if (!this.props.dragging) {
            this.openModal();
        }
    }

    openModal() {
        this.modal.open();
    }

    getClassName() {
        return this.props.type.split('_').join('-');
    }

    private onConfirmRemoval(evt: React.SyntheticEvent<MouseEvent>) {
        evt.stopPropagation();
        this.setState({confirmRemoval: true})
    }

    private onRemoval(evt: React.SyntheticEvent<MouseEvent>) {
        evt.stopPropagation();
        this.props.mutator.removeAction(this.props);
    }

    renderNode(): JSX.Element {
        return null;
    }

    render() {
        let config = Config.get().getTypeConfig(this.props.type);
        var events = {onMouseUp: this.onClick.bind(this)}

        return(
            <div id={this.props.uuid}>
                <div className={'action ' + this.getClassName()} {...events}>
                    <TitleBar className="action-title" title={config.name} onRemoval={this.onRemoval.bind(this)}/>
                    <div className="action-content">
                        {this.renderNode()}
                    </div>
                </div>
                <NodeModal
                    key={"modal-" + this.props.uuid}
                    ref={(ele: any) => {this.modal = ele}} 
                    initial={this.props}
                    changeType={true}
                /> 
            </div>
        )
    }
    
    getType() {
        return this.props.type;
    }
}

export default ActionComp;
