# MVP 0.7 · Quellenprüfplan

Stand: 8. Oktober 2026. **Inventar und Prüfauftrag, noch kein abgeschlossener Quellenabgleich und keine neue Quellenfreigabe.** Grundlage sind die abgenommenen AP22-/AP21-Stände und der [Releaseauftrag](../betrieb/deployment-mvp-07.md). Die bisherigen Fachentscheide bleiben unverändert. Dieser Schritt prüft Aktualität, Vollständigkeit und belastbare Wiederverwendung für den neuen Datenrelease.

## 1. Vollständiger Umfang statt blosser Manifestliste

Die Quellen-IDs sind Referenzen auf konkrete Nachweise. Ihre Anzahl ist weder die Anzahl unterschiedlicher Erlasse noch die Anzahl nötiger Abrufe. Mehrere Referenzen können denselben Erlass, unterschiedliche Fassungen oder unterschiedliche Artikel desselben Dokuments betreffen.

| Menge | Anzahl | Bedeutung |
| --- | ---: | --- |
| Manifest AP22C3 | 109 | 77 bereits im MVP-0.6-Manifest enthaltene und 32 zusätzliche Kalenderreferenzen |
| Historischer Feiertagskatalog | 84 | Davon 33 auch im neuen Manifest. Manifest und bisheriger Katalog ergeben zusammen 160 IDs, noch nicht den vollständigen Prüfbestand |
| Zusätzliche AP22-Nachweise | 73 | 24 AP22- und 49 AP22CLOSE-Referenzen aus `activation.sourceEvidence` und `sourceIdMap` |
| Vollständige kanonische Menge | **232** | 77 bisherige Manifestreferenzen, 82 bisherige Katalog-only-Referenzen und 73 neue Aktivierungsnachweise, ohne Doppelzählung |

Von den früheren 82 Katalog-only-Quellen werden inzwischen 36 im neuen Manifest oder in Aktivierungsverknüpfungen referenziert. 46 bleiben ergänzend. Von den 73 neuen Nachweisen sind 48 direkt in Verfahrensbindungen, Anknüpfungsregeln oder zusätzlichen Prozessregeln verknüpft, 25 ergänzend im Evidenzbestand. «Ergänzend» bedeutet nicht entbehrlich oder ohne Prüfpflicht. Quellenbeziehung und positive operative Fallfreigabe sind getrennte Eigenschaften.

Das aktuelle Governance-Register enthält 81 IDs. 77 gehören zu dieser Releasequellenmenge, vier sind historische Zusatzreferenzen. **155 der 232 Release-IDs sind noch nicht im lebenden Register enthalten.** Diese Differenz ist ein technischer Übernahmeauftrag, kein Nachweis von 155 ungeprüften Erlassen. Vorhandene Fachbelege und frühere Prüfungen werden einzeln zugeordnet. Die vier zusätzlichen Registerreferenzen werden nicht stillschweigend gelöscht.

Das [maschinenlesbare Quelleninventar](../../outputs/release-mvp07-2026-10-08/sources/source-inventory.json) ist mit SHA-256 `4bb394c9b1cccdc50ccae896925a5b64b3a6274fba0fb0b81a35b0ddca7e9c82` gebunden. Es enthält 2'020 konkrete Referenzstellen: 1'647 herkömmliche Quellenverweise, 361 Aktivierungsverweise in `sourceIds` und zwölf zusätzliche Verweise über `evidenceId`. Der definierte Referenzgraph umfasst 142 IDs, davon 138 positiv oder gemeinsam verwendete und vier reine Ausschlussbelege. Die übrigen 90 IDs bleiben ergänzend im Inventar. Diese strukturelle Einordnung ist keine positive rechtliche Fallfreigabe und weicht bewusst von der blossen Manifestzugehörigkeit ab.

Vor der Registerübernahme sind ausserdem konkrete Metadatenpunkte zu bereinigen, ohne historische Belege umzuschreiben:

- 19 AP22CLOSE-BUND-Belege nennen als Fassungsangabe «Siehe Fundstelle». Die konkret geprüfte Fassung und Aussage müssen im neuen Quellenbericht aufgelöst werden.
- Ein neuer Beleg hat keine ausdrücklich eingetragene Fundstelle. Diese ist vor einer inhaltlichen Wiederverwendung konkret nachzuweisen.
- Zwei historische Bundesgerichtsadressen verwenden HTTP. Der aktuelle amtliche HTTPS-Zugang und die Entscheididentität sind zu prüfen. Eine reine Zeichenkettenersetzung wäre kein Nachweis.
- `SRC-BUNDESFEIERTAG-19940701` hat zwei Metadatenvarianten. Die neuen Kalenderprojektionen führen einen Dossier-/Monitoringnachweis, der übernommene CH-Kalender einen älteren Verordnungs-/Prüfnachweis. Beide Varianten bleiben im Inventar erhalten. Die künftige kanonische Registerdarstellung ist anhand des tatsächlichen Ursprungs zu bestimmen, nicht nach dem ersten Treffer.

## 2. Prüfmethode und Wiederverwendung

