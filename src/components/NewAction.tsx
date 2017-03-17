import * as React from 'react';
import Modal from './Modal';
import * as Forms from './ActionForms';


interface ActionOption {
    type: string;
    name: string;
    description: string;
}

let actions: ActionOption[] = [
    {type: "msg", name: "Send Message", description: "Send the contact a message"},
    {type: "add_to_group", name: "Add to Group", description: "Add the contact to a group"},
    {type: "save_to_contact", name: "Save to Contact", description: "Update a field on the contact"},
    {type: "set_language", name: "Set Language", description: "Update the language for the contact"}
]


interface ActionProps {

}

interface NewActionState {
    show: boolean;
    type: string;
}

export class ActionModal extends React.Component<ActionProps, NewActionState> {

    private actionForm: Forms.ActionForm;
    
    constructor(props: ActionProps) {
        super(props);

        this.state = {
            show: false,
            type: 'msg'
        }

        this.actionForm = new Forms.SendMessageForm({
            type: 'msg',
            text: null,
            uuid: null
        });

        this.onModalClose = this.onModalClose.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.show = this.show.bind(this);
    }

    show() {
        this.setState({show: true});
    }

    onModalOpen() {}
    onModalClose() {}

    render() {

        var options: JSX.Element[] = [];
        actions.map((option: ActionOption) => {
            console.log(option);
            options.push(<option value={option.type}>{option.description}</option>);
        });

        return (
            <Modal
                title={this.actionForm.renderTitle()}
                className={this.actionForm.getClassName()}
                show={this.state.show}
                onModalClose={this.onModalClose}
                onModalOpen={this.onModalOpen}>
                
                <div>
                    <select>
                        {options}
                    </select>
                    <div>{this.actionForm.renderTitle()}</div>
                    <div>{this.actionForm.renderForm()}</div>
                </div>
            </Modal>
        )
    }
}