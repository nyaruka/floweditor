import { NAME_PROPERTY } from 'components/flow/props';
import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { FieldRouterFormState } from 'components/flow/routers/field/FieldRouterForm';
import {
  createCaseProps,
  createRenderNode,
  hasCases,
  resolveRoutes
} from 'components/flow/routers/helpers';
import { getContactProperties } from 'components/helpers';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { FlowTypes, Types } from 'config/interfaces';
import { getType, Scheme, SCHEMES } from 'config/typeConfigs';
import { Router, RouterTypes, SwitchRouter } from 'flowTypes';
import { Asset, AssetStore, AssetType, RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';

export const getRoutableFields = (flowType: FlowTypes = null): Asset[] => {
  return [
    ...getContactProperties(flowType),
    ...SCHEMES.map((scheme: Scheme) => ({
      name: scheme.path,
      id: scheme.scheme,
      type: AssetType.Scheme
    }))
  ];
};

export const nodeToState = (
  settings: NodeEditorSettings,
  assetStore: AssetStore
): FieldRouterFormState => {
  let initialCases: CaseProps[] = [];

  // TODO: work out an incremental result name
  let resultName: StringEntry = { value: '' };

  let field: any = null;

  const type = getType(settings.originalNode);
  if (settings.originalNode && type === Types.split_by_contact_field) {
    const router = settings.originalNode.node.router as SwitchRouter;

    if (router) {
      if (hasCases(settings.originalNode.node)) {
        initialCases = createCaseProps(router.cases, settings.originalNode);
      }

      resultName = { value: router.result_name || '' };
    }

    const operand = settings.originalNode.ui.config.operand;

    if (assetStore.fields) {
      if (operand.id in assetStore.fields.items) {
        const name = assetStore.fields.items[operand.id].name;
        field = { key: operand.id, label: name, type: operand.type };
      }
    }

    // couldn't find the asset, check our routable fields
    if (!field) {
      field = getRoutableFields().find((asset: Asset) => asset.id === operand.id);
    }
  }

  // our default is name
  if (!field) {
    field = NAME_PROPERTY;
  }

  return {
    cases: initialCases,
    resultName,
    field: { value: field },
    valid: true
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: FieldRouterFormState
): RenderNode => {
  const { cases, exits, defaultCategory: defaultExit, caseConfig, categories } = resolveRoutes(
    state.cases,
    false,
    settings.originalNode.node
  );

  const optionalRouter: Pick<Router, 'result_name'> = {};
  if (state.resultName.value) {
    optionalRouter.result_name = state.resultName.value;
  }

  let operand = DEFAULT_OPERAND;

  const asset = state.field.value;

  let operandConfig = {
    id: asset.id,
    type: asset.type,
    name: asset.name
  };

  if (asset.type === AssetType.Scheme) {
    operand = `@(default(urn_parts(urns.${asset.id}).path, ""))`;
  } else if (asset.type === AssetType.ContactProperty) {
    operand = `@contact.${asset.id}`;
  } else if (asset.key) {
    operand = `@fields.${asset.key}`;
    operandConfig = {
      id: asset.key,
      name: asset.label,
      type: AssetType.Field
    };
  }

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    default_category_uuid: defaultExit,
    cases,
    categories,
    operand,
    ...optionalRouter
  };

  const newRenderNode = createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    Types.split_by_contact_field,
    [],
    {
      operand: operandConfig,
      cases: caseConfig
    }
  );

  return newRenderNode;
};
