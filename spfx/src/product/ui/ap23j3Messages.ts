// SPDX-License-Identifier: AGPL-3.0-only
// Display copy only. No text here selects a path, qualifies facts or calculates a date.
import type { Locale } from './i18n';
type Pair = readonly [string, string];
const pathNames: Readonly<Record<string, Pair>> = {
  "fr-nontc-ordered": [
    "Angeordnete Eingabe ausserhalb des Kantonsgerichts",
    "Écriture ordonnée hors du Tribunal cantonal"
  ],
  "fr-nontc-recours-30": [
    "Ordentliche Verwaltungsbeschwerde (30 Tage)",
    "Recours administratif ordinaire (30 jours)"
  ],
  "fr-nontc-recours-10": [
    "Beschwerde gegen selbstständig anfechtbaren Zwischenentscheid (10 Tage)",
    "Recours contre une décision incidente attaquable séparément (10 jours)"
  ],
  "fr-tc-ordered": [
    "Angeordnete Eingabe an das Kantonsgericht",
    "Écriture ordonnée au Tribunal cantonal"
  ],
  "fr-tc-recours-30": [
    "Ordentliche Beschwerde an das Kantonsgericht (30 Tage)",
    "Recours ordinaire au Tribunal cantonal (30 jours)"
  ],
  "fr-tc-recours-10": [
    "Zwischenentscheid an das Kantonsgericht weiterziehen (10 Tage)",
    "Recours contre une décision incidente au Tribunal cantonal (10 jours)"
  ],
  "fr-nontc-nachfrist-3": [
    "Nachfrist nach verweigerter Erstreckung (3 Tage)",
    "Délai supplémentaire après refus de prolongation (3 jours)"
  ],
  "fr-tc-nachfrist-3": [
    "Nachfrist am Kantonsgericht nach verweigerter Erstreckung (3 Tage)",
    "Délai supplémentaire au Tribunal cantonal après refus de prolongation (3 jours)"
  ],
  "fr-tc-begruendung-30": [
    "Vollständige Begründung zum TC-Dispositiv verlangen (30 Tage)",
    "Demander la motivation complète du dispositif du Tribunal cantonal (30 jours)"
  ],
  "fr-nontc-reclamation-30": [
    "Gesetzlich eröffnete Reklamation (30 Tage)",
    "Réclamation ouverte par la loi (30 jours)"
  ],
  "fr-tc-cost-reclamation-30": [
    "Reklamation nur gegen Kosten des Kantonsgerichts (30 Tage)",
    "Réclamation limitée aux frais du Tribunal cantonal (30 jours)"
  ],
  "ge-admin-ordered": [
    "Angeordnete erstinstanzliche Eingabe",
    "Écriture ordonnée en première instance"
  ],
  "ge-reclamation-30": [
    "Gesetzlich eröffnete Reklamation (30 Tage)",
    "Réclamation ouverte par la loi (30 jours)"
  ],
  "ge-reclamation-ordered": [
    "Angeordnete Eingabe im Reklamationsverfahren",
    "Écriture ordonnée dans la procédure de réclamation"
  ],
  "ge-recours-30": [
    "Beschwerde gegen End- oder Zuständigkeitsentscheid (30 Tage)",
    "Recours contre une décision finale ou de compétence (30 jours)"
  ],
  "ge-recours-10": [
    "Beschwerde gegen anderen selbstständig anfechtbaren Entscheid (10 Tage)",
    "Recours contre une autre décision attaquable séparément (10 jours)"
  ],
  "ge-recours-ordered": [
    "Angeordnete Eingabe im Beschwerdeverfahren",
    "Écriture ordonnée dans la procédure de recours"
  ],
  "ge-costs-reclamation-30": [
    "Reklamation gegen Kosten, Gebühren oder Entschädigung (30 Tage)",
    "Réclamation contre les frais, émoluments ou indemnités (30 jours)"
  ],
  "ju-admin-ordered": [
    "Angeordnete erstinstanzliche Eingabe",
    "Écriture ordonnée en première instance"
  ],
  "ju-opposition-final30": [
    "Einsprache gegen Endentscheid (30 Tage)",
    "Opposition contre une décision finale (30 jours)"
  ],
  "ju-opposition-interim10": [
    "Selbstständig zulässige Einsprache gegen Zwischenentscheid (10 Tage)",
    "Opposition séparément recevable contre une décision incidente (10 jours)"
  ],
  "ju-opposition-provisional10": [
    "Einsprache in echter vorsorglicher Sache (10 Tage)",
    "Opposition dans une véritable procédure provisionnelle (10 jours)"
  ],
  "ju-opposition-ordered": [
    "Angeordnete Eingabe im Einspracheverfahren",
    "Écriture ordonnée dans la procédure d’opposition"
  ],
  "ju-opposition-provisional-ordered": [
    "Angeordnete Eingabe in vorsorglicher Einsprache",
    "Écriture ordonnée dans une opposition provisionnelle"
  ],
  "ju-review-final30": [
    "Ordentliche Beschwerde gegen Endentscheid (30 Tage)",
    "Recours ordinaire contre une décision finale (30 jours)"
  ],
  "ju-review-interim10": [
    "Selbstständig zulässige Beschwerde gegen Zwischenentscheid (10 Tage)",
    "Recours séparément recevable contre une décision incidente (10 jours)"
  ],
  "ju-review-enforcement10": [
    "Beschwerde gegen Vollstreckungsentscheid (10 Tage)",
    "Recours contre une décision d’exécution (10 jours)"
  ],
  "ju-review-provisional10": [
    "Beschwerde in echter vorsorglicher Sache (10 Tage)",
    "Recours dans une véritable procédure provisionnelle (10 jours)"
  ],
  "ju-review-ordered": [
    "Angeordnete Eingabe im Beschwerdeverfahren",
    "Écriture ordonnée dans la procédure de recours"
  ],
  "ju-review-provisional-ordered": [
    "Angeordnete Eingabe in vorsorglichem Beschwerdeverfahren",
    "Écriture ordonnée dans un recours provisionnel"
  ],
  "ju-confirmation-request5-initial": [
    "Schriftliche Bestätigung mündlicher Eröffnung verlangen (5 Tage)",
    "Demander la confirmation écrite d’une notification orale (5 jours)"
  ],
  "ju-confirmation-request5-review": [
    "Schriftliche Bestätigung in Einsprache oder Beschwerde verlangen (5 Tage)",
    "Demander la confirmation écrite dans une opposition ou un recours (5 jours)"
  ],
  "ju-confirmation-request5-provisional": [
    "Schriftliche Bestätigung in vorsorglicher Sache verlangen (5 Tage)",
    "Demander la confirmation écrite dans une procédure provisionnelle (5 jours)"
  ],
  "ju-motivation-request30-initial": [
    "Begründung eines gutheissenden verkürzten Entscheids verlangen (30 Tage)",
    "Demander les motifs d’une décision favorable notifiée sous forme abrégée (30 jours)"
  ],
  "ju-motivation-request30-review": [
    "Begründung in Einsprache oder Beschwerde verlangen (30 Tage)",
    "Demander les motifs dans une opposition ou un recours (30 jours)"
  ],
  "ju-motivation-request30-provisional": [
    "Begründung in vorsorglicher Sache verlangen (30 Tage)",
    "Demander les motifs dans une procédure provisionnelle (30 jours)"
  ]
};
const common: Readonly<Record<string, Pair>> = {
  "law.cpja-fr": [
    "CPJA FR – Verwaltungsrechtspflege",
    "CPJA FR – Procédure et juridiction administratives"
  ],
  "law.lpa-ge": [
    "LPA GE – Verwaltungsverfahren",
    "LPA GE – Procédure administrative"
  ],
  "law.cpa-ju": [
    "CPA JU – Verwaltungsverfahren",
    "CPA JU – Procédure administrative"
  ],
  "v7.fact.openingMode": [
    "Eröffnung und Empfang",
    "Notification et réception"
  ],
  "v7.value.qualifiedLegalOpening": [
    "Rechtlich massgebender Eröffnungstag steht fest",
    "Date de notification juridiquement déterminante établie"
  ],
  "v7.value.ordinaryPostPhysicalReceipt": [
    "Tatsächlicher Empfang gewöhnlicher Post",
    "Réception effective d’un envoi postal ordinaire"
  ],
  "v7.value.unknown": [
    "Unklar oder abweichend",
    "Incertain ou différent"
  ],
  "v7.fact.reclamationBasis": [
    "Grundlage der Reklamation",
    "Fondement de la réclamation"
  ],
  "v7.value.article148Costs": [
    "Nur Kosten nach Art. 148 CPJA",
    "Frais uniquement selon l’art. 148 CPJA"
  ],
  "v7.value.specificStatutoryOpening": [
    "Reklamation durch besondere Norm eröffnet",
    "Réclamation ouverte par une disposition particulière"
  ],
  "twoPeriods": [
    "Ostern und 18. Dezember–2. Januar (kein Sommerstillstand)",
    "Pâques et du 18 décembre au 2 janvier (sans suspension estivale)"
  ],
  "v7.openingHeading": [
    "Massgebende Eröffnung",
    "Notification déterminante"
  ],
  "v7.physicalReceipt": [
    "Tatsächlicher Postempfang",
    "Réception postale effective"
  ],
  "v7.qualifiedOpening": [
    "Rechtlicher Eröffnungstag",
    "Date juridique de notification"
  ],
  "v7.openingExplanation": [
    "Gewöhnliche Post: Empfang an Samstag, Sonntag oder gesetzlichem Feiertag wird zuerst auf den nächsten Werktag verschoben. Die Tagesfrist beginnt danach am Folgetag.",
    "Courrier ordinaire : une réception le samedi, le dimanche ou un jour férié légal est d’abord reportée au prochain jour ouvrable. Le délai en jours commence ensuite le lendemain."
  ],
  "v7.identityOpeningExplanation": [
    "Das eingegebene Datum ist bereits rechtlich qualifiziert und wird nicht nochmals auf einen Werktag verschoben.",
    "La date saisie est déjà juridiquement qualifiée et n’est pas à nouveau reportée à un jour ouvrable."
  ],
  "v7.noAutomaticFollowup": [
    "Berechnet wird nur dieses Verlangen. Eine spätere Bestätigung oder Begründung und eine anschliessende Rechtsmittelfrist sind getrennt zu qualifizieren.",
    "Seule cette demande est calculée. Une confirmation ou motivation ultérieure et un délai de recours subséquent doivent être qualifiés séparément."
  ],
  "administrative.openingContractInvalid": [
    "Der aktuelle Auslöser oder seine Eröffnungsregel ist nicht eindeutig gebunden.",
    "Le fait déclencheur actuel ou sa règle de notification n’est pas lié de manière univoque."
  ],
  "administrative.openingModeUnqualified": [
    "Bitte zwischen rechtlich bereits geklärter Eröffnung und tatsächlichem Empfang gewöhnlicher Post wählen.",
    "Veuillez distinguer la notification juridique déjà établie de la réception effective du courrier ordinaire."
  ],
  "administrative.openingModeNotQualified": [
    "Bitte zwischen rechtlich bereits geklärter Eröffnung und tatsächlichem Empfang gewöhnlicher Post wählen.",
    "Veuillez distinguer la notification juridique déjà établie de la réception effective du courrier ordinaire."
  ],
  "administrative.openingPolicyInvalid": [
    "Die geprüfte Eröffnungsregel dieses Verfahrenswegs ist nicht verfügbar.",
    "La règle de notification vérifiée de ce parcours n’est pas disponible."
  ],
  "administrative.openingPolicyHashMismatch": [
    "Die Eröffnungsregel passt nicht zum gebundenen Datenstand.",
    "La règle de notification ne correspond pas aux données liées."
  ],
  "administrative.proposalEligibilityInvalid": [
    "Der Verfahrensweg ist nicht vollständig an diesen Datenstand gebunden.",
    "Le parcours n’est pas lié intégralement à ces données."
  ],
  "administrative.sourceCoverageInvalid": [
    "Die verwendeten Tage sind durch den geprüften Quellenstand nicht vollständig gedeckt.",
    "Les jours utilisés ne sont pas intégralement couverts par les sources vérifiées."
  ]
};
const diagnostics: Readonly<Record<string, Pair>> = {
  "administrative.J1-UNIT": [
    "Es braucht eine vorwärts laufende Tagesfrist, keine Zahlung, feste Terminangabe oder abweichende Berechnungsart.",
    "Un délai en jours courant vers l’avenir est requis, non un paiement, une date fixe ou un autre mode de calcul."
  ],
  "administrative.J1-DIRECTION": [
    "Es braucht eine vorwärts laufende Tagesfrist, keine Zahlung, feste Terminangabe oder abweichende Berechnungsart.",
    "Un délai en jours courant vers l’avenir est requis, non un paiement, une date fixe ou un autre mode de calcul."
  ],
  "administrative.Nur Verfahren vor zuständigen kantonalen Stellen in Freiburg. Kommunale Eigenordnungen bleiben ausgeschlossen.": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.Art. 1–7 CPJA, keine ausgeschlossene Erstinstanz und keine abweichende spezielle oder bundesrechtliche Verfahrensordnung.": [
    "Eine abweichende Spezialordnung oder deren Anwendbarkeit ist noch nicht ausgeschlossen.",
    "Un régime spécial dérogatoire ou son applicabilité n’est pas encore exclu."
  ],
  "administrative.FR-OPENING": [
    "Der aktuelle rechtlich massgebende Auslöser und sein tatsächliches Datum sind nicht geklärt.",
    "Le fait déclencheur juridiquement déterminant et sa date effective ne sont pas clarifiés."
  ],
  "administrative.Vorwärts laufende Eingabefrist, kein fixer Kalendertag, keine Monate, Stunden, Zahlung oder Vorladung.": [
    "Es braucht eine vorwärts laufende Tagesfrist, keine Zahlung, feste Terminangabe oder abweichende Berechnungsart.",
    "Un délai en jours courant vers l’avenir est requis, non un paiement, une date fixe ou un autre mode de calcul."
  ],
  "administrative.Art. 7 und 79 Abs. 3 bleiben vorbehalten. Keine automatische Freigabe für Steuern, Sozialversicherung, Beschaffung, politische Rechte oder andere Spezialmaterien.": [
    "Eine abweichende Spezialordnung oder deren Anwendbarkeit ist noch nicht ausgeschlossen.",
    "Un régime spécial dérogatoire ou son applicabilité n’est pas encore exclu."
  ],
  "administrative.Dokumentart, Fristqualität, aktuelle Zuständigkeit, Eröffnung und positive Spezialqualifikation sind keine gespeicherten Fallfakten.": [
    "Die Voraussetzungen der aktuellen Fallkonstellation sind noch nicht vollständig geklärt.",
    "Les conditions de la situation actuelle ne sont pas encore entièrement clarifiées."
  ],
  "administrative.FR-STAGE": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.FR-OTHER-TIME-METHODS": [
    "Die aktuell anwendbare gesetzliche oder angeordnete Tagesdauer ist nicht eindeutig geklärt.",
    "La durée légale ou ordonnée actuellement applicable en jours n’est pas établie sans équivoque."
  ],
  "administrative.FR-PAYMENT": [
    "Die Voraussetzungen der aktuellen Fallkonstellation sind noch nicht vollständig geklärt.",
    "Les conditions de la situation actuelle ne sont pas encore entièrement clarifiées."
  ],
  "administrative.FR-SPECIAL-LAW": [
    "Eine abweichende Spezialordnung oder deren Anwendbarkeit ist noch nicht ausgeschlossen.",
    "Un régime spécial dérogatoire ou son applicabilité n’est pas encore exclu."
  ],
  "administrative.FR-EXECUTION": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.FR-INTERIM-ADMISSIBILITY": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.FR-LATE-EXTENSION": [
    "Die Dreitagesnachfrist setzt eine rechtzeitig verlangte, abgelehnte Erstreckung und eine bereits abgelaufene alte Frist ohne länger fortbestehendes Ende voraus.",
    "Le délai supplémentaire de trois jours suppose une prolongation demandée à temps puis refusée, un ancien délai déjà échu et aucune échéance plus longue subsistante."
  ],
  "administrative.FR-REFUSAL-BEFORE-EXPIRY": [
    "Die Dreitagesnachfrist setzt eine rechtzeitig verlangte, abgelehnte Erstreckung und eine bereits abgelaufene alte Frist ohne länger fortbestehendes Ende voraus.",
    "Le délai supplémentaire de trois jours suppose une prolongation demandée à temps puis refusée, un ancien délai déjà échu et aucune échéance plus longue subsistante."
  ],
  "administrative.FR-FEDERAL-APPEAL": [
    "Die Voraussetzungen der aktuellen Fallkonstellation sind noch nicht vollständig geklärt.",
    "Les conditions de la situation actuelle ne sont pas encore entièrement clarifiées."
  ],
  "administrative.FR-UNQUALIFIED-RECLAMATION": [
    "Die Reklamation muss gesetzlich eröffnet und ihre aktuelle Grundlage geklärt sein.",
    "La réclamation doit être ouverte par la loi et son fondement actuel établi."
  ],
  "administrative.FR-SOCIAL-COSTS": [
    "Eine abweichende Spezialordnung oder deren Anwendbarkeit ist noch nicht ausgeschlossen.",
    "Un régime spécial dérogatoire ou son applicabilité n’est pas encore exclu."
  ],
  "administrative.Only procedures before cantonal authorities are in J1 scope.": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.LPA applies and no differing federal/cantonal special procedural duration, trigger, holiday or suspension rule is applicable. No additional social release.": [
    "Eine abweichende Spezialordnung oder deren Anwendbarkeit ist noch nicht ausgeschlossen.",
    "Un régime spécial dérogatoire ou son applicabilité n’est pas encore exclu."
  ],
  "administrative.Explicitly distinguish legal opening already established from physical receipt of normal post under Art. 17(6). Unknown mode cannot be normalised silently.": [
    "Bitte zwischen rechtlich bereits geklärter Eröffnung und tatsächlichem Empfang gewöhnlicher Post wählen.",
    "Veuillez distinguer la notification juridique déjà établie de la réception effective du courrier ordinaire."
  ],
  "administrative.No unresolved irregular service, misleading longer notice, publication, knowledge-only trigger or reconstruction of fiction. Relevant law remains documented, not negated.": [
    "Der aktuelle rechtlich massgebende Auslöser und sein tatsächliches Datum sind nicht geklärt.",
    "Le fait déclencheur juridiquement déterminant et sa date effective ne sont pas clarifiés."
  ],
  "administrative.Not an appeal or a statutorily opened reclamation.": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.Current forward-day submission, not payment or fixed appointment.": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.Reclamation actually opened by law, not a free reconsideration request.": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.Current enabling legal provision confirmed, no special duration.": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.Each of the six Art. 63(2) exclusions has been assessed and does not apply.": [
    "Die sechs Ausnahmen nach Art. 63 Abs. 2 LPA oder eine andere Spezialregel sind noch nicht vollständig ausgeschlossen.",
    "Les six exceptions de l’art. 63 al. 2 LPA ou une autre règle spéciale ne sont pas encore entièrement exclues."
  ],
  "administrative.Current procedure is a legally opened Art. 50/51 reclamation.": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.Current ordered forward-day submission.": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.No Art. 63(2) subject exception or other special procedural rule.": [
    "Die sechs Ausnahmen nach Art. 63 Abs. 2 LPA oder eine andere Spezialregel sind noch nicht vollständig ausgeschlossen.",
    "Les six exceptions de l’art. 63 al. 2 LPA ou une autre règle spéciale ne sont pas encore entièrement exclues."
  ],
  "administrative.Current target acts as administrative jurisdiction under Art. 6, irrespective of institutional label.": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.Appealability and actual final/competence classification confirmed, no preliminary reclamation instead.": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.No one of the six Art. 63(2) exceptions.": [
    "Die sechs Ausnahmen nach Art. 63 Abs. 2 LPA oder eine andere Spezialregel sind noch nicht vollständig ausgeschlossen.",
    "Les six exceptions de l’art. 63 al. 2 LPA ou une autre règle spéciale ne sont pas encore entièrement exclues."
  ],
  "administrative.Qualified administrative jurisdiction.": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.Separate appealability confirmed. Enforcement measure excluded by Art. 59(b), not turned into ten-day appeal.": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.No Art. 63(2) subject exception.": [
    "Die sechs Ausnahmen nach Art. 63 Abs. 2 LPA oder eine andere Spezialregel sind noch nicht vollständig ausgeschlossen.",
    "Les six exceptions de l’art. 63 al. 2 LPA ou une autre règle spéciale ne sont pas encore entièrement exclues."
  ],
  "administrative.Current general administrative appeal procedure.": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.No Art. 63(2) or other special suspension exception.": [
    "Die sechs Ausnahmen nach Art. 63 Abs. 2 LPA oder eine andere Spezialregel sind noch nicht vollständig ausgeschlossen.",
    "Les six exceptions de l’art. 63 al. 2 LPA ou une autre règle spéciale ne sont pas encore entièrement exclues."
  ],
  "administrative.Actual Art. 87(4) costs/fees/indemnity remedy, not payment of amount.": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.Costs fixed by a competent cantonal administrative jurisdiction.": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.Underlying procedure not subject to Art. 63(2) or other special law.": [
    "Die sechs Ausnahmen nach Art. 63 Abs. 2 LPA oder eine andere Spezialregel sind noch nicht vollständig ausgeschlossen.",
    "Les six exceptions de l’art. 63 al. 2 LPA ou une autre règle spéciale ne sont pas encore entièrement exclues."
  ],
  "administrative.ju.authoritySeatNotQualified": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.ju.competenceQualifiedNotQualified": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.ju.generalCpaAppliesNotQualified": [
    "Eine abweichende Spezialordnung oder deren Anwendbarkeit ist noch nicht ausgeschlossen.",
    "Un régime spécial dérogatoire ou son applicabilité n’est pas encore exclu."
  ],
  "administrative.ju.noDifferentSpecialDeadlineRuleNotQualified": [
    "Eine abweichende Spezialordnung oder deren Anwendbarkeit ist noch nicht ausgeschlossen.",
    "Un régime spécial dérogatoire ou son applicabilité n’est pas encore exclu."
  ],
  "administrative.ju.currentProceduralLawQualifiedNotQualified": [
    "Die Voraussetzungen der aktuellen Fallkonstellation sind noch nicht vollständig geklärt.",
    "Les conditions de la situation actuelle ne sont pas encore entièrement clarifiées."
  ],
  "administrative.ju.sourceDocumentQualifiedNotQualified": [
    "Der aktuelle rechtlich massgebende Auslöser und sein tatsächliches Datum sind nicht geklärt.",
    "Le fait déclencheur juridiquement déterminant et sa date effective ne sont pas clarifiés."
  ],
  "administrative.ju.triggerDateQualifiedNotQualified": [
    "Der aktuelle rechtlich massgebende Auslöser und sein tatsächliches Datum sind nicht geklärt.",
    "Le fait déclencheur juridiquement déterminant et sa date effective ne sont pas clarifiés."
  ],
  "administrative.ju.forwardDayPeriodNotQualified": [
    "Es braucht eine vorwärts laufende Tagesfrist, keine Zahlung, feste Terminangabe oder abweichende Berechnungsart.",
    "Un délai en jours courant vers l’avenir est requis, non un paiement, une date fixe ou un autre mode de calcul."
  ],
  "administrative.ju.notPaymentOrFixedDateNotQualified": [
    "Es braucht eine vorwärts laufende Tagesfrist, keine Zahlung, feste Terminangabe oder abweichende Berechnungsart.",
    "Un délai en jours courant vers l’avenir est requis, non un paiement, une date fixe ou un autre mode de calcul."
  ],
  "administrative.ju.noArticle6ExceptionNotQualified": [
    "Eine abweichende Spezialordnung oder deren Anwendbarkeit ist noch nicht ausgeschlossen.",
    "Un régime spécial dérogatoire ou son applicabilité n’est pas encore exclu."
  ],
  "administrative.ju.noKnownIrregularOrLongerInstructionNotQualified": [
    "Die Voraussetzungen der aktuellen Fallkonstellation sind noch nicht vollständig geklärt.",
    "Les conditions de la situation actuelle ne sont pas encore entièrement clarifiées."
  ],
  "administrative.ju.orderedDurationQualifiedNotQualified": [
    "Die aktuell anwendbare gesetzliche oder angeordnete Tagesdauer ist nicht eindeutig geklärt.",
    "La durée légale ou ordonnée actuellement applicable en jours n’est pas établie sans équivoque."
  ],
  "administrative.ju.notExtensionChainNotQualified": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.ju.differentOrderedStartNotQualified": [
    "Es braucht eine vorwärts laufende Tagesfrist, keine Zahlung, feste Terminangabe oder abweichende Berechnungsart.",
    "Un délai en jours courant vers l’avenir est requis, non un paiement, une date fixe ou un autre mode de calcul."
  ],
  "administrative.J1-JU-OPENING": [
    "Der aktuelle rechtlich massgebende Auslöser und sein tatsächliches Datum sind nicht geklärt.",
    "Le fait déclencheur juridiquement déterminant et sa date effective ne sont pas clarifiés."
  ],
  "administrative.ju.oppositionRequiredAndAdmissibleNotQualified": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.ju.article95ExceptionAbsentNotQualified": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.ju.laterAppealDurationDoesNotDifferNotQualified": [
    "Die Voraussetzungen der aktuellen Fallkonstellation sind noch nicht vollständig geklärt.",
    "Les conditions de la situation actuelle ne sont pas encore entièrement clarifiées."
  ],
  "administrative.ju.genuineProvisionalProcedureNotQualified": [
    "Es muss feststehen, ob die aktuelle Handlung eine echte vorsorgliche Sache betrifft.",
    "Il faut établir si l’acte actuel concerne une véritable procédure provisionnelle."
  ],
  "administrative.ju.finalDecisionNotQualified": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.ju.separatelyAdmissibleInterimDecisionNotQualified": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.ju.reviewTargetQualifiedNotQualified": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.ju.precedingOppositionOrExceptionQualifiedNotQualified": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.ju.currentReviewAdmissibilityQualifiedNotQualified": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.ju.executionDecisionQualifiedNotQualified": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.ju.noOppositionRequiredUnder95jNotQualified": [
    "Die konkrete Verfahrenshandlung, ihre Zulässigkeit und der richtige Rechtsmittelweg müssen positiv geklärt sein.",
    "L’acte concret, sa recevabilité et la voie de droit correcte doivent être établis."
  ],
  "administrative.ju.lawfulActualOralOpeningNotQualified": [
    "Die tatsächliche zulässige mündliche Eröffnung und das eigene Verlangen nach schriftlicher Bestätigung müssen feststehen.",
    "La notification orale effective et licite ainsi que la demande distincte de confirmation écrite doivent être établies."
  ],
  "administrative.ju.actionIsWrittenConfirmationRequestNotQualified": [
    "Die tatsächliche zulässige mündliche Eröffnung und das eigene Verlangen nach schriftlicher Bestätigung müssen feststehen.",
    "La notification orale effective et licite ainsi que la demande distincte de confirmation écrite doivent être établies."
  ],
  "administrative.ju.currentOppositionOrReviewFunctionQualifiedNotQualified": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.J1-JU-REVIEW-TARGET": [
    "Die zuständige kantonale Stelle und die aktuelle Verfahrensfunktion müssen für diesen Weg feststehen.",
    "L’instance cantonale compétente et la fonction procédurale actuelle doivent être établies pour ce parcours."
  ],
  "administrative.ju.fullyGrantsAllPartiesRequestsNotQualified": [
    "Der Entscheid muss die Anträge aller Parteien vollständig gutheissen und rechtmässig verkürzt eröffnet sein. Berechnet wird nur das Begründungsverlangen.",
    "La décision doit admettre entièrement les conclusions de toutes les parties et avoir été légalement notifiée sous forme abrégée. Seule la demande de motifs est calculée."
  ],
  "administrative.ju.lawfulAbbreviatedOpeningUnder86_3NotQualified": [
    "Der Entscheid muss die Anträge aller Parteien vollständig gutheissen und rechtmässig verkürzt eröffnet sein. Berechnet wird nur das Begründungsverlangen.",
    "La décision doit admettre entièrement les conclusions de toutes les parties et avoir été légalement notifiée sous forme abrégée. Seule la demande de motifs est calculée."
  ],
  "administrative.ju.actionIsMotivationRequestNotQualified": [
    "Der Entscheid muss die Anträge aller Parteien vollständig gutheissen und rechtmässig verkürzt eröffnet sein. Berechnet wird nur das Begründungsverlangen.",
    "La décision doit admettre entièrement les conclusions de toutes les parties et avoir été légalement notifiée sous forme abrégée. Seule la demande de motifs est calculée."
  ]
};

