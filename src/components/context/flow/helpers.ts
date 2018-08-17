import { snakify } from '~/utils';

import { FlowResult, FlowResultMap } from './FlowContext';

export const getFlowResult = (
    results: FlowResultMap,
    resultName: string,
    nodeUUID: string
): FlowResult => {
    const key = snakify(resultName);
    const result = results[key] || { key, name: resultName, nodeUUIDs: [] };
    result.nodeUUIDs = result.nodeUUIDs.filter((uuid: string) => uuid !== nodeUUID);
    result.nodeUUIDs.push(nodeUUID);
    return result;
};
