import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import {
  createCaseProps,
  createRenderNode,
  hasCases,
  resolveRoutes
} from 'components/flow/routers/helpers';
import { SelectOption } from 'components/form/select/SelectElement';
import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { Router, RouterTypes, SwitchRouter } from 'flowTypes';
import { AssetStore, AssetType, RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';

import { ResultRouterFormState } from './ResultRouterForm';

export const FIELD_NUMBER_OPTIONS: SelectOption[] = [
  { value: '0', name: 'first' },
  { value: '1', name: 'second' },
  { value: '2', name: 'third' },
  { value: '3', name: 'fourth' },
  { value: '4', name: 'fifth' },
  { value: '5', name: 'sixth' },
  { value: '6', name: 'seventh' },
  { value: '7', name: 'eighth' },
  { value: '8', name: 'ninth' },
  { value: '9', name: 'tenth' },
  { value: '10', name: '11th' },
  { value: '11', name: '12th' },
  { value: '12', name: '13th' },
  { value: '13', name: '14th' },
  { value: '14', name: '15th' },
  { value: '15', name: '16th' },
  { value: '16', name: '17th' },
  { value: '17', name: '18th' },
  { value: '18', name: '19th' },
  { value: '19', name: '20th' }
];

export const getFieldOption = (value: number): SelectOption => {
  return FIELD_NUMBER_OPTIONS.find((option: SelectOption) => option.value === '' + value);
};

export const DELIMITER_OPTIONS: SelectOption[] = [
  { value: ' ', name: 'spaces' },
  { value: '.', name: 'periods' },
  { value: '+', name: 'plusses' }
];

export const getDelimiterOption = (value: string): SelectOption => {
  return DELIMITER_OPTIONS.find((option: SelectOption) => option.value === value);
};

export const nodeToState = (
  settings: NodeEditorSettings,
  assetStore: AssetStore
): ResultRouterFormState => {
  let initialCases: CaseProps[] = [];

  // TODO: work out an incremental result name
  let resultName: StringEntry = { value: '' };

  let result: any = null;
  let fieldNumber = 1;
  let delimiter = ' ';
  let shouldDelimit = false;

  const type = getType(settings.originalNode);

  if (
    (settings.originalNode && type === Types.split_by_run_result) ||
    type === Types.split_by_run_result_delimited
  ) {
    const router = settings.originalNode.node.router as SwitchRouter;

    if (router) {
      if (hasCases(settings.originalNode.node)) {
        initialCases = createCaseProps(router.cases, settings.originalNode);
      }

      resultName = { value: router.result_name || '' };
    }

    const config = settings.originalNode.ui.config;
    if (config && config.operand) {
      if (config.operand.id in assetStore.results.items) {
        result = assetStore.results.items[config.operand.id];
      } else {
        result = null;
      }
    }

    if (type === Types.split_by_run_result_delimited) {
      fieldNumber = config.index;
      delimiter = config.delimiter;
      shouldDelimit = true;
    }
  }

  return {
    cases: initialCases,
    resultName,
    result: { value: result },
    shouldDelimit,
    fieldNumber,
    delimiter,
    valid: true
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: ResultRouterFormState
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

  let nodeType = Types.split_by_run_result;

  const result = state.result.value;
  let operand = `@results.${result.id}`;

  const config: any = {
    operand: {
      name: result.name,
      id: result.id,
      type: AssetType.Result
    },
    cases: caseConfig
  };

  if (state.shouldDelimit) {
    config.index = state.fieldNumber;
    config.delimiter = state.delimiter;
    operand = `@(field(results.${result.id}, ${state.fieldNumber}, "${state.delimiter}"))`;
    nodeType = Types.split_by_run_result_delimited;
  }

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    default_category_uuid: defaultExit,
    categories,
    cases,
    operand,
    ...optionalRouter
  };

  const newRenderNode = createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    nodeType,
    [],
    config
  );

  return newRenderNode;
};
