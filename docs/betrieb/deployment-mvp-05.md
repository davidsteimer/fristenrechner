# MVP 0.5 · Lokale Releasevorbereitung und Bereitstellungsplan

Stand: 28. September 2026. **Quellenprüfung abgenommen, definitive Builds und die anschliessend konkret freigegebene E-/Q-Installation ausgeführt. Technischer Eigentümer-Prüfumfang abgeschlossen. Q fachlich abgenommen, reale Anmeldung mit bestehendem B2B-Gast durch David als durchgeführt bestätigt. Outlook Web geprüft, Outlook Desktop manuell bestätigt. Keine GitHub-, P-Publikations- oder P-Betriebsfreigabe.**

David Steimer hat nach der [Abnahme AP19C3](../fachrecht/abnahme-ap19c3.md) erklärt: «Dann starten wir die Releasevorbereitung und hoffen auf den Support.» Dieser Auftrag startet die lokale Zusammenführung des abgenommenen AP19-Stands. Er autorisiert weder E-/Q-Eingriffe noch GitHub-Schreibzugriff, Hostingänderungen oder eine erneute Supportanfrage.

Die anschliessende [Quellenabnahme und lokale Baufreigabe](../fachrecht/abnahme-quellenpruefung-mvp05.md) erlaubt die kontrollierte Übernahme. Anwendung **`0.5.0`**, SPFx-Paket **`0.5.0.0`** und Datenrelease **`2026-09-28-mvp-05-approved.1`** sind lokal erzeugt. Der [definitive lokale Nachweis](releaseartefakte-mvp-05.md) bindet die tatsächlichen Dateien und Prüfsummen. Die frühere technische Vorprüfung bleibt unverändert als historischer Eingang erhalten.

Die spätere gesonderte, prüfsummengebundene Installationsfreigabe und ihr tatsächlicher Vollzug sind im [E-/Q-Installations- und Prüfbericht](eq-installation-mvp05.md) dokumentiert. Dessen 123 bestandene technische Prüfpunkte decken den konkretisierten Eigentümer-Prüfumfang ab. Die anschliessende [Q-Abnahme und Bestätigung der realen Gastanmeldung](abnahme-q-mvp05.md) sind separate menschliche Nachweise. Der anschliessende [Outlook-Webimport mit Bereinigung](outlook-pruefung-mvp05.md) ist tatsächlich durchgeführt, die Desktop-Prüfung durch David bestätigt. Historische Eingangs- und Baubelege werden dadurch nicht rückwirkend umgeschrieben.

## 1. Umfang und Ausgangsstand

| Gegenstand | Geplanter Releaseumfang beziehungsweise gesicherte Abgrenzung |
| --- | --- |
| AP19 | Abgenommene erste Integrationstranche mit ELG, AVIG-ALE und KVG-OKP sowie überführten IVG-/AHVG-/UVG-Pfaden |
| Sozialmodell | 24 nationale Regeln, 28 konkrete Berner Anbindungen und getrennte Freigabeeinträge. Keine pauschale ATSG-, KVG- oder gesamtschweizerische Produktfreigabe |
| Verträge | Sozialverfahrenskatalog `1.0.0`, Manifest-/Consumerformat `5.0.0` gemäss [DEC-2026-025](../entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md) |
| Kalender und übrige Verfahren | Bisherige CH-/BE-Laufzeitkalender und bestehende Verfahren erhalten. Der schweizweite Feiertagskatalog bleibt Grundlage, ohne zusätzliche Kantone operativ zu aktivieren |
| Zeitliche Freigabegrenzen | Nur die jeweils belegten und abgenommenen Intervalle. Quellenabdeckung muss Eröffnung, Zählung und Endverschiebung umfassen. AVIV-Nachweismethode Option B bleibt ausdrücklich erkennbar |
| Oberfläche | Abgenommene reduzierte DE-/FR-Oberfläche, zweispaltiger Aufbau, frühe Datumseingabe und Zusatzinformationen in der Rechenspur |
| E/Q | Ausgangsbaseline `0.4.0.1` vor dem Eingriff live bestätigt. Inzwischen vier bestehende Instanzen auf `0.5.0.0` und neue same-site Mirrors umgestellt. Technischer Prüfbericht abgeschlossen, Q fachlich abgenommen und reale Gastanmeldung durch David bestätigt |
| P | Nach letztem verifizierten Stand MVP 0.3. MVP-0.4-Umschaltung am 23. September vor Austausch produktiver Dateien angehalten |
| GitHub | MVP 0.4 am 22. September publiziert. AP19-Publikation und ein allfällig nötiger temporärer Schreibschlüssel sind gesondert freizugeben |

