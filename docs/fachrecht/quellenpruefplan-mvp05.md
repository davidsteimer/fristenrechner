# MVP 0.5 · Quelleninventar und Prüfplan

Stand: 28. September 2026. Status: **lokale Releasevorbereitung, keine neue Quellenabnahme**. «MVP 0.5» bezeichnet den Arbeitsnamen des AP19-Folgereleases. Dieser Bericht enthält die Bestandsaufnahme und den nachfolgend ausgeführten begrenzten AP19-Quellenrefresh. Er verändert keinen freigegebenen Nachweis und behauptet keine vollständige neue Prüfung aller 135 Quellen.

## 1. Ergebnis und Haltepunkte

Die abgenommenen AP19C1-, C2- und C3-Integrationen bilden eine belastbare Grundlage für die Releasevorbereitung. Die darin gebundenen Quellenberichte sind jedoch **keine gesonderte AP13-Quellenfreigabe für einen neuen Gesamt-Datenrelease**. Insbesondere werden die historischen Angaben `humanApproval: false` und `approval: null` nicht nachträglich umgeschrieben.

Die lokale Vorbereitung kann weitergehen. Vor Freigabe des Gesamt-Datenreleases sind erforderlich:

1. Quellenabdeckung und Aktualität für den konkreten Gesamtstand dokumentieren, mit getrennt ausgewiesenem Neuabgleich und wiederverwendeten Befunden.
2. Die 15 zusätzlichen Quellen in die Governance einordnen und ein neues, zunächst als Kandidat geführtes AP13-Prüfereignis samt reproduzierbarem Index vorbereiten.
3. Den konsolidierten Quellenbefund einschliesslich verbleibender Vorbehalte durch David Steimer fachlich abnehmen lassen. Die bestehenden Integrationsabnahmen werden referenziert, nicht ersetzt.
4. Quellenindex, Referenzen und menschliche Freigabe an den späteren Datenrelease binden. Datenpromotion und E-/Q-/P-Bereitstellung bleiben eigene Freigabeschritte.

Der offene Hostingbefund ist **kein Hindernis für diese lokalen Arbeiten**. Er wird durch eine abgeschlossene Quellenprüfung weder behoben noch geschlossen.

## 2. Exaktes Inventar

Vergleichsbasis ist der freigegebene Datenstand `2026-09-22-mvp-04-approved.1`. Integrationsbasis ist `2026-09-28-ap19c3-candidate.1`, Manifest-SHA-256 `8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da`.

| Ebene | Anzahl | Einordnung |
| --- | ---: | --- |
| Quellen-IDs im MVP-0.4-Manifest | 38 | Am 22.09.2026 im Gesamtumfang fachlich abgenommen |
| Zusätzliche AP19-Manifestquellen | 15 | Vier aus C1, acht aus C2, drei aus C3 |
| Quellen-IDs im C3-Manifest | 53 | Einschliesslich unterstützender und zeitlicher Nachweise, nicht 53 verschiedene Erlasse |
| Quellen im unveränderten Schweizer Feiertagskatalog | 84 | Zwei überschneiden sich mit dem Manifestbestand |
| Zusätzliche, nicht operative Katalogquellen | 82 | Bewusst gesonderte Governance und keine Aktivierung weiterer Kantonsprofile |
| Unterschiedliche Quellen-IDs im Gesamtstand | **135** | `53 + 84 − 2`, davon die bisherigen 120 plus 15 AP19-IDs |
| Aktuelles AP13-Register | 42 | Bisherige freigegebene Governance, noch ohne die 15 neuen AP19-IDs |
| Register nach Aufnahme dieser 15 IDs | 57 | Vorläufiger Zielumfang bei unveränderter Beibehaltung der vier bisherigen Zusatzbelege |

Die Überschneidungen des Katalogs mit dem Manifest sind `SRC-BUNDESFEIERTAG-19940701` und `SRC-FRG-BE-20210401`. Zusätzliche historische IDs für denselben Erlass bleiben getrennte Referenzen. Ihre fachliche Quellenidentität darf beim Abgleich berücksichtigt werden, ohne die IDs zusammenzulegen.

