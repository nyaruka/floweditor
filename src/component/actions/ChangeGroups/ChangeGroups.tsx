import * as React from 'react';
import { ChangeGroups, Group } from '../../../flowTypes';

export const removeAllSpecId = 'remove_from_all';
export const contentSpecId = 'content';

export const removeAll = 'Remove from all groups';
export const ellipses = '...';

export const getRemoveAllMarkup = () => (
    <div key={removeAllSpecId} data-spec={removeAllSpecId}>
        {removeAll}
    </div>
);

export const getGroupMarkup = (value: string, idx: number) => <div key={idx}>{value}</div>;

export const getGroupElements = (groups: Group[]) =>
    groups.reduce((groupList, { name }, idx) => {
        if (idx <= 2) {
            groupList.push(getGroupMarkup(name, idx));
        }

        if (idx === 3) {
            groupList.push(getGroupMarkup(ellipses, idx));
        }

        return groupList;
    }, []);

export const getContentMarkup = ({ type, groups }: ChangeGroups): JSX.Element[] => {
    const content: JSX.Element[] = [];

    if (type === 'remove_contact_groups' && !groups.length) {
        content.push(getRemoveAllMarkup());
    } else {
        const groupEls = content.push(...getGroupElements(groups));
    }

    return content;
};

export const getChangeGroupsMarkup = (action: ChangeGroups) => (
    <div data-spec={contentSpecId}>{getContentMarkup(action)}</div>
);

const ChangeGroupComp: React.SFC<ChangeGroups> = (props): JSX.Element =>
    getChangeGroupsMarkup(props);

export default ChangeGroupComp;
