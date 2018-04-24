const config = {
    flow: 'a4f64f1b-85bc-477e-b706-de313a022979',
    languages: {
        eng: 'English',
        spa: 'Spanish',
        fre: 'French'
    }
};

module.exports =
    process.env.NODE_ENV === 'production'
        ? Object.assign({}, config, {
              localStorage: false,
              endpoints: {
                  flows: 'flows',
                  groups: 'groups',
                  contacts: 'contacts',
                  fields: 'fields',
                  activity: '',
                  engine: ''
              }
          })
        : Object.assign({}, config, {
              localStorage: true,
              endpoints: {
                  flows: '/assets/flows.json',
                  groups: '/assets/groups.json',
                  contacts: '/assets/contacts.json',
                  fields: '/assets/fields.json',
                  activity: '',
                  engine: 'http://localhost:9000'
              }
          });