/** Closed display inventory. The bound policy alone supplies current legal facts. */
function presentation(pathId: string, locale: Locale): { choice: string; scope: string } {
  const de = locale === 'de';
  const fr = pathId.startsWith('fr-'), ge = pathId.startsWith('ge-');
  const request = pathId.includes('confirmation-request') || pathId.includes('motivation-request') || pathId === 'fr-tc-begruendung-30';
  const ordered = pathId.endsWith('-ordered');
  const provisional = pathId.includes('provisional');
  const refusal = pathId.includes('-nachfrist-');
  const oral = pathId.includes('confirmation-request');
  const motivation = pathId.includes('motivation-request');
  const choice = fr
    ? refusal ? (de ? 'Rechtzeitige Erstreckung abgelehnt, alte Frist abgelaufen, kein länger fortbestehendes Ende' : 'Prolongation demandée à temps puis refusée, ancien délai échu, aucune échéance plus longue subsistante')
      : pathId === 'fr-tc-begruendung-30' ? (de ? 'Rechtmässig eröffnetes TC-Dispositiv, vollständige Begründung verlangen' : 'Dispositif du Tribunal cantonal légalement notifié, demander la motivation complète')
      : pathId.includes('reclamation') ? (de ? 'Gesetzlich eröffnete Reklamation, aktuelle Grundlage und Zuständigkeit geklärt, kein abweichendes Spezialverfahren' : 'Réclamation ouverte par la loi, fondement actuel et compétence établis, sans procédure spéciale dérogatoire')
      : ordered ? (de ? 'Aktuelle Tagesanordnung vor der gewählten zuständigen Stelle, keine Zahlung oder Sonderregel' : 'Ordonnance actuelle en jours devant l’instance compétente choisie, hors paiement ou régime spécial')
      : (de ? 'Zulässiges Rechtsmittel, qualifizierte Eröffnung, unveränderte Frist und kein abweichendes Spezialrecht' : 'Voie de droit recevable, notification qualifiée, délai inchangé et sans droit spécial dérogatoire')
    : ge ? pathId === 'ge-admin-ordered'
      ? (de ? 'Allgemeines LPA-Verfahren und aktuelle Eingabeanordnung, keine Zahlung oder Sonderregel' : 'Procédure générale selon la LPA et ordonnance actuelle, hors paiement ou régime spécial')
      : (de ? 'Zulässiger allgemeiner Verfahrensweg, aktuelle Frist und keine Ausnahme nach Art. 63 Abs. 2 LPA' : 'Voie générale recevable, délai actuel et aucune exception selon l’art. 63 al. 2 LPA')
    : oral ? (de ? 'Tatsächliche zulässige mündliche Eröffnung, schriftliche Bestätigung im gewählten Verfahren verlangen' : 'Notification orale effective et licite, demander la confirmation écrite dans la procédure choisie')
      : motivation ? (de ? 'Vollständig gutheissender Entscheid zulässig verkürzt eröffnet, Begründung verlangen' : 'Décision entièrement favorable légalement notifiée sous forme abrégée, demander les motifs')
      : ordered ? (de ? 'Aktuelle Tagesanordnung, qualifizierte Eröffnung, keine Zahlung oder Erstreckungskette' : 'Ordonnance actuelle en jours, notification qualifiée, hors paiement ou prolongation en chaîne')
      : (de ? 'Zulässiger aktueller Einsprache- oder Beschwerdeweg, rechtliche Eröffnung und Frist stehen fest' : 'Voie actuelle d’opposition ou de recours recevable, notification juridique et délai établis');
  const scope = fr
    ? (de ? 'Zuständige kantonale Stelle nach dem CPJA, aktuelle Eröffnung und unveränderte vorwärts laufende Tagesfrist. Keine abweichende Spezialordnung, ungeklärte Eröffnung, Zahlung oder feste Terminangabe. ' : 'Instance cantonale compétente selon le CPJA, notification actuelle et délai inchangé en jours courant vers l’avenir. Ni régime spécial dérogatoire, notification incertaine, paiement ou date fixe. ')
      + (refusal ? (de ? 'Das Erstreckungsgesuch wurde rechtzeitig gestellt und tatsächlich abgelehnt. Das ursprüngliche rechtliche Ende ist bereits abgelaufen, kein längeres Ende besteht fort. Empfangsdatum ist hier die qualifizierte Mitteilung der Ablehnung.' : 'La prolongation a été demandée à temps puis effectivement refusée. L’ancienne échéance juridique est déjà passée, aucune échéance plus longue ne subsiste. La date saisie est la communication qualifiée du refus.')
        : request ? (de ? 'Nur das eigene Begründungsverlangen nach rechtmässigem TC-Dispositiv. Eine spätere Beschwerde benötigt ihre eigene tatsächlich qualifizierte Eröffnung.' : 'Seule la demande de motivation après un dispositif du Tribunal cantonal valablement notifié. Un recours ultérieur requiert sa propre notification effectivement qualifiée.')
        : (de ? 'Ausserhalb des Kantonsgerichts gelten die beiden allgemeinen Stillstandsperioden, in Angelegenheiten des Kantonsgerichts zusätzlich die Sommerperiode. Eine Reklamation benötigt ihre konkret gesetzlich eröffnete Grundlage, ohne Sozialversicherungsfreigabe.' : 'Hors du Tribunal cantonal, les deux périodes générales de suspension s’appliquent. Dans les affaires du Tribunal cantonal s’ajoute la période estivale. Une réclamation nécessite son fondement légal concret, sans autorisation en matière d’assurances sociales.'))
    : ge ? (de ? 'Die LPA gilt für die zuständige kantonale Stelle und die gewählte aktuelle Handlung. Eröffnung und tatsächlicher Empfang gewöhnlicher Post sind gesondert zu bestimmen. Keine ungeklärte Fiktion, Publikation, mangelhafte Eröffnung oder widersprechende längere Belehrung. ' : 'La LPA s’applique à l’instance cantonale compétente et à l’acte actuel choisi. La notification juridique et la réception effective du courrier ordinaire sont à distinguer. Ni fiction incertaine, publication, notification irrégulière ou indication contradictoire d’un délai plus long. ')
      + (pathId === 'ge-admin-ordered' ? (de ? 'Im Erstverfahren besteht kein allgemeiner Friststillstand. Eine positive aktuelle Eingabeanordnung und ihre Tagesdauer müssen feststehen.' : 'Il n’existe pas de suspension générale en première instance. L’ordonnance actuelle et sa durée en jours doivent être établies.')
        : (de ? 'Alle sechs Sachgebietsausnahmen nach Art. 63 Abs. 2 und sonstiges abweichendes Spezialrecht sind für diesen Fall ausgeschlossen. Bei Reklamation muss eine gesetzliche Grundlage vorliegen. Entscheidend ist die aktuelle Rechtspflegefunktion, nicht die organisatorische Bezeichnung der Stelle.' : 'Les six exceptions matérielles de l’art. 63 al. 2 ainsi que tout autre droit spécial dérogatoire sont exclus pour ce cas. La réclamation doit avoir un fondement légal. La fonction juridictionnelle actuelle, non l’étiquette organique de l’instance, est déterminante.'))
    : (de ? 'Zuständige kantonale Stelle und aktuelles CPA-Verfahren, keine abweichende Spezialfrist, ungeklärte Eröffnung, Zahlung oder feste Terminangabe. Einsprachezulässigkeit und allfällige Ausschlüsse nach Art. 95 sind aktuell geklärt. ' : 'Instance cantonale compétente et procédure actuelle selon le CPA, sans délai spécial dérogatoire, notification incertaine, paiement ou date fixe. La recevabilité de l’opposition et les éventuelles exclusions de l’art. 95 sont actuellement clarifiées. ')
      + (oral ? (de ? 'Tatsächliche zulässige mündliche Eröffnung nach Art. 87 Abs. 2. Nur die eigene Fünftagesfrist für die schriftliche Bestätigung wird berechnet, keine spätere Beschwerde ab einem erfundenen Bestätigungsdatum.' : 'Notification orale effective et licite selon l’art. 87 al. 2. Seul le délai propre de cinq jours pour demander la confirmation écrite est calculé, sans recours ultérieur depuis une confirmation fictive.')
        : motivation ? (de ? 'Der Entscheid gibt den Anträgen aller Parteien vollständig statt und wurde nach Art. 86 Abs. 3 zulässig verkürzt eröffnet. Nur die eigene Dreissigtagesfrist zum Begründungsverlangen wird berechnet, keine automatisch neue Rechtsmittelfrist.' : 'La décision admet entièrement les conclusions de toutes les parties et a été légalement notifiée sous forme abrégée selon l’art. 86 al. 3. Seul le délai propre de trente jours pour demander les motifs est calculé, sans nouveau délai automatique de recours.')
        : (de ? 'Die rechtlich massgebende tatsächliche schriftliche oder gleichwertig geklärte Eröffnung steht fest. Eine spätere schriftliche Bestätigung und die Rechtzeitigkeit eines vorausgehenden Verlangens werden nicht aus einem früheren Rechenergebnis erfunden.' : 'La notification effective écrite ou équivalente juridiquement établie est connue. Une confirmation écrite ultérieure et la ponctualité d’une demande préalable ne sont pas déduites d’un ancien résultat.'))
      + (provisional ? (de ? ' Die aktuelle Handlung betrifft eine echte vorsorgliche Sache, deshalb ohne allgemeinen Stillstand.' : ' L’acte actuel concerne une véritable procédure provisionnelle, sans suspension générale.')
        : (de ? ' Die tatsächliche Erst-, Einsprache- oder Rechtsmittelfunktion bestimmt den Stillstand, auch bei qualifiziertem subsidiärem Gouvernement-Rekurs.' : ' La fonction effective de première instance, d’opposition ou de recours détermine la suspension, également pour un recours subsidiaire qualifié au Gouvernement.'));
  return { choice, scope };
}
export function createAp23j3Messages(locale: Locale): Record<string, string> {
  const index = locale === 'de' ? 0 : 1;
  const messages = Object.fromEntries(Object.entries({ ...common, ...diagnostics }).map(([key, pair]) => [key, pair[index]]));
  for (const [pathId, pair] of Object.entries(pathNames)) {
    messages['path.' + pathId] = pair[index];
    const copy = presentation(pathId, locale);
    messages['case.v7.' + pathId] = copy.choice;
    messages['scope.v7.' + pathId] = copy.scope;
  }
  return messages;
}

