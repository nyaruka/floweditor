import * as React from 'react';
import * as formStyles from './NodeEditor.scss';

const FormContainer: React.SFC<{
    onKeyPress(event: React.KeyboardEvent<HTMLFormElement>): void;
    styles?: string;
}> = ({ children, onKeyPress, styles }): JSX.Element => (
    <div className={styles ? styles : null}>
        <div className={formStyles.node_editor}>
            <form onKeyPress={onKeyPress}>{children}</form>
        </div>
    </div>
);

export default FormContainer;
