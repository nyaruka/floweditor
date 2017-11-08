import * as React from 'react';
import { IChangeGroup } from '../../../flowTypes';

export default ({ groups: [{ name: groupName }] }: IChangeGroup): JSX.Element => (
    <div>{groupName}</div>
);