Die fünf Rechtsprofile, beide operativen Regelkalender und der vollständige Feiertagskatalog sind im C3-Kandidaten byteidentisch zum MVP-0.4-Stand. Der Spezialregimekatalog hat die abgenommene Aufteilung erfahren, hinzugekommen ist der nationale Sozialverfahrenskatalog. Die Unverändertheit einer Datei beweist ihre Herkunft, nicht automatisch die Aktualität der ihr zugrunde liegenden Rechtslage.

## 3. Vorhandene Prüfungen und ihre Reichweite

| Nachweis | Tatsächlicher Prüftag | Inhalt | Heute zulässige Aussage |
| --- | --- | --- | --- |
| [MVP-0.4-Gesamtprüfung](quellenabgleich-mvp04.md) und [ausdrückliche Abnahme](abnahme-quellenpruefung-mvp04.md) | 22.09.2026 | 120 unterschiedliche IDs, 119 unveränderte Befunde, bekannter AI-Listenwiderspruch `unclear` | Fachlich abgenommene Vergleichsbasis. Keine Prüfung vom 28.09.2026 |
| [C1-Quellenabgleich](quellenabgleich-ap19c1.md) | 25.09.2026 | IVG, AHVG, UVG, IVV, ELG, ATSG, EG ELG, GSOG, FRG und begrenzter Rechtsprechungsbeleg | Migration und ELG im belegten Anwendungsfenster 2026–2027 geprüft. Keine AVIV-/KVG- oder vollständige Feiertagsprüfung |
| [C2-Quellenabgleich](quellenabgleich-ap19c2.md) | 28.09.2026 | AVIG, AVIV, Änderungsakte, vollständiger Zukunftsindex, AMG, gemeinsame Grundlagen | ALE-Pfade 2026–2027 mit bestätigter Option-B-Methode. Keine vollständige neue Prüfung aller bisherigen Sozialpfade |
| [C3-Quellenabgleich](quellenabgleich-ap19c3.md) | 28.09.2026 | KVG/OKP, ATSG, GSOG, FRG, Fassungs- und Zukunftsindex, begrenzter Rechtsprechungsbeleg | Vier individuelle OKP-Pfade 2026–2027 geprüft. Keine Vollprüfung des KVG, KVAG oder des Feiertagsbestands |

Die drei AP19-Nachweise decken zusammen **27 der 53 Manifest-IDs** durch die darin dokumentierten gezielten neuen Prüfungen ab. Dabei werden die beiden ATSG-IDs und die beiden FRG-IDs anhand ihrer identischen amtlichen Quellen zugeordnet. Das ist eine belegte Aliaszuordnung, kein zweiter Abruf. Vor dem ergänzenden Release-Refresh hatten zehn IDs den Stand 25.09.2026 und 17 IDs den Stand 28.09.2026. Die zehn älteren Nachweise sind nun gezielt erneuert, siehe Ziffer 5a.

**26 weitere Manifest-IDs** haben weiterhin den MVP-0.4-Prüfstand vom 22.09.2026. Die 82 zusätzlichen Katalogquellen behalten ebenfalls diesen Stand. Ein globales `latestReviewedOn: 2026-09-28` im Kandidatenmanifest darf deshalb nicht als Vollprüfung aller 135 Quellen am 28. September gelesen werden.

Alle 28 Sozial-Freigabeverknüpfungen bleiben gesperrt. 16 referenzieren den C1-Quellennachweis, acht den C2-Nachweis und vier den C3-Nachweis. Die drei verschiedenen Referenzen werden vor einer Promotion vollständig geprüft und entweder unverändert nachvollziehbar weitergebunden oder auf einen neuen konsolidierten Freigabenachweis umgestellt. Ein Nachweis wird nicht allein wegen seines jüngeren Datums über den gesamten Bestand gestülpt.

### Zusätzliche 15 Manifest-IDs

