import * as React from "react";
var styles = require("./TitleBar.scss");


interface TitleBarProps {
    title: string;
    className?: string;
    onRemoval(event: React.MouseEvent<HTMLDivElement>): any;
}

interface TitleBarState {
    confirmingRemoval: boolean;
}

/**
 * Simple title bar with confirmation removal
 */
export class TitleBar extends React.Component<TitleBarProps, TitleBarState> {

    private timeout: any;

    constructor(props: TitleBarProps) {
        super(props);
        this.state = {
            confirmingRemoval: false
        }
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
        })

        this.timeout = window.setTimeout(() => {
            this.setState({
                confirmingRemoval: false
            })
        }, 2000);
    }

    render() {

        var confirmation;

        if (this.state.confirmingRemoval) {
            confirmation = (
                <div className={styles["remove-confirm"]}>
                    Remove?
                    <div className={styles["remove-button"]} onMouseUp={this.props.onRemoval}><span className="icon-remove" /></div>
                </div>
            )
        }

        return (
            <div className={styles.titlebar}>
                <div className={this.props.className + " " + styles.normal}>
                    {this.props.title}
                    <div className={styles["remove-button"]} onMouseUp={this.onConfirmRemoval.bind(this)}><span className="icon-remove" /></div>
                </div>
                {confirmation}
            </div>
        )
    }
}

export default TitleBar;