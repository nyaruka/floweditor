import * as React from 'react';
import { ChangeGroups, Group } from '../../../flowTypes';

// prettier-ignore
const groupEleReducer = (
    groupList: JSX.Element[],
    { name }: Group,
    idx: number
) => {
    if (idx <= 2) {
        groupList.push(<div key={idx}>{name}</div>);
    } else if (idx === 3) {
        groupList.push(<div key={idx}>...</div>);
    }
    return groupList;
};

const getChangeGroupsMarkup = ({ type, groups }: ChangeGroups): JSX.Element[] => {
    const content: JSX.Element[] = [];
    if (type === 'remove_from_group' && !groups.length) {
        content.push(
            <div key="remove_from_all" data-spec="remove-all">
                Remove from all groups
            </div>
        );
    } else {
        content.push(...groups.reduce(groupEleReducer, []));
    }
    return content;
};

const ChangeGroupComps: React.SFC<ChangeGroups> = (props): JSX.Element => {
    const content: JSX.Element[] = getChangeGroupsMarkup(props);
    return <div data-spec="content">{content}</div>;
};

export default ChangeGroupComps;
