import * as React from 'react';
import { connect } from 'react-redux';
import { endpointsPT } from '../../config';
import { Node, SwitchRouter, WaitType } from '../../flowTypes';
import { ReduxState, SearchResult } from '../../redux';
import GroupsElement, { GroupsElementProps } from '../form/GroupsElement';
import { GetResultNameField } from '../NodeEditor';
import { hasSwitchRouter, hasWait, SaveLocalizations } from '../NodeEditor/NodeEditor';
import { GROUP_LABEL } from './constants';
import { instructions } from './SwitchRouter.scss';

export interface GroupsRouterProps {
    translating: boolean;
    groups: SearchResult[];
    nodeToEdit: Node;
    saveLocalizations: SaveLocalizations;
    updateRouter: Function;
    getExitTranslations(): JSX.Element;
    getResultNameField: GetResultNameField;
    onBindWidget(ref: any): void;
}

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

export class GroupsRouter extends React.PureComponent<GroupsRouterProps> {
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

        const groupProps: Partial<GroupsElementProps> = {
            localGroups: this.props.groups
        };

        console.log('nodeToEdit:', this.props.nodeToEdit);

        if (groupSplitExistsAtNode(this.props.nodeToEdit)) {
            groupProps.groups = extractGroups(this.props.nodeToEdit);
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

const mapStateToProps = ({ translating, groups, nodeToEdit }: ReduxState) => ({
    translating,
    groups,
    nodeToEdit
});

const ConnectedGroupsRouterForm = connect(mapStateToProps, null, null, { withRef: true })(
    GroupsRouter
);

export default ConnectedGroupsRouterForm;
