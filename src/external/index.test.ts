import { getFlow, getFlows } from '.';
import { FlowEditorConfig } from '../flowTypes';
import { Resp } from '../testUtils';
import { configProviderContext } from '../testUtils/index';

const colorsFlowResp = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json') as Resp;
const flowsResp = require('../../assets/flows.json') as Resp;

const { endpoints: { flows: flowsEndpoint } } = configProviderContext;

describe('external', () => {
    describe('getFlow', () => {
        it('should get a flow', async () => {
            expect(await getFlow(flowsEndpoint, colorsFlowResp.results[0].uuid, false)).toEqual(
                colorsFlowResp.results[0]
            );
        });
    });

    describe('getFlows', () => {
        it('should fetch a list of flows', async () => {
            expect(await getFlows(flowsEndpoint)).toEqual(flowsResp.results);
        });
    });
});
