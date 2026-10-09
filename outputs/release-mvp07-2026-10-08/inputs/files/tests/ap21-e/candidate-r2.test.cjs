// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// Tests consume the emitted ES5 policy and the real packaged AMD host. They
// never compile TypeScript and never contact SharePoint or another network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { test } = require('node:test');

assert.ok(process.env.AP21_E_STAGE, 'Set AP21_E_STAGE to the isolated, completely built candidate stage');
const stage = fs.realpathSync(process.env.AP21_E_STAGE);
const repo = path.resolve(__dirname, '../..');
const spfx = path.join(stage, 'spfx');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const harness = require(path.join(spfx, 'test-build/package-harness.cjs'));
const policy = require(path.join(spfx, 'lib-commonjs/core/ap21ETestPolicy.js'));
const { E_TEST_TARGETS } = require(path.join(spfx, 'lib-commonjs/core/ap21ETestConfig.js'));
const { getProviderCacheIdentity } = require(path.join(spfx, 'lib-commonjs/core/cacheIdentity.js'));
const { normalizeSharePointMirrorPath } = require(path.join(spfx, 'lib-commonjs/core/providers/sharePointPath.js'));
const contract = json(path.join(repo, 'spfx/test-candidates/ap21-e-r2/contract.json'));
const approvedId = '2026-10-01-mvp-06-approved.1';
const approvedDirectory = path.join(repo, 'data/releases', approvedId);
const manifestBytes = fs.readFileSync(path.join(approvedDirectory, 'manifest.json'));
const manifest = JSON.parse(manifestBytes);
const files = new Map(['manifest.json', ...manifest.artifacts.map(item => item.path)]
  .map(name => [name, fs.readFileSync(path.join(approvedDirectory, name))]));
const { JSDOM } = require(path.join(spfx, 'node_modules/jsdom'));
const APP_MANIFEST_NAMESPACE = 'http://schemas.microsoft.com/sharepoint/2012/app/manifest';

// This deliberately narrow project policy is not a complete SharePoint XSD
// validator. In particular, it avoids the broader schema's whitespace rules.
function assertTechnicalAppName(name) {
  assert.equal(typeof name, 'string', 'App/@Name must be a string');
  assert.match(name, /^[A-Za-z][A-Za-z0-9]{0,63}$/, 'App/@Name must satisfy the conservative ASCII name policy');
}

// XML parsing matters here: raw substring checks miss escaped characters and
// can confuse Properties/Title with an unrelated similarly named element.
function readAppManifest(xml) {
  const dom = new JSDOM(xml, { contentType: 'application/xml' });
  try {
    const document = dom.window.document;
    assert.equal(document.doctype, null, 'A manifest must not contain a DTD');
    const app = document.documentElement;
    assert.equal(app.localName, 'App');
    assert.equal(app.namespaceURI, APP_MANIFEST_NAMESPACE);
    const direct = (element, name) => Array.from(element.children)
      .filter(child => child.localName === name && child.namespaceURI === APP_MANIFEST_NAMESPACE);
    const properties = direct(app, 'Properties');
    assert.equal(properties.length, 1, 'Exactly one direct Properties element is required');
    const titles = direct(properties[0], 'Title');
    assert.equal(titles.length, 1, 'Exactly one direct Properties/Title element is required');
    return {
      name: app.getAttribute('Name'), title: titles[0].textContent,
      productId: app.getAttribute('ProductID'), version: app.getAttribute('Version')
    };
  } finally {
    dom.window.close();
  }
}

const baselineSolution = json(path.join(repo, 'spfx/config/package-solution.json'));
const baselineComponent = json(path.join(repo, 'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json'));

function source(overrides = {}) {
  const fetched = [];
  return {
    id: 'AP21-E-offline-approved-fixture', kind: 'sharepointMirror',
    cacheConfiguration: harness.localMirrorConfiguration(approvedId), fetched,
    async fetchBytes(name) {
      fetched.push(name);
      assert.ok(files.has(name), `Unexpected artifact request: ${name}`);
      return new Uint8Array(files.get(name));
    },
    ...overrides
  };
}

async function loadedHost() {
  const runtime = harness.loadPackagedHost();
  const provider = policy.bindETestProvider(source());
  const activation = await runtime.service.refresh(provider);
  runtime.host.applyActivationResult(activation, runtime.host.props.configurationKey);
  assert.equal(runtime.host.state.status, 'ready');
  return { runtime, activation };
}

