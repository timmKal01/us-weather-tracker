# US Weather Forecast & Alerts Tracker (NWS)

Give it a list of US coordinates. It returns the forecast, active weather
alerts, and location info from the official National Weather Service API —
the same data source behind weather.gov, as clean JSON.

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

US locations only — that's the National Weather Service's coverage area.

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

## How it works

Direct calls to `api.weather.gov` — official NOAA/National Weather Service
API, US federal government data (public domain, no non-commercial
restriction, no API key). No proxy, no scraping.

Coordinates only, no geocoding built in: NWS's API only accepts
latitude/longitude, not place names. Look up coordinates for a city via any
map service before running.

## Why NWS instead of a global weather API

Global free weather APIs (e.g. Open-Meteo) restrict their free tier to
non-commercial use — using one to power a paid actor would violate those
terms. NWS is US-government public data with no such restriction, at the
cost of US-only coverage.

## Related products

- [Field Operations Risk Briefing](https://github.com/timmKal01/field-operations-risk-briefing) — adds GPS/radio propagation conditions on top of the same NWS forecast data
- [Space Weather Alert](https://github.com/timmKal01/space-weather-alert) — solar/geomagnetic conditions, for HF radio and aurora-visibility use cases NWS doesn't cover
- [Disaster Declaration Tracker](https://github.com/timmKal01/disaster-declaration-tracker) — official FEMA disaster declarations rather than day-to-day forecasts
