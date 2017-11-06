import * as React from 'react';
import { ActionComp } from '../../Action';
import { IChangeGroup } from '../../../flowTypes';

class ChangeGroupComp extends ActionComp<IChangeGroup> {
    renderNode() {
        return <div>{this.getAction().groups[0].name}</div>;
    }
}

export default ChangeGroupComp;