function find(node, predicate) {
  if (Array.isArray(node)) {
    for (const child of node) { const result = find(child, predicate); if (result) return result; }
  } else if (node && typeof node === 'object' && node.props) {
    if (predicate(node)) return node;
    return find(node.props.children, predicate);
  }
  return undefined;
}

test('AP21-E R2 separates the conservative technical app name from its German display title in build configuration', () => {
  const { solution } = json(path.join(spfx, 'config/package-solution.json'));
  assert.equal(contract.solutionName, 'FristenrechnerAP21EDeviceTest');
  assert.equal(contract.solutionTitle, 'Fristenrechner AP21 E-Gerätetest');
  assert.equal(solution.name, contract.solutionName);
  assert.equal(solution.title, contract.solutionTitle);
  assert.notEqual(solution.name, solution.title);
  assertTechnicalAppName(solution.name);
  assert.equal(solution.version, '0.0.21.2');
  const firstContract = json(path.join(repo, 'spfx/test-candidates/ap21-e/contract.json'));
  for (const field of ['solutionId', 'featureId', 'componentId']) {
    assert.equal(contract[field], firstContract[field], 'Correction preserves the independent AP21 identity: ' + field);
  }
});

test('AP21-E R2 real packaged AppManifest.xml contains the valid technical name and unchanged German display title', () => {
  const appXml = harness.readPackage().files.get('AppManifest.xml');
  assert.ok(appXml, 'The actual SPPKG must contain AppManifest.xml');
  const app = readAppManifest(appXml.toString('utf8'));
  assertTechnicalAppName(app.name);
  assert.equal(app.name, contract.solutionName);
  assert.equal(app.title, contract.solutionTitle);
  assert.equal(app.productId, contract.solutionId);
  assert.equal(app.version, contract.solutionVersion);
});

test('AP21-E R2 conservative name policy accepts ASCII letter starts and the 64-character boundary', () => {
  for (const name of ['A', 'a', 'App21', 'A'.repeat(64), 'a' + '9'.repeat(63)]) {
    assert.doesNotThrow(() => assertTechnicalAppName(name), name);
  }
});

test('AP21-E R2 conservative name policy rejects the old title and Unicode characters', () => {
  for (const name of ['Fristenrechner AP21 E-Gerätetest', 'FristenrechnerAP21EGerätetest', 'Äpp', 'Appé', 'App\u{1F9EA}']) {
    assert.throws(() => assertTechnicalAppName(name), /conservative ASCII name policy/, name);
  }
});

test('AP21-E R2 conservative name policy rejects empty, overlong and non-string names', () => {
  for (const name of ['', 'A'.repeat(65), 'A'.repeat(128), null, undefined, 21]) {
    assert.throws(() => assertTechnicalAppName(name));
  }
});

test('AP21-E R2 conservative name policy rejects invalid first characters and non-alphanumeric content', () => {
  for (const name of ['1App', '_App', '-App', ' App', 'App Test', 'App-Test', 'App_Test', 'App.Test', 'App\nTest']) {
    assert.throws(() => assertTechnicalAppName(name), /conservative ASCII name policy/, name);
  }
});

test('AP21-E R2 XML parsing decodes escaped text and attributes before checking the technical name', () => {
  const document = (name, title) => '<App xmlns="' + APP_MANIFEST_NAMESPACE + '" Name="' + name
    + '"><Properties><Title>' + title + '</Title></Properties></App>';
  const good = readAppManifest(document('FristenrechnerAP&#50;1EDeviceTest',
    'Fristenrechner AP21 E-Ger&#228;tetest &amp; &lt;QA&gt;'));
  assert.equal(good.name, 'FristenrechnerAP21EDeviceTest');
  assert.equal(good.title, 'Fristenrechner AP21 E-Gerätetest & <QA>');
  assert.doesNotThrow(() => assertTechnicalAppName(good.name));
  for (const name of ['FristenrechnerAP21EGer&#228;tetest', 'App&#xE4;', 'App&#32;Test', '&#49;App']) {
    assert.throws(() => assertTechnicalAppName(readAppManifest(document(name, 'Display title')).name),
      /conservative ASCII name policy/);
  }
});

