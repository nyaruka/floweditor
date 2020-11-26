import { SCHEMES, Scheme, getType } from 'config/typeConfigs';
import { SelectOption } from 'components/form/select/SelectElement';
import { NodeEditorSettings } from 'store/nodeEditor';
import { SchemeRouterFormState } from './SchemeRouterForm';
import { getSwitchRouter, resolveRoutes, createRenderNode } from '../helpers';
import { RenderNode } from 'store/flowContext';
import { SwitchRouter, FlowNode, RouterTypes, Case } from 'flowTypes';
import { CaseProps } from '../caselist/CaseList';
import { createUUID } from 'utils';
import { Operators, Types } from 'config/interfaces';
import { SCHEMES_OPERAND } from 'components/nodeeditor/constants';

export const getChannelTypeOptions = (): SelectOption[] => {
  // get our scheme list as select options, ignore hidden schemes
  return SCHEMES.filter((scheme: Scheme) => !scheme.excludeFromSplit).map((scheme: Scheme) => {
    return { value: scheme.scheme, name: scheme.name };
  });
};

export const nodeToState = (settings: NodeEditorSettings): SchemeRouterFormState => {
  const state: SchemeRouterFormState = {
    schemes: { value: [] },
    resultName: { value: '' },
    valid: false
  };

  if (getType(settings.originalNode) === Types.split_by_scheme) {
    state.schemes.value = extractSchemes(settings.originalNode.node);
    state.resultName = {
      value: (settings.originalNode.node.router as SwitchRouter).result_name || ''
    };
    state.valid = true;
  }

  return state;
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: SchemeRouterFormState
): RenderNode => {
  let orginalCases: Case[] = [];
  if (getType(settings.originalNode) === Types.split_by_scheme) {
    orginalCases = getSwitchRouter(settings.originalNode.node).cases;
  }

  const currentCases = schemesToCases(state.schemes.value, orginalCases);

  const { cases, exits, defaultCategory: defaultExit, caseConfig, categories } = resolveRoutes(
    currentCases,
    false,
    settings.originalNode.node
  );

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    cases,
    categories,
    default_category_uuid: defaultExit,
    operand: SCHEMES_OPERAND,
    result_name: state.resultName.value
  };

  return createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    Types.split_by_scheme,
    [],
    { cases: caseConfig }
  );
};

export const extractSchemes = (node: FlowNode): SelectOption[] => {
  let schemes: SelectOption[] = [];
  const router = getSwitchRouter(node);
  const selectOptions = getChannelTypeOptions();

  if (router) {
    schemes = (router as SwitchRouter).cases
      .map(kase => {
        if (kase.arguments) {
          const [scheme] = kase.arguments;
          return selectOptions.find((option: SelectOption) => option.value === scheme);
        }
        return null;
      })
      .filter((option: SelectOption) => option !== null);
  }
  return schemes;
};

export const schemesToCases = (
  schemes: SelectOption[] = [],
  originalCases: Case[]
): CaseProps[] => {
  return schemes.map(({ value, name }: SelectOption) => {
    // try to use the same case uuids for consistency
    const originalCase = originalCases.find((kase: Case) => kase.arguments[0] === value);
    const uuid = originalCase ? originalCase.uuid : createUUID();
    return {
      uuid: createUUID(),
      kase: {
        uuid,
        type: Operators.has_only_phrase,
        arguments: [value],
        category_uuid: ''
      },
      categoryName: name,
      valid: true
    };
  });
};
