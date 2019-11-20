import * as React from 'react';
import { AddURN } from 'flowTypes';

import { getSchemeObject } from './helpers';
import i18n from 'config/i18n';

export const MAX_TO_SHOW = 3;

const AddURNComp: React.SFC<AddURN> = ({ scheme, path }): JSX.Element => {
  const schemeObject = getSchemeObject(scheme);
  const schemeName = schemeObject ? schemeObject.name : scheme;
  return (
    <>
      {i18n.t('add', 'Add')} {schemeName} {path}
    </>
  );
};

export default AddURNComp;
