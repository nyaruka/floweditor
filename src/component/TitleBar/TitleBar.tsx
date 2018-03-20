import * as React from 'react';

import * as styles from './TitleBar.scss';
import { createClickHandler } from '../../utils';

interface TitleBarProps {
    title: string;
    onRemoval(event: React.MouseEvent<HTMLDivElement>): any;
    className?: string;
    showRemoval?: boolean;
    showMove?: boolean;
    onMoveUp?(event: React.MouseEvent<HTMLDivElement>): any;
}

interface TitleBarState {
    confirmingRemoval: boolean;
}

/**
 * Simple title bar with confirmation removal
 */
export default class TitleBar extends React.Component<TitleBarProps, TitleBarState> {
    private timeout: any;

    constructor(props: TitleBarProps) {
        super(props);

        this.state = {
            confirmingRemoval: false
        };

        this.onConfirmRemoval = this.onConfirmRemoval.bind(this);
    }

    public componentWillUnmount(): void {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }
    }

    private onConfirmRemoval(event: React.MouseEvent<HTMLDivElement>): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.setState({
            confirmingRemoval: true
        });

        this.timeout = window.setTimeout(() => {
            this.setState({
                confirmingRemoval: false
            });
        }, 2000);
    }

    private getConfirmationEl(): JSX.Element {
        let confirmation: JSX.Element;

        if (this.state.confirmingRemoval) {
            confirmation = (
                <div className={styles.remove_confirm}>
                    <div
                        className={styles.remove_button}
                        {...createClickHandler(this.props.onRemoval)}>
                        <span className="icon-remove" />
                    </div>
                    Remove?
                </div>
            );
        }

        return confirmation;
    }

    private getMoveArrow(): JSX.Element {
        let moveArrow: JSX.Element = null;

        if (this.props.showMove) {
            moveArrow = (
                <div className={styles.up_button} {...createClickHandler(this.props.onMoveUp)}>
                    <span className="icon-arrow-up" />
                </div>
            );
        } else {
            moveArrow = <div className={styles.up_button} />;
        }

        return moveArrow;
    }

    private getRemove(): JSX.Element {
        let remove: JSX.Element = null;

        if (this.props.showRemoval) {
            remove = (
                <div
                    className={styles.remove_button}
                    {...createClickHandler(this.onConfirmRemoval)}>
                    <span className="icon-remove" />
                </div>
            );
        }

        return remove;
    }

    public render(): JSX.Element {
        const confirmation: JSX.Element = this.getConfirmationEl();
        const moveArrow: JSX.Element = this.getMoveArrow();
        const remove: JSX.Element = this.getRemove();
        return (
            <div className={styles.titlebar}>
                <div className={`${this.props.className} ${styles.normal}`}>
                    {moveArrow}
                    {remove}
                    {this.props.title}
                </div>
                {confirmation}
            </div>
        );
    }
}
