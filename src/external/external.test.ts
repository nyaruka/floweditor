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

  it('converts rp api flow types', () => {
    // message to messaging, survey to messaging_offline, voice stays the same
    expect(resultToAsset({ type: 'survey' }, AssetType.Flow, 'uuid').content.type).toEqual(
      'messaging_offline'
    );
    expect(resultToAsset({ type: 'message' }, AssetType.Flow, 'uuid').content.type).toEqual(
      'messaging'
    );
    expect(resultToAsset({ type: 'background' }, AssetType.Flow, 'uuid').content.type).toEqual(
      'messaging_background'
    );
    expect(resultToAsset({ type: 'voice' }, AssetType.Flow, 'uuid').content.type).toEqual('voice');
  });
});
