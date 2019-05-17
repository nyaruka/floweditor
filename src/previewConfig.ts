export const getConfig = () => {
  return {
    debug: true,
    flow: "a4f64f1b-85bc-477e-b706-de313a022979",
    flowType: "M",
    localStorage: true,
    showDownload: true,
    showTemplates: true,
    endpoints: {
      attachments: "",
      functions: "functions",
      resthooks: "resthooks",
      flows: "flows",
      groups: "groups",
      recipients: "recipients",
      revisions: "revisions",
      fields: "fields",
      labels: "labels",
      languages: "languages",
      channels: "channels",
      environment: "environment",
      templates: "templates",
      activity: "",
      simulateStart: "/flow/start",
      simulateResume: "/flow/resume"
    }
  };
};
