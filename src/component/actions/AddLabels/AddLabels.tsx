import * as React from 'react';

import { AddLabels } from '../../../flowTypes';
import { AssetType } from '../../../services/AssetService';
import { renderAssetList } from '../helpers';

export const MAX_TO_SHOW = 3;

const AddLabelsComp: React.SFC<AddLabels> = ({ labels }): JSX.Element => (
    <>
        {renderAssetList(
            labels.map(label => {
                return { id: label.uuid, name: label.name, type: AssetType.Label };
            }),
            MAX_TO_SHOW
        )}
    </>
);

export default AddLabelsComp;
