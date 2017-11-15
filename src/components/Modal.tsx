import * as React from 'react';
import * as ReactModal from 'react-modal';
import * as uniqID from 'uniqid';
import Button, { ButtonProps } from './Button';

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
class Modal extends React.Component<ModalProps, ModalState> {
    private children: React.ReactChild[];
    private hasAdvanced: boolean;

    constructor(props: ModalProps) {
        super(props);

        this.state = {
            flipped: false
        };

        this.children = React.Children.toArray(this.props.children);
        this.hasAdvanced = this.children.length > 1;

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
        let rightButtons: JSX.Element[] = [];
        let leftButtons: JSX.Element[] = [];

        /** No matter what, we'll have a primary button */
        rightButtons = [
            ...rightButtons,
            <Button key={uniqID()} {...this.props.buttons.primary} type="primary" />
        ];

        if (this.props.buttons.secondary) {
            rightButtons = [
                ...rightButtons,
                <Button key={uniqID()} {...this.props.buttons.secondary} type="secondary" />
            ];
        }

        /** Our left most button if we have one */
        if (this.props.buttons.tertiary) {
            leftButtons = [
                ...leftButtons,
                <Button key={uniqID()} {...this.props.buttons.tertiary} type="tertiary" />
            ];
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

    private getSides(): JSX.Element[] {
        const sides: JSX.Element[] = this.children.map(
            (child: React.ReactChild, childIdx: number) => {
                let classes = [styles.side];
                let title = this.props.title[childIdx];

                if (childIdx === 0) {
                    classes = [...classes, styles.front];
                } else {
                    title = (
                        <div>
                            <div className={`${styles.background} icon-settings`} />
                            <div style={{ marginLeft: '40px' }}>{title}</div>
                        </div>
                    );
                    classes = [...classes, styles.back];
                }

                let flip: JSX.Element;

                if (this.hasAdvanced) {
                    if (childIdx === 0) {
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

                const { leftButtons, rightButtons } = this.getButtons();

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
            }
        );

        return sides;
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

        const { leftButtons, rightButtons } = this.getButtons();

        const topStyle = this.getTopStyle();

        const sides = this.getSides();

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
