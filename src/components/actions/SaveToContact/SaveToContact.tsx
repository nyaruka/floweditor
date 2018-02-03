import * as React from 'react';
import { Fragment } from 'react';
import { SaveToContact } from '../../../flowTypes';

const SaveToContactComp: React.SFC<SaveToContact> = ({
    value,
    field_name
}): JSX.Element => {
    let content: JSX.Element;

    if (value) {
        content = (
            <Fragment>
                Update <b>{field_name}</b> to <b>{value}</b>
            </Fragment>
        );
    } else {
        content = (
            <Fragment>
                Clear value for <b>{field_name}</b>
            </Fragment>
        );
    }

    return <div>{content}</div>;
};

export default SaveToContactComp;
