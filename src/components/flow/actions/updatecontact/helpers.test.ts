import {
  assetToChannel,
  assetToLanguage,
  channelToAsset,
  fieldToAsset,
  languageToAsset,
  sortFieldsAndProperties
} from 'components/flow/actions/updatecontact/helpers';
import { getContactProperties } from 'components/helpers';
import { REMOVE_VALUE_ASSET } from 'store/flowContext';

describe('UpdateContact.helpers', () => {
  it('should sort options', () => {
    const fields = require('test/assets/fields.json');
    const contactProperties = getContactProperties();
    for (const field of fields.results) {
      contactProperties.push(fieldToAsset(field));
    }
    expect(contactProperties.sort(sortFieldsAndProperties)).toMatchSnapshot();
  });

  it('should return remove asset', () => {
    expect(assetToChannel(REMOVE_VALUE_ASSET)).toEqual({});
    expect(assetToLanguage(REMOVE_VALUE_ASSET)).toEqual('');

    expect(fieldToAsset()).toEqual({ id: '', name: '', type: 'field' });
    expect(fieldToAsset({ key: 'gender', name: 'Gender' })).toEqual({
      id: 'gender',
      name: 'Gender',
      type: 'field'
    });
    expect(languageToAsset({ iso: '', name: '' })).toEqual(REMOVE_VALUE_ASSET);
    expect(channelToAsset({ uuid: '', name: '' })).toEqual(REMOVE_VALUE_ASSET);
  });
});
