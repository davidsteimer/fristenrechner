---
id: DEC-2026-035
titel: "Kantonalverfahrenskatalog 3 mit konkreter Zielstelle und zeitlichen Normabschnitten"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "Fachabnahme AP23F1 vom 22.10.2026 einschliesslich Kalenderbindungen, Zeitfenster und begrenzter offener Punkte"
  - "Technische Vertragsprüfung AP23F2 auf dem freigegebenen MVP09-Bestand"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-035 Kantonalverfahrenskatalog 3 und Manifest 10

## Ausgangslage

[AP23F1 ist fachlich abgenommen](../fachrecht/abnahme-ap23f1.md). Die 17 neuen ZH-/AG-/SG-Gruppen ergänzen die 25 bisherigen TI-/GR-/LU-/ZG-/AR-Wege. Der bestehende Katalog-2-Leser prüft die abgenommenen Definitionen gegen einen geschlossenen Bestand. Er erlaubt die besondere Vollstreckungsqualifikation nur für den AR-Art.-63-Fünftagesweg. Er besitzt keine ausdrückliche Zielorgan-, Dokumentenzugangs-, Kanal- oder Ferienausnahmebelehrungsqualifikation und keine maschinell zeitlich zugeordneten Normabschnitte.

Die gemeinsame Tagesarithmetik und die bestehende Sicherung bei Endverschiebung in einen Stillstand genügen. Die Lücke betrifft die prüfbare Bedeutung des Falls und seiner Datengrundlage, nicht die Tageszählung. Zusätzliche Namen oder eine Öffnung der bisherigen Inventarliste allein würden diese Bedeutung älteren Lesern nicht vermitteln.

## Vorgeschlagener Entscheid

- **Kantonalverfahrenskatalog 3.0.0 sowie Manifest und Mindestconsumer 10.0.0.** Das ist eine Vertragsgrenze, keine Produktrelease- oder Paketversionsnummer und keine Betriebsfreigabe.
- Die bisherigen 25 Pfaddefinitionen, Revisionen und Qualifikationsregeln bleiben exakt erhalten. Der neue geschlossene Qualifikationszweig ergänzt 17 Pfade, insbesondere AG-§83-Vollstreckung, SG-Art.-44-/Art.-60-Massnahmen und den konkret unterlegten SG-VRK-Dokumentenzugangsweg. Neue Pfade dürfen sich nicht als historischer Altzweig deklarieren.
- Die neue Fallqualifikation unterscheidet neben den bisherigen Angaben das Zielorgan, den qualifizierten Verfahrensgegenstand, den gewöhnlichen ZH-Eröffnungs-/Kanalfall und die tatsächlich richtige SG-Ferienausnahmebelehrung. Diese gegenwärtigen Falltatsachen werden nicht aus Standards ergänzt oder gespeichert.
- Jeder neue Pfad enthält lückenlose und überschneidungsfreie zeitliche Normabschnitte. Für ZH gilt die getrennte Bindung vor und ab 01.01.2027, für SG die Organisationsfassung vor und ab 01.06.2027. Jeder bewertete Tag einschliesslich Stillstand und Endverschiebung wird gegen die anwendbare Bindung geprüft. Das Empfangsjahr allein genügt nicht.
- Vier neue rechtliche Kalenderverwendungen und eine zusätzliche Zürcher Verwaltungsprojektion werden eingeführt. Die Neunerprojektion wählt genau die neun abgenommenen Nichtsonntagsregeln aus dem vorhandenen Bereich `ZH-RLG-ALL`. Alle 479 Basisregeln, zwölf getrennten SO-Zusatzregeln und die fachliche Bedeutung der 32 bisherigen Kalender bleiben erhalten.
- F1-O1 verwendet die bestehende ausdrückliche Sicherung ausschliesslich in den neun neuen Pfaden mit anwendbarem Stillstand. Der ferienfreie SG-Art.-60-Pfad und Verwaltungspfade bleiben davon ausgenommen. Die beiden bisherigen AR-Sicherungen bleiben unverändert.
- Das vollständige neue Fallfenster bleibt 29.08.2026–31.12.2027. Alle bewerteten Tage müssen gedeckt sein. Neue Normabschnitte begründen keinen unbefristeten Rechtsbeständigkeitsnachweis.
- Rechtsprofile 1.0.0, Feiertagskatalog 2.0.0, Regelkalender 3.0.0, Spezialregimekatalog 3.0.0 und Sozialverfahrenskatalog 2.0.0 bleiben als Formate unverändert. Die 44 Sozialregeln und 50 BE-Anbindungen werden nicht fachlich erweitert. Persönliche Vorgaben bleiben Format 5.

## Migration und technische Nachweise

Die [Vertragsvorlage AP23F2](../architektur/verwaltungsverfahrensvertrag-ap23f2.md) beschreibt die konkrete Strukturprobe und deren Bindungen. Ältere Leser müssen den neuen Vertrag geschlossen ablehnen, auch bei bloss umetikettiertem Manifest oder manipulierten Prüfsummen. Es gibt keinen produktiven Downgrade-Adapter.

Die zusätzliche Zürcher Projektion steht noch nicht in der historischen Kalenderaktivierung. Die isolierte Strukturprobe darf deshalb bytegleiche MVP09-Komponenten mit einem ausdrücklich nicht aktivierten lokalen Projektionsbeleg verbinden. Vor einer späteren echten Zielreleasebindung müssen die Projektionsdefinition, der Kataloghash, abhängige Kalender-/Verwendungsreferenzen und die Release-/Sozialbindungen konsistent neu gebunden werden. Kopierte historische Freigaben gelten nur für den damaligen Release.

Neue gegenwärtige Qualifikationen werden bei Pfadwechsel und Neuladen nicht übernommen. Ein Rückfall auf MVP09 wählt für einen neuen unbekannten Pfad keinen ähnlichen alten Weg und löscht keine Browserdaten. Historische Formate und AP5 bleiben geschützt.

## Entscheidstatus und Folgeauftrag

**Noch nicht beschlossen.** Die Fachabnahme von AP23F1 und der Start von AP23F2 sind keine technische Vertragsbestätigung. Die konkrete isolierte Prüfung und der Entscheidvorschlag werden David zur Abnahme vorgelegt. Ein Start von AP23F3 folgt gesondert.

Der nächste reguläre Betriebsrelease bleibt gemäss [DEC-2026-034](DEC-2026-034-gebuendelter-schweizausbau.md) bis zur vereinbarten Kantonsabdeckung gebündelt. Dieser Vorschlag erteilt keine Quellenpromotion, Produktintegration, Commits, Uploads oder E/Q/P-Freigaben. David trifft die menschlichen Entscheide in Personalunion. Codex bereitet und prüft ohne formelle Freigabe- oder Haftungsverantwortung.
