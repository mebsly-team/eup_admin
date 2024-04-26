import { Helmet } from 'react-helmet-async';

import UserListView from 'src/sections/logs/logs-list-view';

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Logs</title>
      </Helmet>

      <UserListView />
    </>
  );
}
