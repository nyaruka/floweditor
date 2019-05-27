import UpdateContactComp from 'components/flow/actions/updatecontact/UpdateContact';
import { SetContactProperty } from 'flowTypes';
import { composeComponentTestUtils } from 'testUtils';
import {
  createSetContactChannelAction,
  createSetContactFieldAction,
  createSetContactLanguageAction,
  createSetContactNameAction
} from 'testUtils/assetCreators';

describe(UpdateContactComp.name, () => {
  const baseProps: SetContactProperty = createSetContactNameAction();
  const { setup } = composeComponentTestUtils(UpdateContactComp, baseProps);

  describe('render', () => {
    it('should render set name', () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });

    it('should render set channel', () => {
      const { wrapper } = setup(true, {
        $set: createSetContactChannelAction()
      });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render set field', () => {
      const { wrapper } = setup(true, { $set: createSetContactFieldAction() });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render set language', () => {
      const { wrapper } = setup(true, {
        $set: createSetContactLanguageAction()
      });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render clearing the value', () => {
      const setFieldAction = createSetContactFieldAction();
      setFieldAction.value = null;

      const { wrapper } = setup(true, { $set: setFieldAction });
      expect(wrapper).toMatchSnapshot();
    });
  });
});
