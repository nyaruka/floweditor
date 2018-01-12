import * as React from 'react';
import { ChangeGroup } from '../../../flowTypes';

const getContent = ({ type, groups }: ChangeGroup): JSX.Element[] => {
    const content: JSX.Element[] = [];

    if (type === 'remove_from_group') {
        content.push(<div key="remove_from_all">Remove from all groups</div>);
    } else {
        const groupEls = groups.reduce((groupList, { name }, idx) => {
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

const ChangeGroupComp: React.SFC<ChangeGroup> = (props): JSX.Element => {
    const content: JSX.Element[] = getContent(props);
    return <div>{content}</div>;
};

export default ChangeGroupComp;
