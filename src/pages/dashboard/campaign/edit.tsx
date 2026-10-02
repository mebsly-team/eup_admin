import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CampaignEditView } from 'src/sections/campaign/view';
// ----------------------------------------------------------------------

export default function CampaignEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Actie bewerken</title>
      </Helmet>

      <CampaignEditView id={`${id}`} />
    </>
  );
}