Die AP19-Abnahmen und ihre gebundenen Kandidaten bleiben historische Nachweise. Insbesondere wird der [C3-Kandidat](../../data/candidates/2026-09-28-ap19c3/manifest.json) nicht nachträglich überschrieben. Ein freigegebener Folgestand entsteht in einem neuen Releaseordner. Die frühere [MVP-0.4-Planung](deployment-mvp-04.md) wird nicht rückwirkend umgeschrieben.

## 2. Haltepunkte und Reihenfolge

| Schritt | Ergebnis | Grenze beziehungsweise erforderlicher Entscheid |
| --- | --- | --- |
| 1 · Quellen und Umfang | Betroffene Quellen inventarisiert, letzte vollständige Jahresprüfung und aktuelle Einzelprüfungen sauber zugeordnet, offene Befunde mit Massnahmen | [Release-Checkliste](release-checkliste.md) und [AP13](periodische-quellenpruefung-ap13.md) gelten. Eine technische Quellenprüfung ist keine menschliche Quellenabnahme |
| 2 · Lokaler Freigabekandidat | Abnahmegegenstand mit exakten Kandidaten-, Quellen-, Referenz- und Komponentenständen vorbereitet | Kein erfundenes `approved`, `approvedBy` oder Abnahmedatum. Vor operativer Datenfreigabe muss der hierfür massgebende menschliche Entscheid eindeutig gebunden sein |
| 3 · Datenübernahme und definitive Builds | Neuer vollständiger Datenrelease, SPFx-Paket, Mirrorpaket und statische P-Ausprägung gemeinsam geprüft und hashgebunden | Erst nach erfüllter Quellen-/Datenfreigabe. Kein Hostingzugriff, Mirrorwechsel oder Installationsrecht aus einem erfolgreichen lokalen Build |
| 4 · E-/Q-Vorprüfung | Tatsächliche Instanzen, Versionen, Datenpfade, Zugriffe und wiederherstellbarer Ausgangsstand erfasst | Konkrete, prüfsummengebundene Installationsfreigabe für das neue Paket und die betroffenen Ziele einholen |
| 5 · E, danach Q | Technische Zielumgebungstests gegen exakt denselben App-/Datenstand | E-Fehler zuerst klären. Für vorgezogene interne Q-Kandidatenprüfung ist eine neue, ausdrücklich begrenzte Ausnahme erforderlich |
| 6 · Manuelle Q-Abnahme | Am 28. September 2026 durch David erteilt. Reale Anmeldung mit bestehendem B2B-Gast ebenfalls als durchgeführt bestätigt | [Gebundene Abnahmenotiz](abnahme-q-mvp05.md). [Outlook-Prüfungen abgeschlossen](outlook-pruefung-mvp05.md), nachfolgende Publikationsfreigaben bleiben separat |
| 7 · GitHub | Geprüfter öffentlicher Dateiumfang und unveränderlicher Datenpin veröffentlicht und byteweise verifiziert | Gesonderte Publikationsfreigabe. Neue Deploy-Keys nur mit neuer ausdrücklicher Autorisierung und anschliessender Entfernung |
| 8 · P | Aktuelle Sicherung, temporäre Hostingvorprüfung, kontrollierte Umschaltung, öffentliche Matrix und Betriebsentscheid | Hostingbefund muss belastbar geklärt sein. Eigene Bereitstellungs- und anschliessende Betriebsfreigabe erforderlich |

