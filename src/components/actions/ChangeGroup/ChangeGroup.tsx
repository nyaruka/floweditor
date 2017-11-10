import * as React from 'react';
import { ChangeGroup } from '../../../flowTypes';

export default ({ groups: [{ name: groupName }] }: ChangeGroup): JSX.Element => (
    <div>{groupName}</div>
);
