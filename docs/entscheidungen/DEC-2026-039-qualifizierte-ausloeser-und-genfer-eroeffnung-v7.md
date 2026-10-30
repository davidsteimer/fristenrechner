---
id: DEC-2026-039
titel: "Kantonalverfahrenskatalog 7 mit qualifizierten Auslösern und Genfer Eröffnungsauflösung"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "Fachabnahme AP23J1 einschliesslich J1-A bis J1-G vom 27.10.2026"
  - "Isolierte Vertrags- und Migrationsprobe AP23J2 auf dem abgenommenen lokalen I3-Stand"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-039 Kantonalverfahrenskatalog 7 und Manifest 14

## Ausgangslage

[AP23J1 ist fachlich abgenommen](../fachrecht/abnahme-ap23j1.md). Seine 36 FR-/GE-/JU-Gruppen benötigen ausdrücklich qualifizierte unterschiedliche Auslöser. Die gewöhnliche Genfer Postsendung verlangt zusätzlich eine vorgelagerte Eröffnungsauflösung. Der bisherige V6-Vertrag behandelt das eingegebene Datum bereits als rechtlich massgebend und kennt hierfür weder eine gebundene Transformation noch die dazugehörige Ergebnisprovenienz.

Eine neue UI-Vorrechnung, ein informeller Hinweis oder das Anhängen von Daten unter unverändertem Katalog-6-/Manifest-13-Etikett wäre nicht vertragsneutral. Die alten Reader binden den bisherigen Bestand geschlossen.

## Geprüfte Optionen

1. **Katalog 6 unverändert etikettieren und Daten anhängen.** Neue Semantik und unbekannte Pfade würden ausserhalb des beschlossenen geschlossenen Vertrags ausgeführt. Verworfen als technischer Vorschlag.
2. **Genfer Postempfang ausschliesslich manuell vorqualifizieren oder im GUI vorrechnen.** Ersteres würde den abgenommenen konkreten Postfall nicht vollständig automatisieren, letzteres verlöre die verlässliche Kern-, Quellen- und Zeitbindung. Verworfen als Vorschlag.
3. **Komponentenweise Formatevolution mit Katalog 7 und Manifest/Mindestconsumer 14.** Eigener geschlossener V7-Zweig, unveränderter Altbestand und explizite Eröffnungsprovenienz. Empfohlene Option.

## Vorgeschlagener Entscheid

