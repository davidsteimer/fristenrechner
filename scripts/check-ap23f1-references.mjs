// SPDX-License-Identifier: AGPL-3.0-only
// Independent legal-research reference calculator. Node built-ins only.
// No product import, release-data import, runtime activation or export test.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixturePath = 'docs/fachrecht/ap23f1/referenzfaelle.json';
const reportPath = 'outputs/ap23f1-2026-10-22/reference-verification.json';
const tablePath = 'docs/fachrecht/referenzfaelle-ap23f1.md';
const dayMs = 86_400_000;
const epochDay = value => Date.parse(`${value}T00:00:00Z`) / dayMs;
const iso = value => new Date(value * dayMs).toISOString().slice(0, 10);
const add = (value, days) => iso(epochDay(value) + days);
const weekday = value => new Date(`${value}T00:00:00Z`).getUTCDay();
const weekend = value => [0, 6].includes(weekday(value));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(epochDay(value)) && iso(epochDay(value)) === value;
const boundary = (outcome, reason, extra = {}) => ({ outcome, reason, ...extra });
const qualificationBoundary = reason => boundary('qualificationBoundaryProposed', reason);
const windowBoundary = () => boundary('researchWindowBoundary', 'outsideReferenceWindow');

export function holidays(calendarId, year, suite) {
  const spec = suite.calendarDefinitions[calendarId];
  assert.ok(spec && suite.easter[year], `Missing reference calendar ${calendarId}/${year}`);
  return new Set([...spec.fixed.map(md => `${year}-${md}`),
    ...spec.easterOffsets.map(n => add(suite.easter[year], n))]);
}
export function suspended(date, path, suite) {
  if (path.suspension === 'none') return false;
  assert.equal(path.suspension, 'three');
  const md = date.slice(5);
  const easter = suite.easter[Number(date.slice(0, 4))];
  assert.ok(easter, `No reference Easter for ${date}`);
  return md >= '12-18' || md <= '01-02' || (md >= '07-15' && md <= '08-15')
    || (date >= add(easter, -7) && date <= add(easter, 7));
}
function disallowedEnd(date, path, suite) {
  return weekend(date) || holidays(path.calendar, Number(date.slice(0, 4)), suite).has(date);
}
function within(date, suite) {
  return date >= suite.referenceWindow.from && date <= suite.referenceWindow.to;
}
function prepare(item, suite) {
  const path = suite.paths.find(p => p.id === item.path);
  if (!path) return { result: qualificationBoundary('unknownResearchPath') };
  // These are explicitly synthetic qualified facts, not inferred user facts.
  const facts = { ...suite.sharedSyntheticFacts, stage: path.stages[0],
    qualification: path.qualification, subject: path.requiredSubject ?? 'qualifiedGeneralMatter',
    notice: path.requiredNotice ?? suite.sharedSyntheticFacts.notice,
    ...item.facts };
  if (!validDate(item.trigger)) return { result: qualificationBoundary('invalidResearchDate') };
  if (!path.stages.includes(facts.stage)) return { result: qualificationBoundary('stageDoesNotMatchPath') };
  if (facts.qualification !== path.qualification) return { result: qualificationBoundary('actionNotQualified') };
  if (path.requiredSubject && facts.subject !== path.requiredSubject) return { result: qualificationBoundary('vrkSubjectNotQualified') };
  if (facts.authorityLevel !== 'cantonal') return { result: qualificationBoundary('targetOutsideScope') };
  if (facts.holidayAnchor !== 'targetAuthoritySeat') return { result: qualificationBoundary('holidayAnchorNotQualified') };
  if (facts.opening !== 'completeLegalTriggerKnown') return { result: qualificationBoundary('openingNotQualified') };
  if (facts.specialLaw !== 'excluded') return { result: qualificationBoundary('specialLawNotExcluded') };
  if (facts.paymentOrMaterialPerformance !== false) return { result: qualificationBoundary('paymentOrMaterialPerformanceOutsideScope') };
  if (facts.fixedEndDate !== false || facts.deviatingStart !== false) return { result: qualificationBoundary('fixedDateOrDeviatingStart') };
  if (facts.termChange !== 'none') return { result: qualificationBoundary('termChangeNeedsIndividualReview') };
  if (facts.unit !== 'day' || facts.direction !== 'forward') return { result: qualificationBoundary('unsupportedUnitOrDirection') };
  if (path.requiredNotice && facts.notice !== path.requiredNotice) return { result: qualificationBoundary('exceptionNoticeNeedsIndividualReview') };
  if (!path.requiredNotice && facts.notice !== 'uncontested') return { result: qualificationBoundary('noticeNeedsIndividualReview') };
  if (path.canton === 'ZH' && facts.zh2027ChannelCase !== 'ordinaryNoFictionNoOutage') return { result: qualificationBoundary('zh2027SpecialChannelCase') };
  if (!Number.isInteger(item.days) || item.days < 1) return { result: qualificationBoundary('orderedOrStatutoryDaysNotSpecified') };
  if (path.days !== null && item.days !== path.days) return { result: qualificationBoundary('statutoryDurationMismatch') };
  if (!within(item.trigger, suite)) return { result: windowBoundary() };
  return { path, facts };
}
function temporalBindings(path, from, to, suite) {
  return suite.temporalBindings[path.canton].filter(b => b.to >= from && b.from <= to).map(b => b.binding);
}
function finish(item, path, nominalEnd, firstCountedDay, skippedDays, suite) {
  let cursor = nominalEnd;
  const endShiftDates = [];
  while (disallowedEnd(cursor, path, suite)) {
    cursor = add(cursor, 1);
    if (!within(cursor, suite)) return windowBoundary();
    endShiftDates.push(cursor);
  }
  const firstSuspendedShiftDate = endShiftDates.find(date => suspended(date, path, suite));
  if (firstSuspendedShiftDate) return boundary('unresolvedBoundaryProposed', 'F1-O1', {
    nominalEnd, ordinaryShiftEnd: cursor, firstSuspendedShiftDate,
    status: suite.proposedCommonBoundary.status
  });
  return { outcome: 'datedResearchValue', ordinaryStart: add(item.trigger, 1), firstCountedDay,
    nominalEnd, end: cursor, skippedDays, endShiftDays: epochDay(cursor) - epochDay(nominalEnd),
    temporalBindings: temporalBindings(path, item.trigger, cursor, suite) };
}
export function evaluate(item, suite) {
  const prepared = prepare(item, suite);
  if (prepared.result) return prepared.result;
  const { path } = prepared;
  let cursor = item.trigger, counted = 0, skippedDays = 0, firstCountedDay;
  while (counted < item.days) {
    cursor = add(cursor, 1);
    if (!within(cursor, suite)) return windowBoundary();
    if (suspended(cursor, path, suite)) { skippedDays++; continue; }
    firstCountedDay ??= cursor;
    counted++;
  }
  return finish(item, path, cursor, firstCountedDay, skippedDays, suite);
}
function evaluateByEnumeration(item, suite) {
  const prepared = prepare(item, suite);
  if (prepared.result) return prepared.result;
  const { path } = prepared;
  // Independent counting strategy: choose the nth eligible day from the entire window.
  const eligible = [];
  for (let date = add(item.trigger, 1); within(date, suite); date = add(date, 1)) {
    if (!suspended(date, path, suite)) eligible.push(date);
  }
  if (eligible.length < item.days) return windowBoundary();
  const nominalEnd = eligible[item.days - 1];
  const skippedDays = epochDay(nominalEnd) - epochDay(item.trigger) - item.days;
  return finish(item, path, nominalEnd, eligible[0], skippedDays, suite);
}
function classifyCounts(results) {
  return Object.fromEntries(['datedResearchValue', 'unresolvedBoundaryProposed',
    'qualificationBoundaryProposed', 'researchWindowBoundary'].map(key => [key, results.filter(r => r.actual.outcome === key).length]));
}
const fmt = value => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') ? `${value.slice(8)}.${value.slice(5, 7)}.${value.slice(0, 4)}` : value;
const escapeCell = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
function markdown(suite, report) {
  const counts = report.counts;
  const lines = [
    '# AP23F1 Forschungsreferenzfälle für Zürich Aargau und St Gallen', '',
    `Stand ${fmt(suite.asOf)}. Reproduzierbare Beilage zur Fachvorlage. **Forschungs-Sollwerte, keine Fachabnahme, Produktprüfung, Exportsperrprüfung oder operative Freigabe.**`, '',
    `Das vorgeschlagene Fenster ${fmt(suite.referenceWindow.from)} bis ${fmt(suite.referenceWindow.to)} muss alle bewerteten Tage umfassen. Alle positiven Fälle verwenden ausdrücklich synthetische vollständige Qualifikationen gemäss der jeweiligen Forschungsgruppe. Daraus werden keine tatsächlichen Benutzerangaben abgeleitet.`, '',
    '## Umfang und Prüfergebnis', '',
    `- ${report.paths} Forschungsgruppen, alle mit mindestens einem positiven Datumssollwert.`,
    `- ${report.referenceCases} Fälle, davon ${counts.datedResearchValue} mit Datum, ${counts.unresolvedBoundaryProposed} ungeklärte F1-O1-Grenzfälle, ${counts.qualificationBoundaryProposed} vorgeschlagene Qualifikationsgrenzen und ${counts.researchWindowBoundary} Fenstergrenzen.`,
    `- Zwei Zählweisen gegengeprüft: Tagesfortschaltung und Auswahl des n-ten geeigneten Datums aus einer vollständig enumerierten Datumsmenge. ${report.secondaryCalculationComparisons} Übereinstimmungen. Die Kalenderparameter sind gemeinsame explizite Forschungsannahmen.`,
    `- ${report.calendarProbes} einzelne Kalenderproben und ${report.calendarRuleCountChecks} Jahresregelzählungen. Keine Produktkalender importiert oder verändert.`,
    `- ZH-Januar-Vergleich: ${report.zhJanuarySensitivity.daysCompared} Kalendertage im Fenster, ${report.zhJanuarySensitivity.endEligibilityDifferences} Unterschiede der Endtagszulässigkeit zwischen RLG und einer um den 2. Januar ergänzten Liste. Das klärt die offene rechtliche Anerkennung ausserhalb dieses Fensters nicht.`,
    `- ${report.discrepancies.length} Abweichungen zwischen festgelegten Erwartungen und Referenzrechnung.`, '',
    '## Reproduzieren', '',
    'Aus dem Repositoryordner `node scripts/check-ap23f1-references.mjs` ausführen. Mit `--write` werden ausschliesslich dieser Tabellen-Nachweis und `outputs/ap23f1-2026-10-22/reference-verification.json` mechanisch erzeugt. Das Skript importiert nur Node-Standardmodule und die eigene Forschungsfixture, keinen Produktkern und keine Releasekalender.', '',
    `Fixture SHA-256: \`${report.fixtureSha256}\`. Checker SHA-256: \`${report.checkerSha256}\`.`, '',
    '## Rechtsgrundlagen und Parameter', '',
    'Fachliche Herleitung und Fassungen stehen in den Nachweisen für [Zürich](ap23f1/recherche-zh.md), [Aargau](ap23f1/recherche-ag.md) und [St. Gallen](ap23f1/recherche-sg.md). Diese Tabelle ersetzt die rechtliche Fachabnahme nicht.', '',
    '| Forschungsgruppe | Stufe | Dauer | Kalender | Stillstand |', '| --- | --- | ---: | --- | --- |',
    ...suite.paths.map(p => `| ${p.id} | ${p.stages.join(' / ')} | ${p.days ?? 'angeordnet'} | ${p.calendar} | ${p.suspension === 'three' ? 'Drei Perioden' : 'Keiner'} |`), '',
    'Die drei Perioden laufen einschliesslich Ostern minus sieben bis plus sieben Tage, 15. Juli bis 15. August und 18. Dezember bis 2. Januar. Feiertage und Wochenenden innerhalb einer laufenden Frist werden mitgezählt, ausser sie liegen in einem anwendbaren Stillstand. Ein erster Zähltag nach dem Stillstand kann Sonntag sein.', '',
    'ZH-RLG enthält neun Tage. ZH-GOG enthält zusätzlich den 2. Januar. AG enthält tatsächlich 14 Tage: 1. und 2. Januar, 1. Mai, 1. und 15. August, 1. November, 8., 25. und 26. Dezember sowie Ostern minus zwei, plus eins, plus 39, plus 50 und plus 60 Tage. SG enthält neun Tage und keinen 2. Januar. Dieser bleibt bei den qualifizierten SG-Gerichtspfaden unabhängig davon letzter Winterstillstandstag.', '',
    'Die neue ZH-Normbindung ab 2027 und die organisatorische SG-Fassung ab 1. Juni 2027 sind in den positiven Ergebnissen zeitlich ausgewiesen. Die gewöhnliche Tagesarithmetik bleibt gleich. Abruffiktion, besondere Kanalstörung und individuelle Friständerung werden dadurch nicht berechnet.', '',
    'Die positiven SG-VRK-Fälle betreffen ausschliesslich den Rekurs gegen eine bereits formell eröffnete kantonale Departementsverfügung über Zugang zu amtlichen Dokumenten nach Art. 17 OeffG, mit Zuständigkeit der VRK gemäss VRP Art. 41quater Abs. 1 Bst. a bis und Verweisung nach OeffG Art. 18 Abs. 1. Keine Steuer- oder sonstige Ferienausnahme. Das vorgelagerte Verlangen nach einer formellen Verfügung innert 14 Tagen ist nicht derselbe Pfad. SG-VRK-ORDERED bezeichnet eine tatsächlich angeordnete Eingabe in genau diesem Rekursverfahren.', '',
    '## Datumssollwerte und vorgeschlagene Grenzen', '',
    '| Fall | Forschungsgruppe | Empfang | Tage | Forschungs-Sollwert oder vorgeschlagene Grenze | Zweck |', '| --- | --- | --- | ---: | --- | --- |',
    ...report.results.map(r => {
      const item = suite.cases.find(c => c.id === r.id);
      const a = r.actual;
      const result = a.outcome === 'datedResearchValue' ? fmt(a.end)
        : a.outcome === 'unresolvedBoundaryProposed' ? `F1-O1, offen. Letzter Zähltag ${fmt(a.nominalEnd)}, blosse Endverschiebung ${fmt(a.ordinaryShiftEnd)}`
        : a.outcome === 'researchWindowBoundary' ? 'Vorgeschlagene Fenstergrenze, kein Datumssollwert'
        : `Vorgeschlagene Qualifikationsgrenze: ${a.reason}`;
      return `| ${r.id} | ${item.path} | ${fmt(item.trigger)} | ${item.days ?? 'nicht bestimmt'} | ${escapeCell(result)} | ${escapeCell(item.note)} |`;
    }), '',
    '## Ungeklärte Endverschiebung F1 O1', '',
    'ZH14, AG11 und SG16 zählen bis Samstag, 20. März 2027. Der nächste gewöhnliche Werktag wäre der 22. März. Der anwendbare Osterstillstand beginnt jedoch bereits am 21. März. Der vorgeschlagene vorsichtige Produktumfang weist deshalb keinen definitiven Wert aus. **Dies ist eine ungeklärte Auslegung mit vorgeschlagener enger Produktgrenze, keine bewiesene gesetzliche Sperrnorm.** Die Reproduktion zeigt ausschliesslich, dass die Forschungsrechnung genau diese Kollision erkennt.', '',
    'Die übrigen negativen Fälle sind Vorschläge zur späteren Fallqualifikation. Es wurde nicht geprüft oder behauptet, dass eine bestehende App diese Fälle technisch sperrt. Ebenso fand kein Kalenderexport statt.', '',
    '## Kalenderproben ausserhalb des Fallfensters', '',
    'Einzelne Januarproben 2026 und die isolierende 1.-Mai-Probe 2028 prüfen ausschliesslich die Konstruktion und Unterscheidung der Listen. Sie erweitern weder das vorgeschlagene Fallfenster noch bestehende Freigaben.', '',
    '| Kalender | Datum | Feiertag in dieser Forschungsmenge | Einordnung |', '| --- | --- | --- | --- |',
    ...suite.calendarProbes.map(p => `| ${p.calendar} | ${fmt(p.date)} | ${p.isHoliday ? 'Ja' : 'Nein'} | ${p.scope} |`), '',
    '## Abweichungen', '',
    report.discrepancies.length ? 'Die folgenden Abweichungen sind vor der Fachabnahme zu bereinigen:' : 'Keine. Sämtliche festgelegten Forschungs-Erwartungen stimmen mit beiden Zählweisen überein.', '',
    ...report.discrepancies.map(d => `- ${escapeCell(JSON.stringify(d))}`), '',
    'Der Nachweis erteilt keine Fach-, Release- oder Betriebsfreigabe. Rechenlogik, freigegebene Rechtsdaten, bestehende Testdateien und E/Q/P bleiben unverändert.', ''
  ];
  return lines.join('\n');
}
export async function runReferences() {
  const bytes = await readFile(resolve(root, fixturePath));
  const suite = JSON.parse(bytes);
  assert.equal(suite.formatVersion, 'ap23f1-research-references-1');
  assert.equal(suite.runtimeActive, false);
  assert.equal(suite.productTest, false);
  assert.equal(suite.paths.length, 17);
  assert.equal(new Set(suite.paths.map(p => p.id)).size, 17);
  assert.equal(new Set(suite.cases.map(c => c.id)).size, suite.cases.length);
  const discrepancies = [];
  const results = suite.cases.map(item => {
    const actual = evaluate(item, suite), secondary = evaluateByEnumeration(item, suite);
    if (JSON.stringify(actual) !== JSON.stringify(secondary)) discrepancies.push({ id: item.id, type: 'twoCalculationMethods', actual, secondary });
    for (const [key, expected] of Object.entries(item.expected)) {
      if (JSON.stringify(actual[key]) !== JSON.stringify(expected)) discrepancies.push({ id: item.id, type: 'expectedValue', key, expected, actual: actual[key] ?? null });
    }
    if (actual.outcome !== 'datedResearchValue') assert.equal(Object.hasOwn(actual, 'end'), false, item.id);
    return { id: item.id, path: item.path, expected: item.expected, actual };
  });
  for (const path of suite.paths) {
    assert.ok(results.some(r => r.path === path.id && r.actual.outcome === 'datedResearchValue'), `No positive case ${path.id}`);
  }
  let calendarRuleCountChecks = 0;
  for (const [id, spec] of Object.entries(suite.calendarDefinitions)) {
    for (const year of [2026, 2027]) {
      assert.equal(holidays(id, year, suite).size, spec.expectedAnnualRuleCount, `${id}/${year}`);
      calendarRuleCountChecks++;
    }
  }
  for (const probe of suite.calendarProbes) {
    const actual = holidays(probe.calendar, Number(probe.date.slice(0, 4)), suite).has(probe.date);
    if (actual !== probe.isHoliday) discrepancies.push({ type: 'calendarProbe', ...probe, actual });
  }
  let daysCompared = 0, endEligibilityDifferences = 0;
  for (let date = suite.referenceWindow.from; within(date, suite); date = add(date, 1)) {
    const year = Number(date.slice(0, 4));
    const base = weekend(date) || holidays('ZH-RLG', year, suite).has(date);
    const alternative = base || date.slice(5) === '01-02';
    if (base !== alternative) endEligibilityDifferences++;
    daysCompared++;
  }
  assert.equal(endEligibilityDifferences, 0);
  const report = {
    status: discrepancies.length ? 'discrepancies' : 'passedResearchComparison', asOf: suite.asOf,
    runtimeActive: false, productTest: false, exportTest: false, legalApproval: false,
    negativeCasesMeaning: 'Proposed qualification/window boundaries, not evidence of effective product blocking',
    fixtureSha256: hash(bytes), checkerSha256: hash(await readFile(fileURLToPath(import.meta.url))),
    referenceWindow: suite.referenceWindow, paths: suite.paths.length, referenceCases: results.length,
    counts: classifyCounts(results), secondaryCalculationComparisons: results.length,
    calendarProbes: suite.calendarProbes.length, calendarRuleCountChecks,
    zhJanuarySensitivity: { daysCompared, endEligibilityDifferences, legalQuestionResolved: false },
    discrepancies, results
  };
  return { suite, report };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { suite, report } = await runReferences();
  if (process.argv.includes('--write')) {
    await mkdir(resolve(root, 'outputs/ap23f1-2026-10-22'), { recursive: true });
    await writeFile(resolve(root, reportPath), JSON.stringify(report, null, 2) + '\n');
    await writeFile(resolve(root, tablePath), markdown(suite, report));
  }
  console.log(JSON.stringify({ ...report, results: undefined }, null, 2));
  if (report.discrepancies.length) process.exitCode = 1;
}
