import * as React from 'react';
import { ChangeGroups, Group } from '../../../flowTypes';
import { Types } from '../../../config/typeConfigs';

export const removeAllSpecId = 'remove_from_all';
export const contentSpecId = 'content';
export const removeAllText = 'Remove from all groups';
export const ellipsesText = '...';

export const getRemoveAllMarkup = (
    key = removeAllSpecId,
    specId = removeAllSpecId,
    text = removeAllText
) => (
    <div key={key} data-spec={specId}>
        {text}
    </div>
);

export const getGroupMarkup = (value: string, idx: number) => <div key={idx}>{value}</div>;

export const getGroupElements = (groups: Group[] = []) =>
    groups.reduce((groupList, { name }, idx) => {
        if (idx <= 2) {
            groupList.push(getGroupMarkup(name, idx));
        }

        if (idx === 3) {
            groupList.push(getGroupMarkup(ellipsesText, idx));
        }

        return groupList;
    }, []);

export const getContentMarkup = ({ type, groups }: ChangeGroups): JSX.Element[] => {
    const content = [];

    if (type === Types.remove_contact_groups && !groups.length) {
        content.push(getRemoveAllMarkup());
    } else {
        const groupEls = content.push(...getGroupElements(groups));
    }

    return content;
};

export const getChangeGroupsMarkup = (action: ChangeGroups, specId = contentSpecId) => (
    <div data-spec={specId}>{getContentMarkup(action)}</div>
);


const ChangeGroupComp: React.SFC<ChangeGroups> = (props): JSX.Element =>
    getChangeGroupsMarkup(props);

export default ChangeGroupComp;
