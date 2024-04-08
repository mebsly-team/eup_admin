import { Helmet } from 'react-helmet-async';

import { UserCreateView } from 'src/sections/employee/view';

// ----------------------------------------------------------------------

export default function UserCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new employee</title>
      </Helmet>

      <UserCreateView />
    </>
  );
}
