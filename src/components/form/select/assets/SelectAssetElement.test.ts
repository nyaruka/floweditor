import SelectAssetElement, {
    SelectAssetElementProps
} from '~/components/form/select/assets/SelectAssetElement';
import { composeComponentTestUtils, mock, setMock } from '~/testUtils';
import { ColorFlowAsset, SubscribersGroup } from '~/testUtils/assetCreators';
import * as utils from '~/utils';

const { setup } = composeComponentTestUtils<SelectAssetElementProps>(SelectAssetElement, {
    name: 'Flow',
    entry: { value: ColorFlowAsset },
    assets: null,
    searchable: true
});

mock(utils, 'createUUID', utils.seededUUIDs());

describe(SelectAssetElement.name, () => {
    it('renders', () => {
        const { wrapper } = setup();
        expect(wrapper).toMatchSnapshot();
    });

    it('handles updates', () => {
        const { instance, props } = setup(true, { onChange: setMock() });
        instance.handleChanged(SubscribersGroup);
        expect(props.onChange).toHaveBeenCalled();
        expect(instance.state).toMatchSnapshot();
    });

    it('can be configured to add options', () => {
        const { wrapper } = setup(true, { add: utils.setTrue() });
        expect(wrapper).toMatchSnapshot();
    });
});
