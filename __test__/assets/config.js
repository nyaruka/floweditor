const config = {
    flow: 'boring',
    languages: {
        eng: 'English',
        spa: 'Spanish',
        fre: 'French'
    }
};

module.exports =
    process.env.NODE_ENV === 'production'
        ? Object.assign({}, config, {
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
              endpoints: {
                  flows: '/assets/flows.json',
                  groups: '/assets/groups.json',
                  contacts: '/assets/contacts.json',
                  fields: '/assets/fields.json',
                  activity: '',
                  engine: ''
              }
          });
