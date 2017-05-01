import * as React from "react";

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

    timeout: any;

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

        this.timeout = window.setTimeout(()=>{
            this.setState({
                confirmingRemoval: false
            })
        }, 2000);
    }

    render() {

        var confirmation;

        if (this.state.confirmingRemoval) {
            confirmation = (
                <div className="remove-confirm">
                    <div className="remove-button" onMouseUp={this.props.onRemoval}><span className="icon-remove"/></div>
                    Remove?
                </div>
            )
        }

        return(
            <div className={"titlebar " + this.props.className}>
                {this.props.title}
                <div className="remove-button" onMouseUp={this.onConfirmRemoval.bind(this)}><span className="icon-remove"/></div>
                {confirmation}                
            </div>
        )
    }
}

export default TitleBar;