import { Types } from 'config/interfaces';
import { RequestOptIn } from 'flowTypes';
import { createUUID } from 'utils';
import { initializeForm, stateToAction } from './helpers';

describe('RequestOptIn.helpers', () => {
  describe('stateToAction', () => {
    it('should preserve existing UUID when editing', () => {
      const existingUuid = createUUID();
      const existingAction: RequestOptIn = {
        type: Types.request_optin,
        uuid: existingUuid,
        optin: {
          uuid: createUUID(),
          name: 'Existing Optin'
        }
      };

      const settings = {
        originalAction: existingAction
      };

      const formState = {
        optin: { value: { uuid: createUUID(), name: 'Updated Optin' } },
        valid: true
      };

      const result = stateToAction(settings, formState);
      
      // Should preserve the existing UUID when editing
      expect(result.uuid).toBe(existingUuid);
      expect(result.type).toBe(Types.request_optin);
      expect(result.optin).toBe(formState.optin.value);
    });

    it('should generate new UUID when creating new action', () => {
      const settings = {}; // No original action

      const formState = {
        optin: { value: { uuid: createUUID(), name: 'New Optin' } },
        valid: true
      };

      const result = stateToAction(settings, formState);
      
      // Should generate a new UUID for new actions
      expect(result.uuid).toBeDefined();
      expect(result.uuid).toMatch(/^[a-f0-9-]{36}$/); // UUID format
      expect(result.type).toBe(Types.request_optin);
      expect(result.optin).toBe(formState.optin.value);
    });
  });

  describe('initializeForm', () => {
    it('should initialize form with existing action', () => {
      const existingAction: RequestOptIn = {
        type: Types.request_optin,
        uuid: createUUID(),
        optin: {
          uuid: createUUID(),
          name: 'Test Optin'
        }
      };

      const settings = {
        originalAction: existingAction
      };

      const result = initializeForm(settings);
      
      expect(result.optin.value).toBe(existingAction.optin);
      expect(result.valid).toBe(true);
    });

    it('should initialize empty form for new action', () => {
      const settings = {}; // No original action

      const result = initializeForm(settings);
      
      expect(result.optin.value).toBeNull();
      expect(result.valid).toBe(false);
    });
  });
});