import * as React from 'react';
import { ChangeGroup } from '../../../flowTypes';

const ChangeGroupComp: React.SFC<ChangeGroup> = ({
    groups: [{ name: groupName }]
}): JSX.Element => <div>{groupName}</div>;

export default ChangeGroupComp;