**Vorgeschlagene Reihenfolge: lokale Freigabereife → E → Q → manuelle Q-Abnahme → GitHub → P.** Sie übernimmt das bewährte Vorgehen, nicht die damaligen Berechtigungen. Die MVP-0.4-Ausnahme von [DEC-2026-016](../entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md) war auf den bezeichneten Kandidaten begrenzt. Sie ist keine generelle Erlaubnis, unfertige Folgeversionen in Q zu aktivieren. Ohne neue Ausnahme gilt weiterhin: Q ausschliesslich mit vollständig freigegebenen App- und Datenständen. Ein externer Q-Demobetrieb folgt nicht aus einer internen Abnahmeinstallation.

David nimmt Fachverantwortung, Betrieb und Freigabe weiterhin in Personalunion wahr. Codex bereitet vor, implementiert und dokumentiert als KI-Arbeitsinstrument, ohne formelle Freigabeverantwortung.

## 3. Zusammengehörige Artefakte

Der definitive Datenstand umfasst elf Laufzeitdateien: Manifest, fünf Rechtsprofile, zwei Regelkalender, verbleibender Spezialregimekatalog, Feiertagskatalog und Sozialverfahrenskatalog. Die tatsächliche Manifestliste und der byteweise geprüfte Mirror sind verbindlich.

- Die rechtlichen Intervalle und zeitlichen Normbindungen des tatsächlichen C3-Kandidaten sind vollständig vorhanden und bei der Promotion gegen die abgenommenen Zeitnachweise und den gesamten Rechenweg verifiziert. Die Gesamtquellenprüfung ist abgenommen. Die 28 Freigaben binden den tatsächlichen menschlichen Entscheid, keine synthetischen Testfreigaben.
- Manifest, Komponenten, Freigaben, Quellen- und Referenzbindungen müssen vollständig validieren. Die zwölf bisherigen Sozialpfade dürfen nicht gleichzeitig im alten und im neuen aktiven Vertrag angeboten werden.
- Frühere freigegebene Releases und die abgenommenen C1-/C2-/C3-Kandidaten bleiben unverändert. Auch die historischen Quell-/Buildnachweise werden nicht auf einen neuen Status umgeschrieben.
- Datenpin, SPFx-Fallback und statisch eingebettete P-Daten müssen den jeweils ausdrücklich dokumentierten Stand verwenden. Ein Format-5-Release darf nicht einem Format-4-Consumer untergeschoben werden.
- Der neue Releaseordner wird in jedem freigegebenen same-site Mirror vollständig bereitgestellt und danach Datei für Datei gegen das Manifest geprüft. Keine Teilaktualisierung bestehender JSON-Dateien.
- Der Governance-Bestand aus Quellenregister, Index und neuen Prüfereignissen wird getrennt vom Laufzeitrelease behandelt. Der Laufzeitpfad zeigt niemals auf den Governance-Ordner.
- Der statische P-Build lädt keine Livequellen und keinen SharePoint-Mirror. Kein zusätzlicher Hostinganbieter, keine neue Infrastruktur und keine neue API-Berechtigung.
- Der Publikationsumfang erhält eine explizite Dateiliste. `Userinput/`, private Ausgangsunterlagen, `.work`, lokale Backups und der vorbestehend geänderte historische Word-Projektplan werden nicht automatisch aufgenommen.

Eine lokale Buildprüfung ist noch keine Prüfung des tatsächlich installierten Pakets. Nach der späteren Installation sind die sichtbare Datenquelle, Release-ID und tatsächliche Berechnung auf jeder Instanz erneut nachzuweisen.

Der ausschliesslich lokale Datencommit `3109c39730f10d31cb6c57200b36dd5091d7bcd1` enthält nur den neuen Datenordner. Beide SPFx-Standardpins verweisen unveränderlich darauf. Dieser Commit ist noch nicht veröffentlicht. Eine vorgezogene E-/Q-Installation benötigt deshalb auf jeder aktuellen Instanz den ausdrücklich konfigurierten, vollständigen same-site SharePoint-Mirror. Der noch nicht öffentlich verfügbare GitHub-Pin ist kein einsatzfähiger Rückfallpfad. Vor einer neuen Installation auf Dritt-Tenants ist der Pin gesondert zu publizieren und öffentlich byteweise zu verifizieren.

