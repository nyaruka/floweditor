import { AddURNFormState } from 'components/flow/actions/addurn/AddURNForm';
import { getActionUUID } from 'components/flow/actions/helpers';
import { SelectOption } from 'components/form/select/SelectElement';
import { Types } from 'config/interfaces';
import { Scheme, SCHEMES } from 'config/typeConfigs';
import { AddURN } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';

export const getSchemeOptions = (): SelectOption[] => {
  return SCHEMES.map((scheme: Scheme) => {
    return schemeToSelectOption(scheme);
  });
};

export const getSchemeObject = (scheme: string): Scheme => {
  return SCHEMES.find((item: Scheme) => item.scheme === scheme)!;
};

export const getSchemeSelectOption = (scheme: string): SelectOption =>
  schemeToSelectOption(getSchemeObject(scheme));

export const schemeToSelectOption = (scheme: Scheme): SelectOption => {
  return { value: scheme.scheme, name: scheme.path };
};

export const initializeForm = (settings: NodeEditorSettings): AddURNFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.add_contact_urn) {
    const { scheme, path } = settings.originalAction as AddURN;

    return {
      scheme: { value: getSchemeSelectOption(scheme) },
      path: { value: path },
      valid: true
    };
  }

  return {
    scheme: { value: getSchemeSelectOption('tel') },
    path: { value: '' },
    valid: false
  };
};

export const stateToAction = (settings: NodeEditorSettings, formState: AddURNFormState): AddURN => {
  return {
    type: Types.add_contact_urn,
    uuid: getActionUUID(settings, Types.add_input_labels),
    scheme: formState.scheme.value.value,
    path: formState.path.value
  };
};
