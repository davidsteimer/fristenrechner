// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm, symlink, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { test } from 'node:test';
import { prepareMvp06Promotion, validateMvp06Promotion, writeMvp06Promotion, mvp06Sha256,
  assertMvp06PromotionDelta, MVP06_RELEASE_ID, MVP06_PROMOTION_REPORT } from '../../scripts/promote-ap20-release.mjs';
import type { PreparedMvp06Promotion } from '../../scripts/promote-ap20-release.mjs';
import type { SocialProcedureCatalog } from '../../src/core';

const socialPath = 'social-procedures/ch-social-procedures.json';
const prepared = await prepareMvp06Promotion();
const checked = await validateMvp06Promotion(prepared);
const before = JSON.parse(await readFile(`data/candidates/2026-10-01-ap20c3/${socialPath}`, 'utf8')) as SocialProcedureCatalog;
const previous = JSON.parse(await readFile(`data/releases/2026-09-28-mvp-05-approved.1/${socialPath}`, 'utf8')) as SocialProcedureCatalog;
const duplicate = (): PreparedMvp06Promotion => ({...structuredClone(checked), files: new Map([...checked.files].map(([name, bytes]) => [name, Buffer.from(bytes)]))});

test('MVP06 promotion derives exact 44/50 release bytes with 24/28 old objects and nine artifacts preserved', () => {
  assertMvp06PromotionDelta(before, prepared.catalog, previous);
  assert.equal(prepared.files.size, 12);
  assert.deepEqual(prepared.report.counts, {federalRules: 44, cantonalBindings: 50, approvedEligibility: 50,
    unchangedReviewedRules: 24, unchangedReviewedBindings: 28, newlyReviewedRules: 20, newlyReviewedBindings: 22, artifacts: 10, unchangedArtifacts: 9});
  assert.equal(prepared.report.publicationApproved, false);
  assert.equal(prepared.report.deploymentApproved, false);
  assert.equal(prepared.report.productionActivation, false);
  assert.deepEqual(checked.report.validation, {core: 'passed', python: 'passed', result: {
    status: 'passed', releaseId: MVP06_RELEASE_ID, manifestSha256: prepared.report.manifestSha256,
    validatedArtifacts: 10, unchangedArtifacts: 9, reviewedFederalRules: 44, approvedBindings: 50,
    unchangedReviewedRules: 24, unchangedReviewedBindings: 28, newlyReviewedRules: 20, newlyReviewedBindings: 22,
    sourceReviewDatesUnchanged: true, legalContentUnchanged: true}});
});

test('MVP06 real promotion is append-only, idempotent and exactly equals the checked-in approved release', async context => {
  const target = await mkdtemp(join(tmpdir(), 'mvp06-promotion-idempotent-'));
  context.after(() => rm(target, {recursive: true, force: true}));
  await writeMvp06Promotion(checked, target);
  await writeMvp06Promotion(checked, target);
  for (const [name, bytes] of checked.files) {
    assert.ok((await readFile(join(target, 'data/releases', MVP06_RELEASE_ID, name))).equals(bytes));
    assert.ok((await readFile(join('data/releases', MVP06_RELEASE_ID, name))).equals(bytes));
  }
  assert.deepEqual(JSON.parse(await readFile(join(target, MVP06_PROMOTION_REPORT), 'utf8')), checked.report);
});

test('MVP06 refuses a differing existing file before writing any new release artifact', async context => {
  const target = await mkdtemp(join(tmpdir(), 'mvp06-promotion-existing-'));
  context.after(() => rm(target, {recursive: true, force: true}));
  const output = join(target, 'data/releases', MVP06_RELEASE_ID, 'manifest.json');
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, 'existing user bytes');
  await assert.rejects(writeMvp06Promotion(checked, target), /Existing MVP06 release differs/);
  assert.deepEqual(await readdir(dirname(output)), ['manifest.json']);
  assert.equal(await readFile(output, 'utf8'), 'existing user bytes');
});

test('MVP06 refuses symlink output parents without writing outside the exact target', async context => {
  const target = await mkdtemp(join(tmpdir(), 'mvp06-promotion-symlink-'));
  const other = await mkdtemp(join(tmpdir(), 'mvp06-promotion-unrelated-'));
  context.after(async () => {await rm(target, {recursive: true, force: true}); await rm(other, {recursive: true, force: true});});
  await symlink(other, join(target, 'data'));
  await assert.rejects(writeMvp06Promotion(checked, target), /Not regular promotion evidence/);
  assert.deepEqual(await readdir(other), []);
});

for (const [label, mutate] of [
  ['forged validation flag', (value: PreparedMvp06Promotion) => {value.report.validation = {core: 'passed', python: 'passed', result: 'invented'};}],
  ['changed source proof', (value: PreparedMvp06Promotion) => {value.report.sourceReviewRef = {reviewId: 'FORGED', sha256: 'f'.repeat(64)};}],
  ['invented publication permission', (value: PreparedMvp06Promotion) => {value.report.publicationApproved = true;}],
  ['changed manifest bytes', (value: PreparedMvp06Promotion) => {value.files.set('manifest.json', Buffer.from('{}'));}],
  ['changed catalog bytes', (value: PreparedMvp06Promotion) => {value.files.set(socialPath, Buffer.from('{}'));}]
] as const) test(`MVP06 rejects ${label} before writing`, async context => {
  const target = await mkdtemp(join(tmpdir(), 'mvp06-promotion-forgery-'));
  context.after(() => rm(target, {recursive: true, force: true}));
  const value = duplicate(); mutate(value);
  await assert.rejects(writeMvp06Promotion(value, target));
  assert.deepEqual(await readdir(target), []);
});

test('MVP06 cannot validate a source-approval substitution even after internally consistent rehashing', async () => {
  const value = duplicate();
  const catalog = JSON.parse(value.files.get(socialPath)!.toString());
  catalog.releaseEligibility[49].sourceReviewRef.sha256 = 'f'.repeat(64);
  const bytes = Buffer.from(JSON.stringify(catalog, null, 2) + '\n');
  value.files.set(socialPath, bytes);
  const manifest = JSON.parse(value.files.get('manifest.json')!.toString());
  const descriptor = manifest.artifacts.find((item: {path: string}) => item.path === socialPath);
  descriptor.sha256 = mvp06Sha256(bytes); descriptor.byteLength = bytes.length;
  value.files.set('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  await assert.rejects(validateMvp06Promotion(value), /Independent MVP06 validation failed/);
});
