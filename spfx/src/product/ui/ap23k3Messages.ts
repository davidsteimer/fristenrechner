// SPDX-License-Identifier: AGPL-3.0-only
// Presentation only. These labels neither qualify a case nor select its calendar.
import type { Locale } from './i18n';
type Pair = readonly [string, string];
const paths: Readonly<Record<string, Pair>> = {
  'bs-admin-ordered': ['Angeordnete Eingabe im Erstverfahren', 'Écriture ordonnée en première instance'],
  'bs-internal-register-10': ['Verwaltungsinternen Rekurs anmelden (10 Tage)', 'Annoncer un recours administratif interne (10 jours)'],
  'bs-internal-reasons-30': ['Verwaltungsinternen Rekurs begründen (30 Tage)', 'Motiver un recours administratif interne (30 jours)'],
  'bs-internal-ordered': ['Angeordnete Eingabe im Verwaltungsrekurs', 'Écriture ordonnée dans un recours administratif interne'],
  'bs-court-register-10': ['Rekurs beim Verwaltungsgericht anmelden (10 Tage)', 'Annoncer un recours au Tribunal administratif (10 jours)'],
  'bs-court-reasons-30': ['Rekurs beim Verwaltungsgericht begründen (30 Tage)', 'Motiver un recours au Tribunal administratif (30 jours)'],
  'bs-court-ordered': ['Gerichtlich angeordnete Eingabe', 'Écriture ordonnée par le tribunal'],
  'bs-court-joinder-10': ['Abweisung des Beiladungsantrags anfechten (10 Tage)', 'Contester le refus de l’appel en cause (10 jours)'],
  'bl-admin-ordered': ['Angeordnete Eingabe im Erstverfahren', 'Écriture ordonnée en première instance'],
  'bl-admin-appeal-10': ['Allgemeine Verwaltungsbeschwerde (10 Tage)', 'Recours administratif général (10 jours)'],
  'bl-admin-reasons-granted': ['Tatsächlich gewährte nachträgliche Beschwerdebegründung', 'Motivation ultérieure du recours effectivement accordée'],
  'bl-admin-appeal-ordered': ['Angeordnete Eingabe im Verwaltungsbeschwerdeverfahren', 'Écriture ordonnée dans un recours administratif'],
  'bl-court-appeal-10': ['Allgemeine Verwaltungsgerichtsbeschwerde (10 Tage)', 'Recours général au Tribunal cantonal (10 jours)'],
  'bl-court-reasons-set': ['Gerichtlich festgesetzte Beschwerdebegründung', 'Motivation du recours dans le délai fixé par le tribunal'],
  'bl-court-ordered': ['Angeordnete Eingabe im Gerichtsverfahren', 'Écriture ordonnée dans la procédure judiciaire'],
  'bl-court-objection-5': ['Einsprache gegen qualifizierte Präsidialverfügung (5 Tage)', 'Réclamation contre une ordonnance présidentielle qualifiée (5 jours)']
};
const ordered: Pair = ['Aktuelle gültige Tagesanordnung, massgebende Eröffnung geklärt, keine Abweichung oder Zahlung',
  'Ordre actuel valable en jours, notification déterminante établie, sans dérogation ni paiement'];
const ordinary: Pair = ['Zulässiger allgemeiner Rechtsmittelweg, massgebende Eröffnung geklärt, keine Abweichung',
  'Voie de droit générale recevable, notification déterminante établie, sans dérogation'];
const courtOrdinary: Pair = ['Zulässiger allgemeiner Rechtsmittelweg, Eröffnung und massgebender Wohnsitz / Sitz geklärt',
  'Voie de droit générale recevable, notification et domicile / siège déterminant établis'];
