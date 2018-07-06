// TODO: Remove use of Function
// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { GROUP_LABEL } from '~/components/flow/routers/constants';
import GroupsElement, { GroupsElementProps } from '~/components/form/select/groups/GroupsElement';
import {
    GetResultNameField,
    hasSwitchRouter,
    SaveLocalizations
} from '~/components/nodeeditor/NodeEditor';
import { fakePropType } from '~/config/ConfigProvider';
import { Operators } from '~/config/operatorConfigs';
import { Case, FlowNode, SwitchRouter } from '~/flowTypes';
import { Asset, AssetType } from '~/services/AssetService';
import { AppState } from '~/store';
import { NodeEditorSettings } from '~/store/nodeEditor';

import * as styles from '../SwitchRouter.scss';

export interface GroupsRouterStoreProps {
    translating: boolean;
    settings: NodeEditorSettings;
}

export interface GroupsRouterPassedProps {
    saveLocalizations: SaveLocalizations;
    updateRouter(groups: Asset[]): void;
    getExitTranslations(): JSX.Element;
    getResultNameField: GetResultNameField;
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
        const switchRouter = node.router as SwitchRouter;
        if (switchRouter.cases) {
            groupCase = switchRouter.cases.find((kase: Case) => kase.type === Operators.has_group);
        }
    }
    return hasSwitchRouter(node) && groupCase;
};

// TODO: Temporary, need for based routers
export interface TempGroupState {
    groups: Asset[];
}

export class GroupsRouter extends React.Component<GroupsRouterProps, TempGroupState> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: GroupsRouterProps) {
        super(props);
        this.state = {
            groups: []
        };

        bindCallbacks(this, {
            include: [/^handle/, /^on/]
        });
    }

    public onValid(widgets: { [name: string]: any }): void {
        if (this.props.translating) {
            return this.props.saveLocalizations(widgets);
        } else {
            this.props.updateRouter(this.state.groups);
        }
    }

    public validate(): boolean {
        return this.state.groups.length > 0;
    }

    public handleUpdateGroups(groups: Asset[]): boolean {
        this.setState({ groups });
        return groups.length > 0;
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        }

        const groupProps: Partial<GroupsElementProps> = {};
        if (hasGroupsRouter(this.props.settings.originalNode)) {
            groupProps.entry = { value: extractGroups(this.props.settings.originalNode) };
        }

        const nameField: JSX.Element = this.props.getResultNameField();

        return (
            <React.Fragment>
                <div className={styles.instructions}>
                    <p>{GROUP_LABEL}</p>
                    <GroupsElement
                        name="Groups"
                        assets={this.context.assetService.getGroupAssets()}
                        add={false}
                        onChange={this.handleUpdateGroups}
                        {...groupProps}
                    />
                </div>
                {nameField}
            </React.Fragment>
        );
    }
}

const mapStateToProps = ({
    flowEditor: {
        editorUI: { translating }
    },
    nodeEditor: { settings }
}: AppState) => ({
    translating,
    settings
});

const ConnectedGroupsRouterForm = connect(
    mapStateToProps,
    null,
    null,
    { withRef: true }
)(GroupsRouter);

export default ConnectedGroupsRouterForm;
