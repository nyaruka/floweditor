const axios = require.requireActual('axios');
const { endpoints } = require('../__test__/config');
const colorsFlowResp = require('../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const customerServiceFlowResp = require('../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const flowsResp = require('../assets/flows.json');
const groupsResp = require('../assets/groups.json');
const contactsResp = require('../assets/contacts.json');
const fieldsResp = require('../assets/fields.json');

const getEndpoint = (urlStr: string) => {
    const queryIdx = urlStr.indexOf('?');
    const hasQuery = queryIdx > -1;
    return {
        endpoint: hasQuery ? urlStr.slice(0, queryIdx) : urlStr,
        containsQuery: hasQuery ? true : false
    };
};
const containsUUIDQuery = (urlStr: string) => urlStr.indexOf('uuid=') > -1;
const resolvePromise = (data: { [key: string]: any }) => Promise.resolve({ data });
const getUUIDQuery = (urlStr: string) => urlStr.slice(urlStr.indexOf('uuid=')).slice(5, 41);

const { results: [{ uuid: colorsFlowUUID }] } = colorsFlowResp;
const { results: [{ uuid: customerServiceFlowUUID }] } = customerServiceFlowResp;

axios.get = jest.fn(url => {
    const { endpoint, containsQuery } = getEndpoint(url);
    switch (endpoint) {
        case endpoints.flows:
            if (containsQuery && containsUUIDQuery(url)) {
                const uuid = getUUIDQuery(url);
                switch (uuid) {
                    case colorsFlowUUID:
                        return resolvePromise(colorsFlowResp);
                    case customerServiceFlowUUID:
                        return resolvePromise(customerServiceFlowResp);
                    default:
                        throw new Error(`Axios mock: UUID query "${uuid}" not found`);
                }
            }
            return resolvePromise(flowsResp);
        case endpoints.groups:
            return resolvePromise(groupsResp);
        case endpoints.contacts:
            return resolvePromise(contactsResp);
        case endpoints.fields:
            return resolvePromise(fieldsResp);
        default:
            throw new Error('Axios mock: url not passed. Passed: ' + url);
    }
});

module.exports = axios;
