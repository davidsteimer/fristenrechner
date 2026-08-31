import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const reviewRoot = path.join(repositoryRoot, 'data', 'source-reviews');
const registerPath = path.join(reviewRoot, 'source-register.json');
const eventDirectory = path.join(reviewRoot, 'events');
const indexPath = path.join(reviewRoot, 'index.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function assertUnique(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    const value = item[key];
    if (seen.has(value)) {
      throw new Error(`${label}: doppelte ID ${value}`);
    }
    seen.add(value);
  }
}

function releaseDirectory(releaseId) {
  const directory = path.join(repositoryRoot, 'data', 'releases', releaseId);
  if (!fs.existsSync(directory)) {
    throw new Error(`Datenrelease nicht gefunden: ${releaseId}`);
  }
  return directory;
}

function sourceUsageForRelease(releaseId) {
  const directory = releaseDirectory(releaseId);
  const manifest = readJson(path.join(directory, 'manifest.json'));
  if (manifest.releaseId !== releaseId) {
    throw new Error(`${releaseId}: Manifest-ID stimmt nicht mit dem Ordner überein`);
  }

  const usage = new Map();
  const identifierKeys = [
    'ruleId',
    'deadlineDefinitionId',
    'filingProfileId',
    'regimeId',
    'suspensionSetId'
  ];

  function addUsage(sourceId, context, locator) {
    if (!usage.has(sourceId)) {
      usage.set(sourceId, {
        profileIds: new Set(),
        calendarIds: new Set(),
        componentIds: new Set(),
        locators: new Set()
      });
    }
    const record = usage.get(sourceId);
    if (context.profileId) record.profileIds.add(context.profileId);
    if (context.calendarId) record.calendarIds.add(context.calendarId);
    for (const key of identifierKeys) {
      if (context[key]) record.componentIds.add(context[key]);
    }
    if (locator) record.locators.add(locator);
  }

  function walk(node, inheritedContext = {}) {
    if (Array.isArray(node)) {
      for (const value of node) walk(value, inheritedContext);
      return;
    }
    if (!node || typeof node !== 'object') return;

    const context = { ...inheritedContext };
    for (const key of ['profileId', 'calendarId', ...identifierKeys]) {
      if (typeof node[key] === 'string') context[key] = node[key];
    }
    if (Array.isArray(node.sourceRefs)) {
      for (const reference of node.sourceRefs) {
        addUsage(reference.sourceId, context, reference.locator);
      }
    }
    for (const value of Object.values(node)) walk(value, context);
  }

  for (const artifact of manifest.artifacts) {
    const document = readJson(path.join(directory, artifact.path));
    walk(document);
  }
  return usage;
}

const register = readJson(registerPath);
assertUnique(register.sources, 'sourceId', 'Quellenregister');

const eventFiles = fs.readdirSync(eventDirectory)
  .filter((name) => name.endsWith('.json'))
  .sort();
if (eventFiles.length === 0) {
  throw new Error('Kein Quellenprüfereignis vorhanden');
}

const events = eventFiles.map((name) => {
  const event = readJson(path.join(eventDirectory, name));
  if (`${event.reviewEventId}.json` !== name) {
    throw new Error(`${name}: Dateiname und reviewEventId stimmen nicht überein`);
  }
  assertUnique(event.entries, 'sourceId', event.reviewEventId);
  return event;
});
assertUnique(events, 'reviewEventId', 'Quellenprüfereignisse');

const eventSourceIds = new Set(events.flatMap((event) => event.entries.map((entry) => entry.sourceId)));
for (const sourceId of eventSourceIds) {
  if (!register.sources.some((source) => source.sourceId === sourceId)) {
    throw new Error(`Nicht registrierte Quelle im Prüfprotokoll: ${sourceId}`);
  }
}

const releaseUsageCache = new Map();
function resolvedAffected(entry) {
  const affected = {
    releaseIds: [...entry.affected.releaseIds],
    profileIds: [...entry.affected.profileIds],
    calendarIds: [...entry.affected.calendarIds],
    componentIds: [...entry.affected.componentIds],
    locators: []
  };

  if (entry.affected.resolutionMode === 'allReferencesInRelease') {
    for (const releaseId of entry.affected.releaseIds) {
      if (!releaseUsageCache.has(releaseId)) {
        releaseUsageCache.set(releaseId, sourceUsageForRelease(releaseId));
      }
      const usage = releaseUsageCache.get(releaseId).get(entry.sourceId);
      if (!usage) {
        throw new Error(
          `${entry.sourceId}: keine Referenz im Datenrelease ${releaseId} gefunden`
        );
      }
      affected.profileIds.push(...usage.profileIds);
      affected.calendarIds.push(...usage.calendarIds);
      affected.componentIds.push(...usage.componentIds);
      affected.locators.push(...usage.locators);
    }
  }

  return Object.fromEntries(
    Object.entries(affected).map(([key, values]) => [key, sortedUnique(values)])
  );
}

function latestEntryFor(sourceId) {
  const candidates = [];
  for (const event of events) {
    for (const entry of event.entries) {
      if (entry.sourceId === sourceId) candidates.push({ event, entry });
    }
  }
  if (candidates.length === 0) {
    throw new Error(`Quelle ohne Prüfereignis: ${sourceId}`);
  }
  candidates.sort((left, right) => {
    const dateComparison = left.entry.reviewedOn.localeCompare(right.entry.reviewedOn);
    if (dateComparison !== 0) return dateComparison;
    return left.event.reviewEventId.localeCompare(right.event.reviewEventId);
  });
  return candidates.at(-1);
}

const latestEvent = [...events].sort((left, right) => {
  const dateComparison = left.recordedOn.localeCompare(right.recordedOn);
  if (dateComparison !== 0) return dateComparison;
  return left.reviewEventId.localeCompare(right.reviewEventId);
}).at(-1);

const index = {
  $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/source-review-index.schema.json',
  formatVersion: '1.0.0',
  dataKind: 'sourceReviewIndex',
  generatedOn: latestEvent.recordedOn,
  generatedFrom: {
    sourceRegister: 'source-register.json',
    eventDirectory: 'events',
    eventIds: events.map((event) => event.reviewEventId).sort()
  },
  nextAnnualReviewDue: latestEvent.nextAnnualReviewDue,
  sources: [...register.sources]
    .sort((left, right) => left.sourceId < right.sourceId ? -1 : left.sourceId > right.sourceId ? 1 : 0)
    .map((source) => {
      const { event, entry } = latestEntryFor(source.sourceId);
      return {
        sourceId: source.sourceId,
        usageStatus: source.usageStatus,
        jurisdiction: source.jurisdiction,
        subjectAreas: [...source.subjectAreas].sort(),
        latestReview: {
          reviewEventId: event.reviewEventId,
          recordStatus: event.recordStatus,
          reviewedOn: entry.reviewedOn,
          outcome: entry.outcome,
          finding: entry.evidence.finding,
          followUp: entry.followUp.required
        },
        affected: resolvedAffected(entry)
      };
    })
};

fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
console.log(
  `Quellenprüfindex mit ${index.sources.length} Quellen aus ${events.length} Ereignis(sen) erstellt.`
);
