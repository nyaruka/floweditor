import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { createRenderNode, resolveExits } from '~/components/flow/routers/helpers';
import { Operators, Types } from '~/config/interfaces';
import { getType } from '~/config/typeConfigs';
import { Case, Exit, HintTypes, Router, RouterTypes, SwitchRouter, WaitTypes } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';
import { createUUID } from '~/utils';

import { MenuRouterFormState } from './MenuRouterForm';

export const nodeToState = (settings: NodeEditorSettings): MenuRouterFormState => {
    let resultName: StringEntry = { value: '' };

    const menu: string[] = [];
    for (let i = 0; i < 10; i++) {
        menu.push('');
    }

    if (getType(settings.originalNode) === Types.wait_for_menu) {
        const router = settings.originalNode.node.router as SwitchRouter;
        for (const kase of router.cases) {
            let idx = parseInt(kase.arguments[0], 10) - 1;
            if (idx === -1) {
                idx = menu.length - 1;
            }

            menu[idx] = settings.originalNode.node.exits.find(
                (exit: Exit) => exit.uuid === kase.exit_uuid
            ).name;
        }
        resultName = { value: router.result_name || '' };
    }

    return {
        resultName,
        menu,
        valid: true
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: MenuRouterFormState
): RenderNode => {
    const optionalRouter: Pick<Router, 'result_name'> = {};
    if (state.resultName.value) {
        optionalRouter.result_name = state.resultName.value;
    }

    let originalCases: Case[] = [];
    if (getType(settings.originalNode) === Types.wait_for_menu) {
        originalCases = (settings.originalNode.node.router as SwitchRouter).cases;
    }

    const caseProps = menuToCases(state.menu, originalCases);
    const { cases, exits, defaultExit } = resolveExits(caseProps, false, settings);

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        operand: '@input',
        default_exit_uuid: defaultExit,
        cases,
        ...optionalRouter
    };

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.wait_for_response,
        [],
        { type: WaitTypes.msg, hint: { type: HintTypes.digits, count: 1 } }
    );

    return newRenderNode;
};

export const menuToCases = (menu: string[] = [], previousCases: Case[]): CaseProps[] =>
    menu
        .map((exitName: string, index: number) => {
            const idx = index === 9 ? 0 : index + 1;

            const kase =
                previousCases.find((c: Case) => c.arguments[0] === '' + idx) ||
                ({
                    uuid: createUUID(),
                    arguments: ['' + idx],
                    type: Operators.has_number_eq,
                    exit_uuid: ''
                } as Case);

            return {
                uuid: kase.uuid,
                kase,
                exitName,
                valid: true
            };
        })
        .filter((caseProps: CaseProps) => caseProps.exitName.trim().length > 0);
