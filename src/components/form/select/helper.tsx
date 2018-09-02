import * as React from 'react';
import { AssetType } from '~/store/flowContext';

export const getIconForAssetType = (assetType: AssetType): JSX.Element => {
    switch (assetType) {
        case AssetType.Group:
            return <span className="fe-group" />;
        case AssetType.Label:
            return <span className="fe-label" />;
        case AssetType.Flow:
            return <span className="fe-split" />;
        case AssetType.Scheme:
            return <span className="fe-connection" />;
        case AssetType.Remove:
            return (
                <>
                    <span className="fe-trash" />
                    &nbsp;
                </>
            );
        default:
            return null;
    }
};
