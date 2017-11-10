import { Languages, Endpoints } from './services/EditorConfig';

export const flowUUID: string = 'a4f64f1b-85bc-477e-b706-de313a022979';

export const languages: Languages = {
    eng: 'English',
    spa: 'Spanish'
};

export const endpoints: Endpoints = {
    flows: '/assets/flows.json',
    groups: '/assets/groups.json',
    contacts: '/assets/contacts.json',
    fields: '/assets/fields.json',
    activity: '',
    engine: ''
};

const flowEditorConfig: FlowEditorConfig = {
    flow: flowUUID,
    languages,
    endpoints
};

export default flowEditorConfig;