| Teilmenge | Vorgehen für MVP 0.7 |
| --- | --- |
| Nationale Verfahrensgrundlagen und Feiertagsanknüpfungen | Aktuelle amtliche Fassungen und einschlägige Änderungshinweise prüfen. Die abgenommenen AP22-Ableitungen zu Verfahrensart, Rolle und Ort gezielt nachweisen, nicht erneut durch eine pauschale Feiertagsliste ersetzen |
| Neue Aktivierungsnachweise | Vorhandene AP22-Belege nach Dokument, Artikel, zeitlicher Fassung und Aussage zuordnen. Das Matrix-Abschlussdatum 08.10.2026 ist kein neues Abrufdatum. Die Matrix wurde am 02.10.2026 vorbereitet, die Integrationsschritte C1/C2 weisen keine eigene Quellenprüfung und C3 weiterhin einen ausstehenden Quellenentscheid aus. Fehlende Reichweite, aktuelle Änderungsanzeichen oder nur vorhandene Metadaten erfordern einen ergänzenden Abruf/Inhaltsabgleich |
| Bisherige Feiertagsquellen | Die für MVP 0.6 abgenommene Wiederverwendung der Septemberprüfung nicht automatisch fortschreiben. Insbesondere die 36 nun zusätzlich verknüpften Quellen auf ihre neue konkrete Verwendung prüfen. Für die übrigen 46 ergänzenden Referenzen Wiederverwendung einzeln begründen, keine neue Vollprüfung behaupten |
| Bestehende Sozial- und Spezialregime | Unveränderte Fachregeln und Freigabegrenzen anhand der bisherigen Quellenberichte nachweisen, aktuelle fällige Fassungen und Änderungshinweise abgleichen. Neue Release-/Kalenderhashes sind technische Verknüpfungen, keine neuen nationalen Sozialfreigaben |
| Rechtsprechung | Konkrete Urteile und deren Reichweite getrennt von Normtexten behandeln. Amtliche Originale bevorzugen. Entscheidsuche und OpenCaseLaw bei ergänzenden Recherchen berücksichtigen, Spiegel und Metadaten nicht mit einem amtlichen aktuellen Normtext gleichsetzen |
| Nicht abrufbare, geänderte oder widersprüchliche Quelle | Mit konkretem Befund, betroffener Regel und nächstem Schritt ausweisen. Ein technischer Abruffehler darf nicht als «unverändert» gelten. Bestehende fachliche Entscheide nicht stillschweigend durch automatische Abrufresultate ersetzen |

Der ordentliche Quellenprüftermin bleibt gemäss bestehendem AP13-Konzept bestehen. Diese releasebezogene Zusatzprüfung ersetzt weder das periodische Monitoring noch einen unbegrenzten Nachweis künftiger Rechtsbeständigkeit. Bei Verzögerung oder neuen Änderungshinweisen wird die Aktualität vor der Datenübernahme erneut beurteilt.

## 3. Nachweis pro Referenz

Für jede kanonische Quellen-ID sind mindestens zu dokumentieren:

- Amtlicher Ursprung, konkret verwendete Fassung und einschlägige Bestimmung oder Entscheidpassage.
- Verwendung im Produkt, in einer Grenze/Ausschlussregel oder als ergänzender Beleg.
- Frischer Abruf/Inhaltsabgleich oder konkret gebundene Wiederverwendung mit ursprünglichem Prüfdatum und Dateiprüfsumme.
- Tatsächlich gedeckter Inhalt und Zeitraum. Ein Wiederverwendungsdatum ist kein neues Abrufdatum.
- Ergebnis `unverändert`, `geändert`, `unklar` oder `nicht verfügbar` sowie nötige Folgeaktion.
- Bezug zum zusammengeführten Quellenentscheid. Bis zur menschlichen Abnahme bleibt dieser Entscheid ausstehend.

Dateiidentität, maschinelle Vollständigkeit, juristische Prüfung und menschliche Abnahme werden separat geführt. Ein Quelleninventar mit 232 Zeilen ist noch keine 232-fach abgeschlossene Inhaltsprüfung.

## 4. Fortbestehende Grenzen

Die begrenzte Behandlung des 2. Januar gemäss DEC-2026-029, die GR-/NE-Vorbehalte, der akzeptierte AI-Quellenkonflikt, AVIV-Option B und das bestehende Monitoring zu OF-001 bleiben sichtbar. Soweit die neue Prüfung einen materiell neuen Widerspruch ergibt, wird der betroffene Übernahmeschritt angehalten und David der konkrete Entscheidbedarf vorgelegt. Die blosse Wiederholung eines bereits entschiedenen Sachverhalts eröffnet diesen Entscheid nicht erneut.

Für die Kalenderabdeckung gilt die beschlossene Grenze ab 29.08.2026 mit zusätzlich je Tag geltenden Normen, Gebietsständen, Profilgrenzen und Releasefreigaben. Die offenen Kalender enden technisch nicht nach zwei Jahren, rechtlich gelten dennoch die qualifizierten Grenzen. Die Sozialfreigaben bleiben auf 2026–2027 beschränkt.

## 5. Technische Nachführung nach der Quellenabnahme

Das bestehende Quellenindex-Werkzeug erkennt nicht sämtliche Format-7-Beziehungen. Insbesondere `sourceIds`-Arrays, `evidenceId` und `sourceIdMap` müssen nachvollziehbar aufgelöst werden. Ein unveränderter Lauf des MVP-0.6-Werkzeugs würde daher keine vollständige neue Referenzmenge belegen.

Für MVP 0.7 wird die Format-7-Vorbereitung gesondert und mit Positiv-/Negativtests geführt. Neue Registereinträge und Prüfevents entstehen erst aus dem abgeglichenen Quellenbestand. Alte Einträge, Ereignisse und Prüfberichte bleiben erhalten. Das Governance-Register gehört weiterhin nicht in den Laufzeitmirror. Öffentlich geeignete Prüfbelege werden bei der späteren Publikationsvorprüfung von privaten Rohdownloads getrennt.

## Haltepunkt

Erst der vollständige zusammengeführte Quellenbericht mit den begründeten Wiederverwendungen und fortbestehenden Vorbehalten wird David zur Abnahme vorgelegt. Vorher bleiben aktive Register, Datenrelease, Produktpins und Versionsdateien unverändert. Die Abnahmen von AP22 und AP21 ersetzen diesen Quellenreleaseentscheid nicht.