| Herkunft | Quellen-IDs |
| --- | --- |
| C1 | `SRC-AP19C-EGELG-BE-20250101`, `SRC-AP19C-ELG-20260101`, `SRC-AP19C-ELG-20270101`, `SRC-AP19C-GSOG-BE` |
| C2 | `SRC-AP19C2-AMG-BE-ART35`, `SRC-AP19C2-AVIG-20260101`, `SRC-AP19C2-AVIV-20260101`, `SRC-AP19C2-AVIV-20260801`, `SRC-AP19C2-AVIV-20270101`, `SRC-AP19C2-AVIV-AS-2025-814`, `SRC-AP19C2-AVIV-AS-2026-258`, `SRC-AP19C2-AVIV-FUTURE-INDEX-20260928` |
| C3 | `SRC-AP19C3-KVG-20260101`, `SRC-AP19C3-KVG-20260701`, `SRC-AP19C3-KVG-FUTURE-INDEX-20260928` |

Die Rollen sind bei der Aufnahme quellenbezogen festzulegen. Zukunftsfassungen sind keine bereits geltenden Normen, und eine Indexantwort ist kein Erlasstext. Die Rollen werden nicht pauschal auf `productive` gesetzt. Die bestehenden vier ausserhalb des Manifests geführten Governancequellen bleiben gesondert: `JUD-BE-VG-100-2021-109`, `JUD-BGER-1C-592-2025`, `SRC-BBL-2025-2891` und `SRC-BJ-WEEKEND-DOSSIER`.

## 4. Abnahme ist nicht gleich Prüfdatum

[C1](abnahme-ap19c1.md) bindet das Kandidatenmanifest, das seinerseits die Prüfsumme des C1-Quellennachweises enthält. [C2](abnahme-ap19c2.md) und [C3](abnahme-ap19c3.md) binden zusätzlich ihre Quellenberichte direkt mit SHA-256. Die fachlich-technischen Integrationsabnahmen beziehen sich damit auf einen identifizierbaren Quellen- und Referenzstand. Eine erneute fachliche Erstabnahme derselben Modellannahmen ist nicht nötig.

Die Abnahmen erklären jedoch ausdrücklich keine Datenpromotion oder Betriebsfreigabe. C3 hält zudem fest, dass die Grenzen des damaligen technischen Quellenprüfnachweises erhalten bleiben. Deshalb werden die technischen Berichte nicht nachträglich zu einem freigegebenen AP13-Gesamtereignis umetikettiert. Der neue Gesamtprüfstand und seine Wiederverwendung älterer Befunde sind vor der Datenfreigabe einmal gesondert vorzulegen.

Die Abnahme am 28. September macht den C1-Abruf vom 25. September nicht zu einem neuen Abruf. Gleiches gilt für die historische GSOG-Fassung Januar–April 2026 und die frühere AMG-Fassung, die bereits in AP19B geprüft und in C2/C3 ausdrücklich wiederverwendet wurden.

## 5. Vorgeschlagener begrenzter Release-Refresh

Die [Release-Checkliste](../betrieb/release-checkliste.md) verlangt eine Prüfung der betroffenen amtlichen Quellen unmittelbar vor Freigabe. [AP13](../betrieb/periodische-quellenpruefung-ap13.md) kennt zusätzlich den Jahrestermin, aber keine pauschale Gültigkeitsfrist in Tagen. Ein frisch wirkendes Datum darf deshalb weder automatisch eine Prüfung ersetzen noch muss eine identische Quelle mehrfach am selben Tag heruntergeladen werden.

Für die schlanke Vorbereitung wird folgender Umfang vorgeschlagen. Die tatsächliche Ausführung ist gesondert zu protokollieren:

