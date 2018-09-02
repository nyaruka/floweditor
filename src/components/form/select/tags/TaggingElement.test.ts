import TaggingElement, { TaggingElementProps } from '~/components/form/select/tags/TaggingElement';
import { composeComponentTestUtils } from '~/testUtils';

const taggingElementProps: TaggingElementProps = {
    entry: { value: ['Red', 'Green', 'Blue'] },
    prompt: 'Enter a Color',
    name: 'Color',
    onCheckValid: jest.fn(),
    onChange: jest.fn()
};
const { setup } = composeComponentTestUtils<TaggingElementProps>(
    TaggingElement,
    taggingElementProps
);

describe(TaggingElement.name, () => {
    describe('render', () => {
        it('should render self, children', () => {
            const { wrapper } = setup(false);

            const text = wrapper.text();
            expect(text).toContain('Red');
            expect(text).toContain('Green');
            expect(text).toContain('Blue');
            expect(text).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        it('should handle updating tags', () => {
            const { instance, props } = setup(true, { $merge: { onChange: jest.fn() } });
            instance.handleUpdateTags([{ label: 'Purple', value: 'Purple' }]);
            expect(props.onChange).toHaveBeenCalledWith(['Purple']);
        });

        it('should call prop for valid prompt', () => {
            const components = setup(true, {
                $merge: { onValidPrompt: jest.fn() }
            });

            const instance: TaggingElement = components.instance;
            const props: Partial<TaggingElementProps> = components.props;
            instance.handleCheckValid('My New Tag');
            expect(props.onCheckValid).toBeCalledWith('My New Tag');
        });
    });
});
