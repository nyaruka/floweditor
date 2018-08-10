import * as React from 'react';

const styles = require('./Pill.scss');

export interface PillProps {
    advanced: boolean;
    onClick?(event: React.MouseEvent<HTMLDivElement>): void;
    text: string;
    maxLength: number;
}

const Pill: React.SFC<PillProps> = (props: PillProps): JSX.Element => {
    if (props.text.startsWith('@')) {
        return (
            <div
                data-advanced={props.advanced}
                onClick={props.onClick}
                className={styles.pill}
                title={props.text}
            >
                @(exp)
            </div>
        );
    }

    let text = props.text;
    if (text.length > props.maxLength) {
        text = props.text.substring(0, props.maxLength) + '...';
    }
    return (
        <div data-advanced={props.advanced} onClick={props.onClick} className={styles.pill}>
            {text}
        </div>
    );
};

export default Pill;
