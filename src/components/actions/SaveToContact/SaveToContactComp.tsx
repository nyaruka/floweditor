import * as React from 'react';
import { ISaveToContact } from '../../../flowTypes';
import withAction from '../../enhancers/withAction';

export const SaveToContactCompBase = ({ value, field_name }: ISaveToContact) => {
    if (value) {
        return (
            <div>
                Update <span className="emph">{field_name}</span> to {value}
            </div>
        );
    }
    return (
        <div>
            Clear value for <span className="emph">{field_name}</span>
        </div>
    );
};

export default withAction()(SaveToContactCompBase);
