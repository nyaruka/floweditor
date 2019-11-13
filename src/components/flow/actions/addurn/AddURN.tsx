import * as React from 'react';
import { AddURN } from 'flowTypes';

import { getSchemeObject } from './helpers';
import i18n from 'config/i18n';

export const MAX_TO_SHOW = 3;

const AddURNComp: React.SFC<AddURN> = ({ scheme, path }): JSX.Element => (
  <>
    {i18n.t('add', 'Add')} {getSchemeObject(scheme).name} {path}
  </>
);

export default AddURNComp;
