import { sortFieldsAndProperties } from 'components/flow/actions/updatecontact/helpers';
import { getContactProperties } from 'components/helpers';

describe('UpdateContact.helpers', () => {
  it('should sort options', () => {
    const contactProperties = getContactProperties();
    expect(contactProperties.sort(sortFieldsAndProperties)).toMatchSnapshot();
  });
});
