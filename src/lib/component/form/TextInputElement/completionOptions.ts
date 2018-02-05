import { CompletionOption } from '../../../services/ComponentMap';

export const OPTIONS: CompletionOption[] = [
    { name: 'contact', description: 'The name of the contact.' },
    { name: 'contact.name', description: 'The name of the contact.' },
    {
        name: 'contact.language',
        description: 'The language code for the contact.'
    },
    { name: 'contact.fields', description: 'Custom fields on the contact.' },
    { name: 'contact.groups', description: 'The groups for the contact.' },
    { name: 'contact.urns', description: 'URNs on the contact.' },
    {
        name: 'contact.urns.tel',
        description: 'The preferred telephone number for the contact.'
    },
    {
        name: 'contact.urns.telegram',
        description: 'The preferred telegram id for the contact.'
    },
    { name: 'input', description: 'The last input from the contact if any.' },
    { name: 'run', description: 'Run details' },
    { name: 'run.contact', description: 'The contact in this run' },
    { name: 'run.results', description: 'Results for the run' },
    { name: 'child', description: 'Run details after running a child flow' },
    { name: 'child.results', description: 'The results for the child flow' },
    {
        name: 'parent',
        description: 'Run details if being called from a parent flow'
    },
    { name: 'parent.results', description: 'The results for the parent flow' },
    { name: 'webhook', description: 'The body of the webhook response' },
    { name: 'webhook.status', description: 'The status of the webhook call' },
    {
        name: 'webhook.status_code',
        description: 'The status code returned from the webhook'
    },
    { name: 'webhook.url', description: 'The URL which was called' },
    { name: 'webhook.body', description: 'The body of the webhook response' },
    {
        name: 'webhook.json',
        description:
            'The JSON parsed body of the response, can access subelements'
    },
    {
        name: 'webhook.request',
        description: 'The raw request of the webhook including headers'
    },
    {
        name: 'webhook.response',
        description: 'The raw response of the webhook including headers'
    }
];
