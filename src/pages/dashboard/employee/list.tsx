import { Helmet } from 'react-helmet-async';

import { UserListView } from 'src/sections/employee/view';

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Employee List</title>
      </Helmet>

      <UserListView />
    </>
  );
}
