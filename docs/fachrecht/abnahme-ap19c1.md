# AP19C · Abnahme des vorgelegten Teilpakets C1 einschliesslich Bediennachträgen

Datum: 28. September 2026. Entscheider: David Steimer.

David Steimer hat nach Prüfung des Implementierungsstands und der anschliessenden Bedienkorrekturen erklärt:

> SNKW. Damit kann ich AP19C inklusive AP19C1 - Nachtrag abnehmen.

Die Erklärung nimmt den tatsächlich vorgelegten AP19C-Implementierungsstand ab. Dieser besteht aus **AP19C1 einschliesslich der Formularvereinfachung vom 27. September und der frühen Datumseingabe vom 28. September 2026**. Die noch nicht implementierten Teilpakete AP19C2 (AVIG) und AP19C3 (KVG) sind nicht Gegenstand dieser Abnahme. Gesamt-AP19C wird damit nicht als vollständig umgesetzt ausgewiesen.

## Abgenommener Gegenstand

- Technische Grundlage nach dem bereits beschlossenen DEC-2026-025: Sozialverfahrenskatalog `1.0.0`, Manifest-/Consumerformat `5.0.0`, nationaler Sozialresolver und getrennte kantonale Anbindungen.
- Kontrollierte Migration der zwölf bestehenden IVG-/AHVG-/UVG-Pfade und Integration von vier ELG-Pfaden. Die übrigen Regime und dokumentierten Ausschlüsse bleiben erhalten.
- Nationale Modellierung bei weiterhin auf die konkret geprüften Berner Anbindungen begrenztem Produktumfang und dem dokumentierten Anwendungsintervall 2026–2027.
- Gemeinsame DE-/FR-Oberfläche mit zweispaltigem Raster. Redundantes Dokumentfeld bei den 16 C1-Sozialpfaden entfernt, Zusatzinformationen in die Rechenspur verschoben und Beschwerdebeschriftungen präzisiert.
- Frühe Datumseingabe, Erhalt des Hauptdatums bei gleicher Bedeutung und gezieltes Leeren mit Hinweis bei geänderter Datumsart. Die bestehenden Berechnungs-, Fachqualifikations- und Freigabeprüfungen bleiben unverändert.
- Vorgelegte lokale Prüfungen einschliesslich **860 Kern-/UI-Tests**, darunter 41 neue Datumsübergangstests, sieben Web-App-Tests, 67 SPFx-Transporttests und 29 Prüfungen am kompilierten Code beziehungsweise Testpaket. Die tatsächlichen Browserprüfungen und ihre Grenzen sind in den gebundenen Nachweisen beschrieben.

## Gebundener Stand

Die folgenden Dateien werden durch diese Statusnachführung nicht verändert. Ihre damaligen Hinweise auf eine ausstehende Abnahme bleiben als Vorlagestand erhalten. Der aktuelle menschliche Abnahmestatus ergibt sich aus dieser Notiz.

| Gegenstand | SHA-256 |
| --- | --- |
| [Kandidatenmanifest](../../data/candidates/2026-09-25-ap19c1/manifest.json) | `eae74fc823128e96a42980cd4eeac448e24dece60514b426d92eb698abb49524` |
| [Implementierungsnachweis](../architektur/implementierung-ap19c1.md) | `f316a48e16871b198558cd41d87a5cfff955eb54ca7c20e48d83e98d87e3f257` |
| [Integrations- und Prüfnachweis mit Nachtragsverweisen](pruefbericht-ap19c1.md) | `45c2a77071482aa70a9bd535bb62820cb5b12d55a00d7107b82b0780d3cf2364` |
| [Formularvereinfachung vom 27. September](ui-vereinfachung-ap19c1-2026-09-27.md) | `0a00dae8d9dfc5f91969bf0cf99acef072a954479a9c94a68da247d7a22d8988` |
| [Datumseingabe-Nachtrag vom 28. September](datumseingabe-ap19c1-2026-09-28.md) | `e49d8d3be1c4f7e75d995ff920551944df85e3fcd2eac6b29bf0d82ba952bf05` |
| [Gemeinsame Rechneroberfläche](../../src/ui/FristenrechnerApp.tsx) | `60386fbc4ac5d23fd5dd36f19f1097724da030944eb3f0db55faae5dfefab29e` |
| [Datumsübergangslogik](../../src/ui/dateTransition.ts) | `bd58e8b894dc0f4736e978cf4adf1995509eb743e732da6369462f25addaa940` |

Release-ID des Datenkandidaten: `2026-09-25-ap19c1-candidate.1`. Der letzte isolierte SPFx-Testbuild liegt unter `.work/ap19c-spfx-build-G6o7JE`, Testpaket-SHA-256 `869ec6da1c699ae47e3eb243fdf6482d5ea0b45c836a2e2c276fed4c587a8b75`. Dieser Build ist ein Prüfarbeitsstand, kein Installations- oder Publikationspaket. Künftige Quelländerungen erzeugen einen neuen Arbeitsstand und ändern diese historische Bindung nicht rückwirkend.

## Weitergeltende Grenzen und nächster Schritt

Die fachlich-technische Kandidatenabnahme ist erteilt. Sie ist keine Datenpromotion, operative Aktivierung oder Betriebsfreigabe. Kandidatenflags und Genehmigungsfelder im Datenbestand werden nicht nachträglich umgeschrieben. Die aktuelle Vorschau bleibt deshalb ohne Sozialfrist-Enddatum. Die kontrollierte Übernahme in einen zusammengehörigen Release erfolgt gesondert.

MVP 0.4, bestehende Pakete, Release-Pins, Mirrors, E/Q/P und Zugriffsrechte bleiben unverändert. Aus dieser Abnahmenachführung folgen kein Build, Commit, Push, Deployment oder Hostingzugriff. Es wird keine neue DEC-Nummer vergeben.

Nächstes geplantes Teilpaket ist **AP19C2: AVIG-Integration** mit der bereits abgenommenen Option-B-Nachweismethode. Danach folgt AP19C3 für KVG. Beide benötigen ihren eigenen Start und ihre eigene Kandidatenabnahme. Die Quelle-/Fassungsprüfung vor Kandidatenübernahme bleibt erforderlich.

David Steimer erteilt die Abnahme in Personalunion. Codex dokumentiert sie als KI-Arbeitsinstrument und erteilt keine eigene formelle Freigabe.
