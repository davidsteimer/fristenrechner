# AP19C1 · Zeitliche Bindung der kantonalen Anbindungen

Stand: 25. September 2026. Technische Umsetzung des abgenommenen Intervallvertrags aus AP19B. Keine neue Fach-, Integrations-, Release- oder Betriebsfreigabe.

## Bedeutung des belegten Normintervalls

Alle 16 kantonalen Anbindungen des lokalen AP19C1-Kandidaten verwenden für `legalValidity` das geschlossene Intervall **01.01.2026–31.12.2027**. Es bezeichnet das für diese konkrete, eng begrenzte Anbindung positiv belegte rechtliche Anwendungsintervall.

Das Feld behauptet weder eine erstmalige Inkraftsetzung der beteiligten Normen am 01.01.2026 noch deren Ausserkrafttreten am 31.12.2027. Der Beginn einer vollständig rekonstruierten historischen Normenkette ist für diesen beschränkten Produktvertrag nicht erforderlich. Ein beliebiges technisches Testfenster allein wäre dagegen kein Normnachweis.

Der [abgenommene AP19B-Produktvertrag, Abschnitt 3.2](../architektur/sozialversicherungsvertrag-ap19b.md#32-federalrules), verlangt ein fachlich belegtes Normintervall. Abschnitt 3.3 übernimmt diese Anforderung für die Anbindungen. Abschnitt 7 unterscheidet Normgeltung, Quellenprüfung und Produktabdeckung. Die vorliegende konservative Intervallwahl setzt diesen Vertrag um und erweitert ihn nicht.

## Belegkette für die konkrete Intervallwahl

| Bestandteil | Beleg und Grenze |
| --- | --- |
| Zwölf migrierte IVG-/AHVG-/UVG-Pfade | Abgenommener AP17-/AP19B-Bestand und erneuter artikelbezogener Originalabgleich in [AP19C1](quellenabgleich-ap19c1.md). Keine Erweiterung der bisherigen Fallabdeckung oder Umdeutung des IV-Rechtswegs |
| Vier ELG-Pfade | [Abgenommener AP19B-Fassungs- und Anbindungsabgleich](quellenabgleich-ap19b.md), insbesondere Abschnitte 3 und 4, und erneuerter ELG-/ATSG-Abgleich in AP19C1. Die verwendete heutige Verwaltungszuständigkeitsregel von ELG Artikel 21 wird nicht auf die Inkraftsetzung des Gesamtgesetzes 2008 zurückdatiert |
| Ausgleichskasse Bern | EG ELG Artikel 8 in der amtlichen Version 3072, Stand 01.01.2025, frisch geprüft. Keine automatisch daraus abgeleitete Gerichtszuständigkeit |
| Berner Gerichtsanbindung | GSOG Artikel 54. Historische Version 3144, Stand 01.01.2026, nach dem abgenommenen AP19B-Vergleich und aktuelle Version 3367, Stand 01.05.2026, frisch geprüft. Der historische Originalvergleich wird als Vorbefund wiederverwendet, nicht als erneut durchgeführter Download bezeichnet |
| Feiertagsanknüpfung | FRG Bern Artikel 2 und die getrennt qualifizierte Anknüpfung nach ATSG Artikel 38 Absatz 3. Aktuelle kantonale Norm frisch geprüft. Kein Rückschluss vom Behördensitz auf Partei- oder Vertretungsort |
| Angekündigte Fassungen bis Ende 2027 | Amtlicher Bundesrechts-Änderungsindex und kantonale Versionsmetadaten nach dem dokumentierten Abrufstand. Keine erkannte relevante Änderung für die bezeichneten Pfade. Keine Garantie gegen später publiziertes Recht |

Die tatsächlichen Abrufe, Originalprüfsummen und wiederverwendeten Vorbefunde sind im [maschinenlesbaren Quellenprüfnachweis](../../outputs/ap19c1-2026-09-25/source-review.json) dokumentiert. Dessen SHA-256 wird in jedem Kandidaten-Freigabeeintrag und im Buildnachweis gebunden. Der Builder prüft zusätzlich die unveränderten Prüfsummen der abgenommenen AP19B-Grundlagen.

## Vier weiterhin getrennte Grenzen

- `legalValidity` ist das ausdrücklich konservative rechtlich belegte Anwendungsintervall der Anbindung.
- `sourceCoverage` ist der durch den konkreten Quellen- und Fassungsabgleich gedeckte Zeitraum.
- `caseCoverage` begrenzt die zulässigen qualifizierten Eröffnungsdaten.
- `calculationCoverage` begrenzt den gesamten Rechenweg einschliesslich Stillstand und Endverschiebung.

Dass diese Grenzen im Kandidaten dieselben Datumswerte haben, macht sie nicht austauschbar. Jede wird unabhängig geprüft. Die Freigabe eines längeren technischen Kalenderhorizonts würde keine dieser anderen Grenzen verlängern. `normBindings` verbindet die einzelnen Quellenlocator mit ihrem bezeichneten Zeitanker und dem belegten Anwendungsintervall.

Bei den ELG-Gerichtspfaden ist der Wohnsitzbezug der versicherten Person im Zeitpunkt der Beschwerdeerhebung eigenständig zu qualifizieren. Deshalb bindet die ATSG-58-Gerichtsroute `jurisdictionReferenceDate`. Das Eröffnungsdatum oder das Datum einer gerichtlichen Verbesserungsanordnung wird nicht automatisch als Ersatz eingesetzt. Die Erstgrenze verlangt sowohl `courtCanton: BE` als auch `partyDomicileCanton: BE` und einen ordentlichen Inlandsfall.

## Keine Aktivierung durch die Vervollständigung

Regeln, Anbindungen und Freigabeeinträge behalten den Status `candidate`. `approval` bleibt `null`. Das vollständige Intervall beseitigt eine unnötige technische Leerstelle, erteilt aber keine Freigabe. Der echte Kandidat bleibt bei der Berechnung gesperrt. Synthetische Genehmigungen in isolierten Tests sind keine menschlichen Entscheidungen und werden nicht in Kandidatendateien geschrieben.

Die drei vorherigen, ausschliesslich in dieser Arbeit erzeugten Buildentwürfe bleiben als lokale Entwicklungsnachweise erhalten. Abgenommene AP19A-/B-Dateien und bestehende Datenreleases werden nicht verändert.
