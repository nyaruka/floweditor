import * as React from 'react';

import { AssetType } from '../../services/AssetService';

export const getIconForAssetType = (assetType: AssetType): JSX.Element => {
    switch (assetType) {
        case AssetType.Group:
            return <span className="fe-group" />;
        case AssetType.Label:
            return <span className="fe-label" />;
        case AssetType.Flow:
            return <span className="fe-split" />;
    }
    return null;
};
