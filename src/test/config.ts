import { FlowTypes } from 'config/interfaces';

export const config = {
  flow: "a4f64f1b-85bc-477e-b706-de313a022979"
};

export default (module.exports =
  process.env.NODE_ENV === "production"
    ? Object.assign({}, config, {
        localStorage: true,
        showDownload: true,
        flowType: FlowTypes.MESSAGE,
        endpoints: {
          resthooks: "resthooks",
          flows: "flows",
          groups: "groups",
          recipients: "recipients",
          fields: "fields",
          labels: "labels",
          languages: "languages",
          channels: "channels",
          environment: "environment",
          editor: "/flow/editor",
          activity: "",
          simulateStart: "",
          simulateResume: ""
        }
      })
    : Object.assign({}, config, {
        localStorage: true,
        showDownload: true,
        flowType: FlowTypes.MESSAGE,
        endpoints: {
          resthooks: "/assets/resthooks.json",
          flows: "/assets/flows.json",
          groups: "/assets/groups.json",
          fields: "/assets/fields.json",
          recipients: "/assets/recipients.json",
          labels: "/assets/labels.json",
          languages: "/assets/languages.json",
          channels: "/assets/channels.json",
          environment: "/assets/environment.json",
          revisions: "/assets/revisions.json",
          editor: "/flow/editor",
          activity: "",
          simulateStart: "",
          simulateResume: ""
        }
      }));
