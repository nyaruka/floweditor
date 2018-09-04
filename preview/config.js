const config = {
    debug: true,
    flow: 'a4f64f1b-85bc-477e-b706-de313a022979'
};

if (process.env.RAPID_FLOW) {
    // our base url includes our org and thumbprint for the asset server
    const base = '/flow/assets/' + process.env.RAPID_ORG + '/' + new Date().getTime() + '/';
    module.exports = Object.assign({}, config, {
        flow: process.env.RAPID_FLOW,
        localStorage: true,
        endpoints: {
            flows: base + 'flow',
            groups: base + 'group',
            recipients: '/contact/omnibox?types=gcu',
            fields: base + 'field',
            labels: base + 'label',
            languages: base + 'language',
            channels: base + 'channel',
            environment: base + 'environment',
            activity: '',
            simulateStart: '/flow/start',
            simulateResume: '/flow/resume'
        }
    });
} else {
    module.exports =
        process.env.NODE_ENV === 'preview'
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
                      simulateStart: 'https://goflow.nyaruka.com/flow/start',
                      simulateResume: 'https://goflow.nyaruka.com/flow/resume'
                  }
              })
            : Object.assign({}, config, {
                  localStorage: true,
                  endpoints: {
                      flows: '/assets/flow',
                      groups: '/assets/group',
                      recipients: '/assets/recipient',
                      fields: '/assets/field',
                      labels: '/assets/label',
                      languages: '/assets/language',
                      channels: '/assets/channel',
                      environment: '/assets/environment',
                      activity: '',
                      simulateStart: '/flow/start',
                      simulateResume: '/flow/resume'
                  }
              });
}
