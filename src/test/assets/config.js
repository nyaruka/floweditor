const config = {
  flow: 'boring'
};

export const merged =
  process.env.NODE_ENV === 'preview'
    ? Object.assign({}, config, {
        localStorage: true,
        endpoints: {
          flows: 'flows',
          groups: 'groups',
          contacts: 'contacts',
          classifiers: 'classifiers',
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
          classifiers: '/assets/classifiers',
          fields: '/assets/fields',
          labels: '/assets/labels',
          environment: '/assets/environment',
          editor: 'editor',
          activity: '',
          engine: ''
        }
      });
