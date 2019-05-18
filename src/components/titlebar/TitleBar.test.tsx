import TitleBar, {
  confirmRemovalSpecId,
  moveIconSpecId,
  removeIconSpecId,
  TitleBarProps
} from 'components/titlebar/TitleBar';
import React from 'react';
import { fireEvent, render } from 'react-testing-library';

const baseProps: TitleBarProps = {
  title: "Send Message",
  onRemoval: jest.fn()
};

describe(TitleBar.name, () => {
  describe("render", () => {
    it("should render self, children with base props", () => {
      const { container } = render(<TitleBar {...baseProps} />);
      expect(container).toMatchSnapshot();
    });

    it("should apply _className prop", () => {
      const { container } = render(
        <TitleBar {...baseProps} __className="some-classy-class" />
      );
      expect(container).toMatchSnapshot();
    });

    describe("move icon", () => {
      it("should render move icon", () => {
        const { container } = render(
          <TitleBar {...baseProps} showMove={true} />
        );
        expect(container).toMatchSnapshot();
      });

      it("should call onMoveUp", () => {
        const onMoveUp = jest.fn();
        const { baseElement, getByTestId } = render(
          <TitleBar {...baseProps} showMove={true} onMoveUp={onMoveUp} />
        );
        expect(baseElement).toMatchSnapshot();

        // click on the move up button
        fireEvent.mouseUp(getByTestId(moveIconSpecId));
        expect(onMoveUp).toHaveBeenCalledTimes(1);
      });
    });

    describe("remove icon", () => {
      it("should render remove icon", () => {
        const { baseElement } = render(
          <TitleBar {...baseProps} showMove={true} showRemoval={true} />
        );
        expect(baseElement).toMatchSnapshot();
      });
    });

    describe("confirmation", () => {
      it("should render confirmation markup", () => {
        const { baseElement, getByTestId } = render(
          <TitleBar {...baseProps} showMove={true} showRemoval={true} />
        );

        fireEvent.mouseUp(getByTestId(removeIconSpecId));
        expect(baseElement).toMatchSnapshot();
      });

      it("should call onRemoval prop", () => {
        const handleRemoveClicked = jest.fn();
        const { getByTestId } = render(
          <TitleBar
            {...baseProps}
            showMove={true}
            showRemoval={true}
            onRemoval={handleRemoveClicked}
          />
        );

        fireEvent.mouseUp(getByTestId(removeIconSpecId));
        fireEvent.mouseUp(getByTestId(confirmRemovalSpecId));
        expect(handleRemoveClicked).toHaveBeenCalledTimes(1);
      });
    });
  });
});
