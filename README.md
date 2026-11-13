# US Weather Forecast & Alerts API (NWS)

A go/no-go weather check for event planners, delivery and logistics
dispatch, construction and site managers, and field crews. Give it U.S.
locations and get the official National Weather Service forecast and any
active severe weather alerts for each one, so you can decide whether to go
ahead, move indoors, reroute or reschedule. Turn on GPS and radio conditions
to add the space weather that affects GPS accuracy and HF radio.

## What you get

One row per location:

- City, state and time zone
- The forecast for the coming periods: temperature, wind, chance of rain and a short summary
- Every active weather alert for that spot (storms, floods, heat, winter weather and more)
- Optional GPS and radio conditions: the Kp index (geomagnetic storms that degrade GPS accuracy), the HF radio blackout level and how far south the aurora is visible

## Who this is for

- **Event planners**: weddings, festivals, sports and outdoor venues deciding whether to move indoors or reschedule.
- **Logistics and delivery dispatch**: flagging routes or stops with active severe weather before drivers head out.
- **Site and construction managers**: checking the forecast and alerts before a job-site call.
- **Survey, drone, precision agriculture and utility crews**: weather plus GPS and HF radio conditions in one row per work site (turn on `includeSpaceWeather`).

## Input

| Field | Type | Description |
|---|---|---|
| `locations` | array | `{ "label": "optional name", "latitude": 30.2672, "longitude": -97.7431 }` |
| `forecastPeriods` | integer (default `4`) | How many ~12-hour forecast periods to return (4 ≈ next 2 days). |
| `includeSpaceWeather` | boolean (default `false`) | Add GPS and radio conditions to every row. |

```json
{
  "locations": [
    { "label": "Austin, TX", "latitude": 30.2672, "longitude": -97.7431 }
  ],
  "forecastPeriods": 4
}
```

US locations only: that's the National Weather Service's coverage area.

## Output

One record per location:

```json
{
  "rowType": "weather",
  "label": "Austin, TX",
  "latitude": 30.2672,
  "longitude": -97.7431,
  "city": "Austin",
  "state": "TX",
  "timeZone": "America/Chicago",
  "forecastPeriods": [
    {
      "name": "Today",
      "temperature": 99,
      "temperatureUnit": "F",
      "precipitationProbability": 8,
      "windSpeed": "0 to 5 mph",
      "windDirection": "S",
      "shortForecast": "Sunny",
      "detailedForecast": "Sunny, with a high near 99. ..."
    }
  ],
  "activeAlerts": [],
  "checkedAt": "2026-08-07T00:00:00.000Z"
}
```

With `includeSpaceWeather` on, every row also gets `spaceWeather`. A real row from a local test run on 2026-11-13 (Fairbanks, with its active alert; forecast shortened to the first period):

```json
{
  "rowType": "weather",
  "label": "Fairbanks, AK",
  "latitude": 64.8378,
  "longitude": -147.7164,
  "status": "ok",
  "city": "Fairbanks",
  "state": "AK",
  "timeZone": "America/Anchorage",
  "forecastPeriods": [
    {
      "name": "Tonight",
      "temperature": 11,
      "temperatureUnit": "F",
      "precipitationProbability": 8,
      "shortForecast": "Patchy Fog",
      "detailedForecast": "Patchy fog. Mostly cloudy, with a low around 11. Wind around 0 mph."
    }
  ],
  "activeAlerts": [
    {
      "event": "Dense Fog Advisory",
      "severity": "Moderate",
      "headline": "Dense Fog Advisory issued November 12 at 1:01PM AKST until November 13 at 12:00PM AKST by NWS Fairbanks AK",
      "effective": "2026-11-12T13:01:00-09:00",
      "expires": "2026-11-13T12:00:00-09:00"
    }
  ],
  "spaceWeather": {
    "kpIndex": 0.33,
    "auroraVisibleLatitude": 66.5,
    "radioBlackout": { "xrayFlux": 6.26e-7, "rScale": "R0", "rScaleDescription": "No radio blackout" },
    "observedAt": "2026-11-13T03:00:00"
  },
  "checkedAt": "2026-11-13T08:05:51.178Z"
}
```

`spaceWeather` is the same snapshot on every row in a run: space weather isn't measured per location. A Kp index of 5 or more is a geomagnetic storm, when GPS accuracy can suffer. `rScale` is NOAA's radio blackout scale (R0 none to R5 extreme) for HF radio. `auroraVisibleLatitude` is roughly how far south the aurora can be seen. If NOAA's space weather service doesn't answer, `spaceWeather` is `null` and the weather still comes back. The Output tab's **Weather + GPS and radio conditions** view shows these as columns.

`rowType` is `"weather"`, or `"error"` for a location that couldn't be checked.

**Locations that can't be checked** still get a row, with `"status": "error"`
and an `error` saying why, and they aren't charged. That covers points outside
the United States and its territories (the National Weather Service only
covers the US) and coordinates that aren't numbers. Coordinates written as
text, like `"30.2672"`, work. Every other row has `"status": "ok"`.

## How it works

Direct calls to `api.weather.gov`: official NOAA/National Weather Service
API, US federal government data (public domain, no non-commercial
restriction, no API key). No proxy, no scraping.

GPS and radio conditions come from `services.swpc.noaa.gov` (NOAA's Space
Weather Prediction Center): the planetary Kp index and the GOES X-ray
`0.1-0.8nm` channel, classified into NOAA's own R-scale. They're fetched
once per run and added to every row.

Coordinates only, no geocoding built in: NWS's API only accepts
latitude/longitude, not place names. Look up coordinates for a city via any
map service before running.

## Why NWS instead of a global weather API

Global free weather APIs (e.g. Open-Meteo) restrict their free tier to
non-commercial use: using one to power a paid actor would violate those
terms. NWS is US-government public data with no such restriction, at the
cost of US-only coverage.

## Pricing note

Billed per **location checked**, not per forecast period or alert
returned, so a request for several locations scales predictably with how
many places you actually asked about, whether or not each one currently
has active alerts. GPS and radio conditions add no cost. Locations that
come back with an error aren't charged.

## Related products

- [Space Weather Alerts](https://apify.com/m_ctim/space-weather-alert): solar/geomagnetic conditions, for HF radio and aurora-visibility use cases NWS doesn't cover
