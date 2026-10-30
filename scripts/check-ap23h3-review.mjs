// SPDX-License-Identifier: AGPL-3.0-only
// A separate local technical review, never a human four-eyes approval.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23h3-2026-10-22';
const hash=b=>createHash('sha256').update(b).digest('hex');
const raw=p=>readFile(resolve(root,p));
const bind=async path=>{const b=await raw(path);return{path,byteLength:b.length,sha256:hash(b)};};
const candidate=JSON.parse(await raw(out+'/bundle-integrity.json'));
const paths=[
  'src/core/administrativeTypesV5.ts','src/core/administrativeCatalogV5.ts','src/core/administrativeV5Baseline.ts',
  'src/core/format12Baseline.ts','src/core/releaseFormat12.ts','src/core/format12CalculationData.ts',
  'src/core/format12Runtime.ts','src/core/holidayActivationV12.ts','src/core/administrativeDeadline.ts',
  'src/core/administrativeCatalog.ts','src/core/administrativeContext.ts','src/core/modernRuntime.ts',
  'src/core/calendarResolution.ts','src/core/calculateCalendarBoundDeadline.ts',
  'src/core/calculateDeadline.ts','src/core/socialDeadline.ts','src/core/calculateSpecialDeadline.ts',
  'src/release/ap23h3CandidateData.ts','tests/core/ap23h3Fixtures.ts',
  'tests/core/ap23h3-independent.test.ts','tests/core/ap23h3-runtime.test.ts','scripts/check-ap23h3-review.mjs',
  ...[candidate.manifest,...candidate.artifacts].map(a=>a.path)
];
const before=await Promise.all(paths.map(bind));
const r=spawnSync(process.execPath,['--import','tsx','--test','tests/core/ap23h3-independent.test.ts','tests/core/ap23h3-runtime.test.ts'],
  {cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const text=(r.stdout??'')+(r.stderr??''),log=out+'/independent-core-review-tests.txt';
await writeFile(resolve(root,log),text);
assert.equal(r.status,0,text);
const counts=Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
assert.equal(counts.tests,13);
assert.equal(counts.pass,13);
assert.equal(counts.fail,0);
assert.equal(counts.skipped,0);
assert.match(text,/Individually removed mandatory current facts: 389/);
assert.deepEqual(await Promise.all(paths.map(bind)),before,'Reviewed source changed while tests ran');
const report={workPackage:'AP23H3',status:'passed',kind:'separate-ai-technical-countercheck',
  humanFourEyesReview:false,professionalAcceptance:false,operatingPermission:false,
  tests:{...counts,log:await bind(log)},
  cases:{mandatoryFactRemovals:389,contextForgeries:6,coercionValuesPerOwOpening:9,
    federalComparisons:104,bernSocialBindings:50,priorAdministrativePaths:58,priorAdministrativeComparisons:290},
  fixedDuringImplementation:[{finding:'V5 opening-origin coercion must not accept boxed or coercible objects',
    resolution:'Explicit primitive equality. Both original and timely-request branches reject non-string facts.'}],
  bindings:before};
await writeFile(resolve(root,out,'independent-core-review.json'),JSON.stringify(report,null,2)+'\n');
const markdown='# AP23H3 Ergänzender technischer Kerngegenreview\n\n'
  +'Stand: 22. Oktober 2026. Technische KI-Gegenprüfung, kein menschliches Vieraugenprinzip und keine fachliche oder operative Abnahme.\n\n'
  +'13 ergänzende Tests bestanden. Darin werden 389 Pflichtfakten einzeln entfernt, sechs Kontextfälschungen abgewiesen und je neun nicht primitive beziehungsweise unzulässige Eröffnungswerte in beiden OW-Beschwerdewegen geprüft. Spätere vollständige Begründungen benötigen weiterhin eine ausdrücklich rechtzeitige Voranforderung.\n\n'
  +'Die Prüfung bestätigt 104 Bundesverfahrens-/Kantonskombinationen und alle 50 Berner Sozialbindungen gegenüber dem tatsächlichen nativen Format-11-Ausgangspunkt. Für sämtliche 58 bisherigen Verwaltungswege werden fünf Stichtage, insgesamt 290 Vergleiche, einschliesslich ihrer rechtlichen Herkunft verglichen. Unberechenbare Bestandsgrenzen bleiben unberechenbar.\n\n'
  +'Konsistent neu gehashte Fehlvarianten prüfen geänderte OW-/NW-Quellenprovenienz, unbelegte Prüfstatusaufwertung, fehlende aktive Bundeskalender-Eltern und falsche aktuelle Komponentenbindungen. Die beiden neuen Prozesskalender werden nicht als Kalender der 104 Bundesprofilbindungen eingeführt.\n\n'
  +'Im Gegenreview wurde während der Umsetzung eine Zeichenkettenumwandlung bei der V5-Eröffnungsherkunft erkannt und durch strikte primitive Gleichheit ersetzt. Die Negativtests gegen umhüllte Zeichenketten und eigene Umwandlungsobjekte bestehen. Dieser Befund bleibt nicht offen.\n\n'
  +'[Maschinenlesbarer Nachweis](independent-core-review.json) und [vollständiges Testprotokoll](independent-core-review-tests.txt) binden die tatsächlichen Eingangsbytes. Die Tests laufen mit synthetischen Fakten. Sie ersetzen weder die H1-Fachabnahme noch die H3-Abnahme durch David Steimer.\n';
await writeFile(resolve(root,out,'independent-core-review.md'),markdown);
console.log(JSON.stringify({status:report.status,tests:counts,bindings:before.length},null,2));