Der [lokale Eingangssnapshot](../../outputs/release-mvp05-2026-09-28/preparation-inputs.json), erzeugt durch `scripts/prepare-mvp05-inputs.mjs`, bindet 30 tatsächliche Eingangsbelege und die verbleibenden Haltepunkte. Er ist weder ein freigegebenes Release-Manifest noch eine Installationserlaubnis. Die [erneute lokale technische Vorprüfung](vorpruefung-mvp-05.md) und die [zusammengeführte Quellenvorlage](../fachrecht/quellenabgleich-mvp05.md) liegen vor. Ein statischer Build mit ausdrücklich gewähltem C3-Kandidaten bleibt eine lokale Kandidatenprüfung und aktiviert keinen neuen Release.

## 4. E-/Q-Installation und Rückfall

E und Q teilen die Paketidentität im Tenant-App-Katalog. Bereits dessen Austausch kann den gemeinsamen Code aller bestehenden Instanzen betreffen. Die Reihenfolge der Seitenprüfungen bewirkt keine vollständige Versionsisolation.

Unmittelbar vor einem autorisierten Eingriff sind deshalb die vier bekannten Zielinstanzen sowie unerwartete weitere Paketverwendungen zu prüfen. Zu sichern sind das tatsächliche aktuelle Paket, Seiten-/Registerkartenkonfigurationen, Provider-/Mirrorpfade und der zugehörige vollständige Datenstand. Bei unbekannten zusätzlichen Instanzen, nicht wiederherstellbarem Ausgangsstand oder zusätzlich nötigen Rechten wird angehalten.

Die historische E-Registerkarte **«V0.1 - Fristenrechner Schweiz» behält ihren AP5-Datenstand**. Sie wird wegen des gemeinsamen Codes als Kompatibilitätsfall geprüft, aber nicht auf den neuen Mirror umgestellt. Eine alte Datenquelle ist dort beabsichtigt. In den aktuellen E-/Q-Rechnern wäre derselbe Rückfall dagegen kein bestandener MVP-0.5-Test.

Erst alle neuen Mirrordateien bereitstellen und prüfen, danach das exakt freigegebene Paket aktivieren und die Zielinstanzen kontrolliert aktualisieren. Bestehende Konfigurationen können alte Pfade behalten. Jede aktuelle Instanz muss daher ausdrücklich auf den neuen jeweiligen same-site Mirror zeigen und auch ohne vorhandenen gültigen Datencache erstmals laden. Q-Mitgliedschaften, gruppenbasierte Leserechte und Conditional-Access-Vorgaben bleiben unverändert. Keine neuen Gastpersonen und keine direkten Einzelrechte.

Für einen Rückfall wird die unmittelbar vor dem Eingriff verifizierte Baseline verwendet, nicht ungeprüft eine ältere lokale Sicherung. Datenpfade und nötigenfalls das Paket werden zusammenhängend zurückgestellt und alle betroffenen E-/Q-Instanzen kontrolliert. Neue Release- und Mirrorordner bleiben als Nachweis erhalten. Eine Mischung alter und neuer Komponenten ist kein gültiger Rückfall.

## 5. Prüfmatrix für den Folgerelease

Die [bestehende T01–T19-Matrix](deployment-release-2-mvp-03.md) und die [öffentliche D01–D12-Matrix](deployment-oeffentliche-p-auspraegung-ap16.md) bleiben die Basis. Die folgenden Zeilen definieren den Sollumfang. **Der tatsächliche E-/Q-Stand ist getrennt im [Installations- und Prüfbericht](eq-installation-mvp05.md) belegt. Die Sollmatrix wird nicht pauschal als bestanden erklärt.** E-SP, E-Teams, Q-SP, Q-Teams und P erhalten jeweils ihren tatsächlichen Status und Nachweis. Nicht anwendbare oder nicht ausführbare Schritte werden begründet, nicht stillschweigend als bestanden übernommen.

