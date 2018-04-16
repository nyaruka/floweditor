import { createSetup, getSpecWrapper } from '../testUtils';
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
import { FlowEditorConfig } from '../flowTypes';

const config = require('../../__test__/assets/config') as FlowEditorConfig;
const flowsResp = require('../../__test__/assets/flows.json');

const context = {
    endpoints: config.endpoints
};

const baseProps = {
    flowUUID: 'boring',
    flowName: 'Boring',
    flows: flowsResp.results,
    fetchFlow: jest.fn()
};

const setup = createSetup<FlowListStoreProps>(FlowList, baseProps, context);

const COMPONENT_TO_TEST = FlowList.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('helpers', () => {
        describe('getFlowOption', () => {
            it('should return a FlowOption map', () => {
                const flowUUID = 'boring';
                const flowName = 'Boring';
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
                const flowUUID = 'boring';
                const flowName = 'Boring';
                const validFlowOption = getFlowOption(flowUUID, flowName);
                const invalidFlowOption = getFlowOption(undefined, undefined);
                const flows = flowsResp.results;

                expect(shouldDisplayLoading(validFlowOption, [])).toBeTruthy();
                expect(shouldDisplayLoading(invalidFlowOption, flows)).toBeTruthy();
            });

            it('should return false if flow option is valid and flows prop is truthy', () => {
                const flowUUID = 'boring';
                const flowName = 'Boring';
                const validFlowOption = getFlowOption(flowUUID, flowName);
                const flows = flowsResp.results;

                expect(shouldDisplayLoading(validFlowOption, flows)).toBeFalsy();
            });
        });
    });

    describe('render', () => {
        it('should render select control', () => {
            const { wrapper, instance, props: { flowUUID, flowName, flows } } = setup({}, true);
            const flowOption = getFlowOption(flowUUID, flowName);
            const isLoading = shouldDisplayLoading(flowOption, flows);

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
                    options: flows,
                    isLoading
                })
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('onChange', () => {
            it('should call action creator that fetches flow', () => {
                const {
                    wrapper,
                    instance,
                    props: { fetchFlow: fetchFlowMock },
                    context: { endpoints }
                } = setup({ fetchFlow: jest.fn() }, true);
                const otherUUID = 'other_uuid';

                instance.onChange({ uuid: otherUUID });

                expect(fetchFlowMock).toHaveBeenCalledTimes(1);
                expect(fetchFlowMock).toHaveBeenCalledWith(endpoints.flows, otherUUID);
            });

            it('should not call action creator that fetches flow', () => {
                let {
                    wrapper,
                    // tslint:disable-next-line:prefer-const
                    instance,
                    props: { fetchFlow: fetchFlowMock },
                    context: { endpoints }
                } = setup({ flows: [], fetchFlow: jest.fn() }, true);
                const otherUUID = 'other_uuid';

                instance.onChange({ uuid: otherUUID });

                expect(fetchFlowMock).toHaveBeenCalledTimes(0);

                ({ wrapper, props: { fetchFlow: fetchFlowMock }, context: { endpoints } } = setup(
                    {},
                    true
                ));

                instance.onChange({ uuid: otherUUID });
                expect(fetchFlowMock).toHaveBeenCalledTimes(0);
            });
        });
    });
});
