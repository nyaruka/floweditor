import { excludeDynamicGroups } from 'components/flow/actions/changegroups/helpers';
import { AssetType } from 'store/flowContext';

describe('utils', () => {
  it('should filter on excludeDynamicGroups', () => {
    expect(
      excludeDynamicGroups({
        id: 'dynamic_id',
        name: 'Dynamic',
        query: 'some query'
      })
    ).toBeTruthy();

    expect(
      excludeDynamicGroups({
        id: 'static_id',
        name: 'Static',
        query: null
      })
    ).toBeFalsy();
  });
});
