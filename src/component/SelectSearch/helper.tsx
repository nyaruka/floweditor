import * as React from 'react';

import { AssetType } from '../../services/AssetService';

export const getIconForAssetType = (assetType: AssetType): JSX.Element => {
    switch (assetType) {
        case AssetType.Group:
            return <span className="icn-group" />;
        case AssetType.Label:
            return <span className="icn-label" />;
        case AssetType.Flow:
            return <span className="icn-split" />;
    }
    return null;
};
