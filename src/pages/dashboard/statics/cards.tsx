import { Helmet } from 'react-helmet-async';

import { UserCardsView } from 'src/sections/employee/view';

// ----------------------------------------------------------------------

export default function UserCardsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: statics Cards</title>
      </Helmet>

      <UserCardsView />
    </>
  );
}
