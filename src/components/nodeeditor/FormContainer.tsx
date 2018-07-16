import * as React from 'react';

import * as formStyles from '~/components/nodeeditor/NodeEditor.scss';

export const FormContainer: React.SFC<{
    onKeyPress(event: React.KeyboardEvent<HTMLFormElement>): void;
    __className?: string;
}> = ({ children, onKeyPress, __className }) => (
    <div className={__className ? __className : null}>
        <div className={formStyles.node_editor}>
            <form onKeyPress={onKeyPress}>{children}</form>
        </div>
    </div>
);

FormContainer.displayName = 'FormContainer';

export default FormContainer;
