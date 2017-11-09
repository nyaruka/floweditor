import * as React from 'react';
import { IChangeGroup } from '../../../flowTypes';
import { IType, IEndpoints } from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import { GroupElement } from '../../form/GroupElement';
import Widget from '../../NodeEditor/Widget';

export interface IChangeGroupFormProps {
    validationCallback: Function;
    getActionUUID: Function;
    config: IType;
    updateAction(action: IChangeGroup): void;
    getInitialAction(): IChangeGroup;
    onBindWidget(ref: any): void;
    endpoints: IEndpoints;
    ComponentMap: ComponentMap;
}

export default ({
    validationCallback,
    getActionUUID,
    config,
    updateAction,
    getInitialAction,
    onBindWidget,
    endpoints,
    ComponentMap
}: IChangeGroupFormProps): JSX.Element => {
    validationCallback((widgets: { [name: string]: Widget }) => {
        const groupEle = widgets['Group'] as any;
        const { state: { groups: [group] } } = groupEle;

        if (group) {
            const newAction: IChangeGroup = {
                uuid: getActionUUID(),
                type: config.type,
                groups: [
                    {
                        uuid: group.id,
                        name: group.name
                    }
                ]
            };

            updateAction(newAction);
        }
    });

    const renderForm = (): JSX.Element => {
        const initialAction = getInitialAction();
        let groups: { group: string; name: string }[] = [];

        if (
            initialAction &&
            (initialAction.type === 'add_to_group' || initialAction.type === 'remove_from_group')
        ) {
            if (initialAction.groups) {
                const { groups: [{ uuid: group, name }] } = initialAction;
                groups = [
                    ...groups,
                    { group, name }
                ];
            }
        }

        return (
            <div>
                <p>Select the group(s) to add the contact to.</p>
                <GroupElement
                    ref={onBindWidget}
                    name="Group"
                    endpoint={endpoints.groups}
                    localGroups={ComponentMap.getGroups()}
                    groups={groups}
                    add={config.type == 'add_to_group'}
                    required
                />
            </div>
        );
    };

    return renderForm();
};
