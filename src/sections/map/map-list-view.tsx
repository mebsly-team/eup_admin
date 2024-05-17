import L from 'leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
// ----------------------------------------------------------------------
import { Popup, Marker, TileLayer, MapContainer, useMapEvents } from 'react-leaflet';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      getAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
    },
  });

  const getAddressFromCoordinates = (lat, lng) => {
    // Replace 'YOUR_MAPBOX_ACCESS_TOKEN' with your actual Mapbox access token
    const accessToken = 'https://www.mapbox.com/pricing#session-user-pricing';
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`
    )
      .then((response) => response.json())
      .then((data) => {
        const firstFeature = data.features[0];
        if (firstFeature) {
          setAddress(firstFeature.place_name);
        } else {
          setAddress('Address not found');
        }
      })
      .catch((error) => {
        console.error('Error fetching address:', error);
        setAddress('Error fetching address');
      });
  };

  return position === null ? null : (
    <>
      <Marker position={position}>
        <Popup>
          <div>
            <p>Latitude: {position.lat}</p>
            <p>Longitude: {position.lng}</p>
            <p>Address: {address}</p>
          </div>
        </Popup>
      </Marker>
      <div className="location-info">
        <p>Latitude: {position.lat}</p>
        <p>Longitude: {position.lng}</p>
        <p>Address: {address}</p>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------
const Map = ({ addresses, selectedColor }) => {
  const getColor = (index) => {
    const colors = ['red', 'blue', 'green', 'orange', 'purple'];
    return colors[index % colors.length];
  };

  const filteredAddresses = selectedColor
    ? addresses.filter((_, index) => getColor(index) === selectedColor)
    : addresses;

  const createIcon = (color) =>
    new L.Icon({
      iconUrl: `/assets/red-pin.png`,
      iconSize: [80, 90],
      iconAnchor: [35, 80],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

  return (
    <MapContainer
      center={[52.0907, 5.1214]}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
      doubleClickZoom={false}
    >
      {/* <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      /> */}
      <TileLayer
        attribution="Google Maps"
        url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
      />
      {filteredAddresses.map((address, index) => {
        const color = getColor(index);
        return (
          <Marker key={index} position={address.position} icon={createIcon(color)}>
            <Popup>{address.name}</Popup>
          </Marker>
        );
      })}
      <LocationMarker />
    </MapContainer>
  );
};

export default function UserListView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const { t, onChangeLang } = useTranslate();

  const [selectedCircle, setSelectedCircle] = useState(null);

  const colors = ['blue', 'red', 'green'];

  const handleCircleClick = (circleId) => {
    setSelectedCircle(circleId);
  };
  const addresses = [
    { name: 'Market-1', position: [52.3676, 4.9041] },
    { name: 'Market-2', position: [51.9225, 4.47917] },
    { name: 'Market-3', position: [52.0705, 4.3007] },
    { name: 'Market-4', position: [52.0907, 5.1214] },
    { name: 'Market-5', position: [51.4416, 5.4697] },
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('employee'), href: paths.dashboard.employee.root },
          { name: t('list') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <div
            onClick={() => handleCircleClick()}
            style={{
              cursor: 'pointer',
            }}
          >
            Alle
          </div>
          {colors.map((color, i) => (
            <div
              key={i}
              onClick={() => handleCircleClick(color)}
              style={{
                backgroundColor: color,
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
        <Map addresses={addresses} selectedColor={selectedCircle} />
      </div>
    </Container>
  );
}
