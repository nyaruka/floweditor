import { getTypeConfig, Type } from '~/config/typeConfigs';
import { NodeEditorSettings } from '~/store/nodeEditor';

export const determineTypeConfig = (nodeSettings: NodeEditorSettings): Type => {
    const renderNode = nodeSettings.originalNode;
    const node = renderNode.node;

    if (nodeSettings.originalAction && nodeSettings.originalAction.type) {
        return getTypeConfig(nodeSettings.originalAction.type);
    } else if (node.actions && node.actions.length > 0) {
        return getTypeConfig(node.actions[node.actions.length - 1].type);
    } else {
        try {
            /* istanbul ignore else */
            if (renderNode.ui.type) {
                return getTypeConfig(renderNode.ui.type);
            }
            // tslint:disable-next-line:no-empty
        } catch (Error) {}
    }

    // Account for ghost nodes
    if (node.router) {
        return getTypeConfig(node.router.type);
    }

    throw new Error(`Couldn't determin type config for: ${node.uuid}`);
};
