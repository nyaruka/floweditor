import * as nock from 'nock';
import { DEV_SERVER_PORT } from '../../webpack/webpack.dev';
import { getFlow, getFlows } from '.';

const {
    results: [{ uuid: flowUUID, name: flowName, definition }]
} = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { results: getFlowsResp } = require('../../assets/flows.json');
const { endpoints: { flows: flowsEndpoint } } = require('../../assets/config');

const getFlowResp = {
    uuid: flowUUID,
    name: flowName,
    definition,
    dependencies: []
};

const getFlowNock = nock(`http://localhost:${DEV_SERVER_PORT}`)
    .get(flowsEndpoint)
    .query({ uuid: flowUUID })
    .reply(200, getFlowResp);

const getFlowsNock = nock(`http://localhost:${DEV_SERVER_PORT}`)
    .get(flowsEndpoint)
    .reply(200, getFlowsResp);

afterAll(() => nock.cleanAll());

describe('Providers: external', () => {
    describe('getFlow', () => {
        it('should get a flow', () => {
            getFlow(flowsEndpoint, flowUUID, false).then(response =>
                expect(response).toEqual(getFlowResp)
            );
        });
    });

    describe('getFlows', () => {
        it('should fetch a list of flows', () => {
            getFlows(flowsEndpoint).then(response => expect(response).toEqual(getFlowsResp));
        });
    });
});
