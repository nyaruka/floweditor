import * as React from 'react';

import { Asset, AssetType } from '../../services/AssetService';

const styles = require('../shared.scss');

export const renderAssetList = (assets: Asset[], max: number): JSX.Element[] => {
    return assets.reduce((elements, asset, idx) => {
        if (idx <= max - 1) {
            elements.push(renderAsset(asset));
        } else if (idx > max - 1 && elements.length === max) {
            elements.push(<div key="ellipses">...</div>);
        }
        return elements;
    }, []);
};

export const renderAsset = (asset: Asset) => {
    switch (asset.type) {
        case AssetType.Group:
            return (
                <div className={styles.nodeAsset} key={asset.id}>
                    <span className={`${styles.nodeGroup} icn-group`} />
                    {asset.name}
                </div>
            );
        case AssetType.Label:
            return (
                <div className={styles.nodeAsset} key={asset.id}>
                    <span className={`${styles.nodeLabel} icn-label`} />
                    {asset.name}
                </div>
            );
    }

    return (
        <div className={styles.nodeAsset} key={asset.id}>
            {asset.name}
        </div>
    );
};
