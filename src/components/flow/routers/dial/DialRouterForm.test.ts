import { RouterFormProps } from 'components/flow/props';
import DialRouterForm from 'components/flow/routers/dial/DialRouterForm';
import { Types } from 'config/interfaces';
import { composeComponentTestUtils, mock } from 'testUtils';
import { getRouterFormProps, createMatchRouter } from 'testUtils/assetCreators';
import * as utils from 'utils';
import { createUUID } from 'utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const routerNode = createMatchRouter([]);
routerNode.ui = {
  position: { left: 0, top: 0 },
  type: Types.wait_for_dial
};

const { setup } = composeComponentTestUtils<RouterFormProps>(
  DialRouterForm,
  getRouterFormProps(routerNode)
);

describe(DialRouterForm.name, () => {
  it('should render', () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  describe('updates', () => {
    it('should save changes', () => {
      const { instance, props } = setup(true, {
        $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
      });

      instance.handleUpdateResultName('Dial Result');
      instance.handlePhoneUpdated('@fields.supervisor');

      expect(instance.state).toMatchSnapshot();

      instance.handleSave();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).toHaveBeenCalled();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('should cancel', () => {
      const { instance, props } = setup(true, {
        $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
      });

      instance.handlePhoneUpdated('+1234567890');
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).not.toHaveBeenCalled();
    });
  });
});
