import { Helmet } from 'react-helmet-async';

import { CampaignListView } from 'src/sections/campaign/view';
// ----------------------------------------------------------------------

export default function CampaignListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Campaign List</title>
      </Helmet>

      <CampaignListView />
    </>
  );
}
