import * as React from 'react';
import * as styles from '~/component/Button.scss';

export enum ButtonTypes {
    primary = 'primary',
    secondary = 'secondary',
    tertiary = 'tertiary'
}
export interface ButtonProps {
    name: string;
    onClick: any;
    type?: ButtonTypes;
}

const Button: React.SFC<ButtonProps> = ({ name, onClick, type }) => (
    <div onClick={onClick} className={`${styles.btn} ${styles[type]}`}>
        {name}
    </div>
);

export default Button;
