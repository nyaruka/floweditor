import * as React from 'react';
import * as UUID from 'uuid';
import * as ReactModal from 'react-modal';

import { Button, IButtonProps } from './Button';

const styles = require('./Modal.scss');
const shared = require('./shared.scss');

export interface IButtonSet {
    primary: IButtonProps;
    secondary?: IButtonProps;
    tertiary?: IButtonProps;
}

export interface IModalProps {
    show: boolean;
    buttons: IButtonSet;

    advanced?: JSX.Element;
    onModalOpen?: any;
    className?: string;
    title: JSX.Element[];
    width?: string;
}

interface IModalState {
    flipped: boolean;
}

/**
 * A base modal for displaying messages or performing single button actions
 */
class Modal extends React.Component<IModalProps, IModalState> {
    constructor(props: IModalProps) {
        super(props);
        this.state = {
            flipped: false
        };
        this.toggleFlip = this.toggleFlip.bind(this);
    }

    public toggleFlip() {
        this.setState({ flipped: !this.state.flipped });
    }

    componentWillReceiveProps(nextProps: IModalProps) {
        if (this.props.show != nextProps.show && !nextProps.show) {
            this.setState({ flipped: false });
        }
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
                width: this.props.width ? this.props.width : '700px',
                border: 'none'
            }
        };

        var rightButtons: JSX.Element[] = [];
        var leftButtons: JSX.Element[] = [];

        var buttons = this.props.buttons;

        if (buttons.secondary) {
            rightButtons.push(
                <Button key={Math.random()} {...buttons.secondary} type="secondary" />
            );
        }

        // no matter what, we'll have a primary button
        rightButtons.push(<Button key={Math.random()} {...buttons.primary} type="primary" />);

        // our left most button if we have one
        if (buttons.tertiary) {
            leftButtons.push(<Button key={Math.random()} {...buttons.tertiary} type="tertiary" />);
        }

        // closeTimeoutMS={200}

        var topStyle = styles.container;
        if (this.state.flipped) {
            topStyle += ' ' + styles.flipped;
        }

        var children = React.Children.toArray(this.props.children);
        var hasAdvanced = children.length > 1 && children[1] != null;

        var sides = children.map((child: React.ReactChild, i: number) => {
            var classes = [styles.side];
            var title = this.props.title[i];
            if (i == 0) {
                classes.push(styles.front);
            } else {
                title = (
                    <div>
                        <div className={styles.background + ' icon-settings'} />
                        <div style={{ marginLeft: '40px' }}>{title}</div>
                    </div>
                );
                classes.push(styles.back);
            }

            var flip = null;
            if (hasAdvanced) {
                if (i == 0) {
                    flip = (
                        <div className={styles.show_back} onClick={this.toggleFlip}>
                            <span className="icon-settings" />
                        </div>
                    );
                } else {
                    flip = (
                        <div className={styles.show_front} onClick={this.toggleFlip}>
                            <span className="icon-back" />
                        </div>
                    );
                }
            }

            return (
                <div key={'modal_side_' + i} className={classes.join(' ')}>
                    <div className={styles.modal}>
                        <div
                            className={
                                styles.header +
                                ' ' +
                                this.props.className +
                                ' ' +
                                shared['modal_side_' + i]
                            }>
                            {flip}
                            {title}
                        </div>
                        <div className={styles.content}>{child}</div>
                        <div className={styles.footer}>
                            <div className={styles.left}>{leftButtons}</div>
                            <div className={styles.right}>{rightButtons}</div>
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <ReactModal
                isOpen={this.props.show}
                onAfterOpen={this.props.onModalOpen}
                onRequestClose={buttons.secondary ? buttons.secondary.onClick : null}
                style={customStyles}
                shouldCloseOnOverlayClick={false}
                contentLabel="Modal">
                <div className={topStyle}>{sides}</div>
            </ReactModal>
        );
    }
}

export default Modal;
