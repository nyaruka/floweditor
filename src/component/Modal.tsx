import * as React from 'react';
import * as ReactModal from 'react-modal';
import { Case, FlowNode, SwitchRouter } from '../flowTypes';
import Button, { ButtonProps, ButtonTypes } from './Button';
import * as styles from './Modal.scss';
import * as shared from './shared.scss';

export interface ButtonSet {
    primary: ButtonProps;
    secondary?: ButtonProps;
    tertiary?: ButtonProps;
}

interface Buttons {
    leftButtons: JSX.Element[];
    rightButtons: JSX.Element[];
}

interface CustomStyles {
    content: { [cssProperty: string]: string | number };
}

export interface ModalProps {
    show: boolean;
    buttons: ButtonSet;
    node?: FlowNode;
    advanced?: JSX.Element;
    onModalOpen?: any;
    __className?: string;
    title: JSX.Element[];
    width?: string;
}

interface ModalState {
    flipped: boolean;
}

// A base modal for displaying messages or performing single button actions
export default class Modal extends React.PureComponent<ModalProps, ModalState> {
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

    private getButtons(): Buttons {
        const rightButtons: JSX.Element[] = [
            <Button key={0} {...this.props.buttons.secondary} type={ButtonTypes.secondary} />
        ];

        if (this.props.buttons.primary) {
            rightButtons.push(
                <Button key={1} {...this.props.buttons.primary} type={ButtonTypes.primary} />
            );
        }

        const leftButtons: JSX.Element[] = [];

        // Our left most button if we have one
        if (this.props.buttons.tertiary) {
            leftButtons.push(
                <Button key={0} {...this.props.buttons.tertiary} type={ButtonTypes.tertiary} />
            );
        }

        return {
            leftButtons,
            rightButtons
        };
    }

    private getTopStyle(): string {
        let topStyle: string = styles.container;

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
                        <div className={`${styles.background} icn-settings`} />
                        <div style={{ marginLeft: '50px' }}>{title}</div>
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
                                <div className="icn-settings" />
                            </div>
                        );
                    }
                } else {
                    flip = (
                        <div className={styles.show_front} onClick={this.toggleFlip}>
                            <div className="icn-back" />
                        </div>
                    );
                }
            }
            return (
                <div key={`modal_side_${childIdx}`} className={classes.join(' ')}>
                    <div className={styles.modal}>
                        <div
                            className={`${styles.header} ${this.props.__className} ${
                                shared[`modal_side_${childIdx}`]
                            }`}
                        >
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

    public render(): JSX.Element {
        const onRequestClose = this.props.buttons.secondary
            ? this.props.buttons.secondary.onClick
            : null;

        const width: string = this.props.width ? this.props.width : '700px';
        const customStyles: CustomStyles = {
            content: {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '40px',
                bottom: 'initial',
                padding: 'none',
                borderRadius: 'none',
                outline: 'none',
                width,
                border: 'none'
            }
        };
        const topStyle: string = this.getTopStyle();
        const sides: JSX.Element[] = this.mapSides();
        return (
            <ReactModal
                ariaHideApp={false}
                isOpen={this.props.show}
                onAfterOpen={this.props.onModalOpen}
                onRequestClose={onRequestClose}
                style={customStyles}
                shouldCloseOnOverlayClick={false}
                contentLabel="Modal"
            >
                <div className={topStyle}>{sides}</div>
            </ReactModal>
        );
    }
}
