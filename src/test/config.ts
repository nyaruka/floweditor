import { FlowTypes } from 'config/interfaces';
import { FlowEditorConfig } from 'flowTypes';

export const getFlowEditorConfig = (
  flowType: FlowTypes = FlowTypes.MESSAGING
): FlowEditorConfig => {
  let flowEditorConfig = config;
  flowEditorConfig.flowType = flowType;
  return flowEditorConfig;
};

const config: FlowEditorConfig = {
  flow: 'a4f64f1b-85bc-477e-b706-de313a022979',
  localStorage: true,
  showDownload: true,
  flowType: FlowTypes.MESSAGING,
  mutable: true,
  filters: ['whatsapp', 'airtime', 'resthook', 'classifier'],
  help: {},
  brand: 'RapidPro',
  endpoints: {
    resthooks: '/assets/resthooks.json',
    optins: '/assets/optins.json',
    flows: '/assets/flows.json',
    globals: '/assets/globals.json',
    groups: '/assets/groups.json',
    fields: '/assets/fields.json',
    recipients: '/assets/recipients.json',
    contacts: '/assets/recipients.json',
    labels: '/assets/labels.json',
    languages: '/assets/languages.json',
    channels: '/assets/channels.json',
    revisions: '/assets/revisions.json',
    classifiers: '/assets/classifiers.json',
    attachments: '/assets/attachments.json',
    recents: '/assets/recents.json',
    templates: '/assets/templates.json',
    users: '/assets/users.json',
    topics: '/assets/topics.json',
    editor: '/flow/editor',
    activity: '',
    simulateStart: '',
    simulateResume: ''
  },
  onChangeLanguage: (code: string, name: string) => {}
};

export default config;
