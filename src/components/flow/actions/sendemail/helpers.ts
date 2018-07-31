import { Types } from '~/config/typeConfigs';
import { SendEmail } from '~/flowTypes';
import { NodeEditorSettings } from '~/store/nodeEditor';

import { SendEmailFormState } from './SendEmailForm';

export const initializeForm = (settings: NodeEditorSettings): SendEmailFormState => {
    if (settings.originalAction && settings.originalAction.type === Types.send_email) {
        const action = settings.originalAction as SendEmail;
        return {
            body: { value: action.body },
            subject: { value: action.subject },
            recipients: { value: action.addresses },
            valid: true
        };
    }

    return {
        body: { value: '' },
        subject: { value: '' },
        recipients: { value: [] },
        valid: true
    };
};

export const stateToAction = (actionUUID: string, formState: SendEmailFormState): SendEmail => {
    return {
        addresses: formState.recipients.value,
        subject: formState.subject.value,
        body: formState.body.value,
        type: Types.send_email,
        uuid: actionUUID
    };
};
