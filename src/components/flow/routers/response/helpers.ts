import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import {
    createCaseProps,
    createRenderNode,
    hasCases,
    resolveExits
} from '~/components/flow/routers/helpers';
import ResponseRouterForm, {
    ResponseRouterFormState
} from '~/components/flow/routers/response/ResponseRouterForm';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Types } from '~/config/typeConfigs';
import { Router, RouterTypes, SwitchRouter, Wait, WaitTypes } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

export const nodeToState = (
    settings: NodeEditorSettings,
    form: ResponseRouterForm
): ResponseRouterFormState => {
    let initialCases: CaseProps[] = [];

    // TODO: work out an incremental result name
    let resultName: StringEntry = { value: 'Result' };
    let timeout = 0;

    if (settings.originalNode && settings.originalNode.ui.type === Types.wait_for_response) {
        const router = settings.originalNode.node.router as SwitchRouter;
        if (router) {
            if (hasCases(settings.originalNode.node)) {
                initialCases = createCaseProps(router.cases, settings.originalNode.node.exits);
            }

            if (router.result_name) {
                resultName = { value: router.result_name };
            }
        }

        if (settings.originalNode.node.wait) {
            timeout = settings.originalNode.node.wait.timeout;
        }
    }

    return {
        cases: initialCases,
        resultName,
        timeout,
        valid: true
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: ResponseRouterFormState
): RenderNode => {
    const { cases, exits, defaultExit } = resolveExits(state.cases, state.timeout > 0, settings);

    const optionalRouter: Pick<Router, 'result_name'> = {};
    if (state.resultName.value) {
        optionalRouter.result_name = state.resultName.value;
    }

    // TODO: shouldnt have an operand
    const router: SwitchRouter = {
        type: RouterTypes.switch,
        default_exit_uuid: defaultExit,
        cases,
        operand: DEFAULT_OPERAND,
        ...optionalRouter
    };

    const wait = { type: WaitTypes.msg } as Wait;
    if (state.timeout > 0) {
        wait.timeout = state.timeout;
    }

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.wait_for_response,
        [],
        wait
    );

    return newRenderNode;
};

/*
    public getCasesForLocalization(): JSX.Element[] {
        return (this.props.nodeSettings.originalNode.node.router as SwitchRouter).cases.reduce(
            (casesForLocalization: JSX.Element[], kase) => {
                // only allow translations for cases with arguments that aren't numeric
                if (kase.arguments && kase.arguments.length > 0 && !/number/.test(kase.type)) {
                    const [localized] = this.props.nodeSettings.localizations.filter(
                        (localizedObject: LocalizedObject) =>
                            localizedObject.getObject().uuid === kase.uuid
                    );

                    if (localized) {
                        let value = '';
                        if ('arguments' in localized.localizedKeys) {
                            const localizedCase = localized.getObject() as Case;
                            if (localizedCase.arguments && localizedCase.arguments.length) {
                                [value] = localizedCase.arguments;
                            }
                        }

                        const { verboseName } = getOperatorConfig(kase.type);
                        const [argument] = kase.arguments;

                        casesForLocalization.push(
                            <div
                                key={`translate_${kase.uuid}`}
                                data-spec="operator-field"
                                className={styles.translating_operator_container}
                            >
                                <div
                                    data-spec="verbose-name"
                                    className={styles.translating_operator}
                                >
                                    {verboseName}
                                </div>
                                <div
                                    data-spec="argument-to-translate"
                                    className={styles.translating_from}
                                >
                                    {argument}
                                </div>
                                <div className={styles.translating_to}>
                                    <TextInputElement
                                        data-spec="translation-input"
                                        name={kase.uuid}
                                        placeholder={`${this.props.language.name} Translation`}
                                        showLabel={false}
                                        entry={{ value }}
                                    />
                                </div>
                            </div>
                        );
                    }
                }

                return casesForLocalization;
            },
            []
        );
    }
    */
