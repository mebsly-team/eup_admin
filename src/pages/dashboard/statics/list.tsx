import { Helmet } from 'react-helmet-async';

import { UserListView } from 'src/sections/statics/view';

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Statics</title>
      </Helmet>

      <UserListView />
    </>
  );
}
