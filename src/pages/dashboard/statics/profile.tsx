import { Helmet } from 'react-helmet-async';

import { UserProfileView } from 'src/sections/employee/view';

// ----------------------------------------------------------------------

export default function UserProfilePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Statics</title>
      </Helmet>

      <UserProfileView />
    </>
  );
}
