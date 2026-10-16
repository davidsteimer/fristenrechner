// SPDX-License-Identifier: AGPL-3.0-only
import type { Locale } from './i18n';

export const calendarMessages = {
  de: {
    select: 'Bitte wählen', role: 'Zustellung an', authoritySeat: 'Sitz der zuständigen Stelle', intro: 'Bundesverfahren schweizweit als Prüfrechnung, VRPG und Spezialrecht für Bern im bisherigen freigegebenen Umfang.', productCoverage: 'Produktfenster Kalenderprüfung',
    court: 'Sitz des Gerichts', partyWithoutRepresentative: 'Partei ohne Vertretung',
    qualifiedServiceRepresentative: 'Eindeutig zustellungsberechtigte Vertretung',
    unresolvedMultiplePlaces: 'Andere oder ungeklärte Konstellation',
    canton: 'Massgebender Feiertagskanton', yes: 'Ja', no: 'Nein',
    partyCanton: 'Wohnsitz / Sitz der Partei – Kanton', representativeCanton: 'Wohnsitz / Sitz der Vertretung – Kanton',
    courtCanton: 'Sitz des Gerichts – Kanton', unresolvedCanton: 'Wohnsitz / Sitz – Kanton',
    technicalEvidence: 'Technische Nachweise', holidayPlace: 'Feiertage am massgebenden Ort',
    representationScope: 'Gemeint ist die für diese Zustellung eindeutig bestimmte Vertretung. Eine persönliche Handlung, ein Mandatswechsel oder mehrere ungeklärte Zustellorte sind damit nicht bestätigt.',
    regionalAI: 'Ort im Inneren Land von Appenzell Innerrhoden?',
    regionalNE: 'Ort in der Gemeinde Le Landeron?',
    regionalCourtAI: 'Gerichtssitz im Inneren Land von Appenzell Innerrhoden?', regionalCourtNE: 'Gerichtssitz in der Gemeinde Le Landeron?',
    regionalPartyAI: 'Wohnsitz / Sitz der Partei im Inneren Land von Appenzell Innerrhoden?', regionalPartyNE: 'Wohnsitz / Sitz der Partei in der Gemeinde Le Landeron?',
    regionalRepresentativeAI: 'Wohnsitz / Sitz der Vertretung im Inneren Land von Appenzell Innerrhoden?', regionalRepresentativeNE: 'Wohnsitz / Sitz der Vertretung in der Gemeinde Le Landeron?',
    reference: 'Schweizweite Kalender: lokale Prüfrechnung. Noch keine Freigabe für den Betrieb und kein Kalenderexport. Die bisherigen Berner VRPG-Funktionen bleiben unverändert.',
    referenceAll: 'AP22C3: lokaler Integrationsprüfstand. Sämtliche Berechnungen, einschliesslich VRPG und Sozialversicherungsrecht, dienen ausschliesslich der Prüfung. Keine Betriebsfreigabe und kein Kalenderexport.',
    referenceAllIntro: 'Lokale Integrationsprüfung: Bundesverfahren schweizweit, VRPG und Spezialrecht für Bern.',
    introApproved: 'Bundesverfahren mit schweizweiten Feiertagskalendern, VRPG und Spezialrecht für Bern im freigegebenen Umfang.',
    calendarDataApproved: 'Gebundener Kalenderstand',
    referenceResult: 'Prüfergebnis – nicht für die operative Fristenkontrolle freigegeben',
    pending: 'Feiertagsanknüpfung bitte vervollständigen.',
    unresolved: 'Diese Anknüpfung muss im Einzelfall geklärt werden.',
    blocked: 'Keine definitive Frist. Die Feiertagsanknüpfung oder der betroffene Einzelfall muss geklärt werden.',
    januaryDifferent: 'Die Behandlung des 2. Januar verändert das Fristresultat. Einzelfallklärung erforderlich. Kein definitives Fristdatum und kein Kalenderexport.',
    januarySame: 'Beide vollständigen Berechnungen zur Januargrenze ergeben dieselbe rechtliche Frist.',
    januaryBlocked: 'Mindestens eine Vergleichsberechnung ist nicht gedeckt. Kein definitives Fristresultat.',
    gr: 'Graubünden: bestätigter Grundkatalog. Zusätzliche örtliche Ruhetage sind nicht abgedeckt.',
    ne: 'Neuenburg: bekannte wiederkehrende Feiertage. Jährliche oder örtliche Sonderfestlegungen bleiben vorbehalten.',
    binding: 'Verwendete Verfahrensbindung', source: 'Quellen der Feiertagsanknüpfung', calendarData: 'Kalender-Prüfstand', catalogHash: 'SHA-256 des vollständigen Feiertagskatalogs',
    facts: 'Bestätigte regionale Fakten', projection: 'Gebundener Kalender',
    resolved: 'Automatisch aus Verfahrensrecht, Rolle und Ort bestimmt',
    authorityCH: 'Bundesbehörde', authority: 'Kanton',
    noExport: 'Kalenderexport erst nach Releasefreigabe',
    from: 'Produktfenster ab', reason: 'Prüfhinweis',
    comparison: 'Januarvergleich – vollständige Berechnungsvarianten', withoutJanuary: 'Ohne die gebundene 2.-Januar-Regel', withJanuary: 'Mit der gebundenen 2.-Januar-Regel',
    variant: 'Variante', relevantDate: 'Massgebendes Zustelldatum', deadlineStart: 'Fristbeginn', provisionalEnd: 'Nominelles Fristende', finalEnd: 'Fristablauf der Variante',
    notCovered: 'Nicht vollständig gedeckt', variedRule: 'Einzig variierte Katalogregel', comparisonNotDefinitive: 'Diese Varianten dokumentieren die Prüfung. Sie sind kein definitives Fristresultat.',
    outsideCoverage: 'Der gesamte Rechenweg muss durch das Produktfenster, die Normgeltung und den Gebietsstand gedeckt sein.',
    invalidRuntime: 'Der Kalenderdatenstand ist nicht vollständig oder nicht konsistent gebunden.',
    releaseRequired: 'Für diese Kalenderanwendung fehlt die erforderliche Releasefreigabe.'
  },
  fr: {
    select: 'Veuillez choisir', role: 'Notification à', authoritySeat: 'Siège de l’instance compétente', intro: 'Procédures fédérales dans toute la Suisse à titre de contrôle, LPJA et droit spécial bernois dans le périmètre déjà validé.', productCoverage: 'Période couverte par le contrôle des calendriers',
    court: 'Siège du tribunal', partyWithoutRepresentative: 'Partie sans représentation',
    qualifiedServiceRepresentative: 'Représentation habilitée à recevoir la notification, déterminée sans ambiguïté',
    unresolvedMultiplePlaces: 'Autre situation ou situation indéterminée',
    canton: 'Canton déterminant pour les jours fériés', yes: 'Oui', no: 'Non',
    partyCanton: 'Domicile / siège de la partie – canton', representativeCanton: 'Domicile / siège de la représentation – canton',
    courtCanton: 'Siège du tribunal – canton', unresolvedCanton: 'Domicile / siège – canton',
    technicalEvidence: 'Justificatifs techniques', holidayPlace: 'Jours fériés au lieu déterminant',
    representationScope: 'Il s’agit de la représentation déterminée sans ambiguïté pour cette notification. Cela ne confirme pas un acte personnel, un changement de mandat ou plusieurs lieux de notification non clarifiés.',
    regionalAI: 'Lieu dans la partie intérieure d’Appenzell Rhodes-Intérieures ?',
    regionalNE: 'Lieu dans la commune du Landeron ?',
    regionalCourtAI: 'Siège du tribunal dans la partie intérieure d’Appenzell Rhodes-Intérieures ?', regionalCourtNE: 'Siège du tribunal dans la commune du Landeron ?',
    regionalPartyAI: 'Domicile / siège de la partie dans la partie intérieure d’Appenzell Rhodes-Intérieures ?', regionalPartyNE: 'Domicile / siège de la partie dans la commune du Landeron ?',
    regionalRepresentativeAI: 'Domicile / siège de la représentation dans la partie intérieure d’Appenzell Rhodes-Intérieures ?', regionalRepresentativeNE: 'Domicile / siège de la représentation dans la commune du Landeron ?',
    reference: 'Calendriers suisses : calcul de contrôle local. Pas encore autorisé en production et sans export de calendrier. Les fonctions bernoises LPJA existantes restent inchangées.',
    referenceAll: 'AP22C3 : version locale de contrôle d’intégration. Tous les calculs, y compris la LPJA et les assurances sociales, servent exclusivement au contrôle. Sans autorisation de production ni export de calendrier.',
    referenceAllIntro: 'Contrôle d’intégration local : procédures fédérales dans toute la Suisse, LPJA et droit spécial bernois.',
    introApproved: 'Procédures fédérales avec les calendriers des jours fériés de toute la Suisse, LPJA et droit spécial bernois dans le périmètre validé.',
    calendarDataApproved: 'Version des calendriers liés',
    referenceResult: 'Résultat de contrôle – non autorisé pour le suivi opérationnel des délais',
    pending: 'Veuillez compléter le rattachement des jours fériés.',
    unresolved: 'Ce rattachement nécessite un examen du cas particulier.',
    blocked: 'Pas de délai définitif. Le rattachement des jours fériés ou le cas particulier doit être clarifié.',
    januaryDifferent: 'Le traitement du 2 janvier modifie le résultat. Examen du cas particulier requis. Pas d’échéance définitive ni d’export de calendrier.',
    januarySame: 'Les deux calculs complets relatifs à la réserve de janvier donnent le même résultat juridique.',
    januaryBlocked: 'Au moins un calcul comparatif dépasse la couverture. Pas de résultat définitif.',
    gr: 'Grisons : catalogue de base confirmé. Les jours de repos locaux supplémentaires ne sont pas couverts.',
    ne: 'Neuchâtel : jours fériés récurrents connus. Les dispositions annuelles ou locales particulières restent réservées.',
    binding: 'Rattachement procédural utilisé', source: 'Sources du rattachement des jours fériés', calendarData: 'Calendriers de contrôle', catalogHash: 'SHA-256 du catalogue complet des jours fériés',
    facts: 'Faits régionaux confirmés', projection: 'Calendrier lié',
    resolved: 'Déterminé automatiquement selon la procédure, le rôle et le lieu',
    authorityCH: 'Autorité fédérale', authority: 'Canton',
    noExport: 'Export après validation de la version',
    from: 'Couverture du produit dès le', reason: 'Indication de contrôle',
    comparison: 'Comparaison de janvier – variantes de calcul complètes', withoutJanuary: 'Sans la règle liée au 2 janvier', withJanuary: 'Avec la règle liée au 2 janvier',
    variant: 'Variante', relevantDate: 'Date déterminante de notification', deadlineStart: 'Début du délai', provisionalEnd: 'Échéance nominale', finalEnd: 'Échéance de la variante',
    notCovered: 'Couverture incomplète', variedRule: 'Seule règle du catalogue modifiée', comparisonNotDefinitive: 'Ces variantes documentent le contrôle. Elles ne constituent pas un résultat définitif.',
    outsideCoverage: 'Tout le calcul doit être couvert par la période du produit, la validité des normes et l’état territorial.',
    invalidRuntime: 'Les données du calendrier sont incomplètes ou liées de manière incohérente.',
    releaseRequired: 'La validation de version nécessaire à cette application du calendrier manque.'
  }
} as const;

export type CalendarMessageKey = keyof typeof calendarMessages.de;
export function calendarText(locale: Locale, key: CalendarMessageKey): string { return calendarMessages[locale][key]; }
export function calendarReason(locale: Locale, key: string): string | undefined {
  if(key==='GR-BASE-ONLY')return calendarText(locale,'gr');
  if(key==='NE-YEAR-LOCAL-RESERVE')return calendarText(locale,'ne');
  if(!key.startsWith('calendarBinding.'))return undefined;
  if(key==='calendarBinding.januaryClarificationRequired')return calendarText(locale,'januaryDifferent');
  if(key==='calendarBinding.januaryPathBlocked')return calendarText(locale,'januaryBlocked');
  if(/Coverage|Transition/.test(key))return calendarText(locale,'outsideCoverage');
  if(/release|contractNotApproved/.test(key))return calendarText(locale,'releaseRequired');
  if(/invalid|Missing/.test(key))return calendarText(locale,'invalidRuntime');
  if(/Required/.test(key))return calendarText(locale,'pending');
  return calendarText(locale,'unresolved');
}
const cantonNames: Readonly<Record<string, readonly [string,string]>> = {
  AG:['Aargau','Argovie'],AI:['Appenzell Innerrhoden','Appenzell Rhodes-Intérieures'],AR:['Appenzell Ausserrhoden','Appenzell Rhodes-Extérieures'],
  BE:['Bern','Berne'],BL:['Basel-Landschaft','Bâle-Campagne'],BS:['Basel-Stadt','Bâle-Ville'],FR:['Freiburg','Fribourg'],GE:['Genf','Genève'],
  GL:['Glarus','Glaris'],GR:['Graubünden','Grisons'],JU:['Jura','Jura'],LU:['Luzern','Lucerne'],NE:['Neuenburg','Neuchâtel'],NW:['Nidwalden','Nidwald'],
  OW:['Obwalden','Obwald'],SG:['St. Gallen','Saint-Gall'],SH:['Schaffhausen','Schaffhouse'],SO:['Solothurn','Soleure'],SZ:['Schwyz','Schwytz'],
  TG:['Thurgau','Thurgovie'],TI:['Tessin','Tessin'],UR:['Uri','Uri'],VD:['Waadt','Vaud'],VS:['Wallis','Valais'],ZG:['Zug','Zoug'],ZH:['Zürich','Zurich']
};
export function calendarCantonLabel(code: string, locale: Locale): string {
  return code === 'CH' ? calendarText(locale,'authorityCH') : `${cantonNames[code]?.[locale==='de'?0:1]??code} (${code})`;
}
