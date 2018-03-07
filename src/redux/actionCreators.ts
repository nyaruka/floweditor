import { FlowDefinition } from '../flowTypes';
import { getFlows, FlowDetails, getFlow } from '../external';
import { updateFlows, updateFetchingFlow, updateDefinition } from '.';

export const fetchFlow = (
    dispatch: Function,
    url: string,
    uuid: string
): Promise<void | FlowDefinition> => {
    dispatch(updateFetchingFlow(true));
    return getFlow(url, uuid, false)
        .then(({ definition }: FlowDetails) => {
            dispatch(updateDefinition(definition));
            dispatch(updateFetchingFlow(false));
            return definition;
        })
        .catch((error: any) => console.log(`fetchFlow error: ${error}`));
};

export const fetchFlows = (dispatch: Function, url: string) =>
    getFlows(url)
        .then((flows: FlowDetails[]) =>
            dispatch(
                updateFlows(
                    flows.map(({ uuid, name }) => ({
                        uuid,
                        name
                    }))
                )
            )
        )
        .catch((error: any) => console.log(`fetchFlowList error: ${error}`));
