// The space weather scales merged in from field-operations-risk-briefing: NOAA's R-scale from GOES X-ray flux,
// and the aurora line from the Kp index.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auroraVisibleLatitude, classifyRScale } from '../src/spaceweather.js';

test('radio blackout level follows NOAA R-scale thresholds', () => {
    assert.equal(classifyRScale(null).rScale, null);
    assert.equal(classifyRScale(3.74e-7).rScale, 'R0');
    assert.equal(classifyRScale(1e-5).rScale, 'R1');
    assert.equal(classifyRScale(5e-5).rScale, 'R2');
    assert.equal(classifyRScale(1e-4).rScale, 'R3');
    assert.equal(classifyRScale(1e-3).rScale, 'R4');
    assert.equal(classifyRScale(2e-3).rScale, 'R5');
    assert.equal(classifyRScale(2e-3).description, 'Extreme radio blackout');
});

test('aurora line moves south as Kp rises, clamped to Kp 0 to 9', () => {
    assert.equal(auroraVisibleLatitude(null), null);
    assert.equal(auroraVisibleLatitude(1.67), 62.4);
    assert.equal(auroraVisibleLatitude(5), 56.3);
    assert.equal(auroraVisibleLatitude(12), 48.1);
    assert.equal(auroraVisibleLatitude(-1), 66.5);
});
