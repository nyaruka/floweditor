// TODO: Remove use of Function
// tslint:disable:ban-types
import * as React from 'react';
import { connect } from 'react-redux';

import { fakePropType } from '../../config/ConfigProvider';
import { Operators } from '../../config/operatorConfigs';
import { Case, FlowNode, SwitchRouter } from '../../flowTypes';
import { Asset, AssetType } from '../../services/AssetService';
import { AppState } from '../../store';
import GroupsElement, { GroupsElementProps } from '../form/GroupsElement';
import { GetResultNameField } from '../NodeEditor';
import { hasSwitchRouter, SaveLocalizations } from '../NodeEditor/NodeEditor';
import { GROUP_LABEL } from './constants';
import * as styles from './SwitchRouter.scss';

// import { endpointsPT } from '../../config';
export interface GroupsRouterStoreProps {
    translating: boolean;
    nodeToEdit: FlowNode;
}

export interface GroupsRouterPassedProps {
    saveLocalizations: SaveLocalizations;
    updateRouter: Function;
    getExitTranslations(): JSX.Element;
    getResultNameField: GetResultNameField;
    onBindWidget(ref: any): void;
}

export type GroupsRouterProps = GroupsRouterStoreProps & GroupsRouterPassedProps;

export const extractGroups = ({ exits, router }: FlowNode): Asset[] =>
    (router as SwitchRouter).cases.map(kase => {
        let resultName = '';
        for (const { name, uuid } of exits) {
            if (uuid === kase.exit_uuid) {
                resultName += name;
                break;
            }
        }
        return { name: resultName, id: kase.arguments[0], type: AssetType.Group };
    });

// TODO: can nodeToEdit be a RenderNode?
export const hasGroupsRouter = (node: FlowNode) => {
    let groupCase = null;
    if (node.router) {
        groupCase = (node.router as SwitchRouter).cases.find(
            (kase: Case) => kase.type === Operators.has_group
        );
    }
    return hasSwitchRouter(node) && groupCase;
};

export class GroupsRouter extends React.Component<GroupsRouterProps> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
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

        const groupProps: Partial<GroupsElementProps> = {};
        if (hasGroupsRouter(this.props.nodeToEdit)) {
            groupProps.groups = extractGroups(this.props.nodeToEdit);
        }

        const nameField: JSX.Element = this.props.getResultNameField();

        return (
            <React.Fragment>
                <div className={styles.instructions}>
                    <p>{GROUP_LABEL}</p>
                    <GroupsElement
                        ref={this.props.onBindWidget}
                        name="Groups"
                        assets={this.context.assetService.getGroupAssets()}
                        add={false}
                        // required={true}
                        {...groupProps}
                    />
                </div>
                {nameField}
            </React.Fragment>
        );
    }
}

const mapStateToProps = ({
    flowEditor: { editorUI: { translating } },
    nodeEditor: { nodeToEdit }
}: AppState) => ({
    translating,
    nodeToEdit
});

const ConnectedGroupsRouterForm = connect(mapStateToProps, null, null, { withRef: true })(
    GroupsRouter
);

export default ConnectedGroupsRouterForm;
