import { getRecipients } from '~/components/flow/actions/helpers';
import { Types } from '~/config/typeConfigs';
import { StartSession } from '~/flowTypes';
import { Asset, AssetType } from '~/services/AssetService';
import { NodeEditorSettings, StartSessionFormState } from '~/store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): StartSessionFormState => {
    if (settings.originalAction && settings.originalAction.type === Types.start_session) {
        const action = settings.originalAction as StartSession;
        return {
            recipients: { value: getRecipients(action) },
            flow: {
                value: { id: action.flow.uuid, name: action.flow.name, type: AssetType.Flow }
            },
            valid: true
        };
    }

    return {
        recipients: { value: [] },
        flow: { value: null },
        valid: false
    };
};

export const stateToAction = (uuid: string, form: StartSessionFormState): StartSession => {
    const flow: Asset = form.flow.value;

    return {
        contacts: this.getRecipients(form.recipients.value, AssetType.Contact),
        groups: this.getRecipients(form.recipients.value, AssetType.Group),
        flow: { name: flow.name, uuid: flow.id },
        type: Types.start_session,
        uuid
    };
};
