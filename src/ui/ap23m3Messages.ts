// SPDX-License-Identifier: AGPL-3.0-only
import type { Locale } from './i18n';
type Pair = readonly [string, string];
const paths: Readonly<Record<string, Pair>> = {
  'ne-admin-ordered': ['Angeordnete Eingabe an die Verwaltung', 'Écriture ordonnée à l’administration'],
  'ne-court-ordered': ['Gerichtlich angeordnete Eingabe', 'Écriture ordonnée par le tribunal'],
  'ne-admin-opposition-30': ['Gesetzlich eröffnete Einsprache (30 Tage)', 'Opposition légalement ouverte (30 jours)'],
  'ne-admin-reclamation-30': ['Gesetzlich eröffnete Reklamation (30 Tage)', 'Réclamation légalement ouverte (30 jours)'],
  'ne-admin-appeal-final-30': ['Rekurs gegen Endentscheid (30 Tage)', 'Recours administratif contre une décision finale (30 jours)'],
  'ne-admin-appeal-competence-recusal-30': ['Rekurs gegen Zuständigkeits- oder Ausstandsentscheid (30 Tage)', 'Recours administratif sur la compétence ou la récusation (30 jours)'],
  'ne-admin-appeal-other-incidental-30': ['Rekurs gegen anderen selbstständig anfechtbaren Zwischenentscheid (30 Tage)', 'Recours administratif contre une autre décision incidente attaquable séparément (30 jours)'],
  'ne-admin-appeal-execution-30': ['Rekurs gegen Vollstreckungsmassnahme mit neuen Rechtswirkungen (30 Tage)', 'Recours administratif contre une mesure d’exécution aux effets juridiques nouveaux (30 jours)'],
  'ne-admin-extension-refusal-3': ['Nachfrist nach verweigerter Verlängerung (3 Tage)', 'Délai de grâce après refus de prolongation (3 jours)'],
  'ne-admin-interpretation-appeal-30': ['Neuer Rekurs nach zugelassener Auslegung (30 Tage)', 'Nouveau recours administratif après interprétation admise (30 jours)'],
  'ne-court-appeal-final-30': ['Gerichtsbeschwerde gegen Endentscheid (30 Tage)', 'Recours judiciaire contre une décision finale (30 jours)'],
  'ne-court-appeal-competence-recusal-30': ['Gerichtsbeschwerde betreffend Zuständigkeit oder Ausstand (30 Tage)', 'Recours judiciaire sur la compétence ou la récusation (30 jours)'],
  'ne-court-appeal-other-incidental-30': ['Gerichtsbeschwerde gegen anderen selbstständig anfechtbaren Zwischenentscheid (30 Tage)', 'Recours judiciaire contre une autre décision incidente attaquable séparément (30 jours)'],
  'ne-court-appeal-execution-30': ['Gerichtsbeschwerde gegen Vollstreckungsmassnahme mit neuen Rechtswirkungen (30 Tage)', 'Recours judiciaire contre une mesure d’exécution aux effets juridiques nouveaux (30 jours)'],
  'ne-court-extension-refusal-3': ['Gerichtliche Nachfrist nach verweigerter Verlängerung (3 Tage)', 'Délai de grâce judiciaire après refus de prolongation (3 jours)'],
  'ne-court-interpretation-appeal-30': ['Neue Gerichtsbeschwerde nach zugelassener Auslegung (30 Tage)', 'Nouveau recours judiciaire après interprétation admise (30 jours)'],
  'vd-admin-ordered': ['Angeordnete Eingabe im Erstverfahren', 'Écriture ordonnée en première instance'],
  'vd-reclamation-ordered': ['Angeordnete Eingabe im Einspracheverfahren', 'Écriture ordonnée dans la procédure de réclamation'],
  'vd-administrative-appeal-ordered': ['Angeordnete Eingabe im Verwaltungsbeschwerdeverfahren', 'Écriture ordonnée dans le recours administratif'],
  'vd-court-ordered': ['Angeordnete Eingabe im ordentlichen Gerichtsverfahren', 'Écriture ordonnée dans la procédure judiciaire ordinaire'],
  'vd-court-provisional-ordered': ['Angeordnete Eingabe im gerichtlichen Vorsorgeverfahren', 'Écriture ordonnée dans la procédure judiciaire provisionnelle'],
  'vd-reclamation-final-30': ['Gesetzlich vorgesehene Einsprache gegen Endentscheid (30 Tage)', 'Réclamation prévue par la loi contre une décision finale (30 jours)'],
  'vd-reclamation-interim-10': ['Gesetzlich vorgesehene Einsprache gegen Zwischenentscheid (10 Tage)', 'Réclamation prévue par la loi contre une décision incidente (10 jours)'],
  'vd-administrative-appeal-final-30': ['Verwaltungsbeschwerde gegen Endentscheid (30 Tage)', 'Recours administratif contre une décision finale (30 jours)'],
  'vd-administrative-appeal-interim-30': ['Selbstständig zulässige verwaltungsinterne Zwischenbeschwerde (30 Tage)', 'Recours administratif incident recevable séparément (30 jours)'],
  'vd-administrative-appeal-provisional-30': ['Verwaltungsbeschwerde betreffend vorsorgliche Massnahme (30 Tage)', 'Recours administratif sur une mesure provisionnelle (30 jours)'],
  'vd-court-final-30': ['Ordentliche Beschwerde an das Kantonsgericht (30 Tage)', 'Recours ordinaire au Tribunal cantonal (30 jours)'],
  'vd-court-interim-30': ['Gerichtliche Zwischenbeschwerde ausserhalb des Vorsorgeverfahrens (30 Tage)', 'Recours judiciaire incident hors procédure provisionnelle (30 jours)'],
  'vd-court-external-provisional-30': ['Vorsorgeentscheid der Verwaltung an das Kantonsgericht weiterziehen (30 Tage)', 'Recours au Tribunal cantonal contre une mesure provisionnelle administrative (30 jours)'],
  'vd-court-instructing-provisional-10': ['Vorsorgeentscheid des Instruktionsrichters an dieselbe Kammer weiterziehen (10 Tage)', 'Recours contre une mesure provisionnelle du juge instructeur à la même section (10 jours)'],
  'vd-admin-grace-3': ['Nachfrist nach verweigerter Verlängerung im Erstverfahren (3 Tage)', 'Délai de grâce après refus de prolongation en première instance (3 jours)'],
  'vd-reclamation-grace-3': ['Nachfrist nach verweigerter Verlängerung im Einspracheverfahren (3 Tage)', 'Délai de grâce après refus de prolongation dans la réclamation (3 jours)'],
  'vd-administrative-appeal-grace-3': ['Nachfrist nach verweigerter Verlängerung im Verwaltungsrekurs (3 Tage)', 'Délai de grâce après refus de prolongation dans le recours administratif (3 jours)'],
  'vd-court-grace-3': ['Nachfrist nach verweigerter Verlängerung im ordentlichen Gerichtsverfahren (3 Tage)', 'Délai de grâce après refus de prolongation dans la procédure judiciaire ordinaire (3 jours)'],
  'vd-court-provisional-grace-3': ['Nachfrist nach verweigerter Verlängerung im gerichtlichen Vorsorgeverfahren (3 Tage)', 'Délai de grâce après refus de prolongation dans la procédure judiciaire provisionnelle (3 jours)'],
  'vs-admin-ordered': ['Angeordnete Eingabe im Erstverfahren', 'Écriture ordonnée en première instance'],
  'vs-admin-written-5': ['Schriftliche Bestätigung nach mündlicher Verfügung verlangen (5 Tage)', 'Demander la confirmation écrite d’une décision orale (5 jours)'],
  'vs-admin-opposition-30': ['Gesetzlich eröffnete Einsprache oder Reklamation (30 Tage)', 'Opposition ou réclamation légalement ouverte (30 jours)'],
  'vs-admin-appeal-30': ['Ordentliche Verwaltungsbeschwerde (30 Tage)', 'Recours administratif ordinaire (30 jours)'],
  'vs-admin-interlocutory-10': ['Selbstständig anfechtbaren Zwischenentscheid weiterziehen (10 Tage)', 'Recours administratif contre une décision incidente attaquable séparément (10 jours)'],
  'vs-admin-appeal-ordered': ['Angeordnete Eingabe im Verwaltungsbeschwerdeverfahren', 'Écriture ordonnée dans le recours administratif'],
  'vs-admin-full-30': ['Vollständigen Verwaltungsbeschwerdeentscheid nach Dispositiv verlangen (30 Tage)', 'Demander la décision complète après le dispositif administratif (30 jours)'],
  'vs-admin-notice-long': ['Verwaltungsbeschwerde mit wirksamer längerer Tagesbelehrung', 'Recours administratif avec délai plus long valablement indiqué'],
  'vs-court-appeal-30': ['Ordentliche Verwaltungsgerichtsbeschwerde (30 Tage)', 'Recours de droit administratif ordinaire (30 jours)'],
  'vs-court-interlocutory-10': ['Selbstständig anfechtbaren Zwischenentscheid an das Kantonsgericht weiterziehen (10 Tage)', 'Recours au Tribunal cantonal contre une décision incidente attaquable séparément (10 jours)'],
  'vs-court-ordered': ['Gerichtlich angeordnete Eingabe', 'Écriture ordonnée par le tribunal'],
  'vs-court-full-30': ['Vollständigen Gerichtsentscheid nach Dispositiv verlangen (30 Tage)', 'Demander la décision judiciaire complète après le dispositif (30 jours)'],
  'vs-court-written-5': ['Schriftliche Bestätigung nach mündlichem Gerichtsentscheid verlangen (5 Tage)', 'Demander la confirmation écrite d’une décision judiciaire orale (5 jours)'],
  'vs-court-notice-long': ['Gerichtsbeschwerde mit wirksamer längerer Tagesbelehrung', 'Recours judiciaire avec délai plus long valablement indiqué']
};
const common: Readonly<Record<string, Pair>> = {
  'law.ne-general-administrative': ['LPA NE – Verwaltungsverfahren', 'LPA NE – Procédure administrative'],
  'law.vd-general-administrative': ['LPA-VD – Verwaltungsverfahren', 'LPA-VD – Procédure administrative'],
  'law.vs-general-administrative': ['VVRG / LPJA VS – Verwaltungsverfahren', 'LPJA VS – Procédure administrative'],
  'scope.v10.unselected': ['Allgemeiner kantonaler Tagesweg. Aktueller Auslöser, Zulässigkeit und Anordnung beziehungsweise Belehrung müssen geklärt sein.', 'Parcours cantonal général en jours. Le fait déclencheur actuel, la recevabilité et l’ordre ou l’indication du délai doivent être établis.'],
  'v10.fact.openingMode': ['Grundlage des eingegebenen Datums', 'Base de la date saisie'],
  'v10.fact.noticeStatus': ['Fristbelehrung im aktuellen Fall', 'Indication du délai dans le cas actuel'],
  'v10.fact.ordinaryDays': ['Ordentliche gesetzliche Frist im aktuellen Fall', 'Délai légal ordinaire dans le cas actuel'],
  'v10.fact.authorityHolidayRegion': ['Aktueller Sitz der zuständigen Stelle in Neuenburg', 'Siège actuel de l’instance compétente à Neuchâtel'],
  'v10.value.neWithoutLeLanderon': ['Kanton Neuenburg ausser Le Landeron', 'Canton de Neuchâtel hors Le Landeron'],
  'v10.value.leLanderon': ['Le Landeron', 'Le Landeron'],
  'v10.value.qualifiedLegalOpening': ['Rechtlich massgebender Tag bereits bestimmt', 'Date juridiquement déterminante déjà établie'],
  'v10.value.vdUnsignedPostalReceipt': ['Physischer Eingang einer einfachen Postzustellung ohne Unterschrift', 'Réception physique d’un envoi postal simple sans signature'],
  'v10.value.regularNoDeviation': ['Reguläre, unbestrittene Belehrung', 'Indication régulière et incontestée'],
  'v10.value.shorterInstructionUsesStatutory': ['Kürzere Angabe – gesetzliche Frist gilt', 'Indication plus courte – le délai légal s’applique'],
  'v10.value.10': ['10 Tage', '10 jours'], 'v10.value.30': ['30 Tage', '30 jours'],
  'v10.value.unknown': ['Unklar oder abweichend', 'Incertain ou différent'],
  'v10.qualifiedDate': ['Rechtlich massgebender Eröffnungs- oder Kenntnistag', 'Date de notification ou de connaissance juridiquement déterminante'],
  'v10.physicalReceipt': ['Physischer Eingang der einfachen Postzustellung', 'Réception physique de l’envoi postal simple'],
  'v10.nextDay': ['Tag nach der rechtlich massgebenden Eröffnung', 'Jour suivant la notification juridiquement déterminante'],
  'v10.postExplanation': ['Nur bei aktuell zulässiger einfacher Zustellung ohne Unterschrift und verifiziertem Eingang wird ein arbeitsfreier Empfangstag auf den nächsten Werktag verschoben. Ein bereits rechtlich bestimmtes Eröffnungsdatum bleibt unverändert.', 'Uniquement pour une notification simple actuellement admissible sans signature et une entrée vérifiée, une réception un jour non ouvrable est reportée au prochain jour ouvrable. Une date de notification déjà établie juridiquement reste inchangée.'],
  'v10.postCase': ['Zustellung ohne Unterschrift zulässig, Eingang in der Empfängersphäre verifiziert', 'Notification sans signature admissible, entrée dans la sphère du destinataire vérifiée'],
  'v10.currentDays': ['Aktuell angeordnete Frist in Tagen', 'Délai actuellement ordonné, en jours'],
  'v10.longerDays': ['Aktuell wirksam angegebene längere Frist in Tagen', 'Délai plus long valablement indiqué actuellement, en jours'],
  'v10.noticeInvalid': ['Die tatsächlich wirksam angegebene Tagesdauer muss die gewählte ordentliche Frist überschreiten.', 'La durée effectivement et valablement indiquée doit dépasser le délai ordinaire choisi.'],
  'v10.durationInvalid': ['Bitte die aktuell gültige Tagesdauer von 1 bis 365 eingeben. 365 Tage ist eine technische Grenze, kein gesetzliches Maximum.', 'Veuillez saisir la durée actuellement valable de 1 à 365 jours. 365 jours est une limite technique, non un maximum légal.'],
  'v10.noticeHeading': ['Aktuell wirksame Belehrungsdauer', 'Durée valablement indiquée dans le cas actuel'],
  'v10.vsWinter': ['Ostern, 15. Juli–15. August, 18. Dezember–5. Januar', 'Pâques, 15 juillet–15 août, 18 décembre–5 janvier'],
  'v10.neCourtSeat': ['Tribunal cantonal, Cour de droit public, Neuchâtel', 'Tribunal cantonal, Cour de droit public, Neuchâtel'],
  'v10.noAutomaticFollowup': ['Eine spätere Beschwerdefrist wird erst nach ihrer eigenen tatsächlich qualifizierten Eröffnung berechnet. Hier wird keine Folgezustellung erfunden.', 'Un délai de recours ultérieur n’est calculé qu’après sa propre notification effectivement qualifiée. Aucune notification future n’est inventée ici.'],
  'v10.endCollision': ['Die Endverschiebung führt in einen neu beginnenden Stillstand. Für diesen begrenzt offenen Fall gibt es kein definitives Ende und keinen Kalenderexport.', 'Le report entre dans une nouvelle période de suspension. Ce cas limité non résolu ne donne ni échéance définitive ni export de calendrier.'],
  'NE-YEAR-LOCAL-RESERVE': ['Zusätzliche jährliche oder örtliche Schliessanordnungen sind nicht abschliessend erfasst. Ein im konkreten Fall bekanntes zusätzliches Hindernis ist gesondert zu prüfen.', 'Les fermetures annuelles ou locales supplémentaires ne sont pas recensées exhaustivement. Un obstacle supplémentaire connu dans le cas concret doit être examiné séparément.']
};
const caseKinds: Readonly<Record<string, Pair>> = {
  ordinary: ['Zulässiger aktueller Weg, massgebende Eröffnung und Fristbelehrung geklärt', 'Parcours actuel recevable, notification déterminante et indication du délai établies'],
  ordered: ['Gültige aktuelle Tagesanordnung ab ihrer Eröffnung, keine Zahlung', 'Ordre actuel valable fixant un délai en jours dès sa notification, aucun paiement'],
  vdOrdered: ['Neue Tagesfrist ab Eröffnung, Art.-81-Erstansetzung bis 30 Tage oder bewilligte Verlängerung beziehungsweise andere gültige Anordnung geklärt', 'Nouveau délai en jours dès notification, fixation initiale selon l’art. 81 de 30 jours au plus, prolongation accordée ou autre ordre valable établis'],
  grace: ['Erstreckbare Eingabefrist abgelaufen, Verlängerung rechtzeitig verlangt und erst danach verweigert, keine Zahlung', 'Délai d’écriture prolongeable échu, prolongation demandée à temps et refusée seulement après l’échéance, aucun paiement'],
  interpretation: ['Auslegung zugelassen und neuer Rechtsmittellauf tatsächlich eröffnet', 'Interprétation admise et nouveau délai de recours effectivement ouvert'],
  opposition: ['Einsprache oder Reklamation gesetzlich eröffnet, aktuelle Voraussetzungen geklärt', 'Opposition ou réclamation légalement ouverte, conditions actuelles établies'],
  oral: ['Massgebende mündliche Eröffnung mit Hinweis auf schriftliche Bestätigung geklärt', 'Notification orale déterminante avec information sur la confirmation écrite établie'],
  full: ['Schriftliches Dispositiv rechtmässig eröffnet, vollständigen Entscheid bei derselben Stelle verlangen', 'Dispositif écrit valablement notifié, demande de décision complète à la même instance'],
  long: ['Längere Tagesbelehrung im aktuellen Fall wirksam und oberhalb der gewählten ordentlichen Frist', 'Indication actuelle d’un délai plus long valable et supérieure au délai ordinaire choisi'],
  instructing: ['Vorsorgeentscheid des Instruktionsrichters, zulässiger Weiterzug an dieselbe Kammer', 'Décision provisionnelle du juge instructeur, recours recevable à la même section']
};
const orderedScope: Pair = [
  ' Es gilt nur eine neue Tagesdauer ab ihrer qualifizierten Eröffnung. Kein fixer Termin und keine Verlängerung ab dem alten Fristende. Die Rechtmässigkeit der Anordnung muss aktuell feststehen. Art. 81 Abs. 5 LPA-VD wird nicht automatisch numerisch geprüft. Eine dortige Erstansetzung über 30 Tagen ist nicht allein wegen der Zahleneingabe gültig.',
  ' Seule une nouvelle durée en jours dès sa notification qualifiée est couverte. Ni date fixe ni prolongation dès l’ancienne échéance. La légalité de l’ordre doit être établie actuellement. L’art. 81 al. 5 LPA-VD n’est pas contrôlé automatiquement par calcul. Une fixation initiale dépassant 30 jours n’est pas valable du seul fait de saisir ce nombre.'
];
export function createAp23m3Messages(locale: Locale): Record<string, string> {
  const col = locale === 'de' ? 0 : 1;
  const result = Object.fromEntries(Object.entries(common).map(([key, pair]) => [key, pair[col]]));
  for (const [id, pair] of Object.entries(paths)) {
    const kind = id.includes('grace-3') || id.includes('extension-refusal-3') ? 'grace'
      : id.includes('ordered') ? id.startsWith('vd-') ? 'vdOrdered' : 'ordered'
      : id.includes('interpretation') ? 'interpretation' : id.includes('written-5') ? 'oral'
      : id.includes('full-30') ? 'full' : id.includes('notice-long') ? 'long'
      : id.includes('instructing-provisional') ? 'instructing'
      : id.includes('opposition') || id.includes('reclamation-30') || id.includes('reclamation-final') || id.includes('reclamation-interim') ? 'opposition' : 'ordinary';
    result[`path.${id}`] = pair[col];
    result[`case.v10.${id}`] = caseKinds[kind]![col];
    result[`case.v10.${id}.raw`] = `${caseKinds[kind]![col]}. ${common['v10.postCase']![col]}`;
    result[`scope.v10.${id}`] = pair[col] + ['. Allgemeiner zulässiger kantonaler Tagesweg. Abweichendes Spezialrecht, Zahlungen, fixe Termine und ungeklärte Zustellfolgen sind nicht umfasst. Alle relevanten Tage müssen im Fenster 29.08.2026–31.12.2027 liegen. Aktuelle Tatsachen werden nicht aus Standards übernommen.', '. Parcours cantonal général recevable en jours. Le droit spécial dérogatoire, les paiements, les dates fixes et les conséquences incertaines de notification sont exclus. Tous les jours pertinents doivent être couverts du 29.08.2026 au 31.12.2027. Les faits actuels ne sont pas repris des préférences.'][col]
      + (kind === 'vdOrdered' ? orderedScope[col] : kind === 'grace' ? [' Ein rechtzeitiges Gesuch betreffend eine erstreckbare Eingabefrist und die erst nach deren Ablauf eröffnete Ablehnung stehen fest. Keine pauschale Dreitageszugabe zum alten Ende.', ' Une demande présentée à temps pour un délai d’écriture prolongeable et le refus notifié seulement après son échéance sont établis. Aucun ajout forfaitaire de trois jours à l’ancienne échéance.'][col] : '')
      + (id.startsWith('ne-') ? [' Der massgebende Eröffnungstag ist bereits rechtlich bestimmt. Der Endkalender wird nicht als Rohzustellungsautomatik verwendet. Eine individuelle Sistierung ist ausgeschlossen. Gerichtliche Wege setzen die qualifizierte Zuständigkeit der Cour de droit public in Neuchâtel voraus.', ' La date de notification déterminante est déjà établie juridiquement. Le calendrier d’échéance n’est pas un automatisme de réception physique. Une suspension individuelle est exclue. Les voies judiciaires supposent la compétence qualifiée de la Cour de droit public à Neuchâtel.'][col] : '');
  }
  const reasons: Readonly<Record<string, Pair>> = {
    SCOPE: ['Die zuständige kantonale Stelle muss aktuell feststehen.', 'L’instance cantonale compétente doit être établie actuellement.'],
    ANCHOR: ['Der aktuelle Stellensitz und seine zutreffende Feiertagsbindung müssen geklärt sein.', 'Le siège actuel et son rattachement correct aux jours fériés doivent être établis.'],
    SPECIAL: ['Die Anwendung des allgemeinen kantonalen Rechts ohne abweichendes Spezialrecht ist ungeklärt.', 'L’application du droit cantonal général sans droit spécial dérogatoire n’est pas établie.'],
    UNITS: ['Dieser Weg berechnet nur vorwärts laufende Tagesfristen.', 'Ce parcours ne calcule que des délais en jours courant vers l’avenir.'],
    OPENING: ['Die rechtlich massgebende Eröffnung oder die ausdrücklich zugelassene Postkonstellation ist ungeklärt.', 'La notification juridiquement déterminante ou la situation postale expressément admise n’est pas établie.'],
    NOTICE: ['Die aktuell massgebende Fristbelehrung ist nicht geklärt.', 'L’indication du délai actuellement déterminante n’est pas établie.'],
    STAGE: ['Das aktuelle Verfahrensstadium passt nicht zum gewählten Weg.', 'Le stade actuel de la procédure ne correspond pas au parcours choisi.'],
    ACTION: ['Die aktuelle Verfahrenshandlung und ihre Zulässigkeit müssen feststehen.', 'L’acte actuel de procédure et sa recevabilité doivent être établis.'],
    SISTIERUNG: ['Eine individuelle Sistierung ist nicht ausgeschlossen und benötigt eine gesonderte Prüfung.', 'Une suspension individuelle n’est pas exclue et nécessite un examen séparé.'],
    ORDER: ['Eine gültige aktuelle Tagesanordnung für diese Eingabe muss tatsächlich vorliegen.', 'Un ordre actuel valable fixant un délai en jours pour cette écriture doit effectivement exister.'],
    OPPOSITION: ['Die Einsprache oder Reklamation muss für diesen Entscheid gesetzlich eröffnet sein.', 'L’opposition ou la réclamation doit être légalement ouverte contre cette décision.'],
    INSTANZ: ['Zuständigkeit und erforderliche Ausschöpfung vorgelagerter Rechtsmittel sind ungeklärt.', 'La compétence et l’épuisement nécessaire des voies de droit préalables ne sont pas établis.'],
    ADMISSIBILITY: ['Die selbstständige Anfechtbarkeit dieses Entscheids muss aktuell geklärt sein.', 'La possibilité de contester séparément cette décision doit être établie actuellement.'],
    REFUSAL: ['Die erstreckbare Eingabefrist muss bei Eröffnung der Ablehnung bereits abgelaufen und das Gesuch rechtzeitig gestellt sein.', 'Le délai d’écriture prolongeable doit déjà être échu lors de la notification du refus et la demande avoir été présentée à temps.'],
    INTERPRETATION: ['Eine zugelassene Auslegung mit tatsächlich neuem Rechtsmittellauf ist nicht geklärt.', 'Une interprétation admise ouvrant effectivement un nouveau délai de recours n’est pas établie.'],
    'ORDER-LEGALITY': ['Die aktuelle Anordnung muss rechtlich zulässig sein. Eine Art.-81-Erstansetzung über 30 Tagen ist nicht ungeprüft als gültig zu bestätigen.', 'L’ordre actuel doit être licite. Une fixation initiale selon l’art. 81 dépassant 30 jours ne peut pas être confirmée valable sans examen.'],
    PAYMENT: ['Eine Zahlungsfrist ist mit diesem Eingabeweg nicht abgedeckt.', 'Un délai de paiement n’est pas couvert par ce parcours d’écriture.'],
    COMPETENCE: ['Die zuständige Instanz für diese konkrete Handlung ist nicht geklärt.', 'L’instance compétente pour cet acte concret n’est pas établie.'],
    SUSPENSION: ['Die aktuelle Abgrenzung zwischen ordentlichem und vorsorglichem Verfahren muss feststehen.', 'La distinction actuelle entre procédure ordinaire et provisionnelle doit être établie.'],
    GRACE: ['Die Nachfrist setzt ein rechtzeitiges Verlängerungsgesuch und die erst nach Ablauf der Eingabefrist eröffnete Ablehnung voraus.', 'Le délai de grâce suppose une demande de prolongation à temps et un refus notifié seulement après l’échéance du délai d’écriture.'],
    TRIGGER: ['Massgebend ist der tatsächlich qualifizierte Auslöser dieser Handlung, keine erfundene Folgezustellung.', 'Le fait déclencheur effectivement qualifié de cet acte est déterminant, non une notification future inventée.'],
    'NOTICE-BASE': ['Die ordentliche gesetzliche Frist muss für diesen aktuellen Fall als zehn oder 30 Tage bestimmt sein.', 'Le délai légal ordinaire doit être établi à dix ou 30 jours pour le cas actuel.'],
    'POSTAL-SCOPE': ['Die einfache Zustellung ohne erforderliche Unterschrift muss im aktuellen Fall zulässig sein.', 'La notification simple sans signature requise doit être admissible dans le cas actuel.'],
    'POSTAL-ENTRY': ['Der Eingang in der Empfängersphäre muss verifiziert sein.', 'L’entrée dans la sphère du destinataire doit être vérifiée.']
  };
  for (const canton of ['NE', 'VD', 'VS']) for (const [key, pair] of Object.entries(reasons)) result[`administrative.${canton}-B-${key}`] = pair[col];
  return result;
}

