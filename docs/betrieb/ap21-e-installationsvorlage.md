# AP21 Getrennte Installation für die Geräteprüfung auf E

Stand: 8. Oktober 2026. Die lokale Bedienprüfung ist durch David bestätigt. Der getrennte E-Testkandidat ist gebaut und unten an seine Prüfsumme gebunden. **Noch keine Installation, keine Geräteabnahme und keine Releasefreigabe.** Der Auftrag zur Vorbereitung erlaubt weder einen Upload in den Tenant-App-Katalog noch eine Teams-App-Registrierung.

## Zweck und begrenzte Ziele

Die neue Datumseingabe wird auf echten Geräten in SharePoint und in der Teams-App geprüft. Der Testkandidat erhält eine eigene Paket-, Webpart- und Featureidentität. Er ersetzt das gemeinsame Betriebspaket nicht. Sein sichtbarer Name bezeichnet ihn ausdrücklich als AP21-Gerätetest.

| Ziel | Geplante Ergänzung | Unverändert |
| --- | --- | --- |
| SharePoint-Testsite «Fristenrechner Test» | Neue Seite `AP21-Datumseingabe.aspx`, Titel «AP21 – Datumseingabe (Gerätetest)», ausschliesslich mit dem neuen AP21-Webpart | Bestehende Rechnerseite, App, Navigation, Datenquellen und Berechtigungen |
| Team «Entwicklungsumgebung», Kanal «Fristenrechner» und zugehörige Teamsite | Neue AP21-Testinstanz und separate direkte Registerkarte «AP21 – Datumseingabe», nach dem zusätzlichen Teams-Haltepunkt | Aktuelle Registerkarte, historische AP5-Ansicht und ihre jeweilige Konfiguration |
| Bestehender Tenant-App-Katalog | Zusätzliches Paket mit eigenem Dateinamen und eigener Identität | Bestehendes Paket «Fristenrechner Schweiz» sowie dessen Assets und Berechtigungen |

Q, die historische AP5-Ansicht und P sind keine Installationsziele. Es werden keine neuen Infrastrukturangebote, Gäste, API-Berechtigungen oder SharePoint-Freigaben eingerichtet. «Zu allen Sites hinzufügen», automatische tenantweite Installation und eine Änderung bestehender Teamsrichtlinien sind ausgeschlossen. GitHub bleibt unverändert.

Die benannten Ziele und ihr letzter bekannter Paketstand stammen aus dem [dokumentierten MVP-0.6-Vollzug](eq-installation-mvp06.md). Vor einer Installation sind Identitäten, bestehende Instanzen und Berechtigungen gezielt neu zu lesen. Der historische Bericht ersetzt diese Liveprüfung nicht. Tenantadressen, interne IDs und Rohantworten gehören in den privaten Vollzugsbeleg, nicht in diese öffentliche Vorlage.

## Verbindliche Kandidatenbindung

Die folgende Tabelle bindet die tatsächlich gebaute Paketdatei und den [technischen Kandidatenvertrag](../../spfx/test-candidates/ap21-e/contract.json). Eine spätere Datei mit gleichem Namen gilt nicht automatisch als freigegeben. Jede Codeänderung oder jeder neue Paketbau verlangt eine neue Prüfsumme und erneute Bindung.

| Merkmal | Gebundener Wert |
| --- | --- |
| Kandidat | `ap21-e-device-2026-10-08.1`, Anzeigename «Fristenrechner AP21 E-Gerätetest» |
| Paketdatei | [fristenrechner-ap21-e-0.0.21.1.sppkg](../../outputs/ap21-e-testkandidat-2026-10-08/fristenrechner-ap21-e-0.0.21.1.sppkg) |
| Paketversion und Grösse | `0.0.21.1`, 289’704 Bytes |
| Paket SHA-256 | `a83a47fc930970f5086f37d2ccf3ad5ed91718fa30288077419853edcf7d56cf` |
| Solution-ID | `53750dd9-19a8-42f2-9bad-899090be3192` |
| Webpart-/Component-ID | `e85c1022-b793-43bd-a25e-06c7b0e290da` |
| Feature-ID | `88b5e961-a25e-44ff-9f99-38475d6c9d54` |
| Assetkennungen | Eigener Paketassetbereich, Bundlepräfix `ap21e-fristenrechner-web-part`, Ressourcenname `AP21EFristenrechnerWebPartStrings` |
| CSS-Namensraum | `ap21e-fr-`, getrennt von den Produktklassen |
| Persönliche Standards | `fristenrechner.ap21e.defaults.v1`, keine Migration oder Löschung bestehender Produktschlüssel |
| Daten-Cache | Eigene IndexedDB `fristenrechner-ap21e`, zusätzlich an den konkreten Mirror und das festgelegte Release gebunden |
| Sichtbarer Prüfhinweis | AP21 E-Gerätetest, keine Produktivfreigabe |
| Neue Seite | `AP21-Datumseingabe.aspx`, Titel «AP21 – Datumseingabe (Gerätetest)» auf «Fristenrechner Test» |
| Neue Teams-Registerkarte | «AP21 – Datumseingabe» im bezeichneten E-Kanal, direkte Integration erst nach dem Teams-Haltepunkt |
| Datenrelease | `2026-10-01-mvp-06-approved.1` |
| Manifestformat | `6.0.0` |
| Manifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Datenquelle | Je Ziel ausschliesslich dessen bestehender SharePoint-Mirror dieses MVP-0.6-Releases |
| Ergebnis und Kalenderexport | Alle Berechnungen sind technische Referenzfälle (`referenceOnlyAllCalculations: true`), ICS-Export ist vollständig gesperrt |

Der Kandidat erzwingt den Datenrelease und die Manifestprüfsumme technisch. Eine falsche oder unvollständige Netzlieferung wird nicht aktiviert. Nur ein bereits vollständig validiertes, exakt an dieses MVP-0.6-Release und denselben Mirror gebundenes Bündel aus dem eigenen E-Testcache darf als gekennzeichneter Fallback weiterlaufen. Ohne dieses passende Bündel bleibt der Rechner gesperrt. Kein Rückgriff auf andere Mirrors, AP22-Kandidatendaten, GitHub, Produktcache oder ein eingebautes Ersatzbündel. Der bestehende Mirror wird weder hochgeladen noch umgeschrieben. Seine elf Laufzeitdateien werden vor Gebrauch gegen das freigegebene lokale Bündel zurückgelesen und geprüft.

Der abschliessende lokale Kandidatenbau besteht 186 vorhandene Quelltests und 23 Prüfungen des gebauten Pakets, davon acht AP21-Bedienlogiktests und 15 Prüfungen der E-Isolation. 15 bestehende Lintwarnungen bleiben nicht blockierend dokumentiert. 153 gebundene Vorleistungsartefakte bleiben unverändert. Diese lokalen Ergebnisse ersetzen weder einen Paketreadback aus M365 noch eine Geräteprüfung.

Der AP21-Gerätetest verwendet denselben Stand der Datumskomponente wie die lokale Umsetzung. Die eigene Identität, Prüfkennzeichnung, Datenquellenbegrenzung und Speichertrennung sind Hostanpassungen. Sie erteilen keine operative Freigabe für AP22-Daten oder zusätzliche Rechtsprofile. Der [lokale AP21-Nachweis](../../outputs/ap21-2026-10-08/README.md) und die AP22C3-Abnahmekopie bleiben unverändert erhalten.

## Vorprüfung und Haltepunkte

| Schritt | Erforderlicher Nachweis | Abbruchbedingung |
| --- | --- | --- |
| E01 Lokales Paket | Paket und entpackte Metadaten stimmen mit der ausgefüllten Bindung überein. Build, Hosttests und Identitätstrennung sind bestanden. Betriebspaket und Produktpins sind unverändert | Abweichende Bytes, kollidierende Kennungen oder ungebundene Dateien |
| E02 Live-Ausgangsstand | Exakte zwei E-Sites, Team und Kanal identifiziert. Vorhandene Apps, betroffene Seiten/Registerkarten, Paketmetadaten und relevante Berechtigungen gesichert. Neue Namen und Kennungen kollidieren nicht | Bestehendes gleichnamiges Testobjekt ohne geklärte Herkunft oder abweichender Zielbestand |
| E03 Datenquelle | Pro E-Ziel elf bestehende Mirrordateien vollständig zurückgelesen. Release-ID, Manifesthash und sämtliche Artefakthashes stimmen | Fehlende Rechte, Hashabweichung, anderes Release oder unvollständige Lieferung |
| E04 Konkrete SharePoint-Freigabe | David bestätigt die gebundene Paketdatei, Prüfsumme, genau zwei neue E-Site-Appinstallationen, die neue Prüfseite und die begrenzten Tests | Nur Vorbereitungsauftrag oder erforderliche Rechteausweitung |
| E05 Direkter Teams-Host | Das organisationsinterne Teams-App-Manifest ist an die neue Component-ID gebunden. Seine neue App-Identität, der Katalogweg und der konkrete Zulassungsumfang sind dokumentiert und vor Registrierung separat freigegeben | Fehlende Teams-App-Registrierung, ungebundener App-Katalogeingriff oder notwendige Richtlinienänderung |

