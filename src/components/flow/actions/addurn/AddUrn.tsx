import * as React from 'react';
import { AddUrn } from '~/flowTypes';

import { getSchemeObject } from './helpers';

export const MAX_TO_SHOW = 3;

const AddUrnComp: React.SFC<AddUrn> = ({ scheme, path }): JSX.Element => (
    <>
        Add {getSchemeObject(scheme).name} {path}
    </>
);

export default AddUrnComp;
