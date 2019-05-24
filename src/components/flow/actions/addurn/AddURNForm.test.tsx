import AddURNForm from 'components/flow/actions/addurn/AddURNForm';
import { Types } from 'config/interfaces';
import { AddURN } from 'flowTypes';
import React from 'react';
import { render } from 'test/utils';
import { getActionFormProps } from 'testUtils/assetCreators';

const props = getActionFormProps({
  scheme: 'tel',
  path: '+12065551212',
  type: Types.add_contact_urn
} as AddURN);

describe(AddURNForm.name, () => {
  it('renders', () => {
    const { baseElement } = render(<AddURNForm {...props} />);
    expect(baseElement).toMatchSnapshot();
  });
});
