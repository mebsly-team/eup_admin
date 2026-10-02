import { Helmet } from 'react-helmet-async';

import { CampaignListView } from 'src/sections/campaign/view';
// ----------------------------------------------------------------------

export default function CampaignListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Acties</title>
      </Helmet>

      <CampaignListView />
    </>
  );
}
