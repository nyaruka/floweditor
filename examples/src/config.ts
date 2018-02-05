enum ENV {
    prod = 'prod',
    dev = 'dev'
}

const endpoints: any = {
    flows: '/assets/flows.json',
    groups: '/assets/groups.json',
    contacts: '/assets/contacts.json',
    fields: '/assets/fields.json',
    activity: '',
    engine: ''
};

export default {
    flow: 'a4f64f1b-85bc-477e-b706-de313a022979',
    languages: {
        eng: 'English',
        spa: 'Spanish',
        fre: 'French'
    },
    endpoints
};
