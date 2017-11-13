import * as React from 'react';
import { ChangeGroup } from '../../../flowTypes';
import { Type, Endpoints } from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import GroupElement from '../../form/GroupElement';

export interface ChangeGroupFormProps {
    onValidCallback: Function;
    getActionUUID: Function;
    config: Type;
    updateAction(action: ChangeGroup): void;
    getInitialAction(): ChangeGroup;
    onBindWidget(ref: any): void;
    endpoints: Endpoints;
    ComponentMap: ComponentMap;
}

const ChangeGroup: React.SFC<ChangeGroupFormProps> = ({
    onValidCallback,
    getActionUUID,
    config,
    updateAction,
    getInitialAction,
    onBindWidget,
    endpoints,
    ComponentMap
}): JSX.Element => {
    onValidCallback((widgets: { [name: string]: any }) => {
        const groupEle = widgets['Group'] as any;
        const { state: { groups: [group] } } = groupEle;

        if (group) {
            const newAction: ChangeGroup = {
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
        let p: JSX.Element;

        const { type } = config;

        if (type === 'add_to_group') {
            p = <p>Select the group(s) to add the contact to.</p>;
        } else if (type === 'remove_from_group') {
            p = <p>Select the group(s) to remove the contact from.</p>
        } else {
            p = null;
        }


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
                { p }
                <GroupElement
                    ref={onBindWidget}
                    name="Group"
                    endpoint={endpoints.groups}
                    localGroups={ComponentMap.getGroups()}
                    groups={groups}
                    add={config.type === 'add_to_group'}
                    required
                />
            </div>
        );
    };

    return renderForm();
};

export default ChangeGroupForm;
