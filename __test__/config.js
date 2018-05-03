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
              localStorage: true,
              endpoints: {
                  flows: 'flows',
                  groups: 'groups',
                  recipients: 'recipients',
                  fields: 'fields',
                  activity: '',
                  simulateStart: '',
                  simulateResume: ''
              }
          })
        : Object.assign({}, config, {
              localStorage: true,
              endpoints: {
                  flows: '/assets/flows.json',
                  groups: '/assets/groups.json',
                  fields: '/assets/fields.json',
                  recipients: '/assets/recipients.json',
                  activity: '',
                  simulateStart: '',
                  simulateResume: ''
              }
          });
