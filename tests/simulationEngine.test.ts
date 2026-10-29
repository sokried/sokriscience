import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateStep, formatSimulationTime } from '../src/engine/simulationEngine.ts';
import { isValidTrophicLink } from '../src/data/organisms.ts';

test('formatSimulationTime formats minutes, seconds and milliseconds properly', () => {
  assert.equal(formatSimulationTime(0), '00:00.00');
  assert.equal(formatSimulationTime(65.42), '01:05.42');
  assert.equal(formatSimulationTime(120), '02:00.00');
});

test('isValidTrophicLink correctly validates predator-prey relationships', () => {
  // Primary eats producer
  assert.equal(isValidTrophicLink('grass', 'rabbit'), true);
  assert.equal(isValidTrophicLink('fruit_tree', 'squirrel'), true);

  // Illegal: producer eats consumer
  assert.equal(isValidTrophicLink('rabbit', 'grass'), false);

  // Secondary eats primary
  assert.equal(isValidTrophicLink('grasshopper', 'frog'), true);
  assert.equal(isValidTrophicLink('grasshopper', 'mantis'), true);

  // Tertiary eats secondary / primary
  assert.equal(isValidTrophicLink('rabbit', 'wolf'), true);
  assert.equal(isValidTrophicLink('snake', 'eagle'), true);

  // Illegal: same level or inverted
  assert.equal(isValidTrophicLink('rabbit', 'squirrel'), false);
  assert.equal(isValidTrophicLink('lion', 'grasshopper'), false);
});

test('simulateStep maintains population for balanced food chain', () => {
  const initialPop = {
    grass: 500,
    rabbit: 120,
    snake: 30,
  };
  const links = [
    { fromId: 'grass', toId: 'rabbit' },
    { fromId: 'rabbit', toId: 'snake' },
  ];

  const result = simulateStep(initialPop, ['grass', 'rabbit', 'snake'], links, 1.0, 0.2);
  assert.equal(result.isGameOver, false);
  assert.ok(result.nextPopulations.grass > 100);
  assert.ok(result.nextPopulations.rabbit > 10);
  assert.ok(result.balanceScore > 40);
});

test('simulateStep detects extinction and triggers game over when producer extincts', () => {
  const dyingPop = {
    grass: 0,
    rabbit: 50,
  };
  const links = [{ fromId: 'grass', toId: 'rabbit' }];

  const result = simulateStep(dyingPop, ['grass', 'rabbit'], links, 5.0, 0.2);
  assert.equal(result.isGameOver, true);
  assert.match(result.gameOverReason, /생산자/);
});
