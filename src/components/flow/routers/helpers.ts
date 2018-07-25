import { Types } from '~/config/typeConfigs';
import { Action, Exit, Router, UINodeTypes, Wait } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';

export const createRenderNode = (
    uuid: string,
    router: Router,
    exits: Exit[],
    type: UINodeTypes | Types,
    actions: Action[] = [],
    wait: Wait = null
): RenderNode => {
    return {
        node: {
            uuid,
            actions,
            router,
            exits,
            wait
        },
        ui: {
            type,
            position: null
        },
        inboundConnections: {}
    };
};
