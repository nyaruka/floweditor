import mutate from 'immutability-helper';

import { Asset, AssetType } from '../services/AssetService';
import {
    NodeEditorForm,
    SendBroadcastFormState,
    SetContactAttribFormState,
    StartSessionFormState,
    updateForm
} from './nodeEditor';
import { Thunk } from './thunks';

export type SendBroadcastFunc = (
    updated: Partial<SendBroadcastFormState>
) => Thunk<SendBroadcastFormState>;

export type SetContactAttribFunc = (
    attribute?: Asset,
    value?: string
) => Thunk<SetContactAttribFormState>;

export type StartSessionFunc = (
    updated: Partial<StartSessionFormState>
) => Thunk<StartSessionFormState>;

export const mutateForm = (
    form: NodeEditorForm,
    toMerge: Partial<NodeEditorForm>,
    toRemove: string[] = []
): NodeEditorForm => mutate(form || {}, { $merge: toMerge, $unset: toRemove }) as NodeEditorForm;

// To-do: consider the utility of composing these w/ a HOF, like composeComponentTestUtils
export const updateSendBroadcastForm: SendBroadcastFunc = updated => (
    dispatch,
    getState
): SendBroadcastFormState => {
    const { nodeEditor: { form } } = getState();
    const updatedForm = mutateForm(form, updated);
    dispatch(updateForm(updatedForm));
    return updatedForm as SendBroadcastFormState;
};

// Todo: make this less awful
export const updateSetContactAttribForm: SetContactAttribFunc = (attribute, value = null) => (
    dispatch,
    getState
): SetContactAttribFormState => {
    const { nodeEditor: { form } } = getState();
    if (attribute) {
        let update: string;
        let remove: string;
        switch (attribute.type) {
            case AssetType.Field:
                update = attribute.type;
                remove = AssetType.Name;
                break;
            case AssetType.Name:
                update = attribute.type;
                remove = AssetType.Field;
                break;
        }
        const updatedForm = mutateForm(form, { [update]: attribute }, [remove]);
        dispatch(updateForm(updatedForm));
        return updatedForm as SetContactAttribFormState;
    } else if (value !== null) {
        const updatedForm = mutateForm(form, { value });
        dispatch(updateForm(updatedForm));
        return updatedForm as SetContactAttribFormState;
    }
};

export const updateStartSessionForm: StartSessionFunc = updated => (
    dispatch,
    getState
): StartSessionFormState => {
    const { nodeEditor: { form } } = getState();
    const updatedForm = mutateForm(form, updated);
    dispatch(updateForm(updatedForm));
    return updatedForm as StartSessionFormState;
};
