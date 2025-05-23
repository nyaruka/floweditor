import * as React from 'react';

import { SetContactProfile } from 'flowTypes';

const ContactProfileRouter: React.SFC<SetContactProfile> = (
  action: SetContactProfile
): JSX.Element => {
  const { profile_type, value } = action;

  if (profile_type === 'Create Profile') {
    return (
      <div>
        Creating profile with <strong>name: {value.name}</strong> and{' '}
        <strong>type: {value.type}</strong>
      </div>
    );
  } else if (profile_type === 'Switch Profile') {
    return (
      <div>
        Switching profile to <strong>{value}</strong>
      </div>
    );
  } else if (profile_type === 'Deactivate Profile') {
    return (
      <div>
        Deactivating profile <strong>{value}</strong>
      </div>
    );
  }
  return <div>Manage profile</div>;
};

export default ContactProfileRouter;