| ID | Prüfumfang und erwartetes Ergebnis |
| --- | --- |
| R05-01 | App-/Paketversion, Datenrelease, Format 5 und vollständige Validierung sichtbar beziehungsweise technisch nachgewiesen. 24 nationale Regeln und 28 ausschliesslich freigegebene BE-Anbindungen korrekt aufgelöst |
| R05-02 | Bestehende StPO-/ZPO-/BGG-/VwVG-/VRPG-, Beschaffungs- und politische-Rechte-Fälle unverändert. StPO, Zustellung 16.09.2026, zehn Tage ergibt 28.09.2026 |
| R05-03 | Zwölf migrierte IVG-/AHVG-/UVG-Pfade behalten Ergebnisse und Sperren. Kein doppelter alter Sozialpfad, kein unqualifizierter ATSG-Sammelrückfall |
| R05-04 | ELG: vier Pfade einschliesslich fixer 30 Tage, ausdrücklicher Tagesdauer und eng begrenzter formeller Beschwerdeverbesserung. Referenz R01 ergibt 16.10.2026, Winterreferenz R04 ergibt 11.01.2027 |
| R05-05 | AVIG-ALE: beide Zuständigkeitsrouten getrennt, erforderliche Falltatsachen und zeitliche Zuordnung erhalten. Grenzfälle R23–R25 um Februar 2027 ergeben 03.03.2027, 01.02.2027 und 01.02.2027. Option B bleibt als Nachweismethode erkennbar |
| R05-06 | KVG-OKP: vier individuelle Leistungspfade, Berner Wohnsitz als kenntlich gemachte Verwaltungsproduktgrenze, im Gerichtsverfahren gesonderte Zuständigkeit. Kein Filter aus dem Versicherersitz. R09/R10 ergeben 09.03.2026, R11 ergibt 26.05.2026 |
| R05-07 | Alle übernommenen positiven und negativen [AP19B-Referenzen](../fachrecht/referenzfaelle-ap19b.md) gegen den echten freigegebenen Resolver. Ausschlüsse, fremde Anbindungen, unbekannte Tatsachen und Überschreitung der Quellenabdeckung bleiben ohne Enddatum |
| R05-08 | DE/FR, konsequente zwei Spalten, frühe Datumseingabe und kontrollierter Erlasswechsel. Datum bleibt bei fachlich kompatiblen Übergängen erhalten. Keine redundante Dokumentauswahl, keine Zusatzcheckbox, modellierte Zuständigkeit in der Rechenspur |
| R05-09 | Defaults nur für erlaubte Präferenzen. Falltatsachen, Datum und Kalenderreferenz werden nicht persistiert. Leere oder unvollständige Kontexte rechnen nicht trotz aktivem Datumseingabefeld |
| R05-10 | Erstabruf aus jedem neuen same-site Mirror ohne gültigen Cache. Fehlende, manipulierte oder nicht freigegebene Komponenten werden atomar verworfen. Ein alter Cache oder Fallback wird nicht als neuer Release ausgegeben |
| R05-11 | Historische AP5-Ansicht behält bewusst ihre Datenquelle und funktioniert mit gemeinsamem Code. MVP-0.4-Kompatibilität und kontrollierter vollständiger Rückfall bleiben nachweisbar |
| R05-12 | Kalenderexport nur aus gültigem aktuellem Resultat. Datum, ganztägig, frei, Referenz, Kategorie und Erinnerung unverändert. Reale ICS-Datei aus SharePoint und Teams prüfen, nicht nur den Klick auf die Schaltfläche |
| R05-13 | Q-Zugriffe und Berechtigungsdelta unverändert. Tatsächlicher Gasttest nur mit bereits berechtigtem Konto und zulässigem Anmeldeweg. Ein nicht möglicher Gasttest bleibt offen und wird nicht als Appfehler oder bestandener Test umgedeutet |
| R05-14 | Manuelle Q-Abnahme durch David für die konkret gebundene Kombination aus Paket und Datenrelease dokumentiert |
| R05-15 | P: statische Assets und eingebettete Daten entsprechen dem geprüften Build. D01–D12 einschliesslich funktionaler Fälle, Datenschutz, Lizenzen und effektiver Sicherheitsheader neu geprüft |

