import * as React from 'react';
import { Types } from '~/config/interfaces';
import {
    SetContactAttribute,
    SetContactChannel,
    SetContactLanguage,
    SetContactName
} from '~/flowTypes';
import { emphasize } from '~/utils';

const withEmph = (text: string, emph: boolean) => (emph ? emphasize(text) : text);

export const renderSetText = (
    name: string,
    value: string,
    emphasizeName: boolean = false
): JSX.Element => {
    if (value) {
        return (
            <div>
                Set {withEmph(name, emphasizeName)} to {emphasize(value)}.
            </div>
        );
    } else {
        return <div>Clear {withEmph(name, emphasizeName)}.</div>;
    }
};

const UpdateContactComp: React.SFC<SetContactAttribute> = action => {
    switch (action.type) {
        case Types.set_contact_field:
            return renderSetText(action.field.name, action.value, true);
        case Types.set_contact_channel:
            return renderSetText('channel', (action as SetContactChannel).channel.name);
        case Types.set_contact_language:
            return renderSetText('language', (action as SetContactLanguage).language);
        case Types.set_contact_name:
            return renderSetText('name', (action as SetContactName).name);
    }
};

export default UpdateContactComp;
