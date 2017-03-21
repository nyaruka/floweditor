import * as React from "react";
import * as axios from "axios";
import * as Interfaces from '../interfaces'
import * as Forms from './Forms';
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {FlowComp} from './Flow';
import {NodeModal} from './Modals';
import {Config, TypeConfig} from '../services/Config';

let UUID  = require("uuid");

/**
 * Base Action class for the rendered flow
 */
export abstract class ActionComp<P extends Interfaces.ActionProps> extends React.Component<P, {}> {

    public form: HTMLFormElement;
    private modal: NodeModal;

    abstract renderNode(): JSX.Element;

    static contextTypes = {
        flow: React.PropTypes.object,
        node: React.PropTypes.object
    }
    
    context: Interfaces.FlowContext;
    
    constructor(props: P) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    static createAction(action: Interfaces.ActionProps, node: Interfaces.NodeProps) {
        if (action.type == "add_to_group") {
            return <AddToGroupActionComp {...action as Interfaces.AddToGroupProps} key={action.uuid}/>
        } else if (action.type == "save_to_contact") {
            var props = action as Interfaces.SaveToContactProps;
            return <SaveToContactActionComp {...action as Interfaces.SaveToContactProps} key={action.uuid}/>
        } else if (action.type == "msg") {
            return <SendMessageActionComp {...action as Interfaces.SendMessageProps} key={action.uuid}/>            
        } else if (action.type == "set_language") {
            return <SetLanguageActionComp {...action as Interfaces.SetLanguageProps} key={action.uuid}/>
        }
    }

    setEditing(editing: boolean) {
        this.setState({editing: editing})
    }

    onClick (event: any) {
        if (!this.context.node.state.dragging) {
            this.modal.open();
        }
    }

    getClassName() {
        return this.props.type.split('_').join('-');
    }

    render() {
        var config = Config.get().getTypeConfig(this.props.type);

        return(
            <div>
                <div className={'action ' + this.getClassName()} 
                     onMouseUp={(event)=>{this.onClick(event)}}>
                    <div className="action-title">
                      {config.name}
                    </div>
                    <div className="action-content">
                        {this.renderNode()}
                    </div>
                </div>
                <NodeModal ref={(ele: any) => {this.modal = ele}} initial={this.props}/> 
            </div>
        )
    }
    
    getType() {
        return this.props.type;
    }
}

export class AddToGroupActionComp extends ActionComp<Interfaces.AddToGroupProps> {
    renderNode() { return <div>Add contact to the {this.props.name} group.</div> }
}

export class SaveToContactActionComp extends ActionComp<Interfaces.SaveToContactProps> {
    renderNode() { return <div>Update {this.props.name}.</div> }
}

export class SendMessageActionComp extends ActionComp<Interfaces.SendMessageProps> {
    renderNode() { return <div>{this.props.text}</div>; }
}

export class SetLanguageActionComp extends ActionComp<Interfaces.SetLanguageProps> {
    renderNode() { return <div>Update contact language {this.props.language}.</div>; }
}

export default ActionComp;
