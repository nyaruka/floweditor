import * as React from 'react';
import * as Interfaces from '../interfaces';
import * as Renderer from '../components/Renderer';
import Config from '../services/Config';

var UUID  = require('uuid');
var ReactModal = require('react-modal');
var Select2 = require('react-select2-wrapper');


interface ModalProps {
    show: boolean;
    onModalOpen: any;
    onModalClose: any;
    className: string;
    title: JSX.Element;
    width?: string;

    // button options
    ok?: string;
    cancel?: string;
    tertiary?: string;
}

/**
 * A base modal for displaying messages or performing single button actions
 */
export class Modal extends React.Component<ModalProps, {}> {

    constructor(props: ModalProps) {
        super(props);
    }

    render() {
        var customStyles = {
            content : {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '40px',
                bottom: 'initial',
                padding: 'none',
                borderRadius: 'none',
                outline: 'none',
                width: this.props.width ? this.props.width : "700px",
                border: 'none'
            }
        }

        var rightButtons: JSX.Element[] = [];
        var leftButtons: JSX.Element[] = [];

        if (this.props.cancel) {
            rightButtons.push(<a key={Math.random()} href="javascript:void(0);" data-type="cancel" className='btn cancel' onClick={this.props.onModalClose}>{this.props.cancel}</a>)
        }
        
        // no matter what, we'll have a primary button
        rightButtons.push(<a tabIndex={0} key={Math.random()} href="javascript:void(0);" data-type="ok" className='btn ok' onClick={this.props.onModalClose}>{this.props.ok ? this.props.ok : 'Ok'}</a>)

        // our left most button if we have one
        if (this.props.tertiary) {
            leftButtons.push(<a key={Math.random()} href="javascript:void(0);" data-type="tertiary" className='btn tertiary' onClick={this.props.onModalClose}>{this.props.tertiary}</a>)
        }

        return (
            <ReactModal
                isOpen={this.props.show}
                onAfterOpen={this.props.onModalOpen}
                onRequestClose={this.props.onModalClose}
                style={customStyles}
                shouldCloseOnOverlayClick={false}
                contentLabel="Modal"
                closeTimeoutMS={200}>

                <div className={"modal " + this.props.className}>
                    <div className="modal-header">
                        {this.props.title}
                    </div>
                    <div className="modal-content">
                        {this.props.children}
                    </div>
                    <div className="modal-footer">
                        <div className="left">
                            {leftButtons}
                        </div>
                        <div className="right">
                            {rightButtons}
                        </div>
                    </div>
                </div>                
            </ReactModal>
        )
    }
}

export default Modal;