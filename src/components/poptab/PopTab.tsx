import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import * as styles from './PopTab.scss';

export interface PopTabProps {
    color: string;
    icon: string;
    label: string;
    header: string;
    orientation: string;
    top: string;
    onShow: () => void;
    onHide: () => void;
}

export interface PopTabState {
    visible: boolean;
    width: number;
}

export class PopTab extends React.Component<PopTabProps, PopTabState> {
    private poppedEle: HTMLDivElement;

    constructor(props: PopTabProps) {
        super(props);
        this.state = { visible: false, width: 400 };

        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public componentDidUpdate(): void {
        if (this.state.width !== this.poppedEle.offsetWidth) {
            this.setState({ width: this.poppedEle.offsetWidth });
        }
    }

    private handlePoppedRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.poppedEle = ref);
    }

    private handleTabClick(): void {
        this.setState({ visible: true }, () => {
            this.props.onShow();
        });
    }

    private handleClose(): void {
        this.setState({ visible: false }, () => {
            this.props.onHide();
        });
    }
    public render(): JSX.Element {
        return (
            <div
                className={styles.popWrapper + ' ' + (this.state.visible ? styles.visible : '')}
                style={{
                    right: -this.state.width,
                    top: this.props.top
                }}
            >
                <div className={styles.tabWrapper}>
                    <div
                        className={styles.tab}
                        style={{ background: this.props.color }}
                        onClick={this.handleTabClick}
                    >
                        <div className={styles.icon}>
                            <span className={this.props.icon} />
                        </div>
                        <div className={styles.label}>{this.props.label}</div>
                    </div>
                </div>
                <div
                    ref={this.handlePoppedRef}
                    className={styles.popped}
                    style={{
                        borderColor: this.props.color,
                        right: this.state.visible ? 60 + this.state.width : 0
                    }}
                >
                    <div className={styles.header} style={{ background: this.props.color }}>
                        <div className={styles.close + ' fe-x'} onClick={this.handleClose} />
                        <div className={styles.headerLabel}>{this.props.header}</div>
                    </div>
                    <>{this.props.children}</>
                </div>
            </div>
        );
    }
}
