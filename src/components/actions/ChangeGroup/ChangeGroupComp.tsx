import * as React from 'react';
import { IChangeGroup } from '../../../flowTypes';
import withAction from '../../enhancers/withAction';

const ChangeGroupComp = ({ groups: [{ name: groupName }] }: IChangeGroup): JSX.Element => (
    <div>{groupName}</div>
);

export default withAction()(ChangeGroupComp);
