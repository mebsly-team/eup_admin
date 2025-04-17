import * as Yup from 'yup';
import moment from 'moment';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Divider, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import UserDetailsHistory from './user-details-history';
import { IUserItem } from 'src/types/user';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { COLORS } from 'src/constants/colors';

const SITE_SOURCE_OPTIONS = [
  { value: 'kooptop.com', label: 'kooptop.com' },
  { value: 'europowerbv.com', label: 'europowerbv.com' },
];

type Props = {
  currentUser?: IUserItem;
};

export default function UserNewEditForm({ currentUser }: Props) {
  const { t, onChangeLang } = useTranslate();

  const router = useRouter();
  const [isBusiness, setIsBusiness] = useState(
    !['particular', 'admin'].includes(currentUser?.type || 'particular')
  );
  const { enqueueSnackbar } = useSnackbar();

  const [openAddressForm, setOpenAddressForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [addressList, setAddressList] = useState(currentUser?.addresses || []);
  console.log("🚀 ~ UserNewEditForm ~ addressList:", addressList)

  type UserType = 'special' | 'wholesaler' | 'supermarket' | 'particular';

  const {
    control: controlAddressForm,
    handleSubmit: handleSubmitAddressForm,
    reset: resetAddressForm,
    setValue: setValueAddressForm,
    register,
    watch: watchAddress,
  } = useForm({
    defaultValues: {
      address_name: '',
      first_name: '',
      last_name: '',
      salutation: '',
      phone_number: '',
      street_name: '',
      house_number: '',
      house_suffix: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      addressType: '',
      customer_color: '',
    },
  });

  const NewUserSchema = Yup.object().shape({
    type: Yup.string().required(t('required')),
    relation_code: Yup.string().required(t('required')),
    first_name: !isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    last_name: !isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    password: currentUser ? Yup.string() : Yup.string().required(t('required')),
    email: Yup.string().required(t('required')).email(t('email_must_be_valid')),
    phone_number: isBusiness ? Yup.string()
      .required(t('phone_required'))
      .matches(/^[0-9]+$/, t('phone_number_must_be_numeric')) : Yup.string(),
    mobile_number: isBusiness ? Yup.string()
      .required(t('mobile_required'))
      .matches(/^[0-9]+$/, t('mobile_number_must_be_numeric')) : Yup.string(),
    birthdate: Yup.date()
      .required(t('birthdate_required'))
      .max(moment().subtract(18, 'years').toDate(), t('birthdate_must_be_before_18_years'))
      .nullable(),
    fax: Yup.string().nullable(),
    facebook: Yup.string().nullable().url(t('facebook_url_invalid')),
    linkedin: Yup.string().nullable().url(t('linkedin_url_invalid')),
    twitter: Yup.string().nullable().url(t('twitter_url_invalid')),
    instagram: Yup.string().nullable().url(t('instagram_url_invalid')),
    pinterest: Yup.string().nullable().url(t('pinterest_url_invalid')),
    tiktok: Yup.string().nullable().url(t('tiktok_url_invalid')),
    notes: Yup.string().nullable(),
    website: Yup.string().nullable().url(t('website_url_invalid')),
    is_active: Yup.boolean().required(),
    business_name: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    contact_person_name: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    contact_person_phone: isBusiness ? Yup.string()
      .required(t('required'))
      .matches(/^[0-9]+$/, t('contact_person_phone_number_must_be_numeric')) : Yup.string(),
    contact_person_email: isBusiness ? Yup.string().required(t('required')).email(t('contact_person_email_invalid')) : Yup.string(),
    classification: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    branch: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    iban: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    bic: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    account_holder_name: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    account_holder_city: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    vat: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    kvk: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    payment_method: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    customer_percentage: isBusiness ? Yup.number().required(t('required')) : Yup.number(),
    invoice_discount: isBusiness ? Yup.number().required(t('required')) : Yup.number(),
    payment_termin: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    credit_limit: isBusiness ? Yup.number().required(t('required')) : Yup.number(),
    invoice_address: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    invoice_language: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    discount_group: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    inform_via: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    customer_color: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    relation_type: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    relation_via: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    days_closed: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    days_no_delivery: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    credit_limit: Yup.number().nullable().transform((value) => (value === '' ? null : value)),
    invoice_discount: Yup.number().nullable().transform((value) => (value === '' ? null : value)),
  });

  const ADDRESS_TYPES = [
    { value: 'delivery', label: t('delivery_address') },
    { value: 'contact_person', label: t('contact_person_address') },
    { value: 'invoice', label: t('invoice_address') },
  ];
  const USER_TYPES = [
    { value: 'special', label: t('special') },
    { value: 'wholesaler', label: t('wholesaler') },
    { value: 'supermarket', label: t('supermarket') },
    { value: 'particular', label: t('particular') },
  ];

  const mappedColors = COLORS.map(color => ({
    value: color.value,
    label: t(color.value),
    color: color.color
  }));
  const PAYMENT_METHOD_TYPES = [
    { value: 'bank', label: t('bank') },
    { value: 'kas', label: t('kas') },
    { value: 'pin', label: t('pin') },
  ];

  const defaultValues = useMemo(
    () => ({
      addressList: currentUser?.addresses || [],
      relation_code: currentUser?.relation_code || '',
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || '',
      gender: currentUser?.gender || '',
      site_source: currentUser?.site_source || '',
      phone_number: currentUser?.phone_number || '',
      mobile_number: currentUser?.mobile_number || '',
      mobile_phone: currentUser?.mobile_phone || '',
      contact_person_name: currentUser?.contact_person_name || '',
      contact_person_address: currentUser?.contact_person_address || '',
      contact_person_postcode: currentUser?.contact_person_postcode || '',
      contact_person_city: currentUser?.contact_person_city || '',
      contact_person_country: currentUser?.contact_person_country || '',
      contact_person_phone: currentUser?.contact_person_phone || '',
      contact_person_email: currentUser?.contact_person_email || '',
      contact_person_department: currentUser?.contact_person_department || '',
      contact_person_branch: currentUser?.contact_person_branch || '',
      contact_person_nationality: currentUser?.contact_person_nationality || '',
      type: currentUser?.type || 'particular',
      birthdate: currentUser?.birthdate || null,
      fax: currentUser?.fax || null,
      facebook: currentUser?.facebook || null,
      linkedin: currentUser?.linkedin || null,
      twitter: currentUser?.twitter || null,
      instagram: currentUser?.instagram || null,
      pinterest: currentUser?.pinterest || null,
      tiktok: currentUser?.tiktok || null,
      notes: currentUser?.notes || null,
      website: currentUser?.website || null,
      classification: currentUser?.classification || "",
      credit_limit: currentUser?.credit_limit || 0,
      customer_percentage: currentUser?.customer_percentage || 10,
      days_closed: currentUser?.days_closed || "",
      days_no_delivery: currentUser?.days_no_delivery || "",
      department: currentUser?.department || "",
      account_holder_city: currentUser?.account_holder_city || "",
      account_holder_name: currentUser?.account_holder_name || "",
      bic: currentUser?.bic || "",
      branch: currentUser?.branch || "",
      business_name: currentUser?.business_name || "",
      discount_group: currentUser?.discount_group || "",
      extra_phone: currentUser?.extra_phone || "",
      fullname: currentUser?.fullname || "",
      iban: currentUser?.iban || "",
      inform_via: currentUser?.inform_via || "",
      invoice_address: currentUser?.invoice_address || "",
      invoice_cc_email: currentUser?.invoice_cc_email || "",
      invoice_discount: currentUser?.invoice_discount || 0,
      invoice_email: currentUser?.invoice_email || "",
      invoice_language: currentUser?.invoice_language || "",
      kvk: currentUser?.kvk || "",
      payment_termin: currentUser?.payment_termin || "",
      payment_method: currentUser?.payment_method || "",
      phone: currentUser?.phone || "",
      relation_type: currentUser?.relation_type || "",
      relation_via: currentUser?.relation_via || "",
      vat: currentUser?.vat || "",
      is_active: currentUser?.is_active ?? false,
      is_staff: currentUser?.is_staff ?? false,
      is_no_payment: currentUser?.is_no_payment ?? false,
      inform_when_new_products: currentUser?.inform_when_new_products ?? false,
      is_eligible_to_work_with: currentUser?.is_eligible_to_work_with ?? false,
      is_relation_user: currentUser?.is_relation_user ?? false,
      is_relation_user2: currentUser?.is_relation_user ?? false,
      is_vat_document_printed: currentUser?.is_vat_document_printed ?? false,
      is_payment_termin_active: currentUser?.is_payment_termin_active ?? false,
      needs_electronic_invoice: currentUser?.needs_electronic_invoice ?? false,
      incasseren: currentUser?.incasseren ?? false,
      notify: currentUser?.notify ?? false,
      is_subscribed_newsletters: currentUser?.is_subscribed_newsletters ?? false,
      is_access_granted_social_media: currentUser?.is_access_granted_social_media ?? false,
      customer_color: currentUser?.customer_color ?? "",
      history: currentUser?.history || [],
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting, isDirty, errors },
    ...rest
  } = methods;

  // Reset form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      reset(defaultValues);
    } else {
      reset({});
    }
  }, [currentUser, reset, defaultValues]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as UserType;
    const typeToPercentage: Record<UserType, number> = {
      special: 25,
      wholesaler: 20,
      supermarket: 15,
      particular: 10,
    };

    setValue('type', newType);
    setValue('customer_percentage', typeToPercentage[newType]);
    setIsBusiness(!['particular', 'admin'].includes(newType));
  };

  const handleAddAddress = () => {
    resetAddressForm({
      address_name: '',
      first_name: '',
      last_name: '',
      salutation: '',
      phone_number: '',
      street_name: '',
      house_number: '',
      house_suffix: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      addressType: '',
    });
    setEditingIndex(null);  // Yeni ekleme olduğu için edit modunu sıfırla
    setOpenAddressForm(true);
  };
  const handleOpenAddressForm = (index = null) => {
    setEditingIndex(index);

    if (index !== null) {
      const existingAddress = addressList[index];
      resetAddressForm(existingAddress);

      const addressType = existingAddress.is_delivery_address
        ? "delivery"
        : existingAddress.is_contact_person_address
          ? "contact_person"
          : existingAddress.is_invoice_address
            ? "invoice"
            : "";

      setValueAddressForm("addressType", addressType); // Varsayılan değer atama
    } else {
      resetAddressForm();
      setValueAddressForm("addressType", ""); // Yeni eklerken boş bırak
    }

    setOpenAddressForm(true);
  };


  const handleCloseAddressForm = () => {
    setOpenAddressForm(false);
    resetAddressForm(); // Clear form
  };

  const onSubmitAddress = async (data) => {
    console.log("🚀 ~ onSubmitAddress ~ data:", data);

    try {
      const formData = {
        user_id: currentUser.id,
        ...data,
        first_name: currentUser.first_name || "-",
        last_name: currentUser.last_name || "-",
        is_business_main_address: data.addressType === "business",
        is_delivery_address: data.addressType === "delivery",
        is_contact_person_address: data.addressType === "contact_person",
        is_invoice_address: data.addressType === "invoice",
      };

      if (editingIndex !== null) {
        const updatedList = [...addressList];
        updatedList[editingIndex] = formData;
        setAddressList(updatedList);

        await axiosInstance.put(`/address/${addressList[editingIndex].id}/`, formData);
      } else {
        const response = await axiosInstance.post("/address/", formData);
        setAddressList([...addressList, response.data]);
      }

      setOpenAddressForm(false);
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };


  const handleDeleteAddress = async (index) => {
    try {
      const addressId = addressList[index]?.id;
      if (addressId) {
        await axiosInstance.delete(`/address/${addressId}/`);
      }
      setAddressList(addressList.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  console.log("🚀 ~ UserNewEditForm ~ values:", watch());
  console.log('🚀 ~ ProductNewEditForm ~ errors:', errors);

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.birthdate = moment.isDate(data.birthdate)
        ? moment(data.birthdate).format('YYYY-MM-DD')
        : null;

      // Track changes for history
      const changes = [];
      if (currentUser?.id) {
        // Compare fields and record changes
        if (data.first_name !== currentUser.first_name) {
          changes.push(`Voornaam gewijzigd van "${currentUser.first_name}" naar "${data.first_name}"`);
        }
        if (data.last_name !== currentUser.last_name) {
          changes.push(`Achternaam gewijzigd van "${currentUser.last_name}" naar "${data.last_name}"`);
        }
        if (data.email !== currentUser.email) {
          changes.push(`Email gewijzigd van "${currentUser.email}" naar "${data.email}"`);
        }
        if (data.phone_number !== currentUser.phone_number) {
          changes.push(`Telefoonnummer gewijzigd van "${currentUser.phone_number}" naar "${data.phone_number}"`);
        }
        if (data.mobile_number !== currentUser.mobile_number) {
          changes.push(`Mobiel nummer gewijzigd van "${currentUser.mobile_number}" naar "${data.mobile_number}"`);
        }
        if (data.type !== currentUser.type) {
          changes.push(`Type gewijzigd van "${currentUser.type}" naar "${data.type}"`);
        }
        if (data.business_name !== currentUser.business_name) {
          changes.push(`Bedrijfsnaam gewijzigd van "${currentUser.business_name}" naar "${data.business_name}"`);
        }
        if (data.vat !== currentUser.vat) {
          changes.push(`BTW nummer gewijzigd van "${currentUser.vat}" naar "${data.vat}"`);
        }
        if (data.kvk !== currentUser.kvk) {
          changes.push(`KvK nummer gewijzigd van "${currentUser.kvk}" naar "${data.kvk}"`);
        }
        if (data.customer_percentage !== currentUser.customer_percentage) {
          changes.push(`Klantpercentage gewijzigd van ${currentUser.customer_percentage} naar ${data.customer_percentage}`);
        }
        if (data.credit_limit !== currentUser.credit_limit) {
          changes.push(`Kredietlimiet gewijzigd van ${currentUser.credit_limit} naar ${data.credit_limit}`);
        }
        if (data.customer_color !== currentUser.customer_color) {
          changes.push(`Klantkleur gewijzigd van "${currentUser.customer_color}" naar "${data.customer_color}"`);
        }
        if (data.is_active !== currentUser.is_active) {
          changes.push(`Status gewijzigd van "${currentUser.is_active ? 'Actief' : 'Inactief'}" naar "${data.is_active ? 'Actief' : 'Inactief'}"`);
        }

        if (data.birthdate !== currentUser.birthdate) {
          changes.push(`Geboortedatum gewijzigd van "${currentUser.birthdate}" naar "${data.birthdate}"`);
        }
        if (data.gender !== currentUser.gender) {
          changes.push(`Geslacht gewijzigd van "${currentUser.gender}" naar "${data.gender}"`);
        }
        if (data.site_source !== currentUser.site_source) {
          changes.push(`Site bron gewijzigd van "${currentUser.site_source}" naar "${data.site_source}"`);
        }
        if (data.relation_code !== currentUser.relation_code) {
          changes.push(`Relatiecode gewijzigd van "${currentUser.relation_code}" naar "${data.relation_code}"`);
        }
        if (data.contact_person_name !== currentUser.contact_person_name) {
          changes.push(`Contactpersoon naam gewijzigd van "${currentUser.contact_person_name}" naar "${data.contact_person_name}"`);
        }
        if (data.contact_person_email !== currentUser.contact_person_email) {
          changes.push(`Contactpersoon email gewijzigd van "${currentUser.contact_person_email}" naar "${data.contact_person_email}"`);
        }
        if (data.contact_person_phone !== currentUser.contact_person_phone) {
          changes.push(`Contactpersoon telefoon gewijzigd van "${currentUser.contact_person_phone}" naar "${data.contact_person_phone}"`);
        }
        if (data.iban !== currentUser.iban) {
          changes.push(`IBAN gewijzigd van "${currentUser.iban}" naar "${data.iban}"`);
        }
        if (data.bic !== currentUser.bic) {
          changes.push(`BIC gewijzigd van "${currentUser.bic}" naar "${data.bic}"`);
        }
        if (data.payment_method !== currentUser.payment_method) {
          changes.push(`Betaalmethode gewijzigd van "${currentUser.payment_method}" naar "${data.payment_method}"`);
        }
        if (data.payment_termin !== currentUser.payment_termin) {
          changes.push(`Betalingstermijn gewijzigd van "${currentUser.payment_termin}" naar "${data.payment_termin}"`);
        }
        if (data.invoice_discount !== currentUser.invoice_discount) {
          changes.push(`Factuurkorting gewijzigd van ${currentUser.invoice_discount} naar ${data.invoice_discount}`);
        }
        if (data.invoice_language !== currentUser.invoice_language) {
          changes.push(`Factuurtaal gewijzigd van "${currentUser.invoice_language}" naar "${data.invoice_language}"`);
        }
        if (data.discount_group !== currentUser.discount_group) {
          changes.push(`Kortingsgroep gewijzigd van "${currentUser.discount_group}" naar "${data.discount_group}"`);
        }
        if (data.inform_via !== currentUser.inform_via) {
          changes.push(`Informeren via gewijzigd van "${currentUser.inform_via}" naar "${data.inform_via}"`);
        }
        if (data.days_closed !== currentUser.days_closed) {
          changes.push(`Gesloten dagen gewijzigd van "${currentUser.days_closed}" naar "${data.days_closed}"`);
        }
        if (data.days_no_delivery !== currentUser.days_no_delivery) {
          changes.push(`Geen levering dagen gewijzigd van "${currentUser.days_no_delivery}" naar "${data.days_no_delivery}"`);
        }

        // Social media changes
        if (data.facebook !== currentUser.facebook) {
          changes.push(`Facebook gewijzigd van "${currentUser.facebook}" naar "${data.facebook}"`);
        }
        if (data.linkedin !== currentUser.linkedin) {
          changes.push(`LinkedIn gewijzigd van "${currentUser.linkedin}" naar "${data.linkedin}"`);
        }
        if (data.twitter !== currentUser.twitter) {
          changes.push(`Twitter gewijzigd van "${currentUser.twitter}" naar "${data.twitter}"`);
        }
        if (data.instagram !== currentUser.instagram) {
          changes.push(`Instagram gewijzigd van "${currentUser.instagram}" naar "${data.instagram}"`);
        }
        if (data.pinterest !== currentUser.pinterest) {
          changes.push(`Pinterest gewijzigd van "${currentUser.pinterest}" naar "${data.pinterest}"`);
        }
        if (data.tiktok !== currentUser.tiktok) {
          changes.push(`TikTok gewijzigd van "${currentUser.tiktok}" naar "${data.tiktok}"`);
        }
        if (data.website !== currentUser.website) {
          changes.push(`Website gewijzigd van "${currentUser.website}" naar "${data.website}"`);
        }

        // Boolean field changes
        if (data.is_staff !== currentUser.is_staff) {
          changes.push(`Medewerker status gewijzigd van "${currentUser.is_staff ? 'Ja' : 'Nee'}" naar "${data.is_staff ? 'Ja' : 'Nee'}"`);
        }
        if (data.is_no_payment !== currentUser.is_no_payment) {
          changes.push(`Geen betaling status gewijzigd van "${currentUser.is_no_payment ? 'Ja' : 'Nee'}" naar "${data.is_no_payment ? 'Ja' : 'Nee'}"`);
        }
        if (data.inform_when_new_products !== currentUser.inform_when_new_products) {
          changes.push(`Informeren bij nieuwe producten gewijzigd van "${currentUser.inform_when_new_products ? 'Ja' : 'Nee'}" naar "${data.inform_when_new_products ? 'Ja' : 'Nee'}"`);
        }
        if (data.is_eligible_to_work_with !== currentUser.is_eligible_to_work_with) {
          changes.push(`Geschikt om mee te werken gewijzigd van "${currentUser.is_eligible_to_work_with ? 'Ja' : 'Nee'}" naar "${data.is_eligible_to_work_with ? 'Ja' : 'Nee'}"`);
        }
        if (data.is_payment_termin_active !== currentUser.is_payment_termin_active) {
          changes.push(`Betalingstermijn actief gewijzigd van "${currentUser.is_payment_termin_active ? 'Ja' : 'Nee'}" naar "${data.is_payment_termin_active ? 'Ja' : 'Nee'}"`);
        }
        if (data.needs_electronic_invoice !== currentUser.needs_electronic_invoice) {
          changes.push(`Elektronische factuur nodig gewijzigd van "${currentUser.needs_electronic_invoice ? 'Ja' : 'Nee'}" naar "${data.needs_electronic_invoice ? 'Ja' : 'Nee'}"`);
        }
        if (data.incasseren !== currentUser.incasseren) {
          changes.push(`Incasseren gewijzigd van "${currentUser.incasseren ? 'Ja' : 'Nee'}" naar "${data.incasseren ? 'Ja' : 'Nee'}"`);
        }
        if (data.notify !== currentUser.notify) {
          changes.push(`Notificaties gewijzigd van "${currentUser.notify ? 'Ja' : 'Nee'}" naar "${data.notify ? 'Ja' : 'Nee'}"`);
        }
        if (data.is_subscribed_newsletters !== currentUser.is_subscribed_newsletters) {
          changes.push(`Nieuwsbrief abonnement gewijzigd van "${currentUser.is_subscribed_newsletters ? 'Ja' : 'Nee'}" naar "${data.is_subscribed_newsletters ? 'Ja' : 'Nee'}"`);
        }
        if (data.is_access_granted_social_media !== currentUser.is_access_granted_social_media) {
          changes.push(`Sociale media toegang gewijzigd van "${currentUser.is_access_granted_social_media ? 'Ja' : 'Nee'}" naar "${data.is_access_granted_social_media ? 'Ja' : 'Nee'}"`);
        }
      } else {
        changes.push(`Gebruiker aangemaakt`);
      }

      // Add history entry if there are changes
      if (changes.length > 0) {
        const newHistory = [...(currentUser?.history || [])];
        newHistory.push({
          date: new Date(),
          event: changes.join(', '),
        });
        data.history = newHistory;
      }

      data.unique_identifier = `${data.email}__${data.site_source}`;
      if (currentUser) {
        await axiosInstance.put(`/users/${currentUser.id}/`, data);
      } else {
        await axiosInstance.post('/users/', data);
      }

      enqueueSnackbar(currentUser ? t('update_success') : t('create_success'));
      reset();
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.log('error', error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((errorMessage) => {
          console.error(errorMessage);
          enqueueSnackbar({ variant: 'error', message: errorMessage });
        });
      } else {
        const errorMessages = Object.entries(error);
        if (errorMessages.length) {
          errorMessages.forEach(([fieldName, errors]) => {
            errors?.forEach((errorMsg) => {
              enqueueSnackbar({
                variant: 'error',
                message: `${t(fieldName)}: ${errorMsg}`,
              });
            });
          });
        } else {
          console.error('An unexpected error occurred:', error);
          enqueueSnackbar({ variant: 'error', message: JSON.stringify(error) });
        }
      }
    }
  });

  const handlePasswordReset = async () => {
    try {
      await axiosInstance.post('/password/reset/', {
        email: currentUser?.email,
        site_source: currentUser?.site_source
      });
      enqueueSnackbar(t('password_reset_email_sent'), { variant: 'success' });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      enqueueSnackbar(t('error_sending_password_reset'), { variant: 'error' });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="relation_code" label={t('relation_code')} />
                <RHFSelect
                  name="type"
                  label={t('user_type')}
                  onChange={handleTypeChange}
                >
                  <MenuItem value="">None</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {USER_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFSelect
                  name="site_source"
                  label={t('site_source')}
                  onChange={(e) => {
                    setValue('site_source', e.target.value);
                  }}
                >
                  {SITE_SOURCE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFTextField name="email" label={t('email')} />
                <RHFTextField name="first_name" label={t('name')} />
                <RHFTextField name="last_name" label={t('lastname')} />
                {currentUser ? null : (
                  <RHFTextField name="password" label={t('password')} type="password" />
                )}
                <RHFSelect
                  name="gender"
                  label={t('gender')}
                  onChange={(e) => {
                    setValue('gender', e.target.value);
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <MenuItem key="M" value="M">
                    M
                  </MenuItem>
                  <MenuItem key="V" value="V">
                    V
                  </MenuItem>
                  <MenuItem key="O" value="O">
                    Ander
                  </MenuItem>
                </RHFSelect>
                <RHFTextField name="phone_number" label={t('phone')} />
                <RHFTextField name="mobile_number" label={t('mobile')} />
                <Controller
                  name="birthdate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label={t('birthdate')}
                      value={new Date(field.value) || null}
                      format="yyyy-MM-dd"
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
                <RHFSwitch
                  name="inform_when_new_products"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('inform_when_new_products')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_subscribed_newsletters"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_subscribed_newsletters')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_access_granted_social_media"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_access_granted_social_media')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 5 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="business_name" label={t('business_name')} />
                <RHFTextField name="contact_person_name" label={t('contact_person_name')} />
                <RHFTextField name="contact_person_address" label={t('contact_person_address')} />
                <RHFTextField name="contact_person_postcode" label={t('contact_person_postcode')} />
                <RHFTextField name="contact_person_city" label={t('contact_person_city')} />
                <RHFTextField name="contact_person_country" label={t('contact_person_country')} />
                <RHFTextField name="contact_person_phone" label={t('contact_person_phone')} />
                <RHFTextField name="contact_person_email" label={t('contact_person_email')} />
                <RHFTextField
                  name="contact_person_department"
                  label={t('contact_person_department')}
                />
                <RHFTextField name="contact_person_branch" label={t('contact_person_branch')} />
                <RHFTextField name="classification" label={t('classification')} />
                <RHFTextField
                  name="contact_person_nationality"
                  label={t('contact_person_nationality')}
                />
                <RHFTextField name="branch" label={t('branch')} />
                <RHFTextField name="iban" label={t('iban')} />
                <RHFTextField name="bic" label={t('bic')} />
                <RHFTextField name="account_holder_name" label={t('account_holder_name')} />
                <RHFTextField name="account_holder_city" label={t('account_holder_city')} />
                <RHFTextField name="vat" label={t('vat')} />
                <RHFTextField name="kvk" label={t('kvk')} />
                <RHFSelect name="payment_method" label={t('payment_method')}>
                  <MenuItem value="">{t('none')}</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {PAYMENT_METHOD_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFTextField
                  name="customer_percentage"
                  label={t('customer_percentage')}
                  type="number"
                />
                <RHFTextField name="invoice_discount" label={t('invoice_discount')} type="number" />
                <RHFTextField name="payment_termin" label={t('payment_termin')} />
                <RHFTextField name="credit_limit" label={t('credit_limit')} type="number" />
                <RHFTextField name="invoice_address" label={t('invoice_address')} />
                <RHFTextField name="invoice_language" label={t('invoice_language')} />
                <RHFTextField name="discount_group" label={t('discount_group')} />
                <RHFTextField name="inform_via" label={t('inform_via')} />
                <RHFSelect
                  name="customer_color"
                  label={t('customer_color')}
                  SelectProps={{
                    renderValue: (value) => {
                      const option = mappedColors.find((c) => c.value === value);
                      if (!option) return '';
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            className="color-dot"
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: option.color,
                              border: '2px solid #fff',
                              boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                              flexShrink: 0
                            }}
                          />
                          <Typography noWrap>{option.label}</Typography>
                        </Box>
                      );
                    }
                  }}
                >
                  <MenuItem value="">{t('none')}</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {mappedColors.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1,
                        '&:hover .color-dot': {
                          transform: 'scale(1.2)',
                          boxShadow: '0 0 0 2px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      <Box
                        className="color-dot"
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: option.color,
                          border: '2px solid #fff',
                          boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s ease-in-out',
                          flexShrink: 0
                        }}
                      />
                      <Typography noWrap>{option.label}</Typography>
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFTextField name="relation_type" label={t('relation_type')} />
                <RHFTextField name="relation_via" label={t('relation_via')} />
                <RHFTextField name="days_closed" label={t('days_closed')} />
                <RHFTextField name="days_no_delivery" label={t('days_no_delivery')} />
                <RHFTextField name="fax" label={t('fax')} />
                <RHFTextField name="website" label={t('website')} />
                <RHFSwitch
                  name="incasseren"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('incasseren')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_payment_termin_active"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_payment_termin_active')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_eligible_to_work_with"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_eligible_to_work_with')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_no_payment"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_no_payment')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="inform_when_new_products"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('inform_when_new_products')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />

                <RHFSwitch
                  name="notify"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('notify')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 5 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="facebook" label={t('facebook')} placeholder='https://www.facebook.com/yourprofile' />
                <RHFTextField name="linkedin" label={t('linkedin')} placeholder='https://www.linkedin.com/in/yourprofile' />
                <RHFTextField name="twitter" label={t('twitter')} placeholder='https://www.twitter.com/yourhandle' />
                <RHFTextField name="instagram" label={t('instagram')} placeholder='https://www.instagram.com/yourprofile' />
                <RHFTextField name="pinterest" label={t('pinterest')} placeholder='https://www.pinterest.com/yourprofile' />
                <RHFTextField name="tiktok" label={t('tiktok')} placeholder='https://www.tiktok.com/@yourusername' />
              </Box>
            </Card>
            <Card sx={{ p: 3, mt: 5 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="notes" label={t('notes')} type="textarea" />
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 5 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFSwitch
                  name="is_active"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('active')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
              </Box>
            </Card>
            <Stack alignItems="flex-end" sx={{ mt: 3 }} direction="row" spacing={2}>
              {currentUser && (
                <LoadingButton
                  variant="contained"
                  onClick={handlePasswordReset}
                >
                  {t('send_password_reset')}
                </LoadingButton>
              )}
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? t('create_user') : t('save')}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
      <div>
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Adres Type</TableCell>
                <TableCell>Adres Naam</TableCell>
                <TableCell>Adres</TableCell>
                <TableCell>Acties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {addressList.map((address, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {address?.is_delivery_address ? t('delivery_address') :
                      address?.is_contact_person_address ? t('contact_person_address') : address?.is_invoice_address ? t('invoice_address') : ""}
                  </TableCell>
                  <TableCell>{address.address_name}</TableCell>
                  <TableCell>
                    {`${address.street_name} ${address.house_number} ${address.house_suffix}, ${address.city}, ${address.country}`}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenAddressForm(index)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteAddress(index)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleAddAddress()}
          sx={{ mt: 2 }}
        >
          Adres Toevoegen
        </Button>

        <Dialog open={openAddressForm} onClose={handleCloseAddressForm}>
          <DialogTitle>{editingIndex !== null ? 'Bewerk Adres' : 'Adres Toevoegen'}</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmitAddressForm(onSubmitAddress)}>

              <TextField
                {...register("street_name")}
                label="Straatnaam"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="street-address"
              />
              <TextField
                {...register("house_number")}
                label="Huisnummer"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="house-number"
              />
              <TextField
                {...register("house_suffix")}
                label="Huis Aachtervoegsel"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="address-line2"
              />
              <TextField
                {...register("city")}
                label="Stad"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="address-level2"
              />
              <TextField
                {...register("state")}
                label="Provincie"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="address-level1"
              />
              <TextField
                {...register("zip_code")}
                label="Postcode"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="postal-code"
              />
              <TextField
                {...register("country")}
                label="Land"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="country"
              />
              <Controller
                name="addressType"
                control={controlAddressForm}
                defaultValue="" // Standaard leeg
                render={({ field }) => (
                  <FormControl fullWidth sx={{ my: 1 }}>
                    <InputLabel>Adres Type</InputLabel>
                    <Select {...field} label="Adres Type">
                      <MenuItem value="">Geen</MenuItem>
                      {ADDRESS_TYPES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                )}
              />
              <TextField
                {...register("address_name")}
                label="Adres Naam"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="address-name"
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddressForm}>Annuleren</Button>
            <Button onClick={handleSubmitAddressForm(onSubmitAddress)}>Opslaan</Button>
          </DialogActions>
        </Dialog>

      </div>
      <Stack sx={{ mt: 3 }}>
        <UserDetailsHistory currentUser={currentUser} />
      </Stack>

    </>
  );
}
