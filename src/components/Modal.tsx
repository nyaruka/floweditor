import * as React from 'react';
import * as ReactModal from 'react-modal';
import { Node, Case, SwitchRouter } from '../flowTypes';
import Button, { ButtonProps } from './Button';

const uniqid = require('uniqid');

const styles = require('./Modal.scss');
const shared = require('./shared.scss');

export interface ButtonSet {
    primary: ButtonProps;
    secondary?: ButtonProps;
    tertiary?: ButtonProps;
}

export interface ModalProps {
    show: boolean;
    buttons: ButtonSet;
    node?: Node;
    advanced?: JSX.Element;
    onModalOpen?: any;
    className?: string;
    title: JSX.Element[];
    width?: string;
}

interface ModalState {
    flipped: boolean;
}

/** A base modal for displaying messages or performing single button actions */
class Modal extends React.PureComponent<ModalProps, ModalState> {
    private children: React.ReactChild[];
    private hasAdvanced: boolean;

    constructor(props: ModalProps) {
        super(props);

        this.state = {
            flipped: false
        };

        this.toggleFlip = this.toggleFlip.bind(this);
    }

    public toggleFlip(): void {
        this.setState({ flipped: !this.state.flipped });
    }

    public componentWillReceiveProps(nextProps: ModalProps): void {
        if (this.props.show !== nextProps.show && !nextProps.show) {
            this.setState({ flipped: false });
        }
    }

    private getButtons(): { leftButtons: JSX.Element[]; rightButtons: JSX.Element[] } {
        const rightButtons: JSX.Element[] = [
            <Button key={uniqid()} {...this.props.buttons.secondary} type="secondary" />
        ];
        const leftButtons: JSX.Element[] = [];

        if (this.props.buttons.secondary) {
            rightButtons.push(
                <Button key={uniqid()} {...this.props.buttons.primary} type="primary" />
            );
        }

        /** Our left most button if we have one */
        if (this.props.buttons.tertiary) {
            leftButtons.push(
                <Button key={uniqid()} {...this.props.buttons.tertiary} type="tertiary" />
            );
        }

        return {
            leftButtons,
            rightButtons
        };
    }

    private getTopStyle(): string {
        let topStyle = styles.container;

        if (this.state.flipped) {
            topStyle += ` ${styles.flipped}`;
        }

        return topStyle;
    }

    private mapSides(): JSX.Element[] {
        const children = React.Children.toArray(this.props.children);
        const hasAdvanced = children.length > 1;
        const { leftButtons, rightButtons } = this.getButtons();

        return children.map((child: React.ReactChild, childIdx: number) => {
            const classes = [styles.side];
            let title = this.props.title[childIdx];

            if (childIdx === 0) {
                classes.push(styles.front);
            } else {
                title = (
                    <div>
                        <div className={`${styles.background} icon-settings`} />
                        <div style={{ marginLeft: '40px' }}>{title}</div>
                    </div>
                );
                classes.push(styles.back);
            }

            let flip: JSX.Element;

            if (hasAdvanced) {
                /** Don't show advanced settings for SwitchRouter unless we have cases to translate */
                let cases: Case[];

                if (this.props.node && this.props.node.router) {
                    ({ cases } = this.props.node.router as SwitchRouter);
                }

                if (childIdx === 0) {
                    if (cases && !cases.length) {
                        flip = null;
                    } else {
                        flip = (
                            <div className={styles.show_back} onClick={this.toggleFlip}>
                                <span className="icon-settings" />
                            </div>
                        );
                    }
                } else {
                    flip = (
                        <div className={styles.show_front} onClick={this.toggleFlip}>
                            <span className="icon-back" />
                        </div>
                    );
                }
            }

            return (
                <div key={`modal_side_${childIdx}`} className={classes.join(' ')}>
                    <div className={styles.modal}>
                        <div
                            className={`${styles.header} ${this.props.className} ${
                                shared[`modal_side_${childIdx}`]
                            }`}>
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
    }

    render() {
        const customStyles = {
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
        const topStyle = this.getTopStyle();
        const sides = this.mapSides();

        return (
            <ReactModal
                isOpen={this.props.show}
                onAfterOpen={this.props.onModalOpen}
                onRequestClose={
                    this.props.buttons.secondary ? this.props.buttons.secondary.onClick : null
                }
                style={customStyles}
                shouldCloseOnOverlayClick={false}
                contentLabel="Modal">
                <div className={topStyle}>{sides}</div>
            </ReactModal>
        );
    }
}

export default Modal;
