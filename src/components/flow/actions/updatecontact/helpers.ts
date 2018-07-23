import { NAME_PROPERTY } from '~/components/flow/actions/updatecontact/UpdateContactForm';
import { Channel, Field, Language } from '~/flowTypes';
import { Asset, AssetType, removeAsset } from '~/services/AssetService';

export const sortFieldsAndProperties = (a: Asset, b: Asset): number => {
    // Name always goes first
    if (a === NAME_PROPERTY) {
        return -1;
    }

    if (b === NAME_PROPERTY) {
        return 1;
    }

    // go with alpha-sort for everthing else
    if (a.type === b.type) {
        return a.name.localeCompare(b.name);
    }

    // non-name non-fields go last
    if (a.type !== AssetType.Field) {
        return 1;
    }

    if (b.type !== AssetType.Field) {
        return -1;
    }

    return 0;
};

export const fieldToAsset = (field: Field = { key: '', name: '' }): Asset => ({
    id: field.key,
    name: field.name,
    type: AssetType.Field
});

export const assetToField = (asset: Asset): Field => ({
    key: asset.id,
    name: asset.name
});

export const assetToChannel = (asset: Asset): any => {
    if (asset.id === removeAsset.id) {
        return {};
    }

    return {
        uuid: asset.id,
        name: asset.name
    };
};

export const assetToLanguage = (asset: Asset): string => {
    if (asset.id === removeAsset.id) {
        return '';
    }
    return asset.id;
};

export const languageToAsset = ({ iso, name }: Language) => {
    console.log(iso);
    if (!iso || iso.length === 0) {
        return removeAsset;
    }

    return {
        id: iso,
        name,
        type: AssetType.Language
    };
};

export const channelToAsset = ({ uuid, name }: Channel) => {
    if (!uuid) {
        return removeAsset;
    }
    return {
        id: uuid,
        name,
        type: AssetType.Language
    };
};
