const config = {
    flow: 'a4f64f1b-85bc-477e-b706-de313a022979',
    languages: {
        eng: 'English',
        spa: 'Spanish'
    }
};

if (process.env.RAPID_FLOW) {
    // our base url includes our org and thumbprint for the asset server
    const base = '/flow/assets/' + process.env.RAPID_ORG + '/' + new Date().getTime() + '/';
    module.exports = Object.assign({}, config, {
        flow: process.env.RAPID_FLOW,
        localStorage: true,
        endpoints: {
            flows: base + 'flow/',
            groups: base + 'group/',
            recipients: '/contact/omnibox/',
            fields: base + 'field/',
            activity: '',
            simulateStart: '/flow/start',
            simulateResume: '/flow/resume'
        }
    });
} else {
    module.exports =
        process.env.NODE_ENV === 'preview'
            ? Object.assign({}, config, {
                  localStorage: false,
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
                      flows: '/assets/flow',
                      groups: '/assets/group',
                      recipients: '/assets/recipient',
                      fields: '/assets/field',
                      activity: '',
                      simulateStart: '/flow/start',
                      simulateResume: '/flow/resume'
                  }
              });
}
