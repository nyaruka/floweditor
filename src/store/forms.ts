import mutate from 'immutability-helper';
import { AssetType } from '~/services/AssetService';

import { DispatchWithState, GetState } from '.';
import {
    AddLabelsFormState,
    AssetEntry,
    ChangeGroupsFormState,
    NodeEditorForm,
    SendBroadcastFormState,
    SendEmailFormState,
    SendMsgFormState,
    SetContactAttribFormState,
    SetRunResultFormState,
    StartSessionFormState,
    StringEntry,
    updateForm
} from './nodeEditor';
import { Thunk } from './thunks';

export type SendBroadcastFunc = (
    updated: Partial<SendBroadcastFormState>
) => Thunk<SendBroadcastFormState>;

export type StartSessionFunc = (
    updated: Partial<StartSessionFormState>
) => Thunk<StartSessionFormState>;

export type SetContactAttribFunc = (
    attribute?: AssetEntry,
    value?: StringEntry
) => Thunk<SetContactAttribFormState>;

export type SendMsgFunc = (updated: Partial<SendMsgFormState>) => Thunk<SendMsgFormState>;

export type SendEmailFunc = (updated: Partial<SendEmailFormState>) => Thunk<SendEmailFormState>;

export type ChangeGroupsFunc = (
    updated: Partial<ChangeGroupsFormState>
) => Thunk<ChangeGroupsFormState>;

export type SetRunResultFunc = (
    updated: Partial<SetRunResultFormState>
) => Thunk<SetRunResultFormState>;

export type AddLabelsFunc = (updated: Partial<AddLabelsFormState>) => Thunk<AddLabelsFormState>;

const assetTypes = Object.keys(AssetType).map(type => type);

const getKeysToRemove = (type: AssetType) => assetTypes.filter(assetType => assetType === type);

export const mutateForm = (
    form: NodeEditorForm,
    toMerge: Partial<NodeEditorForm>,
    toRemove: string[] = []
): NodeEditorForm => {
    let updated = mutate(form || {}, { $merge: toMerge, $unset: toRemove }) as NodeEditorForm;
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
    updated = mutate(updated, { $merge: { valid } }) as NodeEditorForm;

    return updated;
};

// To-do: consider the utility of composing these w/ a HOF, like composeComponentTestUtils
export const updateSendBroadcastForm: SendBroadcastFunc = updated => (
    dispatch,
    getState
): SendBroadcastFormState => {
    const {
        nodeEditor: { form }
    } = getState();
    const updatedForm = mutateForm(form, updated);
    dispatch(updateForm(updatedForm));
    return updatedForm as SendBroadcastFormState;
};

// Todo: make this less awful
export const updateSetContactAttribForm: SetContactAttribFunc = (
    attribute: AssetEntry,
    value = null
) => (dispatch, getState): SetContactAttribFormState => {
    const {
        nodeEditor: { form }
    } = getState();
    if (attribute) {
        let keyToUpdate: string;
        let keysToRemove;
        switch (attribute.value.type) {
            case AssetType.Field:
                keyToUpdate = attribute.value.type;
                keysToRemove = getKeysToRemove(AssetType.Name);
                break;
            case AssetType.Name:
                keyToUpdate = attribute.value.type;
                keysToRemove = getKeysToRemove(AssetType.Field);
                break;
            case AssetType.Language:
                keyToUpdate = attribute.value.type;
                keysToRemove = getKeysToRemove(AssetType.Language);
            case AssetType.Channel:
                keyToUpdate = attribute.value.type;
                keysToRemove = getKeysToRemove(AssetType.Channel);
        }
        const updatedForm = mutateForm(form, { [keyToUpdate]: attribute }, keysToRemove);
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
    const {
        nodeEditor: { form }
    } = getState();
    const updatedForm = mutateForm(form, updated);
    dispatch(updateForm(updatedForm));
    return updatedForm as StartSessionFormState;
};

export const updateSendMsgForm: SendMsgFunc = (updated: Partial<SendMsgFormState>) => (
    dispatch: DispatchWithState,
    getState: GetState
): SendMsgFormState => {
    const {
        nodeEditor: { form }
    } = getState();
    const updatedForm = mutateForm(form, updated);
    dispatch(updateForm(updatedForm));
    return updatedForm as SendMsgFormState;
};

export const updateAddLabelsForm: AddLabelsFunc = (updated: Partial<AddLabelsFormState>) => (
    dispatch: DispatchWithState,
    getState: GetState
): AddLabelsFormState => {
    const {
        nodeEditor: { form }
    } = getState();
    const updatedForm = mutateForm(form, updated);
    dispatch(updateForm(updatedForm));
    return updatedForm as AddLabelsFormState;
};

export const updateSendEmailForm: SendEmailFunc = (updated: Partial<SendEmailFormState>) => (
    dispatch: DispatchWithState,
    getState: GetState
): SendEmailFormState => {
    const {
        nodeEditor: { form }
    } = getState();
    const updatedForm = mutateForm(form, updated);
    dispatch(updateForm(updatedForm));
    return updatedForm as SendEmailFormState;
};

export const updateSetRunResultForm: SetRunResultFunc = (
    updated: Partial<SetRunResultFormState>
) => (dispatch: DispatchWithState, getState: GetState): SetRunResultFormState => {
    const {
        nodeEditor: { form }
    } = getState();
    const updatedForm = mutateForm(form, updated);
    dispatch(updateForm(updatedForm));
    return updatedForm as SetRunResultFormState;
};

export const updateChangeGroupsForm: ChangeGroupsFunc = (
    updated: Partial<ChangeGroupsFormState>
) => (dispatch: DispatchWithState, getState: GetState): ChangeGroupsFormState => {
    const {
        nodeEditor: { form }
    } = getState();
    const updatedForm = mutateForm(form, updated);
    dispatch(updateForm(updatedForm));
    return updatedForm as ChangeGroupsFormState;
};
