import * as React from 'react';
import * as styles from '~/components/button/Button.scss';

export enum ButtonTypes {
    primary = 'primary',
    secondary = 'secondary',
    tertiary = 'tertiary'
}
export interface ButtonProps {
    name: string;
    onClick: any;
    disabled?: boolean;
    type?: ButtonTypes;
}

const Button: React.SFC<ButtonProps> = ({ name, onClick, type, disabled }) => (
    <div
        onClick={onClick}
        className={`${styles.btn} ${styles[type]} ${disabled ? styles.disabled : ''}`}
    >
        {name}
    </div>
);

export default Button;