test('AP21-E R2 XML parser rejects malformed XML, foreign namespaces and ambiguous or missing display titles', () => {
  const header = '<App xmlns="' + APP_MANIFEST_NAMESPACE + '" Name="App">';
  for (const xml of [
    header + '<Properties><Title>Broken & raw</Title></Properties></App>',
    header + '<Properties><Title>Unclosed</Properties></App>',
    '<App xmlns="https://example.invalid/not-sharepoint" Name="App"><Properties><Title>Wrong</Title></Properties></App>',
    header + '<Other><Title>Not the application title</Title></Other></App>',
    header + '<Properties><Title>First</Title><Title>Second</Title></Properties></App>',
    header + '<Properties><Title>First</Title></Properties><Properties><Title>Second</Title></Properties></App>',
    '<!DOCTYPE App [<!ENTITY title "Not allowed">]>' + header + '<Properties><Title>&title;</Title></Properties></App>'
  ]) assert.throws(() => readAppManifest(xml));
});

test('AP21-E has independent solution, feature and component identities without tenant-wide installation', () => {
  const solution = json(path.join(spfx, 'config/package-solution.json'));
  const component = json(path.join(spfx, 'src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json'));
  const productionIds = [baselineSolution.solution.id, baselineComponent.id,
    ...baselineSolution.solution.features.map(item => item.id)];
  const candidateIds = [solution.solution.id, component.id,
    ...solution.solution.features.map(item => item.id)];
  assert.equal(new Set(candidateIds).size, candidateIds.length);
  for (const id of candidateIds) {
    assert.match(id, /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i);
    assert.ok(!productionIds.includes(id), 'No production identity may be reused');
    assert.ok(JSON.stringify(contract).includes(id), 'Each candidate identity must be in the explicit contract');
  }
  assert.notEqual(solution.solution.skipFeatureDeployment, true);
  assert.equal(solution.solution.version, contract.solutionVersion);
  assert.equal(solution.solution.includeClientSideAssets, true);
  assert.ok(!solution.solution.webApiPermissionRequests?.length, 'No additional API permissions');
  assert.match(solution.solution.name, /AP21/);
  assert.match(component.preconfiguredEntries[0].title.default, /AP21/);
  const packaged = harness.readPackage();
  const appXml = packaged.files.get('AppManifest.xml')?.toString('utf8');
  assert.ok(appXml);
  assert.ok(appXml.includes(`ProductID="${contract.solutionId}"`));
  assert.ok(appXml.includes(`Version="${contract.solutionVersion}"`));
  const featureXml = packaged.files.get(`feature_${contract.featureId}.xml`)?.toString('utf8');
  assert.ok(featureXml?.includes('Scope="Web"'));
  const componentXml = packaged.files.get(`${contract.featureId}/WebPart_${contract.componentId}.xml`)?.toString('utf8');
  assert.ok(componentXml?.includes(`Id="${contract.componentId}"`));
  for (const [name, bytes] of packaged.files) {
    if (!name.endsWith('.xml')) continue;
    for (const id of productionIds) assert.ok(!bytes.toString('utf8').includes(id),
      `Production app identity leaked into candidate XML ${name}`);
  }
});

test('AP21-E real SPPKG namespaces bundle and localisation assets separately from the existing package', () => {
  const packaged = harness.readPackage();
  assert.match(packaged.bundlePath, /^ClientSideAssets\/ap21e-fristenrechner-web-part_[a-f0-9]+\.js$/);
  const names = [...packaged.files.keys()];
  assert.ok(!names.some(name => /^ClientSideAssets\/fristenrechner-web-part_/.test(name)));
  const text = packaged.bundle.toString('utf8');
  const config = json(path.join(spfx, 'config/config.json'));
  assert.ok(Object.hasOwn(config.localizedResources, contract.localizedResourceName));
  assert.ok(!Object.hasOwn(config.localizedResources, 'FristenrechnerWebPartStrings'));
  assert.match(text, /ap21e-fr-/);
  assert.ok(!text.includes('"fr-native-date-'), 'Production date element identifiers must not be emitted');
  assert.match(text, /fristenrechner-ap21e/);
  assert.match(text, /fristenrechner\.ap21e\.defaults\.v1/);
});

