import { Actor, log } from 'apify';
import { getLocationWeather } from './nws.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { latitude: singleLat, longitude: singleLng, label: singleLabel, locations: locationsInput, forecastPeriods = 4 } = input;

const given = (value) => value !== undefined && value !== null && value !== '';

// The single-location fields (latitude/longitude/label) exist so a Store visitor never has to
// touch the raw JSON "locations" editor just to check one place. They take priority when filled
// in; "locations" is for the bulk/multi-location case. An empty form checks an example instead
// of failing.
let locations;
if (given(singleLat) || given(singleLng)) {
    locations = [{ label: singleLabel ?? null, latitude: singleLat, longitude: singleLng }];
} else if (locationsInput?.length) {
    locations = locationsInput;
} else {
    log.info('No location given, so checking the example location Austin, TX.');
    locations = [{ label: 'Austin, TX', latitude: 30.2672, longitude: -97.7431 }];
}

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const LOCATION_CHECKED_EVENT = 'location-checked';

/** Coordinates sometimes arrive as text ("30.2672"); accept that, and reject anything that isn't a real point. */
function toCoordinate(value, max) {
    const n = typeof value === 'string' && value.trim() !== '' ? Number(value.trim()) : value;
    return typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= max ? n : null;
}

// Every location gets a row. A location that can't be checked used to be skipped with only a log
// line, so a run for one non-US place (or coordinates typed as text) ended with an empty table.
let checked = 0;
let serviceErrors = 0;
for (const location of locations) {
    const { label = null } = location ?? {};
    const latitude = toCoordinate(location?.latitude, 90);
    const longitude = toCoordinate(location?.longitude, 180);
    const checkedAt = new Date().toISOString();
    const errorRow = (error) => Actor.pushData({ label, latitude: location?.latitude ?? null, longitude: location?.longitude ?? null, status: 'error', error, checkedAt });

    if (latitude === null || longitude === null) {
        await errorRow('Latitude and longitude must both be numbers, e.g. 30.2672 and -97.7431. Not charged.');
        log.warning('Location with missing or invalid coordinates', { location });
        continue;
    }

    let weather;
    try {
        weather = await getLocationWeather({ latitude, longitude }, forecastPeriods);
    } catch (err) {
        if (err.status === 404) {
            await errorRow('The US National Weather Service only covers the United States and its territories, and this point is outside its coverage. Not charged.');
        } else {
            serviceErrors++;
            await errorRow(`The National Weather Service didn't answer for this location (${err.message}). Not charged.`);
        }
        log.warning('Failed to fetch weather for location', { location, error: err.message });
        continue;
    }

    await Actor.pushData({
        label,
        latitude,
        longitude,
        status: 'ok',
        ...weather,
        checkedAt,
    });
    await Actor.charge({ eventName: LOCATION_CHECKED_EVENT });
    checked++;

    log.info('Fetched weather', { label: label ?? `${latitude},${longitude}`, activeAlerts: weather.activeAlerts.length });
}

if (checked === 0 && serviceErrors > 0) {
    await Actor.fail("The National Weather Service didn't answer for any location. Nothing was charged.");
} else {
    await Actor.exit();
}
