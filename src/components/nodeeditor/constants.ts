export const DEFAULT_OPERAND = '@run.input';
export const GROUPS_OPERAND = '@contact.groups';
export const DEFAULT_BODY: string = `{
    "contact": @(to_json(contact.uuid)),
    "contact_urn": @(to_json(contact.urns)),
    "message": @(to_json(input.text)),
    "flow": @(to_json(run.flow.uuid)),
    "flow_name": @(to_json(run.flow.name))
}`;
