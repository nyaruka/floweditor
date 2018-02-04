import * as React from 'react';
import { SaveToContact } from '../../../flowTypes';

const SaveToContactComp: React.SFC<SaveToContact> = ({ value, field_name }): JSX.Element => {
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

export default SaveToContactComp;
