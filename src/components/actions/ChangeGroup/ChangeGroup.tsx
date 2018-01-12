import * as React from 'react';
import { ChangeGroup } from '../../../flowTypes';

const ChangeGroupComp: React.SFC<ChangeGroup> = ({ groups }): JSX.Element => {
    const groupsToDiplay: JSX.Element[] = groups.reduce((groupList, { name }, idx) => {
        if (idx <= 2) {
            groupList.push(<div key={idx}>{name}</div>);
        }

        if (idx === 3) {
            groupList.push(<div key={idx}>...</div>);
        }

        return groupList;
    }, []);

    return <div>{groupsToDiplay}</div>;
};

export default ChangeGroupComp;
