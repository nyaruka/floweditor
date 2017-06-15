import * as React from "react";

var styles = require('./Button.scss');

export interface ButtonProps {
    name: string;
    onClick: any;
    type?: string;
}

export class Button extends React.PureComponent<ButtonProps, {}> {
    render() {
        var classes = [styles.btn];
        classes.push(styles[this.props.type]);
        return (<div onClick={this.props.onClick} className={classes.join(" ")}>{this.props.name}</div>)
    }
}
