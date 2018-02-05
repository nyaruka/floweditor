import * as React from 'react';

import * as styles from './Button.scss';

export interface ButtonProps {
    name: string;
    onClick: any;
    type?: string;
}

export default class Button extends React.PureComponent<ButtonProps, {}> {
    public render(): JSX.Element {
        const { name, onClick, type } = this.props;
        const className = `${styles.btn} ${styles[type]}`;
        return (
            <div
                onClick={onClick}
                className={className}
                data-spec={`button-${type}-${name.toLowerCase()}`}>
                {name}
            </div>
        );
    }
}
