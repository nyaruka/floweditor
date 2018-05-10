import { DispatchWithState, GetState } from '.';
import { SendBroadcastFormState, StartSessionFormState, updateForm } from './nodeEditor';
import { Thunk } from './thunks';

const mutate = require('immutability-helper');

export type SendBroadcastFunc = (
    updated: Partial<SendBroadcastFormState>
) => Thunk<SendBroadcastFormState>;

export const updateSendBroadcastForm: SendBroadcastFunc = (
    updated: Partial<SendBroadcastFormState>
) => (dispatch: DispatchWithState, getState: GetState): SendBroadcastFormState => {
    const { nodeEditor: { form } } = getState();
    const updatedForm = mutate(form || {}, { $merge: updated });
    dispatch(updateForm(updatedForm));
    return updatedForm;
};

export type StartSessionFunc = (
    updated: Partial<StartSessionFormState>
) => Thunk<StartSessionFormState>;

export const updateStartSessionForm: StartSessionFunc = (
    updated: Partial<StartSessionFormState>
) => (dispatch: DispatchWithState, getState: GetState): StartSessionFormState => {
    const { nodeEditor: { form } } = getState();
    const updatedForm = mutate(form || {}, { $merge: updated });
    dispatch(updateForm(updatedForm));
    return updatedForm;
};
