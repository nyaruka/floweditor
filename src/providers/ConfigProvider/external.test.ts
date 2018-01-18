import axios from 'axios';
import MockAdapter = require('axios-mock-adapter');
import { ContactField } from '../../flowTypes';
import {
    FlowDetails,
    FLOWS_ENDPOINT,
    FIELDS_ENDPOINT,
    getFlow,
    getFlows,
    getFields
} from './external';

const moxios = new MockAdapter(axios);

const {
    results: [{ uuid: flowUUID, name: flowName, definition }]
} = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { results: getFlowsResp } = require('../../../assets/flows.json');
const { results: getFieldsResp } = require('../../../assets/fields.json');

const getFlowResp: FlowDetails = {
    uuid: flowUUID,
    name: flowName,
    definition,
    dependencies: []
};

moxios
    .onGet(FLOWS_ENDPOINT)
    .reply(200, getFlowsResp)
    .onGet(FLOWS_ENDPOINT, { params: { uuid: flowUUID } })
    .reply(200, getFlowResp)
    .onGet(FIELDS_ENDPOINT)
    .reply(200, getFieldsResp);

afterAll(() => moxios.reset());

describe('external >', () => {
    describe('getFlow >', () =>
        it('should fetch a flow by UUID', () => {
            getFlow(flowUUID, false).then(res => expect(res).toEqual(getFlowResp));
        }));

    describe('getFlows >', () =>
        it('should fetch a list of flows', () => {
            getFlows().then(res => expect(res).toEqual(getFlowsResp));
        }));

    describe('getFields >', () =>
        it('should fetch a list of contact fields', () => {
            getFields().then(res => expect(res).toEqual(getFieldsResp));
        }));
});
