import * as React from 'react';

import * as styles from './TitleBar.scss';

interface TitleBarProps {
    title: string;
    onRemoval: (event: React.MouseEvent<HTMLDivElement>) => any;
    className?: string;
    showRemoval?: boolean;
    showMove?: boolean;
    onMoveUp?: (event: React.MouseEvent<HTMLDivElement>) => any;
}

interface TitleBarState {
    confirmingRemoval: boolean;
}

export const eventNoOp = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
};

/**
 * Simple title bar with confirmation removal
 */
class TitleBar extends React.Component<TitleBarProps, TitleBarState> {
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

        this.timeout = window.setTimeout(
            () =>
                this.setState({
                    confirmingRemoval: false
                }),
            2000
        );
    }

    private getConfirmationEl(): JSX.Element {
        if (this.state.confirmingRemoval) {
            return (
                <div className={styles.remove_confirm}>
                    <div
                        className={styles.remove_button}
                        onMouseUp={eventNoOp}
                        onClick={this.props.onRemoval}>
                        <span className="icon-remove" />
                    </div>
                    Remove?
                </div>
            );
        }

        return null;
    }

    private getMoveArrow(): JSX.Element {
        let moveArrow: JSX.Element;

        if (this.props.showMove) {
            moveArrow = (
                <div
                    className={styles.up_button}
                    onMouseUp={eventNoOp}
                    onClick={this.props.onMoveUp}>
                    <span className="icon-arrow-up" />
                </div>
            );
        } else {
            moveArrow = <div className={styles.up_button} />;
        }

        return moveArrow;
    }

    private getRemove(): JSX.Element {
        if (this.props.showRemoval) {
            return (
                <div
                    className={styles.remove_button}
                    onMouseUp={eventNoOp}
                    onClick={this.onConfirmRemoval}>
                    <span className="icon-remove" />
                </div>
            );
        }

        return null;
    }

    public render(): JSX.Element {
        const className = `${this.props.className} ${styles.normal}`;
        const confirmation: JSX.Element = this.getConfirmationEl();
        const moveArrow: JSX.Element = this.getMoveArrow();
        const remove: JSX.Element = this.getRemove();

        return (
            <div className={styles.titlebar}>
                <div className={className}>
                    {moveArrow}
                    {remove}
                    {this.props.title}
                </div>
                {confirmation}
            </div>
        );
    }
}

export default TitleBar;