const choices: Readonly<Record<string, Pair>> = {
  'bs-admin-ordered': ordered, 'bs-internal-register-10': ordinary, 'bs-internal-ordered': ordered,
  'bs-court-register-10': courtOrdinary,
  'bs-court-ordered': ['Aktuelle gültige Tagesanordnung, Eröffnung und massgebender Wohnsitz / Sitz geklärt', 'Ordre actuel valable en jours, notification et domicile / siège déterminant établis'],
  'bl-admin-ordered': ordered,
  'bl-admin-appeal-10': ordinary, 'bl-admin-appeal-ordered': ordered, 'bl-court-appeal-10': ordinary, 'bl-court-ordered': ordered,
  'bs-internal-reasons-30': ['Ursprüngliche Begründungsfrist ab Eröffnung des angefochtenen Entscheids, keine Verlängerung',
    'Délai initial de motivation dès la notification de la décision attaquée, sans prolongation'],
  'bs-court-reasons-30': ['Ursprüngliche Begründungsfrist, Eröffnung und massgebender Wohnsitz / Sitz geklärt, keine Verlängerung',
    'Délai initial de motivation, notification et domicile / siège déterminant établis, sans prolongation'],
  'bs-court-joinder-10': ['Antragstellende Partei, zulässiger Rekurs gegen verweigerte Beiladung, Eröffnung und Wohnsitz / Sitz geklärt',
    'Partie requérante, recours recevable contre le refus de l’appel en cause, notification et domicile / siège établis'],
  'bl-admin-reasons-granted': ['Nachträgliche Begründungsfrist tatsächlich gewährt, aktuelle Tagesdauer und Auslöser stehen fest',
    'Délai de motivation ultérieure effectivement accordé, durée actuelle en jours et fait déclencheur établis'],
  'bl-court-reasons-set': ['Begründungsfrist gerichtlich festgesetzt, aktuelle Tagesdauer und Auslöser stehen fest',
    'Délai de motivation fixé par le tribunal, durée actuelle en jours et fait déclencheur établis'],
  'bl-court-objection-5': ['Einsprache nach § 7 Abs. 2 VPO, Kammer für den Endentscheid zuständig, Eröffnung geklärt',
    'Réclamation selon le § 7 al. 2 VPO, chambre compétente pour la décision finale, notification établie']
};
const commonScope: Pair = [
  'Allgemeines Verfahren vor der zuständigen kantonalen Stelle. Aktuelle rechtlich massgebende Eröffnung und unbestrittene vorwärts laufende Tagesfrist stehen fest. Keine abweichende Spezialnorm, ungeklärte Zustellfiktion, irreführende Rechtsmittelbelehrung, Wiederherstellung, Zahlung oder feste Terminangabe. Jeder rechtlich relevante Tag einschliesslich der gesamten Endverschiebung muss im Fenster 29.08.2026–31.12.2027 liegen. Es gibt keinen Gerichtsferien-Stillstand.',
  'Procédure générale devant l’instance cantonale compétente. Notification actuelle juridiquement déterminante et délai incontesté en jours courant vers l’avenir établis. Sans disposition spéciale dérogatoire, fiction de notification incertaine, indication trompeuse des voies de droit, restitution, paiement ou date fixe. Chaque jour juridiquement pertinent, y compris le report complet de l’échéance, doit être couvert du 29.08.2026 au 31.12.2027. Aucune suspension pour féries judiciaires.'
];
const common: Readonly<Record<string, Pair>> = {
  'scope.v8.unselected': ['Die Auswahl setzt ein allgemeines Verfahren vor der zuständigen kantonalen Stelle und die bereits rechtlich geklärte Eröffnung voraus. Nicht umfasst sind abweichendes Spezialrecht, eine nicht modellierte abweichende Feiertagsanknüpfung, ein festes Enddatum, ein abweichender Fristbeginn und Vorschüsse für Beweiserhebungen.',
    'La sélection suppose une procédure générale devant l’instance cantonale compétente et une notification déjà établie juridiquement. Sont exclus le droit spécial dérogatoire, un rattachement dérogatoire des jours fériés non modélisé, une date finale fixe, un point de départ dérogatoire et les avances pour les preuves.'],
  'law.bs-general-administrative': ['OG / VRPG BS – Verwaltungsverfahren', 'OG / VRPG BS – Procédure administrative'],
  'law.bl-general-administrative': ['VwVG / VPO BL – Verwaltungsverfahren', 'VwVG / VPO BL – Procédure administrative'],
  'v8.legalAnchorCanton': ['Wohnsitz / Sitz der Partei oder ihrer zustellungsberechtigten Vertretung – Kanton', 'Domicile / siège de la partie ou de sa représentation habilitée – canton'],
  'v8.legalAnchorScope': ['Der für diese Zustellung rechtlich massgebende Ort muss eindeutig bestimmt sein. Keine Zusammenlegung mehrerer Orte und kein Ersatz durch den Gerichtssitz.', 'Le lieu juridiquement déterminant pour cette notification doit être établi sans ambiguïté. Pas de cumul de plusieurs lieux ni de remplacement par le siège du tribunal.'],
  'v8.regionalAI': ['Massgebender Wohnsitz / Sitz im Inneren Land von Appenzell Innerrhoden?', 'Domicile / siège déterminant dans la partie intérieure d’Appenzell Rhodes-Intérieures ?'],
  'v8.regionalNE': ['Massgebender Wohnsitz / Sitz in der Gemeinde Le Landeron?', 'Domicile / siège déterminant dans la commune du Landeron ?'],
  'v8.fact.courtOrderCategory': ['Gegenstand der Präsidialverfügung', 'Objet de l’ordonnance présidentielle'],
  'v8.value.competence': ['Zuständigkeit', 'Compétence'],
  'v8.value.recusal': ['Ausstand', 'Récusation'],
  'v8.value.informationOrProductionDuty': ['Auskunfts- oder Herausgabepflicht', 'Obligation de renseigner ou de produire des pièces'],
  'v8.value.deniedFileAccess': ['Verweigerte Akteneinsicht', 'Refus de consulter le dossier'],
  'v8.value.endangeredEvidenceRefused': ['Verweigerte Abnahme gefährdeter Beweise', 'Refus d’administrer des preuves menacées'],
  'v8.value.interimMeasuresOrSuspensiveEffect': ['Vorsorgliche Massnahmen oder aufschiebende Wirkung', 'Mesures provisionnelles ou effet suspensif'],
  'v8.value.deniedLegalAid': ['Verweigerte unentgeltliche Rechtspflege', 'Refus de l’assistance judiciaire'],
  'v8.value.unknown': ['Unklar oder abweichend', 'Incertain ou différent'],
  'v8.anchorHeading': ['Massgebender Wohnsitz / Sitz', 'Domicile / siège déterminant'],
  'v8.anchorQualified': ['Rechtlich bestimmter Ort der Partei oder ihrer zustellungsberechtigten Vertretung', 'Lieu juridiquement établi de la partie ou de sa représentation habilitée'],
  'v8.annualHeading': ['Zusätzliche ganztägige kantonale Büroschliessungen', 'Fermetures cantonales supplémentaires pour une journée entière'],
  'v8.annualExplanation': ['Diese jährlich belegten Tage wirken nur auf die Endverschiebung. Sie sind weder Gerichtsferien noch zusätzliche schweizweite Feiertage.', 'Ces dates établies annuellement agissent uniquement sur le report de l’échéance. Il ne s’agit ni de féries judiciaires ni de jours fériés supplémentaires pour toute la Suisse.'],
  'v8.annualNoneEncountered': ['Keine zusätzliche Büroschliessung hat das Fristende verschoben.', 'Aucune fermeture supplémentaire n’a reporté l’échéance.'],
  'v8.unresolvedOfficeEndShift': ['Nicht abschliessend bestimmbar. Siehe Vergleichsvarianten.', 'Report non déterminable définitivement. Voir les variantes comparatives.'],
  'v8.annualAutomatic': ['Ganztägige Büroschliessungen automatisch berücksichtigt', 'Fermetures de journées entières prises en compte automatiquement'],
  'v8.annualComparisonHeading': ['Prüfung der Fasnachts-Ungewissheit', 'Contrôle de l’incertitude liée au carnaval'],
  'v8.withoutOptional': ['Ohne den unsicheren Büroschliesstag', 'Sans le jour de fermeture incertain'],
  'v8.withOptional': ['Mit dem unsicheren Büroschliesstag', 'Avec le jour de fermeture incertain'],
  'v8.comparisonEqual': ['Beide vollständigen Berechnungen führen zum gleichen Fristende.', 'Les deux calculs complets aboutissent à la même échéance.'],
  'v8.comparisonDifferent': ['Die Vergleichsvarianten sind nur Nachweise. Kein definitives Fristresultat und kein Kalenderexport.', 'Ces variantes sont uniquement des justificatifs. Pas de résultat définitif ni d’export de calendrier.'],
  'validation.legalAnchorCanton': ['Bitte den eindeutig massgebenden Wohnsitz / Sitz der Partei oder ihrer Vertretung als Kanton angeben.', 'Veuillez indiquer le canton du domicile / siège déterminant sans ambiguïté de la partie ou de sa représentation.'],
  'validation.areaFacts': ['Bitte die örtliche Zuordnung des massgebenden Wohnsitzes / Sitzes ausdrücklich klären.', 'Veuillez établir expressément le rattachement régional du domicile / siège déterminant.'],
  'administrative.blOfficeClosureClarificationRequired': ['Der unsichere ganztägige Fasnachts-Schliesstag verändert das Fristende. Einzelfallklärung erforderlich. Kein definitives Fristdatum und kein Kalenderexport.', 'La fermeture incertaine de toute la journée de carnaval modifie l’échéance. Examen du cas particulier requis. Pas d’échéance définitive ni d’export de calendrier.'],
  'calendarBinding.januaryClarificationRequired': ['Die Behandlung des 2. Januar am massgebenden Ort verändert das Fristende. Einzelfallklärung erforderlich. Kein definitives Fristdatum und kein Kalenderexport.', 'Le traitement du 2 janvier au lieu déterminant modifie l’échéance. Examen du cas particulier requis. Pas d’échéance définitive ni d’export de calendrier.'],
  'administrative.calendarSelectionUnresolved': ['Der rechtlich massgebende Wohnsitz / Sitz und seine Feiertage sind noch nicht eindeutig bestimmt.', 'Le domicile / siège juridiquement déterminant et ses jours fériés ne sont pas encore établis sans ambiguïté.'],
  'administrative.endCalendarPolicyInvalid': ['Die Feiertags- oder Büroschliessungsregel ist nicht vollständig an diesen Datenstand gebunden.', 'La règle des jours fériés ou des fermetures de bureaux n’est pas intégralement liée à ces données.'],
  'administrative.calendarScopeInvalid': ['Der örtliche Geltungsbereich des Feiertagskalenders ist nicht sicher gebunden.', 'Le champ territorial du calendrier des jours fériés ne correspond pas de manière sûre aux données.'],
  'administrative.calendarRuleInvalid': ['Eine benötigte Feiertagsregel ist nicht sicher an diesen Kalender gebunden.', 'Une règle de jour férié nécessaire n’est pas liée de manière sûre à ce calendrier.'],
  'administrative.holidayBindingInvalid': ['Die rechtliche Feiertagsanknüpfung passt nicht zum gewählten Verfahrensweg.', 'Le rattachement juridique des jours fériés ne correspond pas au parcours procédural choisi.']
};
const reasons: Readonly<Record<string, Pair>> = {
  AuthorityScope: ['Die zuständige kantonale Stelle muss für diesen Weg feststehen.', 'L’instance cantonale compétente doit être établie pour ce parcours.'],
  Applicability: ['Eine abweichende Spezialordnung ist noch nicht ausgeschlossen.', 'Un régime spécial dérogatoire n’est pas encore exclu.'],
  OpeningMode: ['Der aktuelle rechtlich massgebende Eröffnungstag steht noch nicht fest.', 'La date actuelle de notification juridiquement déterminante n’est pas encore établie.'],
  NoticeStatus: ['Die Eröffnung oder Rechtsmittelbelehrung ist nicht unbestritten geklärt.', 'La notification ou l’indication des voies de droit n’est pas établie sans contestation.'],
  Stage: ['Das aktuelle Verfahrensstadium passt nicht zum gewählten Weg.', 'Le stade actuel de la procédure ne correspond pas au parcours choisi.'],
  ActionQualification: ['Die aktuelle Handlung und ihre Zulässigkeit müssen geklärt sein.', 'L’acte actuel et sa recevabilité doivent être établis.'],
  LegalAnchorQualification: ['Der massgebende Ort der Partei oder ihrer Vertretung ist nicht eindeutig qualifiziert.', 'Le lieu déterminant de la partie ou de sa représentation n’est pas qualifié sans ambiguïté.'],
  OrderStatus: ['Die aktuelle Tagesfrist muss tatsächlich bewilligt oder festgesetzt sein. Ein Gesuch allein genügt nicht.', 'Le délai actuel en jours doit être effectivement accordé ou fixé. Une demande seule ne suffit pas.'],
  CourtOrderCategory: ['Die Präsidialverfügung muss unter einen der abschliessend genannten Gegenstände fallen.', 'L’ordonnance présidentielle doit relever de l’un des objets énumérés exhaustivement.'],
  ChamberDecidesFinal: ['Die Kammer muss für den Endentscheid zuständig sein.', 'La chambre doit être compétente pour la décision finale.']
};

