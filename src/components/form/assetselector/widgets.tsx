import * as React from 'react';
import { hasPendingTranslation } from '~/components/form/assetselector/helpers';
import { Template } from '~/flowTypes';
import { Asset, AssetType } from '~/store/flowContext';

export const getIconForAssetType = (asset: Asset): JSX.Element => {
    switch (asset.type) {
        case AssetType.Group:
            return <span className="fe-group" />;
        case AssetType.Label:
            return <span className="fe-label" />;
        case AssetType.Flow:
            return <span className="fe-split" />;
        case AssetType.Scheme:
            return <span className="fe-connection" />;
        case AssetType.Template:
            console.log(asset.content, hasPendingTranslation(asset.content as Template));
            if (hasPendingTranslation(asset.content as Template)) {
                return <span className="fe-hourglass" />;
            } else {
                return <span className="fe-check" />;
            }
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
