import * as React from 'react';
import { ActionComp } from '../../Action';
import { IChangeGroup } from '../../../flowTypes';

class ChangeGroupComp extends ActionComp<IChangeGroup> {
    renderNode() {
        const { groups: [{ name: groupName }] } = this.getAction();
        return <div>{groupName}</div>;
    }
}

export default ChangeGroupComp;
