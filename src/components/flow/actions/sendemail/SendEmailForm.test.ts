import SendEmailForm from "components/flow/actions/sendemail/SendEmailForm";
import { ActionFormProps } from "components/flow/props";
import { composeComponentTestUtils, mock } from "testUtils";
import {
  createSendEmailAction,
  getActionFormProps
} from "testUtils/assetCreators";
import * as utils from "utils";

mock(utils, "createUUID", utils.seededUUIDs());

const { setup } = composeComponentTestUtils<ActionFormProps>(
  SendEmailForm,
  getActionFormProps(createSendEmailAction())
);

describe(SendEmailForm.name, () => {
  describe("render", () => {
    it("should render", () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe("updates", () => {
    it("should save changes", () => {
      const component = setup(true);
      const instance: SendEmailForm = component.instance;
      const props: Partial<ActionFormProps> = component.props;

      instance.handleRecipientsChanged(["joe@domain.com", "jane@domain.com"]);
      instance.handleSubjectChanged("URGENT: I have a question");
      instance.handleBodyChanged("What is a group of tigers called?");

      expect(instance.state).toMatchSnapshot();

      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it("should validate emails", () => {
      const component = setup(true);
      const instance: SendEmailForm = component.instance;

      expect(instance.handleCheckValid("invalid")).toBeFalsy();
      expect(instance.handleCheckValid("invalid@")).toBeFalsy();
      expect(instance.handleCheckValid("valid@domain.com")).toBeTruthy();
    });

    it("should allow switching from router", () => {
      const component = setup(true, {
        $merge: { updateAction: jest.fn() },
        nodeSettings: { $merge: { originalAction: null } }
      });

      const instance: SendEmailForm = component.instance;
      const props: Partial<ActionFormProps> = component.props;

      instance.handleRecipientsChanged(["joe@domain.com", "jane@domain.com"]);
      instance.handleSubjectChanged("URGENT: I have a question");
      instance.handleBodyChanged("What is a group of tigers called?");
      instance.handleSave();

      expect(props.updateAction).toMatchCallSnapshot();
    });
  });

  describe("cancel", () => {
    it("should cancel without changes", () => {
      const component = setup(true, {
        $merge: { onClose: jest.fn(), updateAction: jest.fn() }
      });

      const instance: SendEmailForm = component.instance;
      const props: Partial<ActionFormProps> = component.props;

      instance.handleRecipientsChanged(["joe@domain.com"]);
      instance.handleSubjectChanged("Bad mojo");
      instance.handleBodyChanged("Don't save me bro");

      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateAction).not.toHaveBeenCalled();
    });
  });
});
