import * as React from 'react';

const styles = require('./Button.scss');

export interface ButtonProps {
    name: string;
    onClick: any;
    type?: string;
}

export default class Button extends React.PureComponent<ButtonProps, {}> {
    render() {
        const { name, onClick, type } = this.props;
        const classes = [styles.btn, styles[type]].join(' ');
        return (
            <div
                onClick={onClick}
                className={classes}
                data-spec={`button-${type}-${name.toLowerCase()}`}>
                {name}
            </div>
        );
    }
};
