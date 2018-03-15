import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { Node, SwitchRouter, WaitType } from '../../flowTypes';
import { SearchResult } from '../../services/ComponentMap';
import { endpointsPT } from '../../config';
import { FormProps, hasSwitchRouter, hasWait, resolveExits } from '../NodeEditor/NodeEditor';
import GroupsElement, { GroupsElementProps } from '../form/GroupsElement';
import TextInputElement from '../form/TextInputElement';
import { GROUP_LABEL } from './constants';
import { CaseElementProps } from '../form/CaseElement';
import { instructions } from './SwitchRouter.scss';

type GroupsRouterProps = Partial<FormProps>;

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

export default class GroupsRouter extends React.PureComponent<GroupsRouterProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    public onValid(widgets: { [name: string]: any }): void {
        if (this.props.translating) {
            return this.props.saveLocalizations(widgets);
        } else {
            this.props.updateRouter();
        }
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        }

        const localGroups = this.props.ComponentMap.getGroups();

        const groupProps: Partial<GroupsElementProps> = {
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
                    <GroupsElement
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
