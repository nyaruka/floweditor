import {
    AirtimeRouterFormState,
    AirtimeTransferEntry
} from '~/components/flow/routers/airtime/AirtimeRouterForm';
import { createRenderNode } from '~/components/flow/routers/helpers';
import { Operators, Types } from '~/config/interfaces';
import {
    Case,
    Exit,
    RouterTypes,
    SwitchRouter,
    TransferAirtime,
    TransferAirtimeExitNames
} from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';
import { createUUID } from '~/utils';

export const nodeToState = (settings: NodeEditorSettings): AirtimeRouterFormState => {
    const originalAction = getOriginalAction(settings);

    const amounts: AirtimeTransferEntry[] = [];
    if (originalAction) {
        Object.keys(originalAction.amounts).forEach((key: string) => {
            amounts.push({ value: { code: key, amount: '' + originalAction.amounts[key] } });
        });
    }

    return {
        valid: false,
        amounts
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: AirtimeRouterFormState
): RenderNode => {
    let uuid = createUUID();
    const originalAction = getOriginalAction(settings);
    if (originalAction) {
        uuid = originalAction.uuid;
    }

    const amounts = {};
    state.amounts.forEach((entry: AirtimeTransferEntry) => {
        if (entry.value.amount.trim().length > 0) {
            amounts[entry.value.code] = Number(entry.value.amount);
        }
    });

    const newAction: TransferAirtime = {
        uuid,
        type: Types.transfer_airtime,
        amounts
    };

    // If we're already a subflow, lean on those exits and cases
    let exits: Exit[];
    let cases: Case[];

    if (originalAction) {
        ({ exits } = settings.originalNode.node);
        ({ cases } = settings.originalNode.node.router as SwitchRouter);
    } else {
        // Otherwise, let's create some new ones
        exits = [
            {
                uuid: createUUID(),
                name: TransferAirtimeExitNames.Success,
                destination_node_uuid: null
            },
            {
                uuid: createUUID(),
                name: TransferAirtimeExitNames.Failure,
                destination_node_uuid: null
            }
        ];

        cases = [
            {
                uuid: createUUID(),
                type: Operators.has_webhook_status,
                arguments: ['success'],
                exit_uuid: exits[0].uuid
            },
            {
                uuid: createUUID(),
                type: Operators.has_webhook_status,
                arguments: ['failed'],
                exit_uuid: exits[1].uuid
            }
        ];
    }

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        operand: '@child',
        cases,
        default_exit_uuid: null
    };

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.split_by_airtime,
        [newAction]
    );

    return newRenderNode;
};

export const getOriginalAction = (settings: NodeEditorSettings): TransferAirtime => {
    const action =
        settings.originalAction ||
        (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

    if (action.type === Types.transfer_airtime) {
        return action as TransferAirtime;
    }
};
