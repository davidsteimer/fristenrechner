// SPDX-License-Identifier: AGPL-3.0-only
// Legal-research references only. No imports from product code or release data.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = 'docs/fachrecht/ap23g1/referenzfaelle.json';
const output = 'outputs/ap23g1-2026-10-22/reference-verification.json';
const dayMs = 86400000;
const epoch = d => Date.parse(`${d}T00:00:00Z`) / dayMs;
const iso = n => new Date(n * dayMs).toISOString().slice(0, 10);
const add = (d, n) => iso(epoch(d) + n);
const dow = d => new Date(`${d}T00:00:00Z`).getUTCDay();
const weekend = d => [0, 6].includes(dow(d));
const valid = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)
  && Number.isFinite(epoch(d)) && iso(epoch(d)) === d;
const sha = b => createHash('sha256').update(b).digest('hex');
const boundary = reason => ({ outcome: 'qualificationBoundaryProposed', reason });
const within = (d, s) => d >= s.referenceWindow.from && d <= s.referenceWindow.to;
const windowBoundary = () => ({ outcome: 'researchWindowBoundary', reason: 'outsideReferenceWindow' });

export function holidays(id, year, s) {
  const c = s.calendarDefinitions[id];
  assert.ok(c && s.easter[year], `Missing research calendar ${id}/${year}`);
  const set = new Set([...c.fixed.map(md => `${year}-${md}`),
    ...c.easterOffsets.map(n => add(s.easter[year], n))]);
  if (c.septemberThirdSunday) {
    let d = `${year}-09-15`;
    while (dow(d) !== 0) d = add(d, 1);
    set.add(d);
  }
  return set;
}
export function suspended(d, p, s) {
  if (p.suspension === 'none') return false;
  assert.equal(p.suspension, 'three');
  const md = d.slice(5), easter = s.easter[d.slice(0, 4)];
  assert.ok(easter);
  return md <= '01-02' || md >= '12-18' || (md >= '07-15' && md <= '08-15')
    || (d >= add(easter, -7) && d <= add(easter, 7));
}
function urRestricted(d, s) {
  const md = d.slice(5), e = s.easter[d.slice(0, 4)];
  return md >= '12-18' || md <= '01-06' || (d >= add(e, -8) && d <= add(e, 8));
}
function prepared(item, s) {
  const p = s.paths.find(p => p.id === item.path);
  if (!p) return { result: boundary('unknownResearchPath') };
  const f = { ...s.sharedSyntheticFacts, stage: p.stage, action: p.action,
    opening: p.opening, holidayAnchor: p.holidayAnchor, targetCourt: p.requiredCourt ?? 'notApplicable',
    sameIssuingCourt: p.sameIssuingCourt ?? false,
    openingOrigin: p.opening === 'completeReasonedAdministrativeDecision' ? 'originalReasoned' : 'notApplicable', ...item.facts };
  if (!valid(item.trigger)) return { result: boundary('invalidResearchDate') };
  if (f.stage !== p.stage) return { result: boundary('stageDoesNotMatchPath') };
  if (f.action !== p.action) return { result: boundary('actionNotQualified') };
  if (f.authorityLevel !== 'cantonal') return { result: boundary('targetOutsideScope') };
  if (f.holidayAnchor !== p.holidayAnchor) return { result: boundary('holidayAnchorNotQualified') };
  if (f.opening !== p.opening) return { result: boundary('openingNotQualified') };
  if (p.requiredCourt && f.targetCourt !== p.requiredCourt) return { result: boundary('targetCourtNotQualified') };
  if (p.sameIssuingCourt && f.sameIssuingCourt !== true) return { result: boundary('courtReasonsWrongRecipient') };
  if (p.opening === 'completeReasonedAdministrativeDecision') {
    if (!['originalReasoned', 'reasonedFollowingRequest'].includes(f.openingOrigin)) return { result: boundary('openingOriginNotQualified') };
    if (f.openingOrigin === 'reasonedFollowingRequest' && f.priorReasonsRequest !== 'timelyEstablished') return { result: boundary('priorReasonsRequestNotEstablished') };
  }
  if (f.specialLaw !== 'excluded') return { result: boundary('specialLawNotExcluded') };
  if (f.materialPerformance !== false) return { result: boundary('materialPerformanceOutsideScope') };
  if (f.fixedEndDate !== false || f.deviatingStart !== false) return { result: boundary('fixedDateOrDeviatingStart') };
  if (f.termChange !== 'none') return { result: boundary('termChangeNeedsIndividualReview') };
  if (f.unit !== 'day' || f.direction !== 'forward') return { result: boundary('unsupportedUnitOrDirection') };
  if (f.notice !== 'uncontested') return { result: boundary('noticeNeedsIndividualReview') };
  if (f.suspensionContext !== 'ordinaryNoException') return { result: boundary('suspensionExceptionNotQualified') };
  if (f.serviceContext !== 'effectiveLegalTriggerKnown') return { result: boundary('serviceFictionNotCalculated') };
  if (p.canton === 'UR' && f.urOpeningConsequence !== 'ordinaryEffectiveOpening') return { result: boundary('urOpeningSpecialConsequenceUnresolved') };
  if (['UR-ADMIN-20', 'UR-COURT-20'].includes(p.id) && f.coordinatedDecision !== false) return { result: boundary('urCoordinatedLongestPeriodNotQualified') };
  if (p.canton === 'UR' && f.localHolidayEffect !== 'noAdditionalRelevantLocalHoliday') return { result: boundary('urLocalHolidayEffectUnresolved') };
  if (p.canton === 'SH' && f.shortenedRekurs !== false) return { result: boundary('shShortenedRekursOutsideOrdinaryPath') };
  if (!Number.isSafeInteger(item.days) || item.days < 1) return { result: boundary('dayDurationNotSpecified') };
  if (p.days !== null && item.days !== p.days) return { result: boundary('statutoryDurationMismatch') };
  if (!within(item.trigger, s)) return { result: windowBoundary() };
  return { p, f };
}
export function evaluate(item, s) {
  const a = prepared(item, s);
  if (a.result) return a.result;
  const { p } = a;
  let d = item.trigger, count = 0, skippedDays = 0, firstCountedDay;
  while (count < item.days) {
    d = add(d, 1);
    if (!within(d, s)) return windowBoundary();
    if (suspended(d, p, s)) { skippedDays++; continue; }
    firstCountedDay ??= d;
    count++;
  }
  const nominalEnd = d, shifts = [];
  while (weekend(d) || holidays(p.calendar, Number(d.slice(0, 4)), s).has(d)) {
    d = add(d, 1);
    if (!within(d, s)) return windowBoundary();
    shifts.push(d);
  }
  const collision = shifts.find(day => suspended(day, p, s));
  if (collision) return { outcome: 'unresolvedBoundaryProposed', reason: 'G1-END-SUSPENSION',
    nominalEnd, ordinaryShiftEnd: d, firstSuspendedShiftDate: collision };
  const warnings = p.openingRestriction && urRestricted(item.trigger, s) ? ['UR-ART22'] : [];
  return { outcome: 'datedResearchValue', ordinaryStart: add(item.trigger, 1), firstCountedDay,
    nominalEnd, end: d, skippedDays, endShiftDays: epoch(d) - epoch(nominalEnd), warnings,
    temporalBinding: s.temporalBindings[p.canton] };
}
const fmt = d => /^\d{4}-\d{2}-\d{2}$/.test(d ?? '') ? `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : d;
const cell = s => String(s ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
function markdown(s, r) {
  return [
    '# AP23G1 Forschungsreferenzfälle für Uri Solothurn und Schaffhausen', '',
    'Stand 22. Oktober 2026. **Fachlicher Abnahmevorschlag, keine Produktprüfung oder operative Freigabe.**', '',
    `${r.paths} Forschungsgruppen und ${r.referenceCases} Fälle. ${r.counts.datedResearchValue} Datumssollwerte, ${r.counts.unresolvedBoundaryProposed} offene Endverschiebungsfälle, ${r.counts.qualificationBoundaryProposed} vorgeschlagene Qualifikationsgrenzen und ${r.counts.researchWindowBoundary} Fenstergrenzen. ${r.discrepancies.length} Abweichungen von den vorgegebenen Erwartungen.`, '',
    'Alle positiven Fälle sind ausdrücklich synthetisch vollständig qualifiziert. Die gemeinsamen Fakten in der Fixture sind Forschungsannahmen, keine Benutzerdefaults. Das massgebende Eröffnungsdatum ist bekannt. Zustellfiktion und die Bewertung gewöhnlicher Postzustellung werden hier nicht neu berechnet.', '',
    '## Reproduktion und Unabhängigkeit', '',
    '`node scripts/check-ap23g1-references.mjs` prüft die vorgegebenen Erwartungen. `--write` erzeugt nur diese Tabelle und den eigenen Forschungsbericht. `python scripts/check_ap23g1_independent.py` prüft dieselben Vorgaben mit einer getrennten Python-Implementierung und datumsbasierter Enumeration. Beide importieren weder Produktrechner noch Releasekalender. Gemeinsame Rechtsparameter bleiben eine fachlich abzunehmende Grundlage, keine durch zwei Programme bewiesene Rechtsauslegung.', '',
    `Fixture SHA-256: \`${r.fixtureSha256}\`. Node-Checker SHA-256: \`${r.checkerSha256}\`. Der getrennte Python-Nachweis steht in [independent-verification.json](../../outputs/ap23g1-2026-10-22/independent-verification.json).`, '',
    '## Forschungsgruppen', '',
    '| Gruppe | Stufe | Tage | Feiertagsbindung | Stillstand |', '| --- | --- | ---: | --- | --- |',
    ...s.paths.map(p => `| ${p.id} | ${p.stage} | ${p.days ?? 'angeordnet'} | ${p.calendar}, ${p.holidayAnchor} | ${p.suspension === 'three' ? 'Drei Perioden' : 'Keiner'} |`), '',
    'Die drei Perioden sind Ostern minus sieben bis plus sieben Tage, 15. Juli bis 15. August und 18. Dezember bis 2. Januar, je einschliesslich. Wochenenden und Feiertage innerhalb einer laufenden Frist zählen mit. Erst das Fristende wird verschoben. Ein erster Zähltag nach dem Stillstand kann Sonntag sein.', '',
    '## Fälle', '',
    '| Fall | Gruppe | Empfang | Tage | Sollwert oder vorgeschlagene Grenze | Zweck |', '| --- | --- | --- | ---: | --- | --- |',
    ...r.results.map(row => {
      const c = s.cases.find(c => c.id === row.id), a = row.actual;
      const value = a.outcome === 'datedResearchValue' ? `${fmt(a.end)}${a.warnings.length ? ' mit UR-Art.-22-Hinweis' : ''}`
        : a.outcome === 'unresolvedBoundaryProposed' ? `Offen: letzter Zähltag ${fmt(a.nominalEnd)}, blosse Endverschiebung ${fmt(a.ordinaryShiftEnd)}`
        : a.outcome === 'researchWindowBoundary' ? 'Ausserhalb des vollständigen Forschungsfensters'
        : `Qualifikationsgrenze: ${a.reason}`;
      return `| ${c.id} | ${c.path} | ${fmt(c.trigger)} | ${c.days ?? 'offen'} | ${cell(value)} | ${cell(c.note)} |`;
    }), '',
    '## Rechtliche Grenzen der Sollwerte', '',
    'Der UR-Art.-22-Hinweis folgt dem vorgeschlagenen Verständnis als Soll-Eröffnungsrestriktion ohne erfundenen Stillstand. Positive Werte setzen eine wirksame, tatsächlich massgebende Eröffnung voraus. Bei behaupteter besonderer Eröffnungsrechtsfolge gibt es keinen Datumssollwert. Für UR-Begründungsverlangen wird keine gerichtliche Begründungsfrist behauptet.', '',
    'Die SH-Begründungsanforderungen sind selbständige Zehn- beziehungsweise Dreissigtageshandlungen, keine zwanzigtägigen Rechtsmittel. Der zweite Handlungsschritt wird nur aus der späteren, rechtlich massgebenden begründeten Eröffnung gerechnet, nicht aus einem vermuteten Gesuchsdatum.', '',
    'Die offenen Endverschiebungskonstellationen betreffen eine Zählung bis 20.03.2027, deren gewöhnliche Wochenendverschiebung in den am 21.03.2027 beginnenden Osterstillstand geriete. Alle sieben gerichtlichen Forschungsgruppen haben eine eigene Kollisionsprobe. Die vorgeschlagene enge Produktgrenze wird für jede kantonale Verweisung eigenständig begründet. Sie ist kein nachgewiesenes gesetzliches Berechnungsverbot. Negative Forschungsfälle beweisen keine effektive Sperre der bestehenden App oder ihres Exports.', '',
    'Das vollständige Forschungsfenster ist 29.08.2026 bis 31.12.2027. Ein gedecktes Empfangsdatum allein genügt nicht. Alle Zähl-, Stillstands- und Endverschiebungstage müssen darin liegen. Kalenderproben ausserhalb des Fensters sind nur isolierte Listenprüfungen, keine zusätzlichen Fallfreigaben.', '',
    '## Isolierte Kalenderproben', '',
    '| Liste | Datum | Feiertag | Zweck |', '| --- | --- | --- | --- |',
    ...s.calendarProbes.map(p => `| ${p.calendar} | ${fmt(p.date)} | ${p.isHoliday ? 'Ja' : 'Nein'} | ${cell(p.note)} |`), '',
    `SH-Januar-Sensitivität: ${r.shJanuarySensitivity.daysCompared} Tage im Fallfenster verglichen, ${r.shJanuarySensitivity.endEligibilityDifferences} Unterschiede der Endtagszulässigkeit mit oder ohne 2. Januar. Das ersetzt keine rechtliche Begründung des Tages und verändert keinen bisherigen SH-/StPO-Entscheid.`, '',
    'Fachliche Herleitung: [Fachvorlage](verwaltungsverfahren-ap23g1.md) und [Quellenprüfung](quellenpruefung-ap23g1.md). Kein Produktcode, Rechtsrelease, Schema, bestehende Testfixture oder Betriebsstand wurde dafür verändert.', ''
  ].join('\n');
}
export async function runReferences() {
  const b = await readFile(resolve(root, fixture)), s = JSON.parse(b);
  assert.equal(s.formatVersion, 'ap23g1-research-references-1');
  assert.equal(s.runtimeActive, false);
  assert.equal(s.productTest, false);
  assert.equal(s.paths.length, s.expectedPathCount);
  assert.equal(new Set(s.paths.map(p => p.id)).size, s.paths.length);
  assert.equal(new Set(s.cases.map(c => c.id)).size, s.cases.length);
  const discrepancies = [];
  const results = s.cases.map(c => {
    assert.ok(Object.hasOwn(c.expected, 'outcome'));
    const actual = evaluate(c, s);
    for (const [key, expected] of Object.entries(c.expected)) {
      if (JSON.stringify(actual[key]) !== JSON.stringify(expected)) discrepancies.push({ id: c.id, key, expected, actual: actual[key] ?? null });
    }
    if (actual.outcome !== 'datedResearchValue') assert.equal(Object.hasOwn(actual, 'end'), false);
    return { id: c.id, path: c.path, expected: c.expected, actual };
  });
  for (const p of s.paths) assert.ok(results.some(r => r.path === p.id && r.actual.outcome === 'datedResearchValue'), `Missing positive research case ${p.id}`);
  let calendarCountChecks = 0;
  for (const [id, c] of Object.entries(s.calendarDefinitions)) for (const y of [2026, 2027]) {
    assert.equal(holidays(id, y, s).size, c.expectedAnnualRuleCount, `${id}/${y}`);
    calendarCountChecks++;
  }
  for (const p of s.calendarProbes) {
    const actual = holidays(p.calendar, Number(p.date.slice(0, 4)), s).has(p.date);
    if (actual !== p.isHoliday) discrepancies.push({ type: 'calendarProbe', ...p, actual });
  }
  let daysCompared = 0, endEligibilityDifferences = 0;
  for (let d = s.referenceWindow.from; within(d, s); d = add(d, 1)) {
    const list = holidays('SH-VRG-PRACTICE', Number(d.slice(0, 4)), s);
    const both = weekend(d) || list.has(d), without = weekend(d) || (d.slice(5) !== '01-02' && list.has(d));
    if (both !== without) endEligibilityDifferences++;
    daysCompared++;
  }
  const counts = Object.fromEntries(['datedResearchValue', 'unresolvedBoundaryProposed', 'qualificationBoundaryProposed', 'researchWindowBoundary']
    .map(k => [k, results.filter(r => r.actual.outcome === k).length]));
  const r = { workPackage: 'AP23G1', asOf: s.asOf, status: discrepancies.length ? 'discrepancies' : 'passedResearchComparison',
    runtimeActive: false, productTest: false, exportTest: false, legalApproval: false,
    fixtureSha256: sha(b), checkerSha256: sha(await readFile(fileURLToPath(import.meta.url))),
    paths: s.paths.length, referenceCases: results.length, counts, calendarProbes: s.calendarProbes.length, calendarCountChecks,
    shJanuarySensitivity: { daysCompared, endEligibilityDifferences, legalQuestionResolvedBySensitivity: false },
    discrepancies, results };
  return { suite: s, report: r };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { suite, report } = await runReferences();
  if (process.argv.includes('--write')) {
    await mkdir(resolve(root, 'outputs/ap23g1-2026-10-22'), { recursive: true });
    await writeFile(resolve(root, output), JSON.stringify(report, null, 2) + '\n');
    await writeFile(resolve(root, 'docs/fachrecht/referenzfaelle-ap23g1.md'), markdown(suite, report));
  }
  console.log(JSON.stringify({ ...report, results: undefined }, null, 2));
  if (report.discrepancies.length) process.exitCode = 1;
}