| Gruppe | Erforderliche Arbeit vor Datenfreigabe |
| --- | --- |
| Neue und migrierte Sozialpfade samt CH-/BE-Feiertagsanker | Quellenkette, amtliche aktuelle und angekündigte Fassungen sowie artikelbezogene Änderungshinweise für 2026–2027 gegen den gebundenen Stand abgleichen. Die Nachweise vom selben Tag dürfen nach Identitätsprüfung und dokumentierter Aktualitätsbeurteilung wiederverwendet werden. Bei zeitlichem Abstand oder neuem Anlass gezielt neu abrufen und lesen |
| AVIG ab Februar 2027 | Erneut prüfen, ob eine amtliche Konsolidierung inzwischen zugänglich ist. Andernfalls Option B aus Januar-Konsolidierung, beiden Originaländerungsakten und aktuellem vollständigem Zukunftsindex beibehalten. Keine synthetische amtliche Vollfassung erzeugen |
| 26 übrige Manifestquellen | Im Gesamtprüfereignis vollständig abdecken. Unveränderte Produktverwendung und bisherigen fachlichen Befund nachweisen, aktuelle Erlassfassungen, Änderungslage und relevanten Rechtsprechungs-/Monitoringstand prüfen. Eine alte historische PDF muss nicht bloss für einen neuen Zeitstempel nochmals gelesen werden. Ihre Wiederverwendung und aktuelle Aussagegrenze bleiben ausdrücklich benannt |
| 82 zusätzliche, nicht operative Katalogquellen | Die freigegebene Gesamtprüfung vom 22.09.2026 und den byteidentischen Katalog nachvollziehbar übernehmen. Kein vorgetäuschter Vollrefresh. Ohne neuen Änderungsanlass oder erweiterten Aktivierungsumfang ist ein erneutes vollständiges Lesen nach sechs Tagen nicht automatisch notwendig. Eine erneute Vollprüfung wäre ein ausdrücklich festzulegender Zusatzumfang |
| AI-Konflikt | Beschlossene gesetzliche Behandlung und `unclear`-Befund erhalten. Keine amtliche Berichtigung behaupten. Eine tatsächlich neu bekannt gewordene Berichtigung als eigenes Prüfereignis behandeln |
| Monitoring `OF-001` | Den offenen Vorgang unabhängig von AP19 sichtbar halten. Bei der Vorfreigabeprüfung den aktuellen Inkraftsetzungsstand gegen die betroffenen geltenden Profile beurteilen. Nicht aus der nationalen Sozialmodellierung ableiten |

Die 26 nicht in C1–C3 neu geprüften Manifest-IDs betreffen neun Rechtsprechungsbelege sowie die bisherigen Bundes-/Berner Grundlagen und historischen politischen beziehungsweise beschaffungsrechtlichen Abgrenzungsbelege. Sie sind im [maschinenlesbaren Inventar](../../outputs/release-mvp05-2026-09-28/source-inventory.json) einzeln aufgeführt.

Verzögert sich die produktive Bereitstellung wegen des Supports, wird unmittelbar vor der späteren Freigabe eine angemessene Aktualitätskontrolle durchgeführt. Der rechtliche Stand wird nicht auf das Datum eines technischen Vorbereitungsbuilds eingefroren. Das ist kein Anlass, unveränderte veröffentlichte Datenordner umzuschreiben.

## 5a. Tatsächlich ausgeführter AP19-Refresh

Am 28.09.2026 zwischen **11:27:02 und 11:27:03 UTC** wurden zehn amtliche Originaldateien beziehungsweise Erlassdatensätze sowie ein vollständiger Zukunftsänderungsindex und eine ergänzende Fassungsübersicht direkt abgerufen. Die ersten Versuche über Webreader und den netzwerkbeschränkten lokalen Aufruf scheiterten technisch. Der genehmigte direkte Originalabruf war anschliessend bei allen zwölf Antworten erfolgreich. Die fehlgeschlagenen Versuche bleiben getrennt dokumentiert und werden nicht als rechtliche Nichterreichbarkeit gewertet.

