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

const config = require('../../assets/config') as FlowEditorConfig;
const colorsFlowResp = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json') as Resp;
const customerServiceFlowResp = require('../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const flowsResp = require('../../assets/flows.json');

const context = {
    assetHost: config.assetHost,
    endpoints: config.endpoints
};

const baseProps = {
    flowUUID: colorsFlowResp.results[0].uuid,
    flowName: colorsFlowResp.results[0].name,
    flows: flowsResp.results,
    fetchFlow: jest.fn()
};

const setup = createSetup<FlowListStoreProps>(FlowList, baseProps, context);

const COMPONENT_TO_TEST = FlowList.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('helpers', () => {
        describe('getFlowOption', () => {
            it('should return a FlowOption map', () => {
                const flowUUID = colorsFlowResp.results[0].uuid;
                const flowName = colorsFlowResp.results[0].name;

                expect(getFlowOption(flowUUID, flowName)).toEqual({
                    uuid: flowUUID,
                    name: flowName
                });
                expect(getFlowOption(undefined, undefined)).toEqual({
                    uuid: '',
                    name: ''
                });
            });
        });

        describe('shouldDisplayLoading', () => {
            it('should return true if flow option is not valid or flows prop is falsy', () => {
                const flowUUID = colorsFlowResp.results[0].uuid;
                const flowName = colorsFlowResp.results[0].name;
                const validFlowOption = getFlowOption(flowUUID, flowName);
                const invalidFlowOption = getFlowOption(undefined, undefined);
                const flows = flowsResp.results;

                expect(shouldDisplayLoading(validFlowOption, [])).toBeTruthy();
                expect(shouldDisplayLoading(invalidFlowOption, flows)).toBeTruthy();
            });

            it('should return false if flow option is valid and flows prop is truthy', () => {
                const flowUUID = colorsFlowResp.results[0].uuid;
                const flowName = colorsFlowResp.results[0].name;
                const validFlowOption = getFlowOption(flowUUID, flowName);
                const flows = flowsResp.results;

                expect(shouldDisplayLoading(validFlowOption, flows)).toBeFalsy();
            });
        });
    });

    describe('render', () => {
        it('should render select control', () => {
            const { wrapper, props: { flowUUID, flowName, flows } } = setup({}, true);
            const FlowListInstance = wrapper.instance();
            const flowOption = getFlowOption(flowUUID, flowName);
            const isLoading = shouldDisplayLoading(flowOption, flows);

            expect(
                getSpecWrapper(wrapper, flowListContainerSpecId).hasClass('flowList')
            ).toBeTruthy();
            expect(wrapper.find('Select').props()).toEqual(
                expect.objectContaining({
                    placeholder: PLACEHOLDER,
                    onChange: FlowListInstance.onChange,
                    searchable: false,
                    clearable: false,
                    labelKey,
                    valueKey,
                    value: flowOption,
                    options: flows,
                    isLoading
                })
            );
        });
    });

    describe('instance methods', () => {
        describe('onChange', () => {
            it('should call action creator that fetches flow', () => {
                const {
                    wrapper,
                    props: { fetchFlow: fetchFlowMock },
                    context: { endpoints }
                } = setup({ fetchFlow: jest.fn() }, true);
                const FlowListInstance = wrapper.instance();
                const otherUUID = customerServiceFlowResp.results[0].uuid;

                FlowListInstance.onChange({ uuid: otherUUID });

                expect(fetchFlowMock).toHaveBeenCalledTimes(1);
                expect(fetchFlowMock).toHaveBeenCalledWith(endpoints.flows, otherUUID);
            });

            it('should not call action creator that fetches flow', () => {
                let {
                    wrapper,
                    props: { fetchFlow: fetchFlowMock },
                    context: { endpoints }
                } = setup({ flows: [], fetchFlow: jest.fn() }, true);
                const FlowListInstance = wrapper.instance();
                const otherUUID = customerServiceFlowResp.results[0].uuid;

                FlowListInstance.onChange({ uuid: otherUUID });

                expect(fetchFlowMock).toHaveBeenCalledTimes(0);

                ({ wrapper, props: { fetchFlow: fetchFlowMock }, context: { endpoints } } = setup(
                    {},
                    true
                ));

                FlowListInstance.onChange({ uuid: otherUUID });
                expect(fetchFlowMock).toHaveBeenCalledTimes(0);
            });
        });
    });
});
