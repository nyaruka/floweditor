import { RevisionExplorer, RevisionExplorerProps } from '~/components/revisions/RevisionExplorer';
import { AssetType } from '~/store/flowContext';
import { composeComponentTestUtils } from '~/testUtils';

const baseProps: RevisionExplorerProps = {
    assetStore: {
        revisions: {
            id: 'id',
            endpoint: '/assets/revisions.json',
            type: AssetType.Revision,
            items: {}
        }
    },
    utc: true
};

const { setup } = composeComponentTestUtils(RevisionExplorer, baseProps);

describe(RevisionExplorer.name, () => {
    describe('render', () => {
        it('should render base component', async () => {
            const { wrapper, instance } = setup();

            await instance.handleUpdateRevisions();

            expect(wrapper).toMatchSnapshot();
        });
    });
});
