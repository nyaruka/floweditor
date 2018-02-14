import * as React from 'react';
import { SaveToContact } from '../../../flowTypes';

const SaveToContactComp: React.SFC<SaveToContact> = ({
    value,
    field_name
}): JSX.Element => {
    let content: JSX.Element;

    if (value) {
        content = (
            <div>
                Update <b>{field_name}</b> to <b>{value}</b>
            </div>
        );
    } else {
        content = (
            <div>
                Clear value for <b>{field_name}</b>
            </div>
        );
    }

    return <div>{content}</div>;
};

export default SaveToContactComp;
