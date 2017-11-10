import * as React from 'react';
import { SaveToContact } from '../../../flowTypes';

export default ({ value, field_name }: SaveToContact) => {
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
