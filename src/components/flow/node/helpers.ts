import { Category, Exit } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';

export const getCategoriesForExit = (renderNode: RenderNode, exit: Exit): Category[] => {
    if (!renderNode.node.router) {
        return [];
    }
    return renderNode.node.router.categories.filter((cat: Category) => cat.exit_uuid === exit.uuid);
};