test('AP21-E permits the exact approved MVP 0.6 manifest and preserves all original artifact bytes', async () => {
  const provider = source();
  const wrapped = policy.bindETestProvider(provider);
  assert.equal(sha256(await wrapped.fetchBytes('manifest.json')), sha256(manifestBytes));
  for (const descriptor of manifest.artifacts) {
    const bytes = await wrapped.fetchBytes(descriptor.path);
    assert.equal(sha256(bytes), descriptor.sha256, descriptor.path);
    assert.equal(bytes.length, descriptor.byteLength, descriptor.path);
  }
  assert.deepEqual(provider.fetched, ['manifest.json', ...manifest.artifacts.map(item => item.path)]);
});

test('AP21-E stops a changed manifest before fetching or activating another artifact', async () => {
  const runtime = harness.loadPackagedHost();
  const changed = Buffer.from(JSON.stringify({ ...manifest, releaseId: 'not-the-approved-pin' }));
  const fetched = [];
  const provider = policy.bindETestProvider(source({
    async fetchBytes(name) { fetched.push(name); return new Uint8Array(changed); }
  }));
  await assert.rejects(runtime.service.refresh(provider));
  assert.deepEqual(fetched, ['manifest.json']);
  assert.equal(await runtime.service.getActive(provider), undefined);
});

test('AP21-E provider binding rejects other sites and providers before any fetch', () => {
  let fetched = 0;
  const base = source({ async fetchBytes() { fetched += 1; throw new Error('Should not fetch'); } });
  for (const candidate of [
    { ...base, kind: 'github', cacheConfiguration: { kind: 'github', baseUrl: 'https://example.invalid/' } },
    { ...base, cacheConfiguration: { ...base.cacheConfiguration, siteAbsoluteUrl: 'https://example.invalid/sites/not-E' } },
    { ...base, cacheConfiguration: { ...base.cacheConfiguration, mirrorPath: '/sites/not-E/releases/' + approvedId } }
  ]) assert.throws(() => policy.bindETestProvider(candidate));
  assert.equal(fetched, 0);
});

test('AP21-E actual packaged host activates only the approved runtime and sets the global reference/export barrier', async t => {
  const { runtime, activation } = await loadedHost();
  t.diagnostic(JSON.stringify(runtime.provenance));
  assert.equal(activation.release.releaseId, approvedId);
  assert.equal(activation.release.manifestSha256, sha256(manifestBytes));
  const app = find(runtime.host.render(), element => element.props.data === runtime.host.state.calculationData
    && typeof element.type === 'function');
  assert.ok(app);
  assert.equal(app.props.referenceOnlyAllCalculations, true);
  assert.match(app.props.localReviewLabel, /AP21.*E-/);
  const altered = { ...activation.release, releaseId: '2026-10-08-not-approved' };
  assert.throws(() => runtime.host.runtimeState(altered));
  assert.throws(() => policy.assertETestRelease(altered));
  assert.throws(() => policy.assertETestRelease({ ...activation.release, manifestSha256: '0'.repeat(64) }));
  assert.doesNotThrow(() => policy.assertETestRelease(activation.release));
});

test('AP21-E keeps the genuine bundled date commit and MVP 0.6 calculation path', async () => {
  const { runtime } = await loadedHost();
  runtime.inspectCalculator({ authorityCode: 'BE', profileId: 'stpo', inputDate: '2026-09-16', deadlineDays: '10' },
    ({ tree, findElement, component, stateValues }) => {
      const date = findElement(tree, element => typeof element.type === 'function' && element.props.name === 'inputDate');
      const dateInstance = component(date);
      const input = findElement(dateInstance.render(), element => element.type === 'input' && element.props.type === 'text');
      assert.match(input.props.id, /^ap21e-fr-native-date-/);
      input.props.onChange({ currentTarget: { value: '1.10.2026' } });
      findElement(tree, element => element.type === 'form').props.onSubmit({ preventDefault() {} });
      const result = stateValues().find(value => value?.kind === 'general');
      assert.ok(result);
      assert.equal(result.value.finalEnd, '2026-10-12');
    });
});

test('AP21-E actual AMD entry rejects another site before fetching or restoring a calculator', async () => {
  const runtime = harness.loadPackagedHost();
  let fetched = 0;
  runtime.webpart.context.pageContext.web.absoluteUrl = 'https://example.invalid/sites/not-the-permitted-E';
  runtime.webpart.context.spHttpClient.get = () => { fetched += 1; throw new Error('Network must not be reached'); };
  const rendered = runtime.renderWebPart();
  assert.equal(rendered.props.provider, undefined);
  assert.match(rendered.props.configurationError, /AP21.*Site/);
  const host = new rendered.type(rendered.props);
  await host.restoreAndRefresh();
  assert.equal(host.state.status, 'error');
  assert.equal(host.state.calculationData, undefined);
  assert.equal(fetched, 0);
});

