const config = {
    debug: true,
    flow: 'a4f64f1b-85bc-477e-b706-de313a022979'
};

if (process.env.RAPID_FLOW) {
    // our base url includes our org and thumbprint for the asset server
    const base = '/flow/assets/' + process.env.RAPID_ORG + '/' + new Date().getTime() + '/';
    const api = '/api/v2/';

    module.exports = Object.assign({}, config, {
        flow: process.env.RAPID_FLOW,
        flowType: process.env.RAPID_FLOW_TYPE,
        localStorage: true,
        showDownload: true,
        showTemplates: true,
        endpoints: {
            simulateStart: '/flow/simulate/' + process.env.RAPID_ORG + '/',
            simulateResume: '/flow/simulate/' + process.env.RAPID_ORG + '/',
            attachments: '/flow/upload_media_action/' + process.env.RAPID_ORG + '/',
            recipients: '/contact/omnibox?types=gcu',

            functions: '/mr/docs/functions.json',
            groups: api + 'groups.json',
            fields: api + 'fields.json',
            labels: api + 'labels.json',
            channels: api + 'channels.json',
            templates: api + 'templates.json',

            // flow asset server
            // TODO: migrate to API?
            resthooks: api + 'resthooks.json',
            revisions: '/flow/revisions/' + process.env.RAPID_FLOW + '/',
            flows: base + 'flow',
            languages: base + 'language',
            environment: base + 'environment',
            activity: '/flow/activity/' + process.env.RAPID_FLOW + '/'
        }
    });
} else {
    module.exports =
        process.env.NODE_ENV === 'preview'
            ? Object.assign({}, config, {
                  localStorage: true,
                  showDownload: true,
                  showTemplates: true,
                  flowType: 'M',
                  endpoints: {
                      attachments: '',
                      functions: 'functions',
                      resthooks: 'resthooks',
                      flows: 'flows',
                      groups: 'groups',
                      recipients: 'recipients',
                      revisions: 'revisions',
                      fields: 'fields',
                      labels: 'labels',
                      languages: 'languages',
                      channels: 'channels',
                      environment: 'environment',
                      templates: 'templates',
                      activity: '',
                      simulateStart: 'https://goflow.nyaruka.com/flow/start',
                      simulateResume: 'https://goflow.nyaruka.com/flow/resume'
                  }
              })
            : Object.assign({}, config, {
                  localStorage: true,
                  showDownload: true,
                  showTemplates: true,
                  endpoints: {
                      attachments: '/',
                      functions: '/mr/docs/functions',
                      resthooks: '/assets/resthooks',
                      flows: '/assets/flow',
                      groups: '/assets/group',
                      recipients: '/assets/recipient',
                      revisions: '/assets/revision',
                      fields: '/assets/field',
                      labels: '/assets/label',
                      languages: '/assets/language',
                      channels: '/assets/channel',
                      environment: '/assets/environment',
                      templates: '/assets/template',
                      activity: '',
                      simulateStart: '/flow/simulate/1/',
                      simulateResume: '/flow/simulate/1/'
                  }
              });
}
