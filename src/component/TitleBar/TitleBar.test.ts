import { composeComponentTestUtils, getSpecWrapper, setMock } from '../../testUtils';
import { set, setTrue } from '../../utils';
import TitleBar, {
    confirmationSpecId,
    confirmRemovalSpecId,
    moveIconSpecId,
    moveSpecId,
    removeIconSpecId,
    titlebarContainerSpecId,
    TitleBarProps,
    titlebarSpecId
} from './TitleBar';

const baseProps: TitleBarProps = {
    title: 'Send Message',
    onRemoval: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(TitleBar, baseProps);

jest.useFakeTimers();

describe(TitleBar.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, instance, props: { title } } = setup();
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
            const { wrapper, instance, props: { __className } } = setup(true, {
                __className: set('some-classy-class')
            });

            expect(getSpecWrapper(wrapper, titlebarSpecId).hasClass(__className));
            expect(wrapper).toMatchSnapshot();
        });

        describe('move icon', () => {
            it('should render move icon', () => {
                const { wrapper, instance } = setup(true, {
                    showMove: setTrue()
                });

                expect(getSpecWrapper(wrapper, moveIconSpecId).hasClass('up_button')).toBeTruthy();
                expect(wrapper.find('.icon-arrow-up').exists()).toBeTruthy();
                expect(wrapper).toMatchSnapshot();
            });

            it('should call onMoveUp prop', () => {
                const { wrapper, instance, props } = setup(true, {
                    showMove: setTrue(),
                    onMoveUp: setMock()
                });
                const moveIcon = getSpecWrapper(wrapper, moveIconSpecId);
                moveIcon.simulate('mouseDown');
                moveIcon.simulate('mouseUp');

                expect(props.onMoveUp).toHaveBeenCalledTimes(1);
            });
        });

        describe('remove icon', () => {
            it('should render remove icon', () => {
                const { wrapper } = setup(true, { showRemoval: setTrue() });

                expect(
                    getSpecWrapper(wrapper, removeIconSpecId).hasClass('remove_button')
                ).toBeTruthy();
                expect(wrapper.find('.icon-remove').exists()).toBeTruthy();
                expect(wrapper).toMatchSnapshot();
            });

            it('should call onConfirmRemoval instance method', () => {
                const onConfirmRemovalSpy = spyOn('onConfirmRemoval');
                const { wrapper } = setup(true, { showRemoval: setTrue() });
                const removeIcon = getSpecWrapper(wrapper, removeIconSpecId);

                removeIcon.simulate('mouseDown');
                removeIcon.simulate('mouseUp');

                expect(onConfirmRemovalSpy).toHaveBeenCalledTimes(1);

                onConfirmRemovalSpy.mockRestore();
            });
        });

        describe('confirmation', () => {
            it('should render confirmation markup', () => {
                const { wrapper } = setup(true, { showRemoval: setTrue() });
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

                jest.clearAllTimers();
            });

            it('should call onRemoval prop', () => {
                const { wrapper, props } = setup(true, {
                    showRemoval: setTrue(),
                    onRemoval: setMock()
                });
                const removeIcon = getSpecWrapper(wrapper, removeIconSpecId);

                removeIcon.simulate('mouseDown');
                removeIcon.simulate('mouseUp');

                expect(getSpecWrapper(wrapper, confirmRemovalSpecId).exists()).toBeTruthy();

                const remove = getSpecWrapper(wrapper, confirmRemovalSpecId);

                remove.simulate('mouseDown');
                remove.simulate('mouseUp');

                expect(props.onRemoval).toHaveBeenCalledTimes(1);

                jest.clearAllTimers();
            });
        });
    });

    describe('instance methods', () => {
        describe('componentWillUnMount', () => {
            it('should clear confirmation timeout', () => {
                const { wrapper, instance, props } = setup(true, {
                    showRemoval: setTrue(),
                    onRemoval: setMock()
                });
                const removeIcon = getSpecWrapper(wrapper, removeIconSpecId);

                removeIcon.simulate('mouseDown');
                removeIcon.simulate('mouseUp');

                instance.componentWillUnmount();

                expect(clearTimeout).toHaveBeenCalledTimes(1);

                jest.clearAllTimers();
            });
        });

        describe('onConfirmRemoval', () => {
            it('should toggle confirmingRemoval state', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();
                const mockEvent = {
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn()
                };

                instance.onConfirmRemoval(mockEvent);
                jest.runAllTimers();

                expect(setStateSpy).toHaveBeenCalledTimes(2);
                expect(setStateSpy).toHaveBeenCalledWith({ confirmingRemoval: false });
                expect(setStateSpy).toHaveBeenCalledWith({ confirmingRemoval: false });

                setStateSpy.mockRestore();
                jest.clearAllTimers();
            });
        });
    });
});
