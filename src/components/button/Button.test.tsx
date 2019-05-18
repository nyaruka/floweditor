import Button, { ButtonProps, ButtonTypes } from 'components/button/Button';
import { composeComponentTestUtils, setMock } from 'testUtils';

const baseProps: ButtonProps = {
  name: "Save",
  onClick: jest.fn(),
  type: ButtonTypes.primary
};

const { setup } = composeComponentTestUtils(Button, baseProps);

describe(Button.name, () => {
  describe("render", () => {
    it("should render self, children with base props", () => {
      const { wrapper } = setup();

      expect(wrapper.hasClass("btn")).toBeTruthy();
      expect(wrapper.hasClass("primary")).toBeTruthy();
      expect(wrapper.text()).toBe("Save");
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe("interaction", () => {
    it("should execute onClick callback when clicked", () => {
      const { wrapper, props } = setup(true, { onClick: setMock() });

      wrapper.simulate("click");

      expect(props.onClick).toHaveBeenCalled();
    });
  });
});
