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
            flows: base + 'flow',
            groups: base + 'group',
            contacts: base + 'contact',
            fields: base + 'field',
            activity: '',
            simulateStart: base + 'flow',
            simulateResume: base + 'flow'
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
                      contacts: 'contacts',
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
                      contacts: '/assets/contact',
                      fields: '/assets/field',
                      activity: '',
                      simulateStart: '/flow/start',
                      simulateResume: '/flow/resume'
                  }
              });
}
