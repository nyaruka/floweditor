import { Types } from 'config/interfaces';
import * as React from 'react';
import { AssetType, RenderNode } from 'store/flowContext';
import {
  fireEvent,
  render,
  getCallParams,
  fireTembaSelect,
  getByDisplayValue,
  fireChangeText,
  getByTestId
} from 'test/utils';
import { mock } from 'testUtils';
import { createClassifyRouter, getRouterFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';
import ClassifyRouterForm from './ClassifyRouterForm';
import * as external from 'external';

mock(
  external,
  'fetchAsset',
  utils.fetchAsset({
    id: 'purrington',
    name: 'Purrington',
    type: AssetType.Classifier,
    content: {
      intents: ['fact', 'opinion']
    }
  })
);

mock(utils, 'createUUID', utils.seededUUIDs());

const routerNode = createClassifyRouter();

const getProps = () => {
  const formProps = getRouterFormProps(routerNode);
  formProps.assetStore = { classifiers: { items: {}, type: AssetType.Classifier } };
  return formProps;
};

describe(ClassifyRouterForm.name, () => {
  it('should render', () => {
    const { baseElement } = render(<ClassifyRouterForm {...getProps()} />);
    expect(baseElement).toMatchSnapshot('default render');
  });

  it('defaults to correct result name', () => {
    const props = getProps();
    props.nodeSettings.originalNode.node.router.result_name = 'Initial Result Name';
    const { baseElement } = render(<ClassifyRouterForm {...props} />);
    expect(baseElement).toMatchSnapshot('initial result name');
  });

  it('updates the result name', () => {
    const { baseElement, getByTestId } = render(<ClassifyRouterForm {...getProps()} />);
    const result = getByTestId('Result Name');
    fireChangeText(result, 'Updated Result Name');
    expect(baseElement).toMatchSnapshot('updated result name');
  });
});
