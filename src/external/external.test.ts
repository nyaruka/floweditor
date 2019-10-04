import { resultToAsset } from './index';
import { AssetType } from '../store/flowContext';
import * as utils from '../utils';
import { mock } from 'testUtils';

mock(utils, 'createUUID', utils.seededUUIDs());
describe('External', () => {
  it('result type should trump request type', () => {
    const group_uuid = utils.createUUID();
    const group = resultToAsset(
      { uuid: group_uuid, name: 'My Test Group', type: AssetType.Group },
      AssetType.Contact,
      null
    );

    expect(group.type).toEqual(AssetType.Group);
    expect(group).toMatchSnapshot();
  });
});
