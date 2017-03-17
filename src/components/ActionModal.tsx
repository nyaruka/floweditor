import * as React from 'react';
import Modal from './Modal';
import * as Forms from './ActionForms';
import * as Interfaces from '../interfaces';
import Plumber from '../services/Plumber';


var Select2 = require('react-select2-wrapper');

interface ActionOption {
    type: string;
    name: string;
    description: string;
    form: {new(props: Interfaces.ActionProps): Forms.ActionForm};
}

let actions: ActionOption[] = [
    {type: "msg", name: "Send Message", description: "Send the contact a message", form: Forms.SendMessageForm},
    {type: "add_to_group", name: "Add to Group", description: "Add the contact to a group", form: Forms.AddToGroupForm},
    {type: "save_to_contact", name: "Save to Contact", description: "Update a field on the contact", form: Forms.SaveToContactForm},
    {type: "set_language", name: "Set Language", description: "Update the language for the contact", form: Forms.SetLanguageForm}
]

interface ActionModalProps {
    initial: Interfaces.ActionProps;
}

interface ActionModalState {
    show: boolean;
    actionForm: Forms.ActionForm;
}

export class ActionModal extends React.Component<ActionModalProps, ActionModalState> {
    
    private actionMap: {[type:string]:Forms.ActionForm; } = {}
    private form: HTMLFormElement;

    context: Interfaces.FlowContext;
    
    static contextTypes = {
        flow: React.PropTypes.object,
        node: React.PropTypes.object
    }
    
    constructor(props: ActionModalProps) {
        super(props);

        this.state = {
            show: false,
            actionForm: this.getFormForType(this.props.initial.type, this.props.initial)
        }

        this.onModalClose = this.onModalClose.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.onChangeAction = this.onChangeAction.bind(this);
    }

    open() {
        this.setState({
            show: true,
            actionForm: this.getFormForType(this.props.initial.type, this.props.initial)
        });
    }

    close() {
        this.setState({show: false});
    }

    getFormForType (type: string, props?: Interfaces.ActionProps) {
        if (!(type in this.actionMap)) {
            for (let config of actions) {
                if (config.type == type) {
                    // console.log('Creating form for', props.type, props);
                    this.actionMap[type] = new config.form(props);
                }
            }
        }
        return this.actionMap[type]
    }

    onModalOpen() {

    }
    
    onModalClose(event: any) {
        if ($(event.target).data('type') == 'ok') {
            this.state.actionForm.submit(this.context, this.form);
        }

        // force a clean action form now that we are done
        delete this.actionMap[this.props.initial.type];
        this.close();
    }

    onChangeAction(event: any) {
        var type = event.target.value;
        this.setState({ actionForm: this.getFormForType(type, {type: type} as Interfaces.ActionProps)});
    }

    render() {

        var data: any = [];
        actions.map((option: ActionOption) => {
            data.push({id: option.type, text: option.description});
        });

        var action = this.state.actionForm;
        return (
            <Modal
                width="570px"
                key={'modal_' + this.props.initial.uuid}
                title={action.renderTitle()}
                className={action.getClassName()}
                show={this.state.show}
                onModalClose={this.onModalClose}
                onModalOpen={this.onModalOpen}
                ok='Save'
                cancel='Cancel'
                >
                
                <div className="action-editor">
                    <form ref={(ele: any) => { this.form = ele; }}>

                        <div className="header">When somebody arrives at this point in your flow</div>

                        <Select2
                            className={"select"}
                            value={action.props.type}
                            onChange={this.onChangeAction}
                            data={data}
                        />

                        <div className="widgets">{action.renderForm()}</div>
                    </form>
                </div>
            </Modal>
        )
    }
}