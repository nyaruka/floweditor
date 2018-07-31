// TODO: Remove use of Function
// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { GROUP_LABEL } from '~/components/flow/routers/constants';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import GroupsElement from '~/components/form/select/groups/GroupsElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Type } from '~/config/typeConfigs';
import { Asset } from '~/services/AssetService';
import { RenderNode } from '~/store/flowContext';
import {
    AssetArrayEntry,
    FormState,
    mergeForm,
    NodeEditorSettings,
    StringEntry
} from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

import { nodeToState, stateToNode } from './helpers';

export interface GroupsRouterFormProps {
    nodeSettings: NodeEditorSettings;
    typeConfig: Type;

    // update handlers
    updateRouter(renderNode: RenderNode): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

export interface GroupsRouterFormState extends FormState {
    groups: AssetArrayEntry;
    resultName: StringEntry;
}

export default class GroupsRouterForm extends React.Component<
    GroupsRouterFormProps,
    GroupsRouterFormState
> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: GroupsRouterFormProps) {
        super(props);
        this.state = nodeToState(this.props.nodeSettings);

        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    private handleUpdateGroups(groups: Asset[]): void {
        this.handleUpdate({ groups });
    }

    private handleResultNameChange(resultName: string): void {
        this.handleUpdate({ resultName });
    }

    private handleUpdate(keys: { groups?: Asset[]; resultName?: string }): boolean {
        const updates: Partial<GroupsRouterFormState> = {};

        if (keys.hasOwnProperty('groups')) {
            updates.groups = validate('Groups', keys.groups, [validateRequired]);
        }

        if (keys.hasOwnProperty('resultName')) {
            updates.resultName = { value: keys.resultName };
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private handleSave(): void {
        if (this.state.valid) {
            this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
            this.props.onClose(false);
        }
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public render(): JSX.Element {
        return (
            <Dialog
                title={this.props.typeConfig.name}
                headerClass={this.props.typeConfig.type}
                buttons={this.getButtons()}
            >
                <TypeList
                    __className=""
                    initialType={this.props.typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <p>{GROUP_LABEL}</p>
                <GroupsElement
                    name="Groups"
                    assets={this.context.assetService.getGroupAssets()}
                    add={false}
                    onChange={this.handleUpdateGroups}
                    entry={this.state.groups}
                />
                <OptionalTextInput
                    name="Result Name"
                    value={this.state.resultName}
                    onChange={this.handleResultNameChange}
                    toggleText="Save as.."
                    helpText="By naming the result, you can reference it later using @run.results.whatever_the_name_is"
                />
            </Dialog>
        );
    }
}
