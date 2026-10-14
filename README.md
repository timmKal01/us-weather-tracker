# US Weather Forecast & Alerts API (NWS)

A go/no-go weather check for event planners, delivery and logistics
dispatch, and construction and site managers. Give it U.S. locations and
get the official National Weather Service forecast and any active severe
weather alerts for each one, so you can decide whether to go ahead, move
indoors, reroute or reschedule.

## What you get

One row per location:

- City, state and time zone
- The forecast for the coming periods: temperature, wind, chance of rain and a short summary
- Every active weather alert for that spot (storms, floods, heat, winter weather and more)

## Who this is for

- **Event planners**: weddings, festivals, sports and outdoor venues deciding whether to move indoors or reschedule.
- **Logistics and delivery dispatch**: flagging routes or stops with active severe weather before drivers head out.
- **Site and construction managers**: checking the forecast and alerts before a job-site call.

If your field teams also rely on GPS or HF radio, see
[Field Operations Risk Briefing](https://github.com/timmKal01/field-operations-risk-briefing) below: the same forecast data plus space-weather
conditions, at a higher per-location price. This actor is the lighter,
cheaper option when you just need the weather and alerts.

## Input

| Field | Type | Description |
|---|---|---|
| `locations` | array | `{ "label": "optional name", "latitude": 30.2672, "longitude": -97.7431 }` |
| `forecastPeriods` | integer (default `4`) | How many ~12-hour forecast periods to return (4 ≈ next 2 days). |

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

**Locations that can't be checked** still get a row, with `"status": "error"`
and an `error` saying why, and they aren't charged. That covers points outside
the United States and its territories (the National Weather Service only
covers the US) and coordinates that aren't numbers. Coordinates written as
text, like `"30.2672"`, work. Every other row has `"status": "ok"`.

## How it works

Direct calls to `api.weather.gov`: official NOAA/National Weather Service
API, US federal government data (public domain, no non-commercial
restriction, no API key). No proxy, no scraping.

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
has active alerts. Locations that come back with an error aren't charged.

## Related products

- [Field Operations Risk Briefing](https://github.com/timmKal01/field-operations-risk-briefing): adds GPS/radio propagation conditions on top of the same NWS forecast data
- [Space Weather Alert](https://github.com/timmKal01/space-weather-alert): solar/geomagnetic conditions, for HF radio and aurora-visibility use cases NWS doesn't cover
- [Disaster Declaration Tracker](https://github.com/timmKal01/disaster-declaration-tracker): official FEMA disaster declarations rather than day-to-day forecasts
