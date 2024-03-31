import { Helmet } from 'react-helmet-async';

import { CampaignCreateView } from 'src/sections/campaign/view';

// ----------------------------------------------------------------------

export default function CampaignCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new brand</title>
      </Helmet>

      <CampaignCreateView />
    </>
  );
}
