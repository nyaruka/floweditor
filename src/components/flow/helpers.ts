import { Type, Types } from 'config/interfaces';
import { getType, getTypeConfig } from 'config/typeConfigs';
import { NodeEditorSettings } from 'store/nodeEditor';
import { Asset } from 'store/flowContext';
import { FlowIssue } from 'flowTypes';

export const determineTypeConfig = (nodeSettings: NodeEditorSettings): Type => {
  const renderNode = nodeSettings.originalNode;
  const node = renderNode && renderNode.node;

  if (nodeSettings.originalAction && nodeSettings.originalAction.type) {
    return getTypeConfig(nodeSettings.originalAction.type);
  } else if (node && node.actions && node.actions.length > 0) {
    return getTypeConfig(node.actions[node.actions.length - 1].type);
  } else {
    try {
      const type = getType(renderNode);
      const config = getTypeConfig(type);
      if (config.type !== Types.missing) {
        return config;
      }
      // tslint:disable-next-line:no-empty
    } catch (Error) {}
  }

  // Account for ghost nodes
  if (node && node.router) {
    return getTypeConfig(node.router.type);
  }

  throw new Error(`Couldn't determine type config for: ${node.uuid}`);
};

export const hasIssues = (issues: FlowIssue[], translating: boolean, language: Asset): boolean => {
  if (!issues || issues.length === 0) {
    return false;
  }

  if (!translating) {
    return !!issues.find((issue: FlowIssue) => !issue.language);
  } else {
    return !!issues.find((issue: FlowIssue) => issue.language === language.id);
  }
};
