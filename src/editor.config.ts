export interface Languages {
    [iso: string]: string;
}

export const flow: string = 'a4f64f1b-85bc-477e-b706-de313a022979';

export const languages: Languages = {
    eng: 'English',
    spa: 'Spanish'
};

export interface Endpoints {
    fields: string;
    groups: string;
    engine: string;
    contacts: string;
    flows: string;
    activity: string;
}

export const endpoints: Endpoints = {
    flows: '/assets/flows.json',
    groups: '/assets/groups.json',
    contacts: '/assets/contacts.json',
    fields: '/assets/fields.json',
    activity: '',
    engine: ''
};

export default {
    flow,
    languages,
    endpoints
};
