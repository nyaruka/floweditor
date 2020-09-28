import { createRenderNode } from 'components/flow/routers/helpers';
import { RandomRouterFormState } from 'components/flow/routers/random/RandomRouterForm';
import { SelectOption } from 'components/form/select/SelectElement';
import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { Category, Exit, Router, RouterTypes } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { createUUID, range } from 'utils';

export const BUCKET_OPTIONS: SelectOption[] = range(2, 11).map((count: number) => {
  return { value: count + '', name: count + ' buckets' };
});

export const getOption = (value: number): SelectOption => {
  let option = BUCKET_OPTIONS.find(
    (bucketOption: SelectOption) => bucketOption.value === value + ''
  );
  if (!option) {
    option = { name: `${value} Buckets`, value: value + '' };
  }
  return option;
};

export const nodeToState = (settings: NodeEditorSettings): RandomRouterFormState => {
  // TODO: work out an incremental result name
  let resultName: StringEntry = { value: '' };
  let buckets = 2;

  let categories: Category[] = [];
  if (settings.originalNode && getType(settings.originalNode) === Types.split_by_random) {
    const router = settings.originalNode.node.router as Router;
    resultName = { value: router.result_name || '' };
    buckets = settings.originalNode.node.exits.length;

    // use any existing random buckets if we have any
    categories = settings.originalNode.node.router.categories;
  }

  categories = fillOutCategories(categories, buckets);

  return {
    categories,
    resultName,
    bucketChoice: { value: getOption(buckets) },
    valid: true
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: RandomRouterFormState
): RenderNode => {
  const optionalRouter: Pick<Router, 'result_name'> = {};
  if (state.resultName.value) {
    optionalRouter.result_name = state.resultName.value;
  }

  const exits =
    getType(settings.originalNode) === Types.split_by_random
      ? settings.originalNode.node.exits
      : [];

  const count = parseInt(state.bucketChoice.value.value, 10);
  exits.splice(count, exits.length - count);

  state.categories.forEach((category: Category, idx: number) => {
    if (idx < exits.length) {
      category.exit_uuid = exits[idx].uuid;
    } else {
      const newExit: Exit = {
        uuid: createUUID(),
        destination_uuid: null
      };
      category.exit_uuid = newExit.uuid;
      exits.push(newExit);
    }
  });

  const router: Router = {
    type: RouterTypes.random,
    categories: state.categories,
    ...optionalRouter
  };

  const newRenderNode = createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    Types.split_by_random,
    [],
    null
  );

  return newRenderNode;
};

export const fillOutCategories = (categories: Category[], buckets: number): Category[] => {
  // add any that we still need
  return categories.concat(
    range(categories.length, buckets).map((idx: number) => {
      return { uuid: createUUID(), name: `Bucket ${idx + 1}`, exit_uuid: null };
    })
  );
};
