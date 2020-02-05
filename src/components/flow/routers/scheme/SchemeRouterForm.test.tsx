import { render, mock, fireEvent, getUpdatedNode } from 'test/utils';
import * as React from 'react';
import * as utils from 'utils';
import SchemeRouterForm from './SchemeRouterForm';
import { createSchemeRouter, getRouterFormProps } from 'testUtils/assetCreators';
import { SCHEMES } from 'config/typeConfigs';
import { getSchemeOptions } from 'components/flow/actions/addurn/helpers';
import { getChannelTypeOptions } from './helpers';
import { SelectOption } from 'components/form/select/SelectElement';
import { getSwitchRouter } from '../helpers';
import { Operators } from 'config/interfaces';

mock(utils, 'createUUID', utils.seededUUIDs());

const routerProps = getRouterFormProps(createSchemeRouter(SCHEMES.slice(0, 3)));

describe(SchemeRouterForm.name, () => {
  it('should render', () => {
    const { baseElement } = render(<SchemeRouterForm {...routerProps} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should reuse ids on updates', () => {
    const { getByText } = render(<SchemeRouterForm {...routerProps} />);
    fireEvent.click(getByText('Ok'));

    expect(getUpdatedNode(routerProps).node).toEqual(routerProps.nodeSettings.originalNode.node);
  });

  it('should select schemes', () => {
    const { getAllByTestId, getByText } = render(<SchemeRouterForm {...routerProps} />);

    // change to split on one scheme
    const target = getChannelTypeOptions().find(
      (option: SelectOption) => (option.value = 'whatsapp')
    );

    fireEvent.change(getAllByTestId('select')[1], { target });
    fireEvent.click(getByText('Ok'));

    const router = getSwitchRouter(getUpdatedNode(routerProps).node);
    expect(router.cases.length).toBe(1);
    expect(router.cases[0].arguments[0]).toBe('whatsapp');
    expect(router.cases[0].type).toBe(Operators.has_only_phrase);
    expect(routerProps.updateRouter).toMatchCallSnapshot();
  });
});
