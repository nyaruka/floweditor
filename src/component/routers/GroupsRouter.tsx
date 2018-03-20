import * as React from 'react';
import { connect } from 'react-redux';
import { endpointsPT } from '../../config';
import { Node, SwitchRouter, WaitType } from '../../flowTypes';
import { AppState, SearchResult } from '../../store';
import GroupsElement, { GroupsElementProps } from '../form/GroupsElement';
import { GetResultNameField } from '../NodeEditor';
import { hasSwitchRouter, hasWait, SaveLocalizations } from '../NodeEditor/NodeEditor';
import { GROUP_LABEL } from './constants';
import { instructions } from './SwitchRouter.scss';

export interface GroupsRouterStoreProps {
    translating: boolean;
    groups: SearchResult[];
    nodeToEdit: Node;
}

export interface GroupsRouterPassedProps {
    saveLocalizations: SaveLocalizations;
    updateRouter: Function;
    getExitTranslations(): JSX.Element;
    getResultNameField: GetResultNameField;
    onBindWidget(ref: any): void;
}

export type GroupsRouterProps = GroupsRouterStoreProps & GroupsRouterPassedProps;

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

const mapStateToProps = ({
    flowContext: { groups },
    flowEditor: { editorUI: { translating } },
    nodeEditor: { nodeToEdit }
}: AppState) => ({
    translating,
    groups,
    nodeToEdit
});

const ConnectedGroupsRouterForm = connect(mapStateToProps, null, null, { withRef: true })(
    GroupsRouter
);

export default ConnectedGroupsRouterForm;
