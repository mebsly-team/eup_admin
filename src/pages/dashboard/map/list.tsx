import { Helmet } from 'react-helmet-async';

import MapView from 'src/sections/map/map-list-view';

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Map</title>
      </Helmet>

      <MapView />
    </>
  );
}
