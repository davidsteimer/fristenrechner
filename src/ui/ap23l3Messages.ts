// SPDX-License-Identifier: AGPL-3.0-only
import type { Locale } from './i18n';
type Pair = readonly [string, string];
const paths: Readonly<Record<string, Pair>> = {
 'ai-admin-ordered':['Angeordnete Eingabe im Verwaltungsverfahren','Écriture ordonnée dans la procédure administrative'],
 'ai-admin-written-7':['Schriftliche Eröffnung nach mündlichem Entscheid verlangen (7 Tage)','Demander la notification écrite après une décision orale (7 jours)'],
 'ai-internal-appeal-30':['Ordentlicher Rekurs an die Standeskommission (30 Tage)','Recours ordinaire à la Standeskommission (30 jours)'],
 'ai-internal-building-10':['Baugesuchsentscheid an die Standeskommission weiterziehen (10 Tage)','Recours à la Standeskommission contre une décision sur un permis de construire (10 jours)'],
 'ai-internal-school-10':['Qualifizierter Schulrekurs an die Landesschulkommission (10 Tage)','Recours scolaire qualifié à la commission cantonale (10 jours)'],
 'ai-internal-ordered':['Angeordnete Eingabe im verwaltungsinternen Rekurs','Écriture ordonnée dans un recours administratif interne'],
 'ai-internal-denial-30':['Qualifizierte Rechtsverweigerungsbeschwerde (30 Tage)','Recours qualifié pour déni de justice (30 jours)'],
 'ai-court-appeal-30':['Ordentliche Verwaltungsgerichtsbeschwerde (30 Tage)','Recours ordinaire au Tribunal administratif (30 jours)'],
 'ai-court-interim-7':['Zulässigen Zwischenentscheid oder vorsorgliche Massnahme anfechten (7 Tage)','Contester une décision incidente ou une mesure provisionnelle recevable (7 jours)'],
 'ai-court-ordered':['Gerichtlich angeordnete Eingabe','Écriture ordonnée par le tribunal'],
 'ai-court-full-30':['Vollständigen gerichtlichen Entscheid verlangen (30 Tage)','Demander une décision judiciaire complète (30 jours)'],
 'ai-court-interpret-7':['Erläuterung des Urteils verlangen (7 Tage)','Demander l’interprétation du jugement (7 jours)'],
 'ai-court-president-7':['Nach qualifiziertem Präsidialentscheid Gerichtsentscheid verlangen (7 Tage)','Demander une décision du tribunal après une décision présidentielle qualifiée (7 jours)'],
 'ai-court-personnel-10':['Qualifizierte gerichtliche Personalverfügung weiterziehen (10 Tage)','Recours contre une décision judiciaire qualifiée en matière de personnel (10 jours)'],
 'ai-internal-notice-30':['Rekurs bei qualifiziert mangelhafter Belehrung (30 Tage)','Recours interne avec indication des voies de droit qualifiée de défectueuse (30 jours)'],
 'ai-internal-notice-long':['Rekurs mit wirksamer längerer Tagesbelehrung','Recours interne avec délai plus long valablement indiqué'],
 'ai-court-notice-30':['Gerichtsbeschwerde bei qualifiziert mangelhafter Belehrung (30 Tage)','Recours judiciaire avec indication des voies de droit qualifiée de défectueuse (30 jours)'],
 'ai-court-notice-long':['Gerichtsbeschwerde mit wirksamer längerer Tagesbelehrung','Recours judiciaire avec délai plus long valablement indiqué'],
 'sz-admin-ordered':['Angeordnete Eingabe im Erstverfahren','Écriture ordonnée en première instance'],
 'sz-admin-ordered-exempt':['Angeordnete Eingabe im Erstverfahren ohne Stillstand','Écriture ordonnée en première instance sans suspension'],
 'sz-admin-appeal-20':['Ordentliche Verwaltungsbeschwerde (20 Tage)','Recours administratif ordinaire (20 jours)'],
 'sz-admin-appeal-20-exempt':['Verwaltungsbeschwerde ohne Stillstand (20 Tage)','Recours administratif sans suspension (20 jours)'],
 'sz-admin-appeal-ordered':['Angeordnete Eingabe im Verwaltungsbeschwerdeverfahren','Écriture ordonnée dans le recours administratif'],
 'sz-admin-appeal-ordered-exempt':['Angeordnete Eingabe im Verwaltungsbeschwerdeverfahren ohne Stillstand','Écriture ordonnée dans le recours administratif sans suspension'],
 'sz-admin-provisional-opposition':['Konkret angesetzte Einsprache gegen dringende vorsorgliche Massnahme','Réclamation dans le délai fixé contre une mesure provisionnelle urgente'],
 'sz-court-appeal-20':['Ordentliche Verwaltungsgerichtsbeschwerde (20 Tage)','Recours ordinaire au Tribunal administratif (20 jours)'],
 'sz-court-appeal-20-exempt':['Verwaltungsgerichtsbeschwerde ohne Stillstand (20 Tage)','Recours au Tribunal administratif sans suspension (20 jours)'],
 'sz-court-execution-10':['Selbstständig anfechtbare Vollstreckungsmassnahme (10 Tage)','Mesure d’exécution susceptible d’un recours indépendant (10 jours)'],
 'sz-court-execution-10-exempt':['Selbstständig anfechtbare Vollstreckungsmassnahme ohne Stillstand (10 Tage)','Mesure d’exécution susceptible d’un recours indépendant sans suspension (10 jours)'],
 'sz-court-ordered':['Gerichtlich angeordnete Eingabe','Écriture ordonnée par le tribunal'],
 'sz-court-ordered-exempt':['Gerichtlich angeordnete Eingabe ohne Stillstand','Écriture ordonnée par le tribunal sans suspension']
};
const common: Readonly<Record<string,Pair>> = {
 'administrativeProceduralSupplement':['Zusätzlicher verfahrensrechtlicher Endverschiebungstag','Jour supplémentaire de report procédural'],
 'law.ai-general-administrative':['VerwVG / VerwGG AI – Verwaltungsverfahren','VerwVG / VerwGG AI – Procédure administrative'],
 'law.sz-general-administrative':['VRP SZ – Verwaltungsverfahren','VRP SZ – Procédure administrative'],
 'scope.v9.unselected':['Allgemeines kantonales Verfahren mit aktuell geklärten Voraussetzungen und vorwärts laufender Tagesfrist. Abweichendes Spezialrecht, feste Termine und ungeklärte Zustell- oder Einreichungskonstellationen sind nicht umfasst.','Procédure cantonale générale aux conditions actuelles établies et délai en jours courant vers l’avenir. Le droit spécial dérogatoire, les dates fixes et les situations de notification ou de dépôt incertaines sont exclus.'],
 'v9.fact.openingMode':['Grundlage des eingegebenen Datums','Base de la date saisie'],
 'v9.fact.noticeStatus':['Fristbelehrung im aktuellen Fall','Indication du délai dans le cas actuel'],
 'v9.fact.ordinaryStatutoryDays':['Ordentliche gesetzliche Frist im aktuellen Fall','Délai légal ordinaire dans le cas actuel'],
 'v9.fact.exceptionCategory':['Anwendbare Stillstandsausnahme','Exception applicable à la suspension'],
 'v9.value.qualifiedLegalOpening':['Rechtlich massgebender Tag bereits bestimmt','Date juridiquement déterminante déjà établie'],
 'v9.value.trackingPhysicalReceipt':['Physischer Eingang einer qualifizierten Trackingsendung','Réception physique d’un envoi suivi qualifié'],
 'v9.value.regularNoDeviation':['Reguläre, unbestrittene Belehrung','Indication régulière et incontestée'],
 'v9.value.shorterInstructionUsesStatutory':['Kürzere Angabe – unveränderte gesetzliche Frist gilt','Indication plus courte – le délai légal inchangé s’applique'],
 'v9.value.7':['7 Tage','7 jours'],'v9.value.10':['10 Tage','10 jours'],'v9.value.30':['30 Tage','30 jours'],
 'v9.value.actualPartyAgreementToThisPeriod':['Tatsächliche Vereinbarung zur aktuellen Frist','Accord effectif concernant le délai actuel'],
 'v9.value.urgentProvisionalMeasure':['Qualifizierte dringende vorsorgliche Massnahme','Mesure provisionnelle urgente qualifiée'],
 'v9.value.qualifiedGeneralProvisionalRemedyWithoutDifferentSpecialLaw':['Qualifiziertes allgemeines Massnahmenrechtsmittel ohne abweichendes Spezialrecht','Voie de droit générale qualifiée en matière de mesures sans droit spécial dérogatoire'],
 'v9.value.admissibleGeneralPlanningBuildingRemedyWithoutDifferentSpecialDuration':['Zulässiges allgemeines Planungs- oder Baurechtsmittel ohne besondere Dauer','Voie de droit générale recevable en matière d’aménagement ou de construction sans délai spécial'],
 'v9.value.admissibleSelfStandingConstructionExecutionRemedyWithoutDifferentSpecialLaw':['Zulässiger selbstständiger Bauvollstreckungsweiterzug ohne abweichendes Spezialrecht','Recours indépendant recevable en matière d’exécution de droit de la construction sans droit spécial dérogatoire'],
 'v9.value.unknown':['Unklar oder abweichend','Incertain ou différent'],
 'v9.longerDays':['Aktuell wirksam angegebene längere Frist in Tagen','Délai plus long valablement indiqué actuellement, en jours'],
 'v9.currentDays':['Aktuell angeordnete Frist in Tagen','Délai actuellement ordonné, en jours'],
 'v9.durationInvalid':['Bitte die tatsächlich geltende Tagesdauer innerhalb des qualifizierten Bereichs eingeben.','Veuillez saisir la durée effective en jours dans la plage qualifiée.'],
 'v9.noticeInvalid':['Die längere Frist muss wirksam angegeben sein und sowohl die ordentliche Frist als auch 30 Tage überschreiten.','Le délai plus long doit être valablement indiqué et dépasser tant le délai ordinaire que 30 jours.'],
 'v9.physicalReceipt':['Physischer Eingang der Trackingsendung','Réception physique de l’envoi suivi'],
 'v9.qualifiedDate':['Rechtlich massgebender Eröffnungs- oder Kenntnistag','Date de notification ou de connaissance juridiquement déterminante'],
 'v9.nextDay':['Tag nach der rechtlich massgebenden Eröffnung','Jour suivant la notification juridiquement déterminante'],
 'v9.trackingExplanation':['Der physische Eingang ist vom rechtlich massgebenden Eröffnungstag getrennt. Nur die aktuell qualifizierte Trackingsendung wird bei Eingang an einem arbeitsfreien Tag auf den nächsten Werktag normalisiert.','La réception physique est distincte de la date juridiquement déterminante. Seul l’envoi suivi actuellement qualifié est normalisé au prochain jour ouvrable en cas de réception un jour non ouvrable.'],
 'v9.supplementHeading':['Zusätzlicher verfahrensrechtlicher Endverschiebungstag','Jour supplémentaire de report procédural de l’échéance'],
 'v9.supplementExplanation':['Für den aktuell qualifizierten Stellensitz Gemeinde Schwyz gilt zusätzlich der Martinstag. Er verschiebt nur ein darauf fallendes Ende und unterbricht die Tageszählung nicht.','Pour le siège actuellement qualifié dans la commune de Schwyz, la Saint-Martin s’applique en plus. Elle reporte uniquement une échéance tombant ce jour-là, sans interrompre le décompte.'],
 'v9.martinstag':['Martinstag','Saint-Martin'],
 'v9.noSupplementShift':['Kein zusätzlicher Endverschiebungstag hat das Ende verschoben.','Aucun jour supplémentaire n’a reporté l’échéance.'],
 'v9.noticeHeading':['Aktuell qualifizierte Belehrungsdauer','Durée qualifiée de l’indication actuelle'],
 'v9.szWinter':['Drei Stillstandsperioden, Winter bis und mit 7. Januar','Trois périodes de suspension, hiver jusqu’au 7 janvier inclus'],
 'v9.endCollision':['Die Endverschiebung führt in einen neu beginnenden Stillstand. Dieser begrenzte offene Fall liefert kein definitives Ende und keinen Kalenderexport.','Le report entre dans une nouvelle période de suspension. Ce cas limité non résolu ne donne ni échéance définitive ni export de calendrier.']
};
const reasons: Readonly<Record<string,Pair>> = {
 'AI-B-SCOPE':['Die zuständige kantonale Stelle muss aktuell feststehen.','L’instance cantonale compétente doit être établie actuellement.'],
 'AI-B-SPECIAL':['Die Anwendbarkeit des allgemeinen AI-Verfahrens und der Ausschluss abweichenden Spezialrechts sind noch nicht geklärt.','L’application de la procédure générale AI et l’exclusion du droit spécial dérogatoire ne sont pas établies.'],
 'AI-B-ANCHOR':['Der aktuelle Stellensitz muss im inneren Landesteil von Appenzell Innerrhoden feststehen.','Le siège actuel doit être établi dans la partie intérieure d’Appenzell Rhodes-Intérieures.'],
 'AI-B-UNITS':['Hier ist nur eine vorwärts laufende Tagesfrist modelliert.','Seul un délai en jours courant vers l’avenir est modélisé ici.'],
 'AI-B-STAGE':['Das aktuelle Stadium passt nicht zum gewählten Weg.','Le stade actuel ne correspond pas au parcours choisi.'],
 'AI-B-ACTION':['Die aktuelle Handlung und ihre Zulässigkeit müssen geklärt sein.','L’acte actuel et sa recevabilité doivent être établis.'],
 'AI-B-OPENING':['Die aktuelle rechtliche Eröffnung oder der qualifizierte Trackingempfang ist ungeklärt.','La notification juridique actuelle ou la réception suivie qualifiée n’est pas établie.'],
 'AI-B-NOTICE':['Die aktuell massgebende Belehrungsfolge muss geklärt sein.','La conséquence déterminante de l’indication actuelle doit être établie.'],
 'AI-B-ORAL-TRIGGER':['Massgebend ist die qualifizierte mündliche Eröffnung, nicht ein Trackingempfang.','La notification orale qualifiée est déterminante, non une réception suivie.'],
 'AI-B-KNOWLEDGE-TRIGGER':['Massgebend ist der rechtlich bestimmte Kenntnistag, nicht ein Trackingempfang.','La date de connaissance juridiquement établie est déterminante, non une réception suivie.'],
 'AI-O1-EXECUTION':['Die Anfechtbarkeit einer Vollstreckungsmassnahme ist hier nicht positiv geklärt.','La recevabilité du recours contre une mesure d’exécution n’est pas établie ici.'],
 'AI-B-NOTICE-BASE':['Die ordentliche gesetzliche Frist im aktuellen Fall muss ausdrücklich bestimmt sein.','Le délai légal ordinaire du cas actuel doit être expressément établi.'],
 'AI-O3-NOTICE-PRIORITY':['Die Belehrungsfolge ist nicht eindeutig qualifiziert. Keine stille Wahl zwischen angegebener und gesetzlicher Frist.','La conséquence de l’indication n’est pas qualifiée sans ambiguïté. Aucun choix implicite entre le délai indiqué et légal.'],
 'SZ-B-SPECIAL':['Die aktuelle allgemeine Schwyzer Verfahrenskonstellation ist nicht vollständig qualifiziert.','La situation actuelle de procédure générale schwytzoise n’est pas entièrement qualifiée.'],
 'SZ-O1':['Der aktuelle Stellensitz in der Gemeinde Schwyz ist nicht positiv geklärt. Kein Ersatz durch eine allgemeine kantonale Liste.','Le siège actuel dans la commune de Schwyz n’est pas établi positivement. Pas de remplacement par une liste cantonale générale.'],
 'SZ-B-OPENING':['Der rechtlich massgebende Eröffnungstag muss bereits bestimmt sein.','La date de notification juridiquement déterminante doit déjà être établie.'],
 'SZ-B-NOTICE':['Die aktuelle Belehrung ist nicht unbestritten geklärt.','L’indication actuelle n’est pas établie sans contestation.'],
 'SZ-B-POST':['Normale physische Einreichung und gewöhnliche Postbenutzung müssen aktuell feststehen. Störungen oder elektronische Sonderfälle sind hier nicht geklärt.','Le dépôt physique normal et l’utilisation ordinaire de la poste doivent être établis. Les perturbations ou cas électroniques particuliers ne sont pas établis ici.'],
 'SZ-B-ORDER':['Die aktuelle gültige Tagesanordnung muss tatsächlich vorliegen.','L’ordre actuel valable fixant un délai en jours doit effectivement exister.'],
 'SZ-B-EXCEPTION':['Die konkrete Stillstandsausnahme beziehungsweise ihr Ausschluss ist noch nicht geklärt.','L’exception concrète à la suspension ou son exclusion n’est pas établie.'],
 'trackingExpectedServiceNotQualified':['Die Zustellung musste aktuell erwartbar sein.','La notification devait être prévisible dans le cas actuel.'],
 'AI-B-TRACKING-ENTRY':['Der Eingang in der Machtsphäre muss verifiziert sein.','L’entrée dans la sphère de maîtrise doit être vérifiée.'],
 'AI-B-TRACKING-PLACE':['Das Empfangsfeiertagsregime muss dem bestätigten Stellensitzregime entsprechen.','Le régime des jours fériés du lieu de réception doit correspondre à celui du siège confirmé.']
};
export function createAp23l3Messages(locale: Locale):Record<string,string>{
 const col=locale==='de'?0:1,result=Object.fromEntries(Object.entries(common).map(([k,p])=>[k,p[col]]));
 for(const[id,pair]of Object.entries(paths)){
  result[`path.${id}`]=pair[col];
  result[`case.v9.${id}`]=id.startsWith('sz-')
   ? ['Zulässiger aktueller Weg, Stellensitz Gemeinde Schwyz, Eröffnung und Einreichung geklärt','Parcours actuel recevable, siège dans la commune de Schwyz, notification et dépôt établis'][col]!
   : ['Zulässiger aktueller Weg, innerer Stellensitz sowie Eröffnungs- und Belehrungsfolge geklärt','Parcours actuel recevable, siège intérieur et conséquences de notification et d’indication établis'][col]!;
  if(id==='ai-internal-notice-long'||id==='ai-court-notice-long')result[`case.v9.${id}`]=[
   'Wirksame längere Belehrung über ordentlicher Frist und 30 Tagen, innerer Stellensitz und Eröffnung geklärt',
   'Délai plus long valablement indiqué au-delà du délai ordinaire et de 30 jours, siège intérieur et notification établis'][col]!;
  if(id==='ai-internal-notice-30'||id==='ai-court-notice-30')result[`case.v9.${id}`]=[
   'Qualifizierter Belehrungsmangel ohne wirksame längere Angabe, innerer Stellensitz und Eröffnung geklärt',
   'Indication qualifiée de défectueuse sans délai plus long valablement indiqué, siège intérieur et notification établis'][col]!;
  const scope:Pair=id.startsWith('sz-')
   ? ['Aktuell qualifizierte kantonale Stelle mit Sitz in der Gemeinde Schwyz. Normale physische Einreichung ohne zusätzliche Postunterbrechung, allgemeiner zulässiger Verfahrensweg und konkrete Stillstandsausnahme beziehungsweise deren Ausschluss sind geklärt. Andere oder ungeklärte Sitze bleiben ausgeschlossen.','Instance cantonale actuellement qualifiée ayant son siège dans la commune de Schwyz. Dépôt physique normal sans perturbation supplémentaire de la poste, voie générale recevable et exception concrète à la suspension ou son exclusion établis. Les autres sièges ou sièges incertains restent exclus.']
   : ['Aktuell qualifizierte kantonale Stelle im inneren Landesteil. Bei physischem Trackingempfang sind erwartbare Zustellung, verifizierter Eingang in der Machtsphäre und dasselbe bestätigte Empfangsfeiertagsregime wie am Stellensitz aktuell geklärt. Eine bereits rechtlich bestimmte Eröffnung wird nicht nochmals verschoben.','Instance cantonale actuellement qualifiée dans la partie intérieure. En cas de réception physique suivie, notification prévisible, entrée vérifiée dans la sphère de maîtrise et même régime confirmé de jours fériés qu’au siège sont actuellement établis. Une notification déjà établie juridiquement n’est pas reportée à nouveau.'];
  result[`scope.v9.${id}`]=scope[col]+[' Keine abweichende Spezialnorm, Zahlung, fixe Terminangabe oder ungeklärte Zustellfolge. Auslöser, Zählung und gesamte Endverschiebung müssen im Fenster 29.08.2026–31.12.2027 liegen. Aktuelle Tatsachen werden nicht aus Standards übernommen.',' Sans disposition spéciale dérogatoire, paiement, date fixe ni conséquence de notification incertaine. Fait déclencheur, décompte et report complet doivent être couverts du 29.08.2026 au 31.12.2027. Les faits actuels ne sont pas repris des préférences.'][col];
 }
 for(const[k,p]of Object.entries(reasons))result[`administrative.${k}`]=p[col];
 return result;
}
const sourceNames:Readonly<Record<string,Pair>>={
 'SRC-L1-AI-VERWVG':['Verwaltungsverfahrensgesetz AI','Loi sur la procédure administrative AI'],
 'SRC-L1-AI-VERWGG':['Verwaltungsgerichtsgesetz AI','Loi sur le Tribunal administratif AI'],
 'SRC-L1-AI-FRIG':['Fristenlaufgesetz AI','Loi sur la computation des délais AI'],
 'SRC-L1-AI-GOG':['Gerichtsorganisationsgesetz AI','Loi sur l’organisation judiciaire AI'],
 'SRC-L1-AI-REST':['Ruhetagsgesetz AI','Loi sur les jours de repos AI'],
 'SRC-L1-SZ-VRP-20260701':['Verwaltungsrechtspflegegesetz SZ','Loi sur la procédure et la juridiction administratives SZ'],
 'SRC-L1-SZ-JG-20260701':['Justizgesetz SZ','Loi sur la justice SZ'],
 'SRC-L1-SZ-RTG-20180701':['Ruhetagsgesetz SZ','Loi sur les jours de repos SZ'],
 'SRC-L1-SZ-HOLIDAY-OVERVIEW-20260924':['Amtliche Feiertagsübersicht SZ','Aperçu officiel des jours fériés SZ']
};
export function ap23l3SourceName(id:string,locale:Locale):string|undefined{return sourceNames[id]?.[locale==='de'?0:1];}
/** Only reviewed operative locators. Raw reading annotations remain technical evidence. */
export function ap23l3NormLocator(id:string,pathId?:string):string|undefined{
 if(id==='SRC-L1-AI-VERWVG')return pathId==='ai-admin-written-7'?'Art. 4 Abs. 2':pathId==='ai-internal-denial-30'?'Art. 55 Abs. 3':pathId?.includes('notice')?'Art. 39 Abs. 2':pathId==='ai-internal-building-10'?'Art. 51 Abs. 4':pathId==='ai-internal-school-10'?'Art. 51 Abs. 3':pathId==='ai-internal-appeal-30'?'Art. 39 Abs. 1 und Art. 51 Abs. 1':'Art. 27–29';
 if(id==='SRC-L1-AI-VERWGG')return pathId?.includes('notice')?'Art. 16 Abs. 4':pathId==='ai-court-full-30'?'Art. 26 Abs. 5':pathId==='ai-court-personnel-10'?'Art. 12':pathId==='ai-court-interpret-7'?'Art. 41 Abs. 1':pathId==='ai-court-president-7'?'Art. 29, 58, 64–65':'Art. 16, 64–65';
 if(id==='SRC-L1-AI-FRIG')return 'Art. 2, 2a und 2b';
 if(id==='SRC-L1-AI-GOG')return pathId==='ai-court-president-7'?'Art. 42 Abs. 2, in Verbindung mit Art. 29 VerwGG':pathId==='ai-court-personnel-10'?'Art. 11 Abs. 3 Ziff. 3':undefined;
 if(id==='SRC-L1-AI-REST')return 'Art. 2 Abs. 1 lit. b–c';
 if(id==='SRC-L1-SZ-VRP-20260701')return pathId==='sz-admin-provisional-opposition'?'§§ 4, 23 Abs. 2':pathId?.startsWith('sz-court-execution')?'§§ 4, 56 Abs. 2 lit. e':pathId?.startsWith('sz-court-appeal')?'§§ 4, 56 Abs. 1':pathId?.startsWith('sz-admin-appeal-20')?'§§ 4, 47 Abs. 1':'§ 4';
 if(id==='SRC-L1-SZ-JG-20260701')return '§§ 157–158';
 if(id==='SRC-L1-SZ-RTG-20180701')return '§ 2';
 if(id==='SRC-L1-SZ-HOLIDAY-OVERVIEW-20260924')return 'Gemeinde Schwyz, 11. November';
 return undefined;
}
