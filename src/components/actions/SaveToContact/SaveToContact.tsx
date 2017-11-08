import * as React from 'react';
import { ISaveToContact } from '../../../flowTypes';

export default ({ value, field_name }: ISaveToContact) => {
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
