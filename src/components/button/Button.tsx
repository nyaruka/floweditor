import * as React from 'react';
import * as styles from '~/components/button/Button.scss';
import { renderIf } from '~/utils';

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
    leftSpacing?: boolean;
    topSpacing?: boolean;
    iconName?: string;
}

const Button: React.SFC<ButtonProps> = ({
    name,
    onClick,
    type,
    disabled,
    leftSpacing,
    topSpacing,
    iconName
}) => (
    <div
        style={{ marginLeft: leftSpacing ? 10 : 0, marginTop: topSpacing ? 10 : 0 }}
        onClick={onClick}
        className={`${styles.btn} ${styles[type]} ${disabled ? styles.disabled : ''}`}
    >
        {renderIf(iconName != null)(<span style={{ paddingRight: 4 }} className={iconName} />)}
        {name}
    </div>
);

export default Button;
