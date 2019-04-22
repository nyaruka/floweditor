const config = {
    flow: 'boring'
};

module.exports =
    process.env.NODE_ENV === 'preview'
        ? Object.assign({}, config, {
              localStorage: true,
              endpoints: {
                  flows: 'flows',
                  groups: 'groups',
                  contacts: 'contacts',
                  fields: 'fields',
                  labels: 'labels',
                  environment: 'environment',
                  editor: 'editor',
                  activity: '',
                  engine: ''
              }
          })
        : Object.assign({}, config, {
              localStorage: true,
              endpoints: {
                  flows: '/assets/flows',
                  groups: '/assets/groups',
                  contacts: '/assets/contacts',
                  fields: '/assets/fields',
                  labels: '/assets/labels',
                  environment: '/assets/environment',
                  editor: 'editor',
                  activity: '',
                  engine: ''
              }
          });
