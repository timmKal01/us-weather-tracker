import { Actor, log } from 'apify';
import { getLocationWeather } from './nws.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { latitude: singleLat, longitude: singleLng, label: singleLabel, locations: locationsInput, forecastPeriods = 4 } = input;

// The single-location fields (latitude/longitude/label) exist so a Store visitor never has to
// touch the raw JSON "locations" editor just to check one place. They take priority when filled
// in; "locations" is for the bulk/multi-location case.
const locations = (typeof singleLat === 'number' && typeof singleLng === 'number')
    ? [{ label: singleLabel ?? null, latitude: singleLat, longitude: singleLng }]
    : (locationsInput?.length ? locationsInput : []);

if (locations.length === 0) {
    throw new Error('No locations provided.');
}

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const LOCATION_CHECKED_EVENT = 'location-checked';

for (const location of locations) {
    const { label = null, latitude, longitude } = location;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        log.warning('Skipping location with missing/invalid latitude or longitude', { location });
        continue;
    }

    let weather;
    try {
        weather = await getLocationWeather({ latitude, longitude }, forecastPeriods);
    } catch (err) {
        log.warning('Failed to fetch weather for location', { location, error: err.message });
        continue;
    }

    await Actor.pushData({
        label,
        latitude,
        longitude,
        ...weather,
        checkedAt: new Date().toISOString(),
    });
    await Actor.charge({ eventName: LOCATION_CHECKED_EVENT });

    log.info('Fetched weather', { label: label ?? `${latitude},${longitude}`, activeAlerts: weather.activeAlerts.length });
}

await Actor.exit();