Bis E04 gibt es ausschliesslich lokale Arbeiten und begrenzte Leseprüfungen. Bei einem vorhandenen Zugriffsverbot wird nicht auf einen anderen technischen Schreibweg ausgewichen. E04 allein erlaubt keine neue Teams-App-Registrierung. Die direkte Teams-Integration benötigt für die neue Component-ID ein eigenes organisationsinternes Teams-App-Manifest beziehungsweise Appobjekt. Die Übernahme in den Teams-Katalog und dessen gezielte Zulassung sind in E05 konkret zu binden und gesondert freizugeben. Bereits jetzt werden weder Teams-Appobjekte erzeugt noch Apps synchronisiert oder registriert.

Ein SPFx-Upload macht den Kandidaten nicht automatisch als direkte Teams-App nutzbar. Der [dokumentierte Teams-Installationsweg](installation-und-betrieb-dritttenants.md#5-zusätzliche-installation-für-microsoft-teams) bleibt massgebend. Eine über die Teams-App «SharePoint» eingebundene Webseite ersetzt keinen Nachweis des direkten `TeamsTab`-Hosts. Sind allgemeine Richtlinien- oder Berechtigungserweiterungen nötig, wird der Teams-Teil angehalten. Die Produktiv-App und ihre bestehenden Zulassungen bleiben unberührt.

## Installation nach konkreter Freigabe

1. Die gebundene Kandidatendatei unter ihrem eigenen Dateinamen in den bestehenden App-Katalog aufnehmen. Jede Aufforderung zum Ersetzen des Betriebspakets oder zu einer tenantweiten Installation abbrechen. Keine zusätzlichen API-Berechtigungen bestätigen.
2. Paket und relevante ausgelieferte Assets frisch herunterladen. Rohbytes und SHA-256 mit dem freigegebenen lokalen Paket vergleichen. Bestehendes Betriebspaket und dessen relevante Berechtigungen müssen unverändert sein.
3. Den neuen Kandidaten ausschliesslich auf den zwei bezeichneten E-Sites installieren. Site-Appdetails, Solution-ID und Version je Site festhalten. Keine bestehende App aktualisieren.
4. Auf «Fristenrechner Test» die neue Seite `AP21-Datumseingabe.aspx` mit dem Titel «AP21 – Datumseingabe (Gerätetest)» erstellen und nur den neuen Webpart einsetzen. Den bisherigen MVP-0.6-Mirror der Site lesen, nicht verändern. Die neue Seite publizieren, ohne Startseite oder Navigation umzustellen. Die tatsächlich neu erzeugte Seiten-ID im privaten Vollzugsbeleg festhalten.
5. Erst nach E05 die gesondert gebundene neue Teams-App registrieren und gezielt bereitstellen. Im bestehenden Kanal «Fristenrechner» die direkte Registerkarte «AP21 – Datumseingabe» mit dem neuen Webpart einrichten. Neue Teams-App- und Registerkarten-IDs festhalten, Hostmeldung `Microsoft Teams` nachweisen. Den bisherigen MVP-0.6-Mirror der Teamsite verwenden. Aktuelle und historische Registerkarten weder umbenennen noch ersetzen. Ohne E05 endet die Vorbereitung des Teams-Teils vor der Katalogmutation.
6. Beide neuen Ansichten frisch öffnen. Kandidatenhinweis, Webpartkennung, tatsächlich geladenes Bundle, aktive Mirroradresse, Release-ID und Manifesthash prüfen. Für den Erstabruf ausschliesslich den eigenen AP21-Cache verwenden beziehungsweise gezielt leeren. Keine domainweite Speicherlöschung.
7. Die vor der Installation gesicherten Paketmetadaten und Konfigurationen der unmittelbar betroffenen bestehenden E-Instanzen erneut vergleichen. Damit wird keine vollständige Liveprüfung von Q oder P behauptet.

Ein fehlgeschlagener Schritt wird mit Zeitpunkt und Beleg dokumentiert. Kein «bestanden» aufgrund eines sichtbaren Seitentitels oder einer blossen Uploadmeldung. Zeigt die neue Ansicht das falsche Bundle oder einen nicht passend gebundenen Cachebestand, bleibt die Geräteprüfung gesperrt, bis die Ursache geklärt ist. Ein zulässiger, gekennzeichneter Fallback ist als solcher festzuhalten und ersetzt keinen erfolgreichen Netz-Erstabrufnachweis.

## Geräteprüfung

Die [AP21-Geräteprüfliste](../../outputs/ap21-2026-10-08/geraetepruefung.md) bleibt die fachliche Grundlage. Für diesen Kandidaten gilt zusätzlich: Alle Resultate sind Referenzfälle und der Kalenderexport ist durchgehend gesperrt. Die Prüfung einer zunächst verfügbaren Exportmöglichkeit und ihres Entfalls beim Tippen kann deshalb nicht als E-Gerätenachweis gezählt werden. Der lokale automatische Nachweis der Exportinvalidierung bleibt davon getrennt. Der E-Test ersetzt keinen bereits gebundenen lokalen Nachweis. Pro Lauf werden Paket- und Bundlehash, Zielansicht, Prüfperson, Datum, Schweizer Referenzdatum, Gerät, Betriebssystem und Browser-/Teamsversion festgehalten.

| Oberfläche | Prüfumfang |
| --- | --- |
| E-Prüfseite auf iOS Safari, Edge und Chrome | Direkte Texteingabe, sichtbares Format, Schrift und Linksbündigkeit, Kurzformen, Fehler, Kalender und Touchfokus |
| Neue E-Registerkarte in der tatsächlichen iOS-Teams-App | Derselbe Umfang im eingebetteten Host, kein Ersatz durch Teams im Desktopbrowser |
| E-Prüfseite auf macOS Chrome und Safari | Tab, Enter, Blur, direkter Berechnungsklick, Kalenderabbruch, Fokus und zweispaltiges Layout |
| Reale Geräte mit VoiceOver und 200 Prozent Zoom | Feldbeschriftung, Pflichtfeld, Fehlerzuordnung, Kalendertage, Dialogfokus und erreichbare Bedienelemente |

Je Oberfläche gehören die folgenden Kernfälle zum Lauf:

- `5` ergänzt den aktuellen Monat und das aktuelle Jahr, `16.9` das aktuelle Jahr. `h` und in Französisch `a` setzen das heutige Schweizer Datum. Die Übernahme fixiert jeweils ein vollständiges Datum. Enter berechnet nicht, Tab führt ins nächste Eingabefeld.
- `31.04`, `29.02.2027`, `16.9.26` und `h+10` bleiben sichtbar und sperren die Berechnung. `29.02.2028` ist syntaktisch gültig, kann aber unabhängig davon ausserhalb einer Fachfreigabe liegen.
- StPO, Bern, direkte Zustellung am `16.09.2026`, zehn Tage, Partei ohne Vertretung in Bern ergibt bei der passenden Feiertagsanknüpfung den Referenzwert `28.09.2026`. Tippen eines neuen Zeichens entfernt sofort das Resultat. Ein ungültiger Entwurf darf keine Rechnung mit dem früheren Datum auslösen. Die Exportmöglichkeit bleibt unabhängig davon stets gesperrt.
- Hauptdatum, besondere politische Anker, Beschaffungsbeginn und sozialrechtliches Zuständigkeitsdatum verwenden dieselbe Bedienung. Rollenwechsel und Zurücksetzen bringen keine verdeckten Altwerte zurück.
- Kalenderauswahl, Löschen und Abbruch funktionieren. Der Abbruch erhält den zuvor sichtbaren Entwurf. DE/FR-Wechsel erhält verständliche Beschriftungen und Fehlermeldungen.
- Nur synthetische Angaben verwenden. Datum, Referenz und Resultat werden nicht als persönliche Standards gespeichert. Es werden weder ICS-Dateien erzeugt noch Termine in Outlook importiert.

Neue Teststandards werden ausschliesslich im eigenen AP21-Speicher angelegt und anschliessend auf den zuvor dokumentierten Zustand zurückgesetzt. Die Formulierung «iOS bestanden» setzt tatsächliche Läufe voraus. Eine schmale Desktopansicht, jsdom oder ein anderes iOS-Programm ist kein Ersatz für die jeweils genannte Oberfläche.

## Rückfall und spätere Bereinigung

Der Rückfall erfordert keinen Downgrade des Betriebspakets, weil dieses nicht ersetzt wird. Bei einem technischen Fehler zuerst den neuen Kandidaten nicht weiterverwenden, Befund und aktuelle Objekt-IDs sichern und nur die neuen E-Testansichten aus dem Prüfzugang nehmen. Die bestehenden Rechner bleiben die Rückfallansichten.

Eine Freigabe der untenstehenden Installation umfasst den begrenzten Rückfall: ausschliesslich die neu erzeugte AP21-Registerkarte entfernen und die neue AP21-Prüfseite über den SharePoint-Papierkorb wiederherstellbar entfernen. Zuvor Seiteneinstellungen und Registerkartenkonfiguration sichern. Keine bestehende Registerkarte, Seite oder Navigation löschen.

Die anschliessende Bereinigung von Site-Testapps, SharePoint- und Teams-App-Katalogeinträgen sowie Paketassets erfolgt erst nach gesonderter Zustimmung und einer gezielten Prüfung, dass keine weitere Testinstanz darauf verweist. Paketdatei, Buildbelege und Vollzugsprotokoll bleiben archiviert. Assets nicht manuell pauschal löschen. Ein App-Paket wird nicht allein aufgrund seines Anzeigenamens entfernt. Bei fehlender technischer Wiederherstellbarkeit ist vor der Entfernung erneut zu entscheiden.

## Vorlage für die konkrete Freigabe

Diese Freigabe betrifft E04. Die neue Teams-App-Registrierung bleibt bis zum gesondert konkretisierten E05-Haltepunkt ausgeschlossen:

> Ich gebe die Installation von `fristenrechner-ap21-e-0.0.21.1.sppkg`, Version `0.0.21.1`, mit SHA-256 `a83a47fc930970f5086f37d2ccf3ad5ed91718fa30288077419853edcf7d56cf` und den oben gebundenen technischen Identitäten als zusätzliches Paket im bestehenden Tenant-App-Katalog und ausschliesslich auf den Sites «Fristenrechner Test» und «Entwicklungsumgebung» frei. Auf «Fristenrechner Test» darf die neue Seite `AP21-Datumseingabe.aspx` mit dem Titel «AP21 – Datumseingabe (Gerätetest)» eingerichtet werden. Die Instanzen verwenden ausschliesslich ihren jeweiligen bestehenden, unveränderten MVP-0.6-Mirror mit der gebundenen Manifestprüfsumme. Anschliessend dürfen die beschriebenen technischen Tests durchgeführt und die realen Geräteprüfungen vorbereitet werden. Ausschliesslich synthetische Referenzfälle, kein Kalenderexport. Die neue Teams-App-Registrierung, Katalogübernahme und gezielte Zulassung benötigen die gesonderte E05-Freigabe. Bei einem Fehler dürfen ausschliesslich die neu erzeugten Testansichten nach dem beschriebenen Rückfall entfernt werden. Das Betriebspaket, bestehende Instanzen, Q, die historische AP5-Ansicht, P, GitHub, M365-Berechtigungen und Richtlinien bleiben unverändert. Die Entfernung von Testapps und Katalogpaketen wird gesondert entschieden.

Die nachfolgende Geräteabnahme liegt bei David Steimer. Codex führt die beauftragten technischen Schritte aus und dokumentiert deren tatsächliche Ergebnisse, ohne formelle Freigabe- oder Haftungsverantwortung.
