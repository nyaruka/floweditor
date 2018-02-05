enum ENV {
    prod = 'prod',
    dev = 'dev'
}

const endpoints: any = {
    activity: '',
    engine: ''
};

endpoints.flows = '/assets/flows.json';
endpoints.groups = '/assets/groups.json';
endpoints.contacts = '/assets/contacts.json';
endpoints.fields = '/assets/fields.json';

export default {
    flow: 'a4f64f1b-85bc-477e-b706-de313a022979',
    languages: {
        eng: 'English',
        spa: 'Spanish',
        fre: 'French'
    },
    endpoints
};
