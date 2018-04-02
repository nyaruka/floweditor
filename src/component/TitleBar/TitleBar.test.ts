import { createSetup, getSpecWrapper } from '../../testUtils';
import TitleBar, {
    TitleBarProps,
    titlebarContainerSpecId,
    titlebarSpecId,
    moveIconSpecId,
    removeIconSpecId,
    confirmationSpecId,
    moveSpecId,
    confirmRemovalSpecId,
    confirmationTime
} from './TitleBar';

const baseProps = {
    title: 'Send Message',
    onRemoval: jest.fn()
};

const setup = createSetup<TitleBarProps>(TitleBar, baseProps);

const COMPONENT_TO_TEST = TitleBar.name;

jest.useFakeTimers();

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, props: { title } } = setup({}, true);
            const titlebar = getSpecWrapper(wrapper, titlebarSpecId);
            const moveIcon = getSpecWrapper(wrapper, moveSpecId);
            const confirmation = getSpecWrapper(wrapper, confirmationSpecId);

            expect(
                getSpecWrapper(wrapper, titlebarContainerSpecId).hasClass('titlebar')
            ).toBeTruthy();
            expect(titlebar.hasClass('normal')).toBeTruthy();
            expect(moveIcon.hasClass('up_button')).toBeTruthy();
            expect(moveIcon.children().length).toBe(0);
            expect(getSpecWrapper(wrapper, removeIconSpecId).exists()).toBeFalsy();
            expect(titlebar.text()).toBe(title);
            expect(confirmation.exists()).toBeFalsy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should apply _className prop', () => {
            const { wrapper, props: { __className } } = setup(
                { __className: 'some-classy-class' },
                true
            );

            expect(getSpecWrapper(wrapper, titlebarSpecId).hasClass(__className));
            expect(wrapper).toMatchSnapshot();
        });

        describe('move icon', () => {
            it('should render move icon', () => {
                const { wrapper } = setup({ showMove: true }, true);

                expect(getSpecWrapper(wrapper, moveIconSpecId).hasClass('up_button')).toBeTruthy();
                expect(wrapper.find('.icon-arrow-up').exists()).toBeTruthy();
                expect(wrapper).toMatchSnapshot();
            });

            it('should call onMoveUp prop', () => {
                const { wrapper, props: { onMoveUp: onMoveUpMock } } = setup(
                    { showMove: true, onMoveUp: jest.fn() },
                    true
                );
                const moveIcon = getSpecWrapper(wrapper, moveIconSpecId);
                moveIcon.simulate('mouseDown');
                moveIcon.simulate('mouseUp');

                expect(onMoveUpMock).toHaveBeenCalledTimes(1);
            });
        });

        describe('remove icon', () => {
            it('should render remove icon', () => {
                const { wrapper } = setup({ showRemoval: true }, true);

                expect(
                    getSpecWrapper(wrapper, removeIconSpecId).hasClass('remove_button')
                ).toBeTruthy();
                expect(wrapper.find('.icon-remove').exists()).toBeTruthy();
                expect(wrapper).toMatchSnapshot();
            });

            it('should call onConfirmRemoval instance method', () => {
                const onConfirmRemovalSpy = jest.spyOn(TitleBar.prototype, 'onConfirmRemoval');
                const { wrapper } = setup({ showRemoval: true }, true);
                const removeIcon = getSpecWrapper(wrapper, removeIconSpecId);

                removeIcon.simulate('mouseDown');
                removeIcon.simulate('mouseUp');

                expect(onConfirmRemovalSpy).toHaveBeenCalledTimes(1);

                onConfirmRemovalSpy.mockRestore();
            });
        });

        describe('confirmation', () => {
            it('should render confirmation markup', () => {
                const { wrapper } = setup({ showRemoval: true }, true);
                const removeIcon = getSpecWrapper(wrapper, removeIconSpecId);

                expect(wrapper).toMatchSnapshot();

                removeIcon.simulate('mouseDown');
                removeIcon.simulate('mouseUp');

                const confirmation = getSpecWrapper(wrapper, confirmationSpecId);
                const confirmRemoval = getSpecWrapper(wrapper, confirmRemovalSpecId);

                expect(confirmation.hasClass('remove_confirm')).toBeTruthy();
                expect(confirmation.text()).toBe('Remove?');
                expect(confirmRemoval.hasClass('remove_button')).toBeTruthy();
                expect(wrapper.find('.icon-remove').exists()).toBeTruthy();
                expect(wrapper).toMatchSnapshot();

                jest.runAllTimers();
            });

            it('should call onRemoval prop', () => {
                const { wrapper, props: { onRemoval: onRemovalMock } } = setup(
                    { showRemoval: true, onRemoval: jest.fn() },
                    true
                );
                const removeIcon = getSpecWrapper(wrapper, removeIconSpecId);

                removeIcon.simulate('mouseDown');
                removeIcon.simulate('mouseUp');

                expect(getSpecWrapper(wrapper, confirmRemovalSpecId).exists()).toBeTruthy();

                const remove = getSpecWrapper(wrapper, confirmRemovalSpecId);

                remove.simulate('mouseDown');
                remove.simulate('mouseUp');

                expect(onRemovalMock).toHaveBeenCalledTimes(1);

                jest.runAllTimers();
            });
        });
    });

    describe('instance methods', () => {
        describe('componentWillUnMount', () => {
            it('should clear confirmation timeout', () => {
                const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
                const { wrapper, props: { onRemoval: onRemovalMock } } = setup(
                    { showRemoval: true, onRemoval: jest.fn() },
                    true
                );
                const TitleBarInstance = wrapper.instance();
                const removeIcon = getSpecWrapper(wrapper, removeIconSpecId);

                removeIcon.simulate('mouseDown');
                removeIcon.simulate('mouseUp');

                TitleBarInstance.componentWillUnmount();

                expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);

                jest.clearAllTimers();
                clearTimeoutSpy.mockRestore();
            });
        });

        describe('onConfirmRemoval', () => {
            it('should toggle confirmingRemoval state', () => {
                const setStateSpy = jest.spyOn(TitleBar.prototype, 'setState');
                const { wrapper } = setup({}, true);
                const TitleBarInstance = wrapper.instance();
                const mockEvent = {
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn()
                };

                TitleBarInstance.onConfirmRemoval(mockEvent);
                jest.runAllTimers();

                expect(setStateSpy).toHaveBeenCalledTimes(2);
                expect(setStateSpy).toHaveBeenCalledWith({ confirmingRemoval: false });
                expect(setStateSpy).toHaveBeenCalledWith({ confirmingRemoval: false });

                setStateSpy.mockRestore();
                jest.runAllTimers();
            });
        });
    });
});
