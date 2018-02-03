import * as React from 'react';
import { SaveToContact } from '../../../flowTypes';

const SaveToContactComp: React.SFC<SaveToContact> = ({
    value,
    field_name
}): JSX.Element => {
    let content: JSX.Element;

    if (value) {
        content = (
            <>
                Update <b>{field_name}</b> to <b>{value}</b>
            </>
        );
    } else {
        content = (
            <>
                Clear value for <b>{field_name}</b>
            </>
        );
    }

    return <div>{content}</div>;
};

export default SaveToContactComp;