const sources: Readonly<Record<string, Pair>> = {
  'SRC-M1-NE-LPA': ['Verwaltungsverfahrensgesetz NE', 'Loi sur la procédure administrative NE'],
  'SRC-M1-NE-RDF': ['Reglement über Arbeitsdauer und Ferien NE', 'Règlement sur la durée du travail et les vacances NE'],
  'SRC-M1-NE-LDJF': ['Feiertagsgesetz NE', 'Loi sur le dimanche et les jours fériés NE'],
  'SRC-M1-NE-LANDERON': ['Kantonale Feiertagsregel Le Landeron', 'Arrêté cantonal sur le jour férié au Landeron'],
  'SRC-M1-NE-LCE': ['Gesetz über den Staatsrat NE', 'Loi sur l’organisation du Conseil d’État NE'],
  'SRC-M1-NE-OJN': ['Gerichtsorganisationsgesetz NE', 'Loi d’organisation judiciaire neuchâteloise'],
  'SRC-M1-VD-LPA': ['Verwaltungsverfahrensgesetz VD', 'Loi sur la procédure administrative VD'],
  'SRC-M1-VD-LSAM': ['Gesetz über Samstage im Fristenlauf VD', 'Loi sur la supputation des délais comprenant un samedi VD'],
  'SRC-M1-VD-LEMP': ['Beschäftigungsgesetz VD', 'Loi sur l’emploi VD'],
  'SRC-M1-VS-LPJA-FR-API': ['Verwaltungsverfahrensgesetz VS', 'Loi sur la procédure et la juridiction administratives VS'],
  'SRC-M1-VS-RUHE-API': ['Ruhetagsgesetz VS', 'Loi sur le repos du dimanche et des jours de fête VS'],
  'SRC-M1-VS-RUHEREG-API': ['Ruhetagsreglement VS', 'Règlement sur le repos du dimanche et des jours de fête VS'],
  'SRC-M1-VS-LOJ-API': ['Gerichtsorganisationsgesetz VS', 'Loi sur l’organisation de la justice VS'],
  'JUD-M1-VS-SATURDAY-CASE': ['Kantonsgericht VS zur Samstagsverschiebung', 'Tribunal cantonal VS sur le report du samedi'],
  'JUD-M1-VS-RECESS-CASE': ['Kantonsgericht VS zum administrativen Fristenlauf', 'Tribunal cantonal VS sur les délais administratifs']
};
export function ap23m3SourceName(id: string, locale: Locale): string | undefined { return sources[id]?.[locale === 'de' ? 0 : 1]; }
/** Reviewed article labels only. Raw reading annotations and reform chronology stay technical. */
export function ap23m3NormLocator(id: string, pathId?: string): string | undefined {
  if (id === 'SRC-M1-VD-LPA') {
    if (pathId?.includes('grace')) return pathId.startsWith('vd-court') ? 'Art. 19–21, 96, 99'
      : pathId === 'vd-reclamation-grace-3' ? 'Art. 19–21, 72' : 'Art. 19–21';
    if (pathId === 'vd-court-instructing-provisional-10') return 'Art. 19–21, 94 Abs. 2, 96 Abs. 2';
    if (pathId === 'vd-reclamation-ordered') return 'Art. 19–23, 66–72, 81, 87, 89';
    if (pathId?.startsWith('vd-reclamation')) return 'Art. 19–21, 66–68, 72';
    if (pathId === 'vd-administrative-appeal-ordered') return 'Art. 19–23, 73, 81, 87, 89';
    if (pathId?.startsWith('vd-administrative-appeal')) return 'Art. 19–21, 73–74, 77';
    if (pathId === 'vd-court-provisional-ordered') return 'Art. 19–23, 87, 92, 96 Abs. 2, 99';
    if (pathId === 'vd-court-ordered') return 'Art. 19–23, 81, 89, 92, 96, 99';
    if (pathId === 'vd-court-external-provisional-30') return 'Art. 19–21, 74 Abs. 3, 92, 95, 96 Abs. 2, 99';
    if (pathId?.startsWith('vd-court')) return 'Art. 19–21, 74, 92, 95–96, 99';
    return 'Art. 19–23, 27, 62';
  }
  if (id === 'SRC-M1-NE-LPA') return pathId?.includes('extension-refusal') ? 'Art. 33–37, insbesondere Art. 35 Abs. 2–3'
    : pathId?.includes('interpretation') ? 'Art. 79 Abs. 2, 101–109, 118' : pathId?.includes('opposition') || pathId?.includes('reclamation') ? 'Art. 76, 98–100'
    : pathId?.includes('ordered') ? 'Art. 20–21, 33–37, 49–50, 60, 110, 114, 116' : 'Art. 33–37, 101–109, 118';
  if (id === 'SRC-M1-VS-LPJA-FR-API') {
    const court = pathId?.startsWith('vs-court');
    if (pathId?.includes('notice-long')) return court ? 'Art. 14 Abs. 2, 46 Abs. 3, 79a, 80 Abs. 1 lit. b' : 'Art. 14 Abs. 2, 46 Abs. 3';
    if (pathId?.includes('written-5')) return court ? 'Art. 29 Abs. 2 und 4, 79a, 80 Abs. 2' : 'Art. 15, 29 Abs. 2 und 4';
    if (pathId?.includes('full-30')) return court ? 'Art. 60 Abs. 2, 79a, 80 Abs. 1 lit. e' : 'Art. 15, 60 Abs. 2';
    if (pathId === 'vs-admin-opposition-30') return 'Art. 15, 34a–34g';
    if (pathId === 'vs-admin-ordered') return 'Art. 12–15';
    if (pathId?.includes('ordered')) return court ? 'Art. 12–15, 79a, 80 Abs. 1 lit. c–d' : 'Art. 12–15, 49–50, 54–56';
    return court ? 'Art. 41–46, 72–77a, 79a, 80 Abs. 1 lit. b' : 'Art. 15, 41–46';
  }
  const labels: Readonly<Record<string, string>> = {
    'SRC-M1-NE-RDF': 'Art. 11', 'SRC-M1-NE-LDJF': 'Art. 3', 'SRC-M1-NE-LANDERON': 'Art. 2',
    'SRC-M1-NE-LCE': 'Art. 35', 'SRC-M1-NE-OJN': 'Art. 35, 47', 'SRC-M1-VD-LSAM': 'Art. 1', 'SRC-M1-VD-LEMP': 'Art. 47',
    'SRC-M1-VS-RUHE-API': 'Art. 1', 'SRC-M1-VS-RUHEREG-API': 'Art. 1', 'SRC-M1-VS-LOJ-API': 'Art. 37',
    'JUD-M1-VS-SATURDAY-CASE': 'A1 15 225, E. 1.1–1.3', 'JUD-M1-VS-RECESS-CASE': 'A1 23 199, E. 3'
  };
  return labels[id];
}
