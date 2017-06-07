import * as React from 'react';
import * as UUID from 'uuid';
import * as ReactModal from 'react-modal';

import { Button } from './Button';
import { Config } from '../services/Config';

var styles = require('./Modal.scss');

interface ModalProps {
    show: boolean;

    onModalOpen?: any;
    className?: string;
    title: JSX.Element;
    width?: string;

    // button options
    ok?: string;
    cancel?: string;
    tertiary?: string;

    onClickPrimary?: any;
    onClickSecondary?: any;
    onClickTertiary?: any;
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

        if (this.props.cancel) {
            //rightButtons.push(<a key={Math.random()} href="javascript:void(0);" data-type="cancel" className={styles.btn + ' ' + styles.cancel} onClick={this.props.onModalClose}>{this.props.cancel}</a>)
            rightButtons.push(<Button key={Math.random()} name={this.props.cancel} onClick={this.props.onClickSecondary} type="secondary" />);
        }

        // no matter what, we'll have a primary button
        // rightButtons.push(<a tabIndex={0} key={Math.random()} href="javascript:void(0);" data-type="ok" className={styles.btn + ' ok'} onClick={this.props.onModalClose}>{this.props.ok ? this.props.ok : 'Ok'}</a>)
        rightButtons.push(<Button key={Math.random()} name={this.props.ok ? this.props.ok : 'Ok'} onClick={this.props.onClickPrimary} type="primary" />);

        // our left most button if we have one
        if (this.props.tertiary) {
            leftButtons.push(<Button key={Math.random()} name={this.props.tertiary} onClick={this.props.onClickTertiary} type="tertiary" />);
        }

        // closeTimeoutMS={200}
        return (
            <ReactModal
                isOpen={this.props.show}
                onAfterOpen={this.props.onModalOpen}
                onRequestClose={this.props.onClickSecondary}
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