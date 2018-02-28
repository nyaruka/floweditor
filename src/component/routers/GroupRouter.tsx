import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { Node, SwitchRouter, WaitType } from '../../flowTypes';
import { SearchResult } from '../../services/ComponentMap';
import { endpointsPT } from '../../config';
import { FormProps } from '../NodeEditor/NodeEditor';
import GroupElement, { GroupElementProps } from '../form/GroupElement';
import { hasSwitchRouter, hasWait, resolveExits } from './SwitchRouter';
import TextInputElement from '../form/TextInputElement';
import { GROUP_LABEL, GROUPS_OPERAND } from './constants';
import { CaseElementProps } from '../form/CaseElement';
import { instructions } from './SwitchRouter.scss';

type GroupRouterProps = Partial<FormProps>;

export const extractGroups = ({ exits, router }: Node): SearchResult[] =>
    (router as SwitchRouter).cases.map(kase => {
        const resultName = exits.reduce((result, { name, uuid }) => {
            if (uuid === kase.exit_uuid) {
                result += name;
            }
            return result;
        }, '');
        return { name: resultName, id: kase.arguments[0] };
    });

export const groupSplitExistsAtNode = (node: Node) =>
    hasSwitchRouter(node) && hasWait(node, WaitType.group);

export const toCases = (groups: SearchResult[] = []): CaseElementProps[] =>
    groups.map(({ name, id }: SearchResult) => ({
        kase: {
            uuid: id,
            type: 'has_group',
            arguments: [id],
            exit_uuid: ''
        },
        exitName: name
    }));

export default class GroupRouter extends React.PureComponent<GroupRouterProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    public onValid(widgets: { [name: string]: any }): void {
        if (this.props.translating) {
            return this.props.saveLocalizations(widgets);
        } else {
            const { state: { groups } } = widgets.Group;

            const currentCases = toCases(groups);

            const { cases, exits, defaultExit } = resolveExits(currentCases, this.props.node);

            if (
                this.props.definition.localization &&
                Object.keys(this.props.definition.localization).length
            ) {
                this.props.cleanUpLocalizations(currentCases);
            }

            const router: Partial<SwitchRouter> = {
                type: 'switch',
                cases,
                default_exit_uuid: defaultExit,
                operand: GROUPS_OPERAND,
                result_name: ''
            };

            const updates: Partial<Node> = {
                uuid: this.props.node.uuid,
                exits,
                wait: {
                    type: WaitType.group
                }
            };

            const resultNameEle = widgets['Result Name'];

            if (resultNameEle) {
                router.result_name += resultNameEle.state.value;
            }

            this.props.updateRouter(
                { ...updates, router } as Node,
                'split_by_group',
                this.props.action
            );
        }
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        }

        const localGroups = this.props.ComponentMap.getGroups();

        const groupProps: Partial<GroupElementProps> = {
            localGroups
        };

        if (groupSplitExistsAtNode(this.props.node)) {
            groupProps.groups = extractGroups(this.props.node);
        }

        const nameField: JSX.Element = this.props.getResultNameField();

        return (
            <React.Fragment>
                <div className={instructions}>
                    <p>{GROUP_LABEL}</p>
                    <GroupElement
                        ref={this.props.onBindWidget}
                        name="Group"
                        endpoint={this.context.endpoints.groups}
                        add={false}
                        required={true}
                        {...groupProps}
                    />
                </div>
                {nameField}
            </React.Fragment>
        );
    }
}