export function createAp23k3Messages(locale: Locale): Record<string, string> {
  const column = locale === 'de' ? 0 : 1;
  const result = Object.fromEntries(Object.entries(common).map(([key, pair]) => [key, pair[column]]));
  for (const [id, pair] of Object.entries(paths)) {
    result[`path.${id}`] = pair[column];
    result[`case.v8.${id}`] = choices[id]![column];
    const extra: Pair = id.includes('reasons-30')
      ? [' Die 30 Tage laufen ab derselben ursprünglichen Eröffnung wie die Anmeldung, nicht ab der Anmeldung oder Überweisung.', ' Les 30 jours courent dès la même notification initiale que l’annonce, non dès l’annonce ou le transfert.']
      : id === 'bl-admin-reasons-granted' || id === 'bl-court-reasons-set'
        ? [' Dauer und aktueller Auslöser stammen aus der tatsächlich gewährten oder festgesetzten Anordnung, nicht aus einem blossen Gesuch.', ' La durée et le fait déclencheur actuel proviennent de l’ordre effectivement accordé ou fixé, non d’une simple demande.']
        : ['', ''];
    const anchor: Pair = id.startsWith('bs-court-')
      ? [' Für die Feiertage ist genau ein rechtlich bestimmter Wohnsitz oder Sitz der Partei beziehungsweise ihrer zustellungsberechtigten Vertretung erforderlich. Der Gerichtssitz oder eine freie Vereinigung mehrerer Orte ersetzt diese Qualifikation nicht.',
        ' Les jours fériés nécessitent un unique domicile ou siège juridiquement établi de la partie ou de sa représentation habilitée. Le siège du tribunal ou un cumul libre de plusieurs lieux ne remplace pas cette qualification.']
      : ['', ''];
    result[`scope.v8.${id}`] = commonScope[column] + extra[column] + anchor[column];
  }
  for (const [key, pair] of Object.entries(reasons)) result[`administrative.currentFactNotQualified${key}`] = pair[column];
  return result;
}

