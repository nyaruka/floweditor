const config = {
    flow: 'a4f64f1b-85bc-477e-b706-de313a022979'
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
                  labels: 'labels',
                  languages: 'languages',
                  channels: 'channels',
                  environment: 'environment',
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
                  labels: '/assets/labels.json',
                  languages: '/assets/languages.json',
                  channels: '/assets/channels.json',
                  environment: '/assets/environment.json',
                  activity: '',
                  simulateStart: '',
                  simulateResume: ''
              }
          });
