import * as React from 'react';
import * as UUID from 'uuid';
import { IAction } from '../../flowTypes';
import { LocalizedObject } from '../../services/Localization';
import NodeEditorForm, { INodeEditorFormState } from './NodeEditorForm';

abstract class NodeActionForm<A extends IAction> extends NodeEditorForm<
    INodeEditorFormState
> {
    private actionUUID: string;

    public getLocalizedObject(): LocalizedObject {
        if (this.props.localizations && this.props.localizations.length == 1) {
            return this.props.localizations[0];
        }
    }

    public getInitial(): A {
        if (this.props.action) {
            return this.props.action as A;
        }
        return null;
    }

    public getActionUUID(): string {
        if (this.props.action) {
            return this.props.action.uuid;
        }

        if (!this.actionUUID) {
            this.actionUUID = UUID.v4();
        }
        return this.actionUUID;
    }
}

export default NodeActionForm;
