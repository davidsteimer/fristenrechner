# MVP 0.8 Releasehinweise

Stand: 16. Oktober 2026. MVP 0.8 erweitert den Rechner um die abgenommenen Tessiner und Bündner Verwaltungsverfahrenspfade aus AP23. Anwendung `0.8.0` und SPFx-Paket `0.8.0.0` sind auf den vier bestehenden E-/Q-Instanzen installiert. David Steimer hat [Q, reale Geräteprüfung und Gastzugriff abgenommen](abnahme-q-mvp08.md) und die begrenzte Wiederverwendung früherer Outlook-Importnachweise bestätigt.

**Die Publikation von MVP 0.8 auf GitHub und auf der öffentlichen Website steht noch aus.** Der letzte dokumentierte P-Stand ist [MVP 0.7 vom 9. Oktober 2026](produktionsbereitstellung-mvp07-2026-10-09.md). Diese Releasehinweise beruhen auf dem gebundenen lokalen und E-/Q-Stand, nicht auf einer neuen öffentlichen Bestandsprüfung.

## Neu in diesem Release

Der Rechner unterstützt fünf Tessiner und sieben Bündner Verwaltungsverfahrenspfade. Nach der Auswahl des zuständigen Kantons und Verfahrensrechts werden nur die zum Verfahrensstadium passenden Handlungen angeboten. Gesetzlich bestimmte Fristen sind fest vorgegeben. Bei modellierten behördlich angesetzten Tagesfristen wird die Dauer eingegeben.

Die Feiertagsanknüpfung wird aus Verfahrensrecht und bekannten Fallangaben bestimmt. Für die neuen allgemeinen kantonalen Verwaltungsverfahren ist dies der Sitz der zuständigen kantonalen Stelle. Die Oberfläche verlangt keinen zusätzlichen, frei bestimmbaren Feiertagskanton. Bei bestehenden Verfahren mit einer Anknüpfung an Partei oder Vertretung bleiben die entsprechenden rollenbezogenen Ortsangaben erhalten.

Die Rechenspur zeigt verständliche deutsche und französische Erläuterungen mit fallbezogenen Rechtsnormen und Links. Technische Regel- und Quellenkennungen sowie Verfahrenspfad, Revision und Datenrelease bleiben separat aufklappbar. Der zweispaltige Grundaufbau und die frühzeitige Datumseingabe bleiben erhalten.

Persönliche Standards werden auf Version 5 migriert. Die Speicherung umfasst zulässige stabile Auswahlwerte, aber weder Empfangsdatum, Referenz, Resultat noch aktuelle Fallqualifikation oder Dringlichkeit. Ein ausdrücklich zurückgesetzter Standard wird nicht erneut aus dem alten Speicher eingelesen.

## Fachlicher Umfang und Grenzen

- Die neuen TI-/GR-Pfade sind vom **29. August 2026 bis 31. Dezember 2027** freigegeben. Sämtliche für die Berechnung relevanten Tage müssen innerhalb der Abdeckung liegen. Ein Beginn im Jahr 2027 allein genügt nicht, wenn die Berechnung in 2028 hineinreicht.
- In Graubünden unterscheiden sich Verwaltungs- und Gerichtsverfahren sowie ausdrücklich dringlich erklärte Gerichtsverfahren. Die erforderlichen Fallangaben müssen bestätigt werden. Ein allgemeiner Fristenstillstand vor Verwaltungsbehörden wird nicht angenommen.
- Die konkrete Tessiner Konstellation TI-O2 bleibt gesperrt, wenn eine Endverschiebung in einen neuen Fristenstillstand führt. Fehlende Fallqualifikation und nicht modellierte spezialgesetzliche Abweichungen werden ebenfalls nicht durch Annahmen ersetzt.
- Die bestehenden Bundesverfahren und Berner Verfahren bleiben erhalten. Die 44 national modellierten Sozialregeln und 50 Berner Anbindungen bleiben auf ihre bestehende Freigabe für Bern und 2026–2027 begrenzt.
- Die nationalen Kalenderzuordnungen und ihre Vorbehalte bleiben unverändert. Dazu gehören die begrenzten Januarvergleiche, die getrennten GR-/NE-Grenzen, die beschlossene AI-Behandlung und der ergänzende historische Freiburger Praxisbeleg ohne eigenständige positive Fallfreigabe.
- Weitere kantonale Verwaltungsverfahren, zusätzliche kantonale Spezialrechte, ausserbernische Sozialfreigaben und eigenständige kommunale Erlasse werden nicht aktiviert. Deutsch und Französisch bleiben die Produktsprachen. Italienisch, Rumantsch Grischun, Kalender-App und Karte sind nicht Teil dieses Releases.

