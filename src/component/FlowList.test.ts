import {
    FlowList,
    FlowListStoreProps,
    flowListContainerSpecId,
    PLACEHOLDER,
    valueKey,
    labelKey,
    getFlowOption,
    shouldDisplayLoading
} from './FlowList';
import { FlowEditorConfig, FlowDefinition } from '../flowTypes';
import { composeComponentTestUtils, setMock, getSpecWrapper } from '../testUtils';
import { set } from '../utils';

const { results: flows } = require('../../assets/flows.json');

const flowUUID = 'registration';
const flowName = 'Registration';

const baseProps: FlowListStoreProps = {
    flowUUID,
    flowName,
    flows,
    fetchFlow: jest.fn()
};

const { setup } = composeComponentTestUtils(FlowList, baseProps);

describe(FlowList.name, () => {
    describe('helpers', () => {
        describe('getFlowOption', () => {
            it('should return a FlowOption map', () => {
                const truthyOption = getFlowOption(flowUUID, flowName);
                const falsyOption = getFlowOption(undefined, undefined);

                expect(truthyOption).toEqual({
                    uuid: flowUUID,
                    name: flowName
                });
                expect(truthyOption).toMatchSnapshot();
                expect(falsyOption).toEqual({
                    uuid: '',
                    name: ''
                });
                expect(falsyOption).toMatchSnapshot();
            });
        });

        describe('shouldDisplayLoading', () => {
            it('should return true if flow option is not valid or flows prop is falsy', () => {
                const validFlowOption = getFlowOption(flowUUID, flowName);
                const invalidFlowOption = getFlowOption(undefined, undefined);

                expect(shouldDisplayLoading(validFlowOption, [])).toBeTruthy();
                expect(shouldDisplayLoading(invalidFlowOption, flows)).toBeTruthy();
            });

            it('should return false if flow option is valid and flows prop is truthy', () => {
                const validFlowOption = getFlowOption(flowUUID, flowName);

                expect(shouldDisplayLoading(validFlowOption, flows)).toBeFalsy();
            });
        });
    });

    describe('render', () => {
        it('should render select control', () => {
            const { wrapper, instance, props } = setup();
            const flowOption = getFlowOption(props.flowUUID, props.flowName);
            const isLoading = shouldDisplayLoading(flowOption, props.flows);

            expect(
                getSpecWrapper(wrapper, flowListContainerSpecId).hasClass('flowList')
            ).toBeTruthy();
            expect(wrapper.find('Select').props()).toEqual(
                expect.objectContaining({
                    placeholder: PLACEHOLDER,
                    onChange: instance.onChange,
                    searchable: false,
                    clearable: false,
                    labelKey,
                    valueKey,
                    value: flowOption,
                    options: props.flows,
                    isLoading
                })
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('onChange', () => {
            const otherUUID = 'some-other-uuid';

            it('should call action creator that fetches flow', () => {
                const { wrapper, instance, props, context: { endpoints } } = setup(true, {
                    fetchFlow: setMock()
                });

                instance.onChange({ uuid: otherUUID });

                expect(props.fetchFlow).toHaveBeenCalledTimes(1);
                expect(props.fetchFlow).toHaveBeenCalledWith(endpoints.flows, otherUUID);
            });

            it('should not call action creator that fetches flow', () => {
                let {
                    wrapper,
                    // tslint:disable-next-line:prefer-const
                    instance,
                    props,
                    context: { endpoints }
                } = setup(true, {
                    flows: set([]),
                    fetchFlow: setMock()
                });

                instance.onChange({ uuid: otherUUID });

                expect(props.fetchFlow).toHaveBeenCalledTimes(0);

                ({ wrapper, props, context: { endpoints } } = setup());

                instance.onChange({ uuid: otherUUID });

                expect(props.fetchFlow).toHaveBeenCalledTimes(0);
            });
        });
    });
});