- Kantonalverfahrenskatalog **7.0.0** sowie Manifest und Mindestconsumer **14.0.0**. Dies ist kein Produktrelease, keine Installation und keine Betriebsfreigabe.
- Alle 113 bisherigen Pfade, Revisionen, Policies, Eligibility- und Fachobjekte bleiben exakt erhalten. Die 36 neuen FR-/GE-/JU-Wege erhalten ausschliesslich den eigenen V7-Vertrag. Keine neuen Pflichtfakten in Altpfaden.
- `openingPolicy` ist eine geschlossene Union. `qualifiedCurrentTrigger` übernimmt den aktuell qualifizierten besonderen Ereignistag unverändert. `geQualifiedOrOrdinaryPost` lässt genau zwei aktuelle Modi zu. Nur der ausdrücklich qualifizierte physische Empfang gewöhnlicher Post wird bei Samstag, Sonntag oder gebundenem gesetzlichen Feiertag vorgelagert auf den nächsten Werktag verschoben.
- Rechtlich bereits qualifizierte Eröffnung wird nicht erneut normalisiert. Fehlender, unklarer oder falsch typisierter Modus blockiert. Keine Ableitung aus Datum oder Standards. Keine freie Transformationssprache, Zustellfiktion oder automatische Folgeereigniskette.
- Pfad und Eligibility binden den Eröffnungspolicyhash. Die Auflösung prüft auch den physischen Empfang und jeden vorgeschalteten Tag gegen die anwendbare Norm-, Quellen-, Kalender- und Zeitbindung. Erst danach wird die Tagesfrist genau einmal ab dem rechtlichen Auslösetag gezählt. Gerichtsferien verschieben die Postmitteilung nicht.
- Die spätere Ergebnisprovenienz weist Eingabebedeutung, Modus, Eingabedatum, rechtlichen Eröffnungstag, vorgeschaltete Verschiebungstage, Policyhash und tatsächlich verwendete Normsegmente aus. Daraus folgt keine eigenständige serialisierbare Exportberechtigung.
- FR-Nachfrist und FR-/JU-Begründungs- beziehungsweise Bestätigungsverlangen bleiben eigene positiv qualifizierte aktuelle Wege. Kein früher Ablehnungsentscheid darf eine fortbestehende Frist verkürzen. Ein errechnetes Verlangensende erzeugt keine tatsächliche Folgeeröffnung oder neue Beschwerdefrist.
- Sechs neue rechtliche Feiertagsverwendungen binden FR Nicht-TC/TC, GE Erstverfahren/Rechtsmittel und JU Erstverfahren/Rechtsmittel. Verfahrensfunktion und qualifizierter Zielstellensitz zählen, nicht das organisatorische Etikett Gericht. Die 35 physischen Kalender und 499 Feiertagsregeln bleiben unverändert. Keine Ersatzmontage oder freie Listenvereinigung.
- Forschungsquellen werden mit erhaltener Rolle und explizitem Crosswalk projiziert. Für den bereits abgenommenen ergänzenden historischen Beleg `JUD-AP23J1-JU-BGER2D55-2010` bleibt ausschliesslich die exakte ursprüngliche HTTP-Verweisadresse zulässig. Der alte HTTPS-Zweig bleibt unverändert. Keine allgemeine HTTP-/Domainöffnung, Quellenaufwertung oder automatisches Nachladen dieses Belegs.
- Neues vollständiges Fallfenster 29.08.2026–31.12.2027. FR verwendet CPJA 7947 bis 30.09.2026 und 8637 ab 01.10.2026 in disjunkten Abschnitten. Die begrenzte reine Endverschiebung in neu beginnenden anwendbaren Stillstand bleibt ohne definitives Resultat und Export. Keine Rechtsbeständigkeitsgarantie für zukünftige Tage.
- Rechtsprofile 1.0.0, Feiertagskatalog 2.0.0, Regelkalender 3.0.0, Spezialregimekatalog 3.0.0, Sozialverfahrenskatalog 2.0.0 und persönliche Vorgaben 5 bleiben als Formate unverändert. Die 44 Sozialregeln und 50 BE-Anbindungen erhalten keine zusätzliche Kantons- oder Zeitfreigabe.
- Alle bisherigen Formate, Reader, Pins und AP5-Daten bleiben unverändert. Unbekannte neue Verträge werden geschlossen abgelehnt, nicht durch Altpfade ersetzt. Aktuelle Falltatsachen werden nie aus persönlichen Defaults ergänzt.

## Folgen und Grenzen

Die Strukturprobe umfasst 149 Pfade und Policies bei weiterhin 35 Kalendern und 44 Manifestartefakten. Sie ist kein konsistenter freigegebener Gesamtquellenrelease und kein neuer nativer Consumer. Ein korrekter Datei-Hash ersetzt weder die exakte semantische Zuordnung noch die Prüfung aktueller Qualifikation, Normfassung, Quellenrolle und Kalenderverwendung.

Erst nach technischer J2-Abnahme und ausdrücklichem Beschluss kann AP23J3 gesondert starten. Die bisher 16 lokal integrierten und abgenommenen Kantone bleiben bis dahin 16, davon sechs operativ. Fachabnahme der drei neuen Kantone und isolierte Probe sind noch keine native Integration.

Keine Änderung an Produktcode, GUI, freigegebenen Daten oder bestehenden Paketen. Kein Produktbuild, Commit, Push, Issueeingriff, Upload oder Betriebswechsel. E/Q/P, Mirrors, AP5, AP21, Hosting und Berechtigungen bleiben unverändert. DEC-2026-038 gilt weiter für den bisherigen Bestand. DEC-2026-034 bündelt weiterhin den nächsten regulären Release.

## Status und Nachweise

- [Fachabnahme J1](../fachrecht/abnahme-ap23j1.md)
- [Vertrags- und Migrationsvorlage J2](../architektur/verwaltungsverfahrensvertrag-ap23j2.md)
- [Technischer Prüfbericht](../architektur/verwaltungsverfahrensvertrag-ap23j2-pruefung.md)

**Vorgeschlagen, noch nicht beschlossen.** J1-Abnahme und J2-Start sind weder technische J2-Abnahme noch dieser Formatentscheid. David Steimer entscheidet in Personalunion. Codex bereitet vor und prüft ohne formelle Freigabe- oder Haftungsverantwortung.
