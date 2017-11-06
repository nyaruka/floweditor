import * as React from 'react';

const styles = require('./TitleBar.scss');

interface ITitleBarProps {
    title: string;
    className?: string;

    showRemoval?: boolean;
    onRemoval(event: React.MouseEvent<HTMLDivElement>): any;

    showMove?: boolean;
    onMoveUp?(event: React.MouseEvent<HTMLDivElement>): any;
}

interface ITitleBarState {
    confirmingRemoval: boolean;
}

/**
 * Simple title bar with confirmation removal
 */
class TitleBar extends React.Component<ITitleBarProps, ITitleBarState> {
    private timeout: any;

    constructor(props: ITitleBarProps) {
        super(props);

        this.state = {
            confirmingRemoval: false
        };

        this.onConfirmRemoval = this.onConfirmRemoval.bind(this);
    }

    componentWillUnmount() {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }
    }

    private onConfirmRemoval(event: React.MouseEvent<HTMLDivElement>) {
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

    render() {
        var confirmation;

        if (this.state.confirmingRemoval) {
            confirmation = (
                <div className={styles.remove_confirm}>
                    <div
                        className={styles.remove_button}
                        onMouseUp={(event: any) => {
                            event.stopPropagation();
                            event.preventDefault();
                        }}
                        onClick={this.props.onRemoval}>
                        <span className="icon-remove" />
                    </div>
                    Remove?
                </div>
            );
        }

        var moveArrow = null;
        if (this.props.showMove) {
            moveArrow = (
                <div
                    className={styles.up_button}
                    onMouseUp={(event: any) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                    onClick={this.props.onMoveUp}>
                    <span className="icon-arrow-up" />
                </div>
            );
        } else {
            moveArrow = <div className={styles.up_button} />;
        }

        var remove = null;
        if (this.props.showRemoval) {
            remove = (
                <div
                    className={styles.remove_button}
                    onMouseUp={(event: any) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                    onClick={this.onConfirmRemoval}>
                    <span className="icon-remove" />
                </div>
            );
        }

        return (
            <div className={styles.titlebar}>
                <div className={this.props.className + ' ' + styles.normal}>
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