test('AP21-E actual AMD entry binds both E sites automatically and ignores editable legacy provider properties', () => {
  assert.equal(E_TEST_TARGETS.length, 2);
  for (const target of E_TEST_TARGETS) {
    const runtime = harness.loadPackagedHost();
    runtime.webpart.context.pageContext.web.absoluteUrl = target.siteAbsoluteUrl;
    runtime.webpart.properties = {
      providerKind: 'github', githubBaseUrl: 'https://example.invalid/not-approved',
      sharePointMirrorPath: '/sites/not-approved/release'
    };
    const rendered = runtime.renderWebPart();
    assert.equal(rendered.props.configurationError, undefined);
    assert.equal(rendered.props.provider.kind, 'sharepointMirror');
    assert.equal(rendered.props.configurationKey, target.cacheIdentity);
    assert.equal(rendered.props.provider.cacheConfiguration.mirrorPath,
      normalizeSharePointMirrorPath(target.siteAbsoluteUrl, target.mirrorPath));
    const pane = runtime.webpart.getPropertyPaneConfiguration();
    assert.ok(pane.pages.every(page => page.groups.length === 0));
  }
});

test('AP21-E stores validated bytes only in the isolated database and never touches production defaults', () => {
  const store = new policy.ETestStore();
  assert.equal(store.inner.databaseName, contract.databaseName);
  assert.notEqual(store.inner.databaseName, 'fristenrechner-spfx');
  const calls = [];
  const storage = policy.createETestStorage({
    getItem(key) { calls.push(['get', key]); return 'candidate-defaults'; },
    setItem(key, value) { calls.push(['set', key, value]); },
    removeItem(key) { calls.push(['remove', key]); }
  });
  assert.equal(storage.getItem('fristenrechner.defaults.v1'), 'candidate-defaults');
  storage.setItem('fristenrechner.defaults.v1', '{}');
  storage.removeItem('fristenrechner.defaults.v1');
  assert.deepEqual(calls, [
    ['get', contract.defaultsStorageKey], ['set', contract.defaultsStorageKey, '{}'],
    ['remove', contract.defaultsStorageKey]
  ]);
});

test('AP21-E policy rejects a foreign release on both cache write and cache read', async () => {
  const { activation } = await loadedHost();
  const key = getProviderCacheIdentity(source());
  const wrongRelease = { ...activation.release, releaseId: 'wrong-release' };
  let written = 0;
  const store = new policy.ETestStore({
    async activate() { written += 1; }, async getActive() { return wrongRelease; }
  });
  await assert.rejects(store.activate(wrongRelease, key), /MVP-0.6/);
  await assert.rejects(store.getActive(key), /MVP-0.6/);
  await assert.rejects(store.activate(activation.release), /Site|Datenquelle/);
  await assert.rejects(store.getActive('provider-v1:' + '0'.repeat(64)), /Site|Datenquelle/);
  assert.equal(written, 0);
});

test('AP21-E actual packaged service cannot fall back to an injected non-approved cached release', async () => {
  const { runtime, activation } = await loadedHost();
  const current = source();
  const key = getProviderCacheIdentity(current);
  await runtime.store.inner.activate({ ...activation.release, releaseId: 'not-the-approved-release' }, key);
  const offline = policy.bindETestProvider(source({ async fetchBytes() { throw new Error('AP21-E-OFFLINE'); } }));
  await assert.rejects(runtime.service.getActive(offline), /MVP-0.6/);
  await assert.rejects(runtime.service.refresh(offline), /AP21-E-OFFLINE/);
});

test('AP21-E actual packaged service retains approved offline data only for the exact E mirror', async () => {
  const { runtime, activation } = await loadedHost();
  const offline = policy.bindETestProvider(source({ async fetchBytes() { throw new Error('AP21-E-OFFLINE'); } }));
  const fallback = await runtime.service.refresh(offline);
  assert.equal(fallback.mode, 'fallback');
  assert.equal(fallback.release.manifestSha256, activation.release.manifestSha256);
  const other = E_TEST_TARGETS.find(target => target.cacheIdentity !== getProviderCacheIdentity(source()));
  assert.ok(other);
  const otherProvider = policy.bindETestProvider(source({
    cacheConfiguration: { kind: 'sharepointMirror', siteAbsoluteUrl: other.siteAbsoluteUrl, mirrorPath: other.mirrorPath },
    async fetchBytes() { throw new Error('AP21-E-OTHER-MIRROR-OFFLINE'); }
  }));
  await assert.rejects(runtime.service.refresh(otherProvider), /AP21-E-OTHER-MIRROR-OFFLINE/);
});

