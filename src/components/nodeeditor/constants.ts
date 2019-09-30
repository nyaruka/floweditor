export const DEFAULT_OPERAND = '@input.text';
export const GROUPS_OPERAND = '@contact.groups';
export const WEBHOOK_OPERAND = '@run.webhook';
export const SUBFLOW_OPERAND = '@child.run.status';
export const MEDIA_OPERAND = '@input';
export const DIGITS_OPERAND = '@input.text';
export const MENU_OPERAND = '@input.text';

export const DEFAULT_BODY: string = `@(json(object(
  "contact", object(
    "uuid", contact.uuid, 
    "name", contact.name, 
    "urn", contact.urn
  ),
  "flow", object(
    "uuid", run.flow.uuid, 
    "name", run.flow.name
  ),
  "results", foreach_value(results, extract_object, "value", "category")
)))`;
