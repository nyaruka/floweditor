import UpdateContactComp from 'components/flow/actions/updatecontact/UpdateContact';
import {
  SetContactProperty,
  MissingDependencies,
  AnyAction,
  RenderAction,
  SetContactField
} from 'flowTypes';
import { composeComponentTestUtils } from 'testUtils';
import {
  createSetContactChannelAction,
  createSetContactFieldAction,
  createSetContactLanguageAction,
  createSetContactNameAction
} from 'testUtils/assetCreators';
import { createRenderAction } from '../helpers';

describe(UpdateContactComp.name, () => {
  const baseProps: RenderAction = createRenderAction(createSetContactNameAction());
  const { setup } = composeComponentTestUtils(UpdateContactComp, baseProps);

  describe('render', () => {
    it('should render set name', () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });

    it('should render set channel', () => {
      const { wrapper } = setup(true, {
        $set: createRenderAction(createSetContactChannelAction())
      });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render set field', () => {
      const { wrapper } = setup(true, { $set: createRenderAction(createSetContactFieldAction()) });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render set language', () => {
      const { wrapper } = setup(true, {
        $set: createRenderAction(createSetContactLanguageAction())
      });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render clearing the value', () => {
      const setFieldAction = createRenderAction(createSetContactFieldAction());
      (setFieldAction as SetContactField).value = null;

      const { wrapper } = setup(true, { $set: setFieldAction });
      expect(wrapper).toMatchSnapshot();
    });
  });
});
