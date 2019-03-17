import { createRenderNode } from '~/components/flow/routers/helpers';
import { RandomRouterFormState } from '~/components/flow/routers/random/RandomRouterForm';
import { SelectOption } from '~/components/form/select/SelectElement';
import { Types } from '~/config/interfaces';
import { Exit, Router, RouterTypes } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';
import { createUUID, range } from '~/utils';

export const BUCKET_OPTIONS: SelectOption[] = range(2, 11).map((count: number) => {
    return { value: count + '', label: count + ' buckets' };
});

export const getOption = (value: number): SelectOption => {
    let option = BUCKET_OPTIONS.find(
        (bucketOption: SelectOption) => bucketOption.value === value + ''
    );
    if (!option) {
        option = { label: `${value} Buckets`, value: value + '' };
    }
    return option;
};

export const nodeToState = (settings: NodeEditorSettings): RandomRouterFormState => {
    // TODO: work out an incremental result name
    let resultName: StringEntry = { value: '' };
    let buckets = 2;

    let exits: Exit[] = [];
    if (settings.originalNode && settings.originalNode.ui.type === Types.split_by_random) {
        const router = settings.originalNode.node.router as Router;
        resultName = { value: router.result_name || '' };
        buckets = settings.originalNode.node.exits.length;

        // use any existing random buckets if we have any
        exits = settings.originalNode.node.exits;
    }

    exits = fillOutExits(exits, buckets);

    return {
        exits,
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

    const router: Router = {
        type: RouterTypes.random,
        ...optionalRouter
    };

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        state.exits,
        Types.split_by_random,
        [],
        null
    );

    return newRenderNode;
};

export const fillOutExits = (exits: Exit[], buckets: number): Exit[] => {
    // add any that we still need
    return exits.concat(
        range(exits.length, buckets).map((idx: number) => {
            return { uuid: createUUID(), name: `Bucket ${idx + 1}` };
        })
    );
};
