// SPDX-License-Identifier: AGPL-3.0-only
// Explicitly generated review table. Hand-edit source cases, not this derived table.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { runReferences } from './check-ap23e1-references.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const suite = JSON.parse(await readFile(resolve(root, 'tests/golden/candidates/ap23e1-administrative.json'), 'utf8'));
const report = await runReferences();
const results = new Map(report.results.map(r => [r.id, r]));
const de = iso => iso ? iso.split('-').reverse().join('.') : '–';
const reasons = {
  'AR-O1-endShiftIntoSuspension': 'Offene Endverschiebung in beginnenden Stillstand',
  actionDoesNotMatchPath: 'Handlung liegt ausserhalb des ausgewählten Pfads',
  shortenedOrSpecialPeriod: 'Verkürzte oder besondere Frist ist kein ordentlicher Rechtsmittelpfad',
  openingNotQualified: 'Rechtlich massgebende vollständige Eröffnung nicht geklärt',
  noticeNeedsIndividualReview: 'Fehlende oder fehlerhafte Belehrung braucht gesonderte Prüfung',
  specialLawNotExcluded: 'Besonderes Recht ist nicht durch den allgemeinen Pfad freigegeben',
  fixedDateOrDeviatingStart: 'Fixtermin oder abweichender Beginn, keine gewöhnliche Tagesfrist',
  unsupportedUnit: 'Keine Tagesfrist', authorityOutsideScope: 'Zielinstanz liegt ausserhalb des kantonalen Pilots',
  outsideReferenceRange: 'Mindestens ein notwendiger Tag liegt ausserhalb des Fachfensters',
  decisionOutsideScope: 'Nicht als Endentscheid qualifiziert',
  executionOrderNotQualified: 'Keine qualifizierte Vollstreckungsverfügung nach Art. 63 VRPG',
  stageDoesNotMatchPath: 'Verfahrensstufe passt nicht zum Pfad'
};
const parts = [
  '# AP23E1 Referenzfälle für Luzern Zug und Appenzell Ausserrhoden',
  'Stand 18. Oktober 2026. **Fachvorlage, noch nicht abgenommen.** Diese Tabelle wird aus der [maschinenlesbaren Fachreferenz](../../tests/golden/candidates/ap23e1-administrative.json) abgeleitet. Keine neuen Produktdaten und kein Integrationstest. Massgebend sind die Fallqualifikation, Pfaddefinitionen und Zeitfenster der [Fachvorlage](verwaltungsverfahren-ap23e1.md).',
  '## Gemeinsame Voraussetzungen',
  'Bei positiven Fällen stehen kantonale Zielstelle, zulässiger allgemeiner Weg, vollständige tatsächliche Eröffnung und unbestrittene Belehrung fest. Ordentliche Beschwerden betreffen Endentscheide. Der Fünftagesrekurs betrifft eine qualifizierte Vollstreckungsverfügung nach Art. 63 VRPG. Angeordnete Tage betreffen nur Verfahrenseingaben. Keine abweichende Spezialnorm, Verkürzung, Friständerung, Zahlungsfrist oder Zustellfiktion. Kalenderanknüpfung ist die kantonale Zielstelle. Diese Forschungsangaben sind keine neuen GUI-Felder.',
  'LU ab 27.09.2026, ZG/AR ab 29.08.2026, alle benötigten Tage bis 31.12.2027. Zukunftsfälle unter Normfortgeltungsannahme. Die Prüfung der Kalenderformeln ausserhalb dieses Fensters erweitert die Fallfreigabe nicht.',
  '## Positive Datumssollwerte'
];
for (const canton of ['LU', 'ZG', 'AR']) {
  const rows = suite.cases.filter(c => c.id.startsWith(canton) && results.get(c.id).outcome === 'reference')
    .map(c => { const r = results.get(c.id); return `| ${c.id} | ${c.input.path} | ${de(c.input.trigger)} | ${c.input.days} | ${de(r.nominalEnd)} | **${de(r.end)}** | ${c.focus} |`; });
  parts.push(`### ${canton}`, ['| Fall | Pfad | Empfang | Tage | Letzter gezählter Tag | Fristende | Zweck |', '| --- | --- | --- | ---: | --- | --- | --- |', ...rows].join('\n'));
}
parts.push('## Gesperrte und abgegrenzte Fälle', 'Kein definitives Enddatum und kein darauf gestützter Export. AR09 ist ein zur Fachentscheidung vorgeschlagener Sperrfall. Die anderen Fälle prüfen bewusst nicht aufgenommene oder unqualifizierte Konstellationen.');
const blockedRows = suite.cases.filter(c => results.get(c.id).outcome === 'blocked').map(c => {
  const r = results.get(c.id); assert.ok(reasons[r.reason], r.reason);
  const unit = c.input.unit === 'month' ? 'als Monatsfrist, nicht als Tage' : `${c.input.days} Tage angegeben`;
  return `| ${c.id} | ${c.focus} | ${c.input.path}, ${de(c.input.trigger)}, ${unit} | ${reasons[r.reason]} |`;
});
parts.push(['| Fall | Tatsächlicher Prüfgegenstand | Eingabe | Erwartete Behandlung |', '| --- | --- | --- | --- |', ...blockedRows].join('\n'));
parts.push('## Unabhängige Prüfungen',
  `Die ${report.referenceCases} Referenzen umfassen ${report.datedCases} Datumssollwerte und ${report.blockedCases} Sperrfälle. Der [JavaScript-Referenzchecker](../../scripts/check-ap23e1-references.mjs) liest keine Produktmodule. Er prüft zusätzlich ${report.negativeMutations} gezielt ungültige Varianten, ${report.calendarDayComparisons.toLocaleString('de-CH')} Kalendertage und ${report.calendarProbes} zusätzliche Kalenderbedingungen. [Prüfbericht](../../outputs/ap23e1-2026-10-18/QA-AP23E1.json).`,
  'Die getrennte [Python-Gegenrechnung](../../scripts/check_ap23e1_independent.py) verwendet eigene Pfaddefinitionen, eigene Feiertagslisten, eine eigenständige gregorianische Osterberechnung und eigene Zählung. Sie übernimmt nicht das Ergebnis des JavaScript-Checkers. [Unabhängiger Prüfbericht](../../outputs/ap23e1-2026-10-18/QA-AP23E1-INDEPENDENT.json). Beide Rechner prüfen die vorgegebenen fachlichen Sollwerte. Ihre Übereinstimmung ersetzt die menschliche rechtliche Abnahme nicht.',
  'Die zusätzlichen Kalenderproben betreffen den 2. Januar in LU/ZG gegenüber AR, Josefstag in LU/ZG sowie den AR-Stephanstag 2026–2029. Der Vergleich 2026–2027 berücksichtigt die Endtagswirkung einschliesslich Wochenenden. Er beweist keine historische positive Verfahrensfreigabe vor dem Fachfenster.',
  'Alle Forschungsergebnisse tragen `exportAllowed: false`, auch die positiven Sollwerte. Es werden keine Kalenderdateien erstellt. Die Sperrprüfung zeigt die Behandlung im unabhängigen Fachmodell, noch keine implementierte Sperre im Produkt. Die 95 bestehenden Produktquelldateien einschliesslich der lokal abgenommenen CSS-Korrektur und die 42 Dateien des MVP-0.8-Releases werden bytegebunden auf Unverändertheit geprüft.'
);
const document = parts.join('\n\n') + '\n';
const path = resolve(root, 'docs/fachrecht/referenzfaelle-ap23e1.md');
if (process.argv.includes('--write')) await writeFile(path, document);
else assert.equal(await readFile(path, 'utf8'), document, 'Review table differs from the research fixtures');
console.log(`AP23E1 table ${process.argv.includes('--write') ? 'written' : 'verified'}: ${report.referenceCases} cases`);
