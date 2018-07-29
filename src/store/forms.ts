import mutate from 'immutability-helper';
import { NodeEditorForm } from '~/store/nodeEditor';

export const mutateForm = (
    form: NodeEditorForm,
    toMerge: Partial<NodeEditorForm>,
    toRemove: string[] = []
): NodeEditorForm => {
    const updated = mutate(form || {}, { $merge: toMerge, $unset: toRemove }) as NodeEditorForm;
    let valid = true;
    for (const key of Object.keys(updated)) {
        const entry: any = updated[key];
        if (entry && typeof entry === 'object') {
            if (entry.validationFailures && entry.validationFailures.length > 0) {
                valid = false;
                break;
            }
        }
    }

    // only set this if we found errors
    return mutate(updated, { $merge: { valid } }) as NodeEditorForm;
};
