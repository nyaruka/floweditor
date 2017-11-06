import * as React from 'react';
import { IChangeGroup } from '../../../flowTypes';
import withAction from '../../Action';

const ChangeGroupComp = ({ groups: [{ name: groupName }] }: IChangeGroup): JSX.Element => (
    <div>{groupName}</div>
);

export default withAction()(ChangeGroupComp);
