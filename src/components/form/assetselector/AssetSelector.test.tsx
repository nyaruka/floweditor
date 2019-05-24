import AssetSelector from 'components/form/assetselector/AssetSelector';
import React from 'react';
import { Assets, AssetType } from 'store/flowContext';
import { render } from 'test/utils';

const assets: Assets = {
  items: {},
  type: AssetType.Group
};

describe(AssetSelector.name, () => {
  it('renders', () => {
    const { baseElement } = render(
      <AssetSelector
        name="Groups"
        onChange={jest.fn()}
        assets={assets}
        createAssetFromInput={jest.fn()}
        entry={{ value: null }}
      />
    );
    expect(baseElement).toMatchSnapshot();
  });
});
