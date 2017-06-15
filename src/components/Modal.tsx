import * as React from 'react';
import * as UUID from 'uuid';
import * as ReactModal from 'react-modal';

import { Button, ButtonProps } from './Button';
import { Config } from '../services/Config';

var styles = require('./Modal.scss');

export interface ButtonSet {
    primary: ButtonProps;
    secondary?: ButtonProps;
    tertiary?: ButtonProps;
}

interface ModalProps {
    show: boolean;
    buttons: ButtonSet;

    onModalOpen?: any;
    className?: string;
    title: JSX.Element;
    width?: string;
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
            content: {
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

        var buttons = this.props.buttons;

        if (buttons.secondary) {
            rightButtons.push(<Button key={Math.random()} {...buttons.secondary} type="secondary" />);
        }

        // no matter what, we'll have a primary button
        rightButtons.push(<Button key={Math.random()} {...buttons.primary} type="primary" />);

        // our left most button if we have one
        if (buttons.tertiary) {
            leftButtons.push(<Button key={Math.random()} {...buttons.tertiary} type="tertiary" />);
        }

        // closeTimeoutMS={200}
        return (
            <ReactModal
                isOpen={this.props.show}
                onAfterOpen={this.props.onModalOpen}
                onRequestClose={buttons.secondary ? buttons.secondary.onClick : null}
                style={customStyles}
                shouldCloseOnOverlayClick={false}
                contentLabel="Modal"
            >

                <div className={styles.modal}>
                    <div className={styles["modal-header"] + " " + this.props.className}>
                        {this.props.title}
                    </div>
                    <div className={styles["modal-content"]}>
                        {this.props.children}
                    </div>
                    <div className={styles["modal-footer"]}>
                        <div className={styles.left}>
                            {leftButtons}
                        </div>
                        <div className={styles.right}>
                            {rightButtons}
                        </div>
                    </div>
                </div>
            </ReactModal>
        )
    }
}

export default Modal;