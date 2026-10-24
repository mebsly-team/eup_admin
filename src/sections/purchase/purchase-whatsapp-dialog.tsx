import axiosInstance from 'src/utils/axios';

import WhatsAppShareDialog, {
  countryCallingCode,
  WhatsAppShareMethod,
} from 'src/components/whatsapp-share';

import { IPurchaseItem } from 'src/types/purchase';

// ----------------------------------------------------------------------

type Props = {
  purchase: IPurchaseItem | null;
  onClose: VoidFunction;
  onShared?: (purchase: IPurchaseItem, method: WhatsAppShareMethod) => void;
};

/** Sends a bestel offerte PDF to the supplier over WhatsApp. */
export default function PurchaseWhatsAppDialog({ purchase, onClose, onShared }: Props) {
  const supplier = purchase?.supplier_detail;
  const greeting = supplier?.contact_person_name
    ? `Beste ${supplier.contact_person_name},`
    : 'Beste leverancier,';

  return (
    <WhatsAppShareDialog
      open={!!purchase}
      onClose={onClose}
      title={`Bestelling #${purchase?.id ?? ''} via WhatsApp${supplier ? ` – ${supplier.name}` : ''}`}
      filename={`bestelling_${purchase?.id ?? ''}.pdf`}
      message={`${greeting}\n\nIn de bijlage vindt u onze bestelling #${purchase?.id ?? ''}. Graag een bevestiging met de verwachte levertijd.\n\nMet vriendelijke groet,\nEuropower BV`}
      phones={[
        { label: 'Mobiel', value: supplier?.mobile_phone },
        { label: 'Contactpersoon', value: supplier?.contact_person_phone },
        { label: 'Telefoon', value: supplier?.phone },
      ]}
      defaultCountryCode={countryCallingCode(supplier?.supplier_country)}
      loadPdf={async () => {
        const response = await axiosInstance.get(`/purchases/${purchase?.id}/offer/`, {
          responseType: 'blob',
        });
        return response.data as Blob;
      }}
      onShared={(method) => purchase && onShared?.(purchase, method)}
    />
  );
}
