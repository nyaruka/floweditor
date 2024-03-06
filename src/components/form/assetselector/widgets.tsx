import * as React from 'react';
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