Die [Quellenabnahme R08-A2](../fachrecht/abnahme-quellen-mvp08.md) und die [AP23-Abnahmen](../fachrecht/abnahme-ap23d3.md) bleiben von Datenübernahme, Hostprüfung und Betriebsfreigaben getrennt.

## Technischer Wechsel

| Bestandteil | MVP 0.8 |
| --- | --- |
| Anwendung und SPFx-Paket | `0.8.0` / `0.8.0.0` |
| Manifest und Mindestconsumer | `8.0.0` |
| Neuer Kantonalverfahrenskatalog | `1.0.0` |
| Unveränderte Komponentenformate | Regelkalender `3.0.0`, Feiertagskatalog `2.0.0`, Rechtsprofile `1.0.0`, Spezialregimekatalog `3.0.0`, Sozialverfahrenskatalog `2.0.0` |
| Datenrelease | `2026-10-15-mvp-08-approved.1` |
| Mirror | 41 Nutzartefakte plus Manifest, genau 42 Dateien |
| Persönliche Standards | Version 5 |

Das [gebundene SPFx-Paket](../../outputs/release-mvp08-2026-10-15/fristenrechner-schweiz-0.8.0.0.sppkg) umfasst 311’611 Bytes, SHA-256 `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a`. Die [Releaseartefakte](releaseartefakte-mvp-08.md) binden auch Mirror-ZIP und statisches Webpaket. Ein erneuter Build wäre ein neuer Kandidat und ersetzt nicht automatisch diese geprüften Dateien.

Der bisherige MVP-0.7-Consumer kann Format 8 nicht laden. Die Umstellung erfordert daher den gebundenen Codewechsel und anschliessend die kontrollierte Konfiguration des jeweiligen vollständigen Mirrors. Provider und Cache bleiben an die tatsächliche Datenkonfiguration gebunden. Historische Formate und AP5-Pins bleiben unterstützt, ohne deren Fachumfang nachträglich zu erweitern. Zusätzliche API-Berechtigungen oder neue Hosting-Infrastruktur sind nicht erforderlich.

## Prüfungen und verbleibende Punkte

Der [E-/Q-Vollzugsnachweis](eq-vollzugsnachweis-mvp08.md) dokumentiert die technischen Tests auf SharePoint und Teams, die vollständigen TI-/GR-Fachfälle, Bestandsregressionen, Speicher- und Fehlerfälle sowie acht tatsächlich gespeicherte und geprüfte Kalenderdateien. Geräte- und Gastprüfung sind als menschliche Abnahme dokumentiert, nicht als nachträglich erfundene Einzelgeräteprotokolle.

Es gab keinen neuen Outlook-Import. Die [bestätigte Wiederverwendung](outlook-wiederverwendung-mvp08.md) gilt für den unveränderten Terminvertrag. Die neuen TI-/GR-Herkunftsfelder wurden in den erzeugten Dateien geprüft, aber nicht durch frühere Outlook-Importe nachgewiesen. Eine tatsächlich ausgelöste Erinnerung oder die grüne Darstellung einer Kategorie wird dadurch ebenfalls nicht belegt.

Die separate VoiceOver-Prüfung bleibt offen. Der akzeptierte geringfügige iPad-Magic-Keyboard-Befund bleibt unverändert. Die Prüfung beziehungsweise allfällige Korrektur der minimal abweichenden Datumsfeldhöhe aus Issue #50 ist dem nächsten Release zugeordnet und nicht in dieses Paket eingearbeitet.

## Publikation und Rückfall

Das [Publikationspaket](publikationspaket-mvp08.md) trennt den zur Freigabe vorgelegten öffentlichen Dateiumfang von privaten Originalnachweisen. Der lokale Datencommit und die Releaseartefakte sind noch kein GitHub-Push und keine P-Bereitstellung.

Der gebundene [Wiederherstellungskandidat `0.8.0.1`](rueckfall-mvp08.md) stellt den MVP-0.7-Funktionsumfang mit den gesicherten Format-7-Mirrors wieder her. Er wurde nicht eingesetzt. Ein tatsächlicher Rückfall folgt dem konkret gebilligten Ablauf, schützt historische AP5-Pins und persönliche Standards und erlaubt keinen pauschalen Browserdatenreset. Eine spätere reguläre Wiederaufnahme müsste eine erneut höhere Paketversion verwenden.

Vor einer P-Bereitstellung bleiben frische Sicherung und Bestandsprüfung, HEAD-/GET-/Cachevergleich sowie öffentliche Hosttests erforderlich. Der frühere Header-/Cachebefund wird nicht als behoben ausgegeben und eine frühere begrenzte Risikoakzeptanz nicht stillschweigend auf MVP 0.8 übertragen. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben unverändert, solange kein gesonderter Auftrag vorliegt.
