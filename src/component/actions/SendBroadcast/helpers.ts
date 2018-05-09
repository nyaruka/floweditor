import { BroadcastMsg, Contact, Group } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';

export const getRecipients = (action: BroadcastMsg): Asset[] => {
    const selected = action.groups.map((group: Group) => {
        return { id: group.uuid, name: group.name, type: AssetType.Group };
    });

    return selected.concat(
        action.contacts.map((contact: Contact) => {
            return { id: contact.uuid, name: contact.name, type: AssetType.Contact };
        })
    );
};
