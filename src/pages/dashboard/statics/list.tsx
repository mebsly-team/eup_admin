import { Helmet } from 'react-helmet-async';

import { StaticsView } from 'src/sections/statics/view';

// ----------------------------------------------------------------------

export default function StaticsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Websiteteksten</title>
      </Helmet>

      <StaticsView />
    </>
  );
}