| Frisch geprüfte Gruppe | Präziser Umfang und Ergebnis |
| --- | --- |
| [ELG 2026](https://www.fedlex.admin.ch/eli/cc/2007/804/20260101/de) und [2027](https://www.fedlex.admin.ch/eli/cc/2007/804/20270101/de) | Art. 1–3, 14–16 und 21. Einzelgesetzlicher Eintritt, Leistungsabgrenzung und getrennte Verwaltungszuständigkeit einschliesslich Heimfälle unverändert. Materielle 15-Monatsfrist weiterhin ausgeschlossen |
| [IVG 2026](https://www.fedlex.admin.ch/eli/cc/1959/827_857_845/20260101/de) und [2027](https://www.fedlex.admin.ch/eli/cc/1959/827_857_845/20270101/de) | Art. 1, 57a und 69. Vorbescheideinwand 30 Tage und direkter Beschwerdeweg bei kantonalen IV-Stellen unverändert |
| [AHVG 2026](https://www.fedlex.admin.ch/eli/cc/63/837_843_843/20260101/de) und [2027](https://www.fedlex.admin.ch/eli/cc/63/837_843_843/20270101/de) | Art. 1 und 84. Verweisung und besondere Gerichtszuständigkeit bei kantonalen Ausgleichskassen unverändert. Altershilfebeiträge nicht aufgenommen |
| [UVG 2026](https://www.fedlex.admin.ch/eli/cc/1982/1676_1676_1676/20260101/de) | Art. 1 einschliesslich der gesetzlichen Ausnahmen. Keine Erweiterung auf Tarif-, Registrierungs- oder Versichererstreitigkeiten |
| [IVV 2025](https://www.fedlex.admin.ch/eli/cc/1961/29_29_29/20250601/de) und [2027](https://www.fedlex.admin.ch/eli/cc/1961/29_29_29/20270701/de) | Art. 73bis und 73ter. Eröffnungs-/Eingabevorgaben unverändert. Absatz 1 von Art. 73ter bleibt aufgehoben |
| [EG ELG, BSG 841.31](https://www.belex.sites.be.ch/api/de/texts_of_law/841.31) | Version 3072, Art. 8 und 9. AKB-Zuweisung unverändert. Amtliche Liste künftiger Fassungen leer |

Alle zehn empfangenen Originaldateien sind byteidentisch zu den gebundenen C1-Belegen. Die relevanten Artikel wurden aus XML beziehungsweise amtlichem XHTML extrahiert und gelesen. In den vier Paaren ELG, IVG, AHVG und IVV sind die ausgewählten Artikel einschliesslich ihrer Fussnoten zwischen den gelesenen Fassungen textgleich. Das ist keine Behauptung, dass die ganzen Erlasse unverändert wären.

Die [neue vollständige Indexabfrage](../../outputs/release-mvp05-2026-09-28/sources/retry-01/future-index.rq) umfasst ATSG, IVG, IVV, AHVG, UVG, ELG, AVIG, AVIV und KVG mit Wirksamkeit 28.09.2026–31.12.2027, ohne Publikationsjahr- oder Artikelvorauswahl. Sie ergibt **14 bereits beurteilte Einträge**: sechs IVG-, zwei IVV-, zwei ELG-, einen AHVG- und drei AVIV-Einträge. Kein zusätzlicher Treffer wurde gefunden. Für ATSG, UVG, AVIG und KVG liefert diese Abfrage keine Änderungsauswirkung. Der Befund bleibt ein zeitgebundener amtlicher Registerstand.

Die übrigen **17 der 27 AP19-bezogenen Manifest-IDs** werden ausdrücklich aus den gleichtägigen C2-/C3-Prüfungen übernommen. Deren gebundene Review-Dateien und 18 dort bezeichnete Original-/Indexdateien wurden lokal auf unveränderte SHA-256-Werte geprüft. BGer 8C_767/2008 bleibt eine wiederverwendete heutige Fundstellenprüfung, keine erneut durchgeführte Vollsuche nach neuerer Rechtsprechung. Die Januar-/Februar-2027-AVIV-Belegkette bleibt entsprechend der heute geprüften und abgenommenen Option B erhalten. Ein erneuter Abruf der technisch nicht verfügbaren Februar-Vollfassung wird hier nicht behauptet.

Maschinenlesbar sind [das Inventar aller 135 IDs](../../outputs/release-mvp05-2026-09-28/source-inventory.json) und [der begrenzte AP19-Quellennachweis](../../outputs/release-mvp05-2026-09-28/sources/ap19-source-review.json) vorhanden. Der AP19-Nachweis hat SHA-256 `c5e37d8c44f9aa17d6b102f654551ea27960231a66dc14a284f91032117f87c7`. Status bleibt `candidate`, `humanApproval: false`, `productionApproval: false` und `runtimeActivation: false`.

Der gesonderte [Restabgleich der 26 übrigen Manifestquellen](quellenabgleich-mvp05-rest.md) ist inzwischen ebenfalls abgeschlossen. 17 IDs sind an 16 frisch abgerufene, byteidentische amtliche Originaldateien gebunden. Neun bekannte Rechtsprechungsbelege wurden erneut an den verwendeten Erwägungen geprüft. Die dokumentierten künftigen Änderungen erfordern im modellierten Umfang keine Änderung der Tagesberechnung. Die 82 zusätzlichen Katalogquellen bleiben ausserhalb dieses frischen Abgleichs.

Der [zusammengeführte Quellenbefund](quellenabgleich-mvp05.md) und der [maschinelle Vollständigkeitsnachweis](../../outputs/release-mvp05-2026-09-28/source-review-completeness.json) bilden die Vorlage für die menschliche Gesamtquellenabnahme. Sie unterscheiden 53 aktuell abgedeckte Manifest-IDs und 82 ausdrücklich wiederverwendete Katalogbelege. Kein Prüfdatum des Katalogs wird nachträglich aktualisiert.

## 6. Governance und technische Nachweise

- Bestehende freigegebene AP13-Ereignisse, MVP-0.4-Abnahme und C1-/C2-/C3-Nachweise bleiben byteidentisch.
- Neues Ereignis mit Auslöser `preRelease`, genauem Vergleichsstand, tatsächlichen Prüftagen, Fundstellen, Methoden und Folgemassnahmen vorbereiten. Wiederverwendung und Neuprüfung auseinanderhalten.
- Vollständige Abdeckung aller 53 Manifest-IDs und gesonderte Bindung des unveränderten 84-Quellen-Katalogs nachweisen. Die 15 neuen Registereinträge und die neuen Sozialkomponenten müssen im Index korrekt aufgelöst werden.
- Die bestehenden Governance-Schemata werden nicht allein wegen Manifest 5 hochgezählt. Generator und Validator müssen allerdings die Sozialkomponente und ihre Regel-/Anbindungsreferenzen tatsächlich verstehen. Dies ist vor Verwendung des neuen Index zu testen.
- Für die Freigabeverknüpfung ist ein unveränderlicher Quellennachweis zu binden. Der Browser lädt keine juristischen Prüfnachweise nach. Die menschliche Erklärung wird ausserhalb des Browsers nachvollziehbar an die exakten Releasebytes gebunden.
- Der nächste ordentliche Jahrestermin bleibt `2027-11-15`. Die Anlassprüfung erfindet keine neue Jahresvollprüfung.

## 7. Menschliche Entscheide

| Entscheid | Vorhanden oder offen |
| --- | --- |
| Nationales Modell, Manifest 5 und Sozialkatalog 1 | Vorhanden, DEC-2026-024/025 |
| AVIG-Option B und Anwendungsfenster 2026–2027 | Vorhanden, AP19B-Abnahme |
| Fachlich-technische Integration C1/C2/C3 | Vorhanden, drei getrennte Abnahmen |
| Start der lokalen Gesamt-Releasevorbereitung | Vorhanden, Auftrag vom 28.09.2026 |
| Konsolidierter neuer Quellenbefund und bezeichnete Wiederverwendung für MVP 0.5 | **Offen**, nach Vorlage des tatsächlich ausgeführten Abgleichs |
| Konkrete Datenpromotion mit exakten Hash- und Freigabebindungen | **Offen**, aus Vorbereitungsauftrag nicht als operative Freigabe ableiten |
| E-/Q-Installation und deren Prüfungen | **Offen**, gesonderter konkreter Auftrag |
| GitHub-Publikation und P-Bereitstellung | **Offen**, gesonderter konkreter Auftrag und fortbestehende technische P-Gates |

David Steimer nimmt die Rollen in Personalunion wahr. Codex bereitet Bestandsaufnahme, Prüfung und Nachweise als Arbeitsinstrument vor und erteilt keine formelle fachliche oder betriebliche Freigabe.
