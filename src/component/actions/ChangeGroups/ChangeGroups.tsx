import * as React from 'react';
import { ChangeGroups } from '../../../flowTypes';

const changeGroupMarkup = ({ type, groups }: ChangeGroups): JSX.Element[] => {
    const content: JSX.Element[] = [];

    if (type === 'remove_contact_groups' && !groups.length) {
        content.push(
            <div key="remove_from_all" data-spec="remove-all">
                Remove from all groups
            </div>
        );
    } else {
        const groupEls: JSX.Element[] = groups.reduce((groupList, { name }, idx) => {
            if (idx <= 2) {
                groupList.push(<div key={idx}>{name}</div>);
            }

            if (idx === 3) {
                groupList.push(<div key={idx}>...</div>);
            }

            return groupList;
        }, []);

        content.push(...groupEls);
    }

    return content;
};

const ChangeGroupComp: React.SFC<ChangeGroups> = (props): JSX.Element => {
    const content: JSX.Element[] = changeGroupMarkup(props);
    return <div data-spec="content">{content}</div>;
};

export default ChangeGroupComp;
