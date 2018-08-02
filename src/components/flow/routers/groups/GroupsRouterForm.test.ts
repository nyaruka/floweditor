import GroupsRouter from '~/components/flow/routers/groups/GroupsRouterForm';
import { extractGroups } from '~/components/flow/routers/groups/helpers';
import { SwitchRouter } from '~/flowTypes';
import { composeComponentTestUtils } from '~/testUtils';
import { createGroupsRouterNode, getRouterFormProps } from '~/testUtils/assetCreators';

const groupsRouterNode = createGroupsRouterNode();
const { setup } = composeComponentTestUtils(GroupsRouter, getRouterFormProps(groupsRouterNode));

describe(GroupsRouter.name, () => {
    describe('render', () => {
        it('should render', () => {
            const { wrapper } = setup(true);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('helpers', () => {
        describe('extractGroups', () => {
            it('should extract groups from the exits of a groupsRouter node', () => {
                extractGroups(groupsRouterNode.node).forEach((group, idx) => {
                    expect(group.name).toBe(groupsRouterNode.node.exits[idx].name);
                    expect(group.id).toBe(
                        (groupsRouterNode.node.router as SwitchRouter).cases[idx].arguments[0]
                    );
                    expect(group).toMatchSnapshot();
                });
            });
        });
    });
});
