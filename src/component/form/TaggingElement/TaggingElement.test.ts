import { composeComponentTestUtils } from '../../../testUtils';
import TaggingElement, { TaggingElementProps } from './TaggingElement';

const taggingElementProps: TaggingElementProps = {
    tags: ['Red', 'Green', 'Blue'],
    prompt: 'Enter a Color',
    name: 'Color',
    required: true,
    onValidPrompt: jest.fn(),
    onCheckValid: jest.fn()
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
            expect(text).toContain('×Red');
            expect(text).toContain('×Green');
            expect(text).toContain('×Blue');
            expect(text).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        it('should handle updating tags', () => {
            const { wrapper, instance } = setup();
            instance.handleUpdateTags({ tags: [{ label: 'Purple', value: 'Purple' }] });
            expect(instance.state.tags).toEqual({ tags: [{ label: 'Purple', value: 'Purple' }] });
        });

        it('should call prop for valid prompt', () => {
            const { wrapper, instance, props } = setup(true, {
                $merge: { onValidPrompt: jest.fn() }
            });
            instance.handleValidPrompt('My New Tag');
            expect(props.onValidPrompt).toBeCalledWith('My New Tag');
        });

        it('should validate', () => {
            const { instance } = setup();
            instance.validate();
            expect(instance.state.errors.length).toEqual(0);
        });

        it('should check required', () => {
            const { instance } = setup(true, { $merge: { tags: [] } });
            instance.validate();
            expect(instance.state.errors).toEqual(['Color is required']);
        });
    });
});
