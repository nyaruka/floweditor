import { composeComponentTestUtils, setMock } from '../../testUtils';
import {
    TimeoutControl,
    TimeoutControlStoreProps,
    DEFAULT_TIMEOUT,
    TIMEOUT_OPTIONS
} from './TimeoutControl';

const baseProps: TimeoutControlStoreProps = {
    checked: false,
    timeout: null,
    updateTimeout: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(TimeoutControl, baseProps);

describe(TimeoutControl.name, () => {
    describe('render', () => {
        it('should render only checkbox, instructions if not passed a timeout', () => {
            const { wrapper } = setup();

            expect(wrapper).toMatchSnapshot();
        });

        it('should render select control if passed a timeout', () => {
            const { wrapper } = setup(true, { checked: { $set: true }, timeout: { $set: 300 } });

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('handleCheck', () => {
            it('should nullify timeout state if checkbox is checked', () => {
                const { wrapper, props } = setup(true, {
                    checked: { $set: true },
                    updateTimeout: setMock()
                });

                wrapper.find('input').simulate('change');

                expect(props.updateTimeout).toHaveBeenCalledTimes(1);
                expect(props.updateTimeout).toHaveBeenCalledWith(null);
            });

            it('should update local, redux state w/ default timeout', () => {
                const { wrapper, props } = setup(true, { updateTimeout: setMock() });

                wrapper.find('input').simulate('change');

                expect(props.updateTimeout).toHaveBeenCalledTimes(1);
                expect(props.updateTimeout).toHaveBeenCalledWith(DEFAULT_TIMEOUT.value);
            });
        });

        describe('onChangeTimeout', () => {
            it('should update local state if passed a new selection', () => {
                const setStateSpy = spyOn('setState');
                // setting 'checked' prop to true gives a default selection of 5 minutes
                const { wrapper } = setup(true, { checked: { $set: true } });

                const mockChange = {
                    target: {
                        value: TIMEOUT_OPTIONS[0]
                    }
                };

                // select a different timeout
                wrapper.find('Select').simulate('change', mockChange);

                expect(setStateSpy).toHaveBeenCalledTimes(1);

                setStateSpy.mockRestore();
            });
        });
    });
});
