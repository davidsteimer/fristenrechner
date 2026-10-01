# AP20B Abnahme der Vorlage

Datum: 30. September 2026. Entscheider: David Steimer.

David Steimer hat erklärt: **«AP20B ist abgenommen.»** Damit ist die vorgelegte AP20B-Arbeit fachlich-technisch abgenommen. [Issue #40](https://github.com/davidsteimer/fristenrechner/issues/40) dokumentiert den Abschluss dieses Vorlagepakets. [#35](https://github.com/davidsteimer/fristenrechner/issues/35) bleibt für die Integration und die weiteren Sozialversicherungswege offen.

## Abgenommener Gegenstand

- Konkrete Fach- und Vertragsvorlage für EOG, FamZG, FLG, MVG und ÜLG mit 20 nationalen Handlungspfaden und 22 vorgeschlagenen Berner Anbindungen. Die nationale Wiederverwendbarkeit und die begrenzte Berner Erstfreigabe bleiben getrennt.
- Bundesrechtlicher Quellen- und Fassungsabgleich, bernische Originalprüfung und beantragtes Quellen-/Referenzfenster 01.01.2026–31.12.2027. Die publizierten Änderungen von EOG, EOV und FLG per 01.07.2027 sowie die gesonderte ÜLG-/ELG-Querverweisung sind berücksichtigt.
- Konkrete Zeitanker und Zuständigkeitsmerkmale. EOG-/MVG-Verwaltungswohnsitz BE am rechtlich massgebenden Eröffnungstag ist eine Produktgrenze. Gerichtliche Zuständigkeit, Herkunft des angefochtenen Leistungsfalls und Feiertagsanknüpfung bleiben eigenständig.
- Isolierte Strukturprobe, zehn literal erfasste Datumsvektoren über alle 22 Anbindungen und damit 220 positive Datumsprüfungen. Die 24 Governance-Gruppen und vier Kompatibilitätstests des bisherigen Readers sind Bestandteil des vorgelegten Nachweises.
- Beschriebener Migrations- und Bestandsschutz. Der positive Nachweis eines neuen Consumers und die tatsächliche Integration sind noch nicht ausgeführt und werden nicht vorweg abgenommen.
- Die bestehenden Bedienleitplanken bleiben erhalten: zwei Spalten, DE/FR, frühe Datumseingabe und keine redundanten Dokument- oder Bestätigungsfelder.

Die Abnahme akzeptiert den dokumentierten Prüfstand und seine Grenzen. Sie ist keine Gewähr gegen später publizierte Gesetzesänderungen. Vor Integration und Datenpromotion sind die Quellen wie vorgesehen erneut abzugleichen.

## Gesonderter Architekturentscheid

Im Abschluss von AP20B wurden die Abnahme des Arbeitspakets und der **gesonderte Beschluss zu DEC-2026-026** als nächste Schritte bezeichnet. Die jetzige Erklärung nennt ausdrücklich die AP20B-Abnahme. Diese Nachführung dokumentiert deshalb nicht zusätzlich einen noch nicht ausdrücklich erklärten Architekturentscheid.

[DEC-2026-026](../entscheidungen/DEC-2026-026-sozialverfahrenskatalog-v2.md) bleibt vorerst **vorgeschlagen**. Gegenstand ist die verbindliche Übernahme von Sozialverfahrenskatalog `2.0.0`, Manifest `6.0.0` und Mindestconsumer `6.0.0`. Die Entscheidungsvorlage gehört zum abgenommenen Arbeitsergebnis, ihr Status wird dadurch hier nicht eigenmächtig auf «beschlossen» gesetzt. Die ausdrückliche Bestätigung wird vor der Produktintegration noch eingeholt.

## Unverändert gebundene Vorlage

Der ursprüngliche [AP20B-Prüfnachweis](../../outputs/ap20b-2026-09-30/pruefprotokoll.json) bleibt unverändert und bindet die 15 vorgelegten Dokument-, Test- und Quellenprotokolldateien über ihre einzelnen SHA-256-Prüfsummen. Seine eigene Prüfsumme lautet:

`8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d`

Alle 15 dort bezeichneten Dateien wurden bei dieser Abnahmenachführung erneut geprüft. Sämtliche Prüfsummen stimmen. Zusätzlich stimmen die beiden AP20A-Vorlagen weiterhin mit ihren Abnahmeprüfsummen überein.

Der gebundene DEC-Entwurf hat die Prüfsumme `ef0251f40b4cec08233ff135cd3ded7b2a05a9ffb0675b36e4278788d7a2a779`. Auch er bleibt als eingereichte Vorlage unverändert. Ein späterer Beschluss ist ergänzend zu dokumentieren, ohne diesen historischen Nachweis ungültig zu machen.

Die bisherigen Angaben «Vorlage», «zur Abnahme», `humanApproval: false`, `legalTimeApproval: false` und `runtimeActive: false` in den Prüfunterlagen werden nicht rückwirkend geändert. Sie beschreiben deren Erstellungsstand. Für die nun erklärte menschliche AP20B-Abnahme ist diese Notiz massgebend. Eine künftige operative Freigabe bleibt davon unabhängig.

## Weitergeltende Grenzen und nächster Schritt

- Keine Aktivierung neuer Erlasse, Kantone oder Feiertagsräume, keine automatische Übernahme freiwilliger FamZG-Kassenleistungen oder rein kantonaler EO-Zusatzleistungen.
- Zuständiger Träger bleibt ein fachlich qualifizierter Fallbefund. Insbesondere wird die EAK-Zuständigkeit für EO-Adoption nicht automatisch aus nicht erhobenen Leistungsangaben erkannt.
- Keine pauschale Freigabe beliebiger gerichtlicher Fristen, Monatsfristen, Fixtermine oder materieller Geltendmachungsfristen.
- Kein Start von AP20C durch diese Abnahmenachführung. Nach dem gesonderten Architekturentscheid ist AP20C1 mit Consumer-/Schemadelta, Bestandserhaltung und EOG-Pfaden der vorgesehene nächste Umsetzungsschritt.
- Keine Änderung an Produktcode, produktiven Schemata, freigegebenen Daten oder Releaseartefakten. Kein Commit, Quellpush, Mirrorwechsel, E-/Q-/P-Deployment oder Berechtigungsdelta.
- Die lebenden Einstiegstexte und GitHub-Issues werden zur Statusnachführung angepasst. Die lokalen Quell- und Dokumentdateien werden damit noch nicht veröffentlicht.

David Steimer nimmt Fachprüfung und Abnahme in Personalunion wahr. Codex dokumentiert die Erklärung als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