Die genannten Datumsreferenzen gelten nur zusammen mit sämtlichen qualifizierten Eingaben ihrer gebundenen Testfälle. Sie sind keine verkürzten unabhängigen Rechtsauskünfte.

Die früher offenen Outlook-Importtests T15/T16 aus MVP 0.4 bleiben historische Angaben. Für MVP 0.5 sind der tatsächlich ausgeführte Webimport mit anschliessender Bereinigung und Davids manuelle Desktop-Bestätigung im [Outlook-Abschlussnachweis](outlook-pruefung-mvp05.md) dokumentiert. Die 123 technischen Hostpunkte werden dadurch nicht umgezählt.

## 6. Hostingbefund und P-Haltepunkt

Der [dokumentierte Hostingstand](../fachrecht/sozialversicherungsrecht-ap19.md#7-abgrenzung-zu-mvp-04) bleibt offen: Bei der MVP-0.4-Vorprüfung fehlten Sicherheitsheader teilweise in echten GET-Antworten, obwohl HEAD-Antworten sie auswiesen. Daneben waren mehrfache `Cache-Control`-Header Gegenstand der Anfrage. Die vom Benutzer mitgeteilte Green-Zwischenantwort vom 24. September kündigte eine weitere Analyse an, keine Behebung. Dieser Plan enthält keinen neuen Livebefund.

Die lokale Releasevorbereitung kann weiterlaufen. **Öffentliche Umschaltung bleibt angehalten**, bis Ursache und kleinste tragfähige Korrektur geklärt, allfällige Hostingänderungen ausdrücklich autorisiert und die tatsächlichen Antworten erneut geprüft sind. Eine Supportzusage oder ein guter HEAD-Test genügt nicht. Erforderlich sind insbesondere reale GET-Antworten für HTML und ausgelieferte Ressourcen, wirksame Sicherheitsheader, nachvollziehbare Cache-Regeln und ein erfolgreicher Browsertest. Die bestehende steimer.ch-Infrastruktur bleibt zwingend.

Ob der noch ausstehende P-Schritt von MVP 0.4 später durch die unmittelbare Bereitstellung von MVP 0.5 abgelöst wird, wird anhand der dann vorliegenden Nachweise ausdrücklich entschieden. Dieser Plan verwirft weder den freigegebenen MVP-0.4-Stand noch übernimmt er dessen Hostingfreigabe auf neue Dateien.

Vor jeder späteren P-Bereitstellung werden aktueller vollständiger Webbestand und Konfiguration neu gesichert. Erst temporäre Vorprüfung, dann ausdrücklich freigegebene Umschaltung, dann öffentliche Matrix. Bei Fehlern wird der gesicherte vollständige Ausgangsstand wiederhergestellt. Root-Webauftritt und Sitemap bleiben ohne konkreten Änderungsbedarf und Auftrag unverändert.

## 7. Abschlussnachweis

Der spätere Abschluss enthält nur die tatsächlich erreichten Ergebnisse: Quellstand, endgültige Versionen, Datenrelease-ID, Artefaktprüfsummen, Quellenabnahme, Testergebnisse pro Umgebung, manuelle Entscheide und deklarierte Restpunkte. Historische Ergebnisse bleiben historische Ergebnisse. Private Tenant-, Konto- und Hostingdetails gehören nicht in den öffentlichen Nachweis.

Diese Planung ist bewusst schlank. Die vorhandenen fachlichen Abnahmen, Referenzen und Checklisten werden weiterverwendet, nicht nochmals in parallelen Formularen erhoben. Neue Nachweise entstehen dort, wo sich Stand oder Zielumgebung tatsächlich ändern.
