import * as React from "react";
import { AddURN } from "flowTypes";

import { getSchemeObject } from "./helpers";

export const MAX_TO_SHOW = 3;

const AddURNComp: React.SFC<AddURN> = ({ scheme, path }): JSX.Element => (
  <>
    Add {getSchemeObject(scheme).name} {path}
  </>
);

export default AddURNComp;