const sourceNames: Readonly<Record<string, Pair>> = {
  'SRC-K1-BS-OG-20210101': ['Organisationsgesetz BS (OG)', 'Loi sur l’organisation BS (OG)'],
  'SRC-K1-BS-VRPG-20210101': ['Verwaltungsrechtspflegegesetz BS (VRPG)', 'Loi sur la juridiction administrative BS (VRPG)'],
  'SRC-K1-BS-GOG-20250615': ['Gerichtsorganisationsgesetz BS', 'Loi sur l’organisation judiciaire BS'],
  'SRC-K1-BS-RLG-20200701': ['Ruhetags- und Ladenschlussgesetz BS', 'Loi sur les jours de repos et la fermeture des magasins BS'],
  'SRC-K1-BS-STG-20260101': ['Steuergesetz BS, ergänzende Analogie', 'Loi fiscale BS, analogie complémentaire'],
  'SRC-K1-BS-VWVG-20220701': ['Verwaltungsverfahrensgesetz des Bundes (Fassung 2026)', 'Loi fédérale sur la procédure administrative (version 2026)'],
  'SRC-K1-BS-VWVG-20270101': ['Verwaltungsverfahrensgesetz des Bundes (Fassung 2027)', 'Loi fédérale sur la procédure administrative (version 2027)'],
  'SRC-K1-BS-EUFRUEB-20110101': ['Europäisches Fristenübereinkommen', 'Convention européenne sur la computation des délais'],
  'SRC-K1-BL-VWVG-20240801': ['Verwaltungsverfahrensgesetz BL (VwVG)', 'Loi sur la procédure administrative BL (VwVG)'],
  'SRC-K1-BL-VPO-20240101': ['Verfassungs- und Verwaltungsprozessordnung BL (VPO)', 'Code de procédure constitutionnelle et administrative BL (VPO)'],
  'SRC-K1-BL-GOG-20200101': ['Gerichtsorganisationsgesetz BL', 'Loi sur l’organisation judiciaire BL'],
  'SRC-K1-BL-RTG-20191201': ['Ruhetagsgesetz BL', 'Loi sur les jours de repos BL'],
  'SRC-K1-BL-RRB2025-51': ['Regierungsratsbeschluss zu Büroschliessungen 2026', 'Décision du Conseil d’État sur les fermetures des bureaux 2026'],
  'SRC-K1-BL-OVERVIEW2026': ['Amtliche Übersicht Büroschliessungen 2026', 'Aperçu officiel des fermetures des bureaux 2026'],
  'SRC-K1-BL-RRB2026-217': ['Regierungsratsbeschluss zu Büroschliessungen 2027', 'Décision du Conseil d’État sur les fermetures des bureaux 2027'],
  'SRC-K1-BL-OVERVIEW2027': ['Amtliche Übersicht Büroschliessungen 2027', 'Aperçu officiel des fermetures des bureaux 2027']
};
export function ap23k3SourceName(sourceId: string, locale: Locale): string | undefined { return sourceNames[sourceId]?.[locale === 'de' ? 0 : 1]; }

