import * as React from "react";
var UUID  = require("uuid");
var ReactModal = require("react-modal");

interface ModalProps {
    show: boolean;
    onModalOpen: any;
    onModalClose: any;
    className: string;
    title: JSX.Element;
}

export class Modal extends React.Component<ModalProps, {}> {

    private ele: any

    constructor(props: ModalProps) {
        super(props);
    }

    customStyles = {
        content : {
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '40px',
            bottom: 'initial',
            padding: 'none',
            borderRadius: 'none',
            outline: 'none',
            width: '700px',
            border: 'none'

        }
    };

    render() {
        return (
            <ReactModal
                isOpen={this.props.show}
                onAfterOpen={this.props.onModalOpen}
                onRequestClose={this.props.onModalClose}
                style={this.customStyles}
                contentLabel="blerg"
                closeTimeoutMS={200}>

                <div ref={(ele: any) => {this.ele = ele;}} className={"modal " + this.props.className}>
                    <div className="modal-header">
                        {this.props.title}
                    </div>
                    <div className="modal-content">
                        {this.props.children}
                    </div>
                    <div className="modal-footer">
                        <button onClick={this.props.onModalClose}>Save</button>
                    </div>
                </div>                
            </ReactModal>
        )
    }
}

export default Modal;