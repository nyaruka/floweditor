import * as React from 'react';
import { hasPendingTranslation } from 'components/form/assetselector/helpers';
import { Template } from 'flowTypes';
import { Asset, AssetType } from 'store/flowContext';

export const getIconForAssetType = (asset: Asset): JSX.Element => {
  switch (asset.type) {
    case AssetType.Group:
      return <temba-icon name="group"></temba-icon>;
    case AssetType.Label:
      return <temba-icon name="label"></temba-icon>;
    case AssetType.Flow:
      return <temba-icon name="flow"></temba-icon>;
    case AssetType.Scheme:
      return <temba-icon name="scheme"></temba-icon>;
    case AssetType.Template:
      if (hasPendingTranslation(asset.content as Template)) {
        return <span className="pending" />;
      } else {
        return <temba-icon name="check"></temba-icon>;
      }
    case AssetType.Remove:
      return (
        <>
          <temba-icon name="delete"></temba-icon>
          &nbsp;
        </>
      );
    default:
      return null;
  }
};