/** Only accepted K1 statutory locators, never the raw research-reading annotation. */
export function ap23k3NormLocator(sourceId: string, pathId?: string): string | undefined {
  if (sourceId === 'SRC-K1-BS-OG-20210101') return pathId === 'bs-admin-ordered' ? '§§ 38–39'
    : pathId === 'bs-internal-register-10' ? '§§ 41, 43, 46 Abs. 1'
      : pathId === 'bs-internal-reasons-30' ? '§ 46 Abs. 2–3' : '§§ 46 Abs. 3, 48 Abs. 2';
  if (sourceId === 'SRC-K1-BS-VRPG-20210101') return pathId === 'bs-court-register-10' ? '§§ 10, 16 Abs. 1, 21 Abs. 1–2'
    : pathId === 'bs-court-reasons-30' ? '§§ 16 Abs. 2–3, 21 Abs. 1–2'
      : pathId === 'bs-court-joinder-10' ? '§§ 21 Abs. 1–2, 23 Abs. 1' : '§§ 16 Abs. 2, 21 Abs. 1–2';
  if (sourceId === 'SRC-K1-BL-VWVG-20240801') return pathId === 'bl-admin-reasons-granted' ? '§§ 5 Abs. 1 und 3, 33 Abs. 3'
    : pathId === 'bl-admin-ordered' ? '§§ 5 Abs. 1 und 3, 12 Abs. 2, 15 Abs. 2, 25–26'
      : pathId === 'bl-admin-appeal-ordered' ? '§§ 5 Abs. 1 und 3, 15 Abs. 2, 35–36' : '§§ 5 Abs. 1, 15, 27–33';
  if (sourceId === 'SRC-K1-BL-VPO-20240101') return pathId === 'bl-court-reasons-set' ? '§ 5 Abs. 2'
    : pathId === 'bl-court-objection-5' ? '§ 7 Abs. 2' : pathId === 'bl-court-ordered' ? '§§ 5 Abs. 3, 7 Abs. 1, 10, 18 Abs. 2' : '§§ 5 Abs. 1, 43–48';
  const locators: Readonly<Record<string, string>> = {
    'SRC-K1-BS-RLG-20200701': '§ 2', 'SRC-K1-BS-STG-20260101': '§ 147 Abs. 3',
    'SRC-K1-BS-VWVG-20220701': 'Art. 20 Abs. 1–3', 'SRC-K1-BS-VWVG-20270101': 'Art. 20 Abs. 1–3',
    'SRC-K1-BS-EUFRUEB-20110101': 'Art. 1 Abs. 1 Bst. a, Art. 3 und 5',
    'SRC-K1-BL-GOG-20200101': '§ 46 Abs. 1–4', 'SRC-K1-BL-RTG-20191201': '§§ 2–3',
    'SRC-K1-BL-RRB2025-51': 'Jahresanordnung 2026', 'SRC-K1-BL-OVERVIEW2026': 'Jahresübersicht 2026',
    'SRC-K1-BL-RRB2026-217': 'Jahresanordnung 2027', 'SRC-K1-BL-OVERVIEW2027': 'Jahresübersicht 2027'
  };
  return locators[sourceId];
}