test('AP21-E product implementations are unchanged except the DOM namespace and four explicit test notices', () => {
  const notices = new Map([
    ['AP22C3: lokaler Integrationsprüfstand. Sämtliche Berechnungen, einschliesslich VRPG und Sozialversicherungsrecht, dienen ausschliesslich der Prüfung. Keine Betriebsfreigabe und kein Kalenderexport.',
      'AP21 · E-Gerätetest. Nur synthetische Prüffälle. Keine operative Fristenkontrolle und kein Kalenderexport.'],
    ['Lokale Integrationsprüfung: Bundesverfahren schweizweit, VRPG und Spezialrecht für Bern.',
      'Gerätetest der Datumseingabe mit dem freigegebenen MVP-0.6-Datenstand.'],
    ['AP22C3 : version locale de contrôle d’intégration. Tous les calculs, y compris la LPJA et les assurances sociales, servent exclusivement au contrôle. Sans autorisation de production ni export de calendrier.',
      'AP21 · Test sur appareil E. Cas synthétiques uniquement. Pas de contrôle opérationnel des délais ni d’export de calendrier.'],
    ['Contrôle d’intégration local : procédures fédérales dans toute la Suisse, LPJA et droit spécial bernois.',
      'Test de saisie des dates avec les données approuvées de MVP 0.6.']
  ]);
  for (const file of fs.readdirSync(path.join(repo, 'src/ui')).filter(name => /\.(?:ts|tsx|css)$/.test(name))) {
    const original = fs.readFileSync(path.join(repo, 'src/ui', file), 'utf8');
    const copied = fs.readFileSync(path.join(spfx, 'src/product/ui', file), 'utf8');
    let expected = original.replace(/\bfr-(?=[a-z])/g, contract.cssPrefix);
    if (file === 'calendarMessages.ts') for (const [before, after] of notices) {
      assert.ok(expected.includes(before), 'The original reference notice must remain known');
      expected = expected.replace(before, after);
    }
    assert.equal(copied, expected, file);
  }
  for (const file of fs.readdirSync(path.join(repo, 'src/core')).filter(name => name.endsWith('.ts'))) {
    assert.equal(sha256(fs.readFileSync(path.join(spfx, 'src/product/core', file))),
      sha256(fs.readFileSync(path.join(repo, 'src/core', file))), file);
  }
});

test('AP21-E namespacing retains valid Swiss French locales and emitted French date formatting', () => {
  for (const file of ['FristenrechnerApp.tsx', 'calendarContextUi.tsx']) {
    const copied = fs.readFileSync(path.join(spfx, 'src/product/ui', file), 'utf8');
    assert.match(copied, /['"]fr-CH['"]/);
    assert.ok(!copied.includes('ap21e-fr-CH'));
  }
  const { JanuaryComparisonTrace } = require(path.join(spfx, 'lib-commonjs/product/ui/calendarContextUi.js'));
  const value = { legallyRelevantDate: '2026-10-01', deadlineStart: '2026-10-02',
    provisionalEnd: '2026-10-11', finalEnd: '2026-10-12' };
  const tree = JanuaryComparisonTrace({ locale: 'fr', comparison: {
    outcome: 'same', variedCatalogRuleIds: ['SYNTHETIC-UI-FORMATTING-ONLY'],
    withoutJanuary2: value, withJanuary2: value
  } });
  const values = [];
  const visit = node => {
    if (Array.isArray(node)) node.forEach(visit);
    else if (node && typeof node === 'object' && node.props) {
      if (node.type === 'td' && typeof node.props.children === 'string') values.push(node.props.children);
      visit(node.props.children);
    }
  };
  visit(tree);
  assert.deepEqual(values, ['01.10.2026', '02.10.2026', '11.10.2026', '12.10.2026',
    '01.10.2026', '02.10.2026', '11.10.2026', '12.10.2026']);
});

