# MVP 0.4: Releasevorbereitung und kontrollierte Bereitstellung

Stand: 22. September 2026. **Publikationspaket lokal abgeschlossen, Quellenprüfung und fachliche Q-Abnahme erteilt. `0.4.0.1` ist auf allen vier E-/Q-Instanzen installiert, eigenständige Erstabrufe, Rechen-/Sperrfälle und U01–U03 sind bestanden. AP5-Kompatibilität, Q-T-U04-Gegenlauf und Q-Rechteabgleich sind bestanden. SharePoint ist durch den Benutzer positiv gegengeprüft, ohne neue instrumentierte 768-Pixel-Messung. Kein aktueller Produktblocker aus den Darstellungsbefunden. Tatsächlicher Gasttest, Q-Demofreigabe, Outlook T15/T16 und bedingte Prüfungen bleiben gesondert ausgewiesen. Keine GitHub-, P- oder Betriebsfreigabe.**

Die [E-/Q-Vorprüfung](eq-vorpruefung-mvp04.md) dokumentiert den lokalen Freeze, die gesicherte Tenantbaseline, den fehlgeschlagenen E-Versuch und den bestätigten Katalog-/Laufzeitrückfall mit seinen Metadatengrenzen. Die [Korrekturvorbereitung `0.4.0.1`](spfx-korrekturkandidat-mvp04-0401.md) bleibt ein eigener historischer Nachweis. Der [E-/Q-Wiederholungsversuch `0.4.0.1`](eq-wiederholungsversuch-mvp04-0401.md) dokumentiert die erneute Autorisierung, aktuelle Prüfergebnisse, fachliche Q-Abnahme und den lokalen Abschluss mit seinen verbleibenden Grenzen.

David Steimer hat [AP18C abgenommen und den Release beauftragt](../fachrecht/abnahme-ap18c.md). Der Release bündelt AP17 mit der Schweizer Feiertagsgrundlage AP18. Die Produktversion folgt auf MVP 0.3 als `0.4.0`. Nach dem verworfenen ersten SPFx-Paket `0.4.0.0` wurde die reine Paketkorrektur `0.4.0.1` separat autorisiert, installiert und geprüft. Anwendung, WebPart-Version und alle Datenformate bleiben unverändert. Dies ist keine neue Architekturentscheidung und keine weitere Datenformatänderung.

## Umfang und unveränderte Grenzen

- Gestufte VRPG-Bedienung mit allgemeinem VRPG, Sozialversicherungsrecht, politischen Rechten und Beschaffungsrecht.
- 16 abgenommene AP17-Zuordnungen, vier weiterhin gesperrte Sammelpfade und unveränderte technische Fallabdeckung 2026–2027.
- Schweizer Feiertagskatalog mit 479 Regeln und vier Sprachfeldern, operative Projektion nur der zwölf bisherigen CH-/BE-Feiertagsregeln.
- Kalenderkomponente `2.0.0`, Spezialregimekomponente `3.0.0`, Feiertagskatalog `1.0.0`, Manifest-/Consumerformat `4.0.0`.
- Keine zusätzlichen kantonalen Fristenprofile, keine Kalender-App und keine Karte.
- Bestehende Grenzen SO, GR, NE sowie eigenständiges kommunales Recht bleiben bestehen.
- Keine neuen Microsoft-Graph- oder sonstigen API-Berechtigungen. Lokale Defaults und ICS-Export bleiben bestehen.

## Freigaben und Ablauf

| Schritt | Stand | Freigabegrenze |
| --- | --- | --- |
| AP17-Fachabnahme und technischer Vertrag | Erteilt, DEC-2026-020 | Keine zusätzlichen Fachpfade |
| AP18C-Abnahme und technischer Vertrag | Erteilt, DEC-2026-023 | Bindung an den geprüften Kandidaten |
| Quellenprüfung unmittelbar vor Release | Durch David Steimer abgenommen. 120 unterschiedliche IDs, 119 unverändert, ein bekannter AI-Quellenkonflikt mit ausdrücklich unveränderter Behandlung | [Abnahme und Hashbindung](../fachrecht/abnahme-quellenpruefung-mvp04.md). Keine rückwirkende Umdatierung oder Publikations-/Deploymentfreigabe |
| Lokale Datenpromotion | Abgeschlossen, Datenpin `739876a0d11b550ea8cc702622ab22af321994a5` | Neuer eigener Ordner, historische Kandidaten unverändert. Commit noch nicht veröffentlicht |
| Web- und SPFx-Releasebuild | Lokal gebaut und technisch geprüft | Paket-, Mirror- und Webprüfsummen unten. Keine Zielumgebungsprüfung vorweggenommen |
| Publikationsvorprüfung P01/P02 | [Bereinigung gemäss Nutzerentscheid](publikationsbereinigung-mvp04.md) | Zwei getrennte öffentliche V0.9-/V0.10-Kopien, private Originale unverändert. Lebende IT-Unterlagen auf MVP 0.4 aktualisiert. Keine Publikationsfreigabe |
| E-/Q-Installation und Mirror | Versuch mit `0.4.0.0` in E gescheitert und rückabgewickelt. Vier neue Mirrors vollständig und byteweise geprüft erhalten | [Ausführungsnachweis](eq-vorpruefung-mvp04.md). Die ursprüngliche Freigabe deckt `0.4.0.1` nicht ab |
| SPFx-Korrekturkandidat `0.4.0.1` | Auf allen vier E-/Q-Instanzen installiert. G01, F01–F09, N01–N04 und U01–U03 bestanden, AP5 und Q-T-U04 separat bestanden. Q-Rechte unverändert | [Aktueller Nachweis](eq-wiederholungsversuch-mvp04-0401.md). SharePoint-Benutzergegencheck positiv, alte Messung nicht umgedeutet, kein aktueller Darstellungsblocker |
| Interne Q-Abnahme | Fachlich durch David Steimer am 22.09.2026 erteilt | [Erklärung und genaue Standbindung](eq-wiederholungsversuch-mvp04-0401.md#fachliche-q-abnahme-vom-22-september-2026). Keine pauschale technische, Publikations- oder Betriebsfreigabe |
| Lokales Publikationspaket | Auf ausdrücklichen Benutzerauftrag abgeschlossen | SharePoint positiv gegengeprüft. Tatsächlicher Gasttest und Q-Demofreigabe, Outlook T15/T16 sowie bedingte Prüfungen bleiben deklariert. Kein Push und keine P-Bereitstellung |
| GitHub-Veröffentlichung | Noch nicht erfolgt, fachliche Q-Abnahme liegt vor | Konkreter Veröffentlichungsumfang und Schreibzugriff gesondert bestätigen |
| P-Bereitstellung auf steimer.ch | Noch nicht erfolgt | Eigene ausdrückliche Hostingfreigabe, Sicherung und öffentliche Prüfung |
| Betriebliche Freigabe | Noch nicht erfolgt | David Steimer nach bestandenen Zielumgebungsprüfungen |

Die fachlich-technische Abnahme autorisiert die lokale Releasevorbereitung. Die [bisherige begrenzte Installationsfreigabe](eq-installationsfreigabe-mvp04.md) galt für den exakt gebundenen Kandidaten `0.4.0.0`. Nach dessen E-Fehler hat David Steimer den [Wiederholungsversuch mit `0.4.0.1`](eq-wiederholungsversuch-mvp04-0401.md) eigens und prüfsummengebunden freigegeben. Dessen tatsächliche Installation und Tests sind inzwischen gesondert nachgewiesen, die anschliessende fachliche Q-Abnahme ist dokumentiert. Weder GitHub noch P sind dadurch freigegeben. Codex hat keine formelle Freigabe- oder Haftungsverantwortung.

Die beschlossene Reihenfolge lautet **E → Q → manuelle Abnahme durch David Steimer → GitHub → P**. Während der vorgezogenen Prüfung ist Q ausschliesslich eine interne Abnahmeumgebung. Für diesen konkreten MVP-0.4-Kandidaten gilt eine begrenzte Ausnahme von der Vorgabe in [DEC-2026-016](../entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md), nur vollständig freigegebene Releases in Q zu aktivieren. Der historische Entscheid bleibt unverändert. Sein gruppenbasiertes Berechtigungsmodell sowie die Freigabegrenze für den externen Demobetrieb bleiben verbindlich. Die Ausnahme ist keine allgemeine Freigabe künftiger Kandidaten.

David Steimer hat für den Quellenabgleich ausdrücklich die vollständige erneute Prüfung gewählt. Eine Ausnahme für die byteidentische Übernahme der 82 zusätzlichen, nicht operativ verwendeten Katalogquellen wurde nicht beschlossen. Zusammen mit den zwei überlappenden Quellen umfasst der Katalog 84 Quellen, zusammen mit dem Manifestbestand 120 unterschiedliche Quellen-IDs. Sprachbelege, historische Materialien und geltende Normen werden dabei nicht gleichgesetzt.

Der Vollabgleich ist abgeschlossen und am 22. September 2026 [ausdrücklich abgenommen](../fachrecht/abnahme-quellenpruefung-mvp04.md). Die [Quellennachweise](../fachrecht/quellenabgleich-mvp04.md) dokumentieren keinen neuen Änderungsbedarf am Produkt. Die bekannte AI-Jahresliste bleibt als widersprüchliche Quelle gekennzeichnet, die abgenommene gesetzliche Bedingung bleibt massgebend. [Folgemassnahme und bestehender Entscheid](../../outputs/release-mvp04-2026-09-22/catalog-follow-up.json) sind getrennt von einer noch nicht erfolgten amtlichen Berichtigung dokumentiert. Die ursprünglichen Prüfberichte bleiben byteidentisch. Der [separate Abnahmenachweis](../../outputs/release-mvp04-2026-09-22/source-approval.json) weist den aktuellen Freigabestatus aus.

## Abgrenzung der Veröffentlichungsvorbereitung

Der Datenpin ist bereits lokal committed. Der zusammengehörige AP17-/AP18-Stand umfasst Code, Schemas, Tests und Nachweise. Seine konkrete lokale Commit- und Artefaktbindung wird im [Abschlussnachweis des Publikationspakets](publikationspaket-mvp04.md) ausgewiesen. Ein isolierter Commit nur der Releasekonfiguration wäre kein vollständiger Publikationsstand.

- Notwendige Reproduktionsgrundlagen sind die beiden Fachkandidaten, der vollständige AP18C-Importnachweis, die eingefrorene V0.12 sowie die für Archiv- und Vertragsprüfungen referenzierten Arbeitsmappen. Historische Prüfsummenabweichungen bleiben dokumentiert.
- `Userinput/`, der vom Benutzer veränderte historische Word-Projektplan, Office-Sperrdateien mit Präfix `~$`, `.work/`, private Originalkopien und Arbeitskopien bleiben ausgeschlossen. Verwendet werden explizite Pfadlisten, kein pauschales Staging.
- Die [ursprüngliche Publikationsvorprüfung](publikationsvorpruefung-mvp04.md) bleibt als Ausgangsnachweis unverändert. P01 wird gemäss Variante 2 durch zwei [separat benannte Publikationskopien](../fachrecht/publikationskopien-ap18.md) gelöst. Vier V0.9-/V0.10-Originaldateien mit persönlicher Speicherpfadmetadatenangabe bleiben ausserhalb des öffentlichen Umfangs. V0.12 und fachliche Nachweise werden nicht rückwirkend umgeschrieben.
- Ein sauberer Dateiexport des vorgesehenen öffentlichen Stands prüft lokal ungetrackte Abhängigkeiten und den Betrieb der Archivtests ohne private Originale. Er ist kein Git-Clone-Test. Die Wiederherstellung der ursprünglichen Excel-Erstellungsumgebung ist vom geprüften Import der eingefrorenen Referenzdatei zu unterscheiden. Die [Nachprüfung P01/P02](publikationsbereinigung-mvp04.md) weist Umfang und Grenzen aus.
- Mirror- und Web-ZIP liegen im ignorierten lokalen Artefaktordner. Ein Git-Push allein veröffentlicht diese ZIP-Dateien nicht. Eine allfällige Veröffentlichung als Release-Anhang wird ausdrücklich in den späteren Publikationsumfang aufgenommen.

Der Benutzerauftrag «Schliesse das Publikationspaket ab» autorisiert den lokalen Abschluss dieses abgegrenzten Stands, keine öffentliche Freigabe und keinen neuen GitHub-Schreibzugriff. Die vermutete KTBE-Anmeldehürde des Gastzugriffs ist weder als Ursache noch als Appfehler bewiesen. Der tatsächliche Gasttest und die Q-Demofreigabe bleiben offen. Outlook T15/T16 sind nicht ausdrücklich erlassen und bleiben gesondert offen. Diese deklarierten Grenzen stehen dem lokalen Paketabschluss nicht entgegen. Historische Prüfnachweise behalten ihren ursprünglichen Stand.

## Ursprüngliche Artefakte und getrennte Korrektur

Die folgende Tabelle bleibt die historische Bindung des ersten Kandidaten. **Das Paket `0.4.0.0` darf wegen des nachgewiesenen Fehlers nicht weiter ausgerollt werden.** Die neue Paketdatei `0.4.0.1` und ihre Prüfsumme sind im [Korrekturkandidatennachweis](spfx-korrekturkandidat-mvp04-0401.md) und der [gesonderten Wiederholungsfreigabe](eq-wiederholungsversuch-mvp04-0401.md) gebunden. Der ursprüngliche Paketnachweis, Mirror und Webarchiv werden nicht überschrieben. Die damalige Korrektur betraf nur SPFx. Ein gesonderter Webbuild des aktuellen lokalen Publikationsstands wird ausschliesslich im [Abschlussnachweis](publikationspaket-mvp04.md) gebunden, nicht durch Umdeutung des historischen Webhashs. Das geprüfte SPFx-Paket wird für den Paketabschluss nicht neu gebaut.

Die portablen Artefakte liegen unter `.work/release-mvp04-2026-09-22/artifacts/`. Der [maschinenlesbare Nachweis](../../outputs/release-mvp04-2026-09-22/artifact-verification.json) bindet sie an den tatsächlichen Datencommit und prüft den Inhalt nach dem Verpacken. Die Quellenprüfung verändert die bereits gebauten Daten nicht automatisch. Ergibt sie materiellen Änderungsbedarf, sind ein eigener korrigierter Datenstand und neue Builds erforderlich.

| Artefakt | SHA-256 |
| --- | --- |
| `fristenrechner-schweiz-0.4.0.0.sppkg` | `eaf4c24ae53c8c3166e38025cbe2337029c2dd88930e354030c97e622ffb6a2a` |
| `fristenrechner-mvp04-sharepoint-mirror.zip` | `3a194a29e25eb08a1c503306372671f7d9747951cdb5f31937556c3d41da0536` |
| `fristenrechner-mvp04-steimer-web.zip` | `1131d164d96cffe7ed43206f39b38a1790fa86292542b8d73fa7604f3845d69c` |

Manifest-SHA-256: `a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e`.

Der GitHub-Standardpfad ist an Commit `739876a0d11b550ea8cc702622ab22af321994a5` gebunden. Solange dieser nicht veröffentlicht und öffentlich byteweise verifiziert ist, kann das Paket den neuen Standardpfad noch nicht von GitHub laden. Der Mirror enthält das Manifest und sämtliche neun Nutzartefakte. Er ist kein Auszug des Katalogs.

Der [ursprüngliche lokale technische Prüfnachweis](../../outputs/release-mvp04-2026-09-22/QA-MVP04.md) trennt die damaligen automatisierten Tests und die lokale Browserprüfung von den damals noch ausstehenden Zielumgebungsprüfungen. Die inzwischen bestandenen E-/Q-Prüfungen und verbleibenden Gast-, Outlook- und P-Grenzen stehen im [aktuellen E-/Q-Nachweis](eq-wiederholungsversuch-mvp04-0401.md).

## Daten und Consumer gemeinsam umstellen

Der neue Datenordner lautet `2026-09-22-mvp-04-approved.1`. Das Manifest ist Einstiegspunkt und führt neun Nutzartefakte:

```text
2026-09-22-mvp-04-approved.1/
├── manifest.json
├── profiles/             fünf bestehende Rechtsprofile
├── calendars/            zwei bestehende Regelkalender
├── special-regimes/      qualifizierter AP17-Spezialkatalog
└── holiday-catalogs/     ch-holiday-catalog.json
```

Die historische MVP-0.3-Version kann Format 4 nicht lesen. Für die vorgezogene E-/Q-Installation wird deshalb der lokal hashgebundene Datenstand verwendet, nicht der noch unveröffentlichte GitHub-Pfad. Zuerst den vollständigen neuen Releaseordner im jeweiligen same-site Mirror bereitstellen und sämtliche zehn Dateien nach dem Upload byteweise prüfen. Der frühere Mirrorordner bleibt für den Rückfall erhalten. Danach den neuen Consumer installieren und erst anschliessend jede WebPart-/Registerkartenkonfiguration ausdrücklich auf `SharePoint-Mirror` und den neuen Pfad setzen. Eine Teilaktualisierung einzelner JSON-Dateien ist unzulässig.

Bestehende Instanzen behalten unter Umständen ihre bisherigen Provider- und Mirrorpfade. Ein neues Paket allein beweist daher keine Datenumstellung. Sichtbare Release-ID, Quelle, vollständige Format-4-Validierung und Referenzberechnung müssen nach jeder Aktualisierung kontrolliert werden. Ein noch funktionierender alter Cache oder der Rückfall auf MVP 0.3 zählt nicht als bestandene MVP-0.4-Prüfung. Die neue Quelle muss auch in einer frischen Sitzung ohne vorhandenen gültigen Daten-Cache laden.

E und Q verwenden dieselbe Paketidentität im gemeinsamen Tenant-App-Katalog. Der Katalogaustausch ist deshalb ein gemeinsamer E-/Q-Eingriff, auch wenn die Instanzen anschliessend nacheinander aktualisiert und geprüft werden. Eine vollständige Versionsisolation zwischen E und Q wird nicht vorausgesetzt. Vor dem Katalogaustausch müssen alle betroffenen Instanzen, der aktuelle Paketstand, die Mirrorpfade und die tatsächlichen Zugriffe erfasst und gesichert sein. Unerwartete weitere Instanzen oder externe Zugriffe sind vor einer Mutation zu klären.

Die P-Ausprägung bettet die Daten beim Build ein. Sie verwendet keinen Laufzeit-Mirror und keine externen Datenabfragen. Auf steimer.ch wird ausschliesslich der geprüfte statische Webbestand ausgerollt. Root-Webauftritt und Sitemap werden nicht ohne einen konkreten Änderungsbedarf verändert.

## Freigegebene Reihenfolge und Haltepunkte

1. Die abgeschlossene Quellenabnahme, den lokalen Datencommit, die Publikationsbereinigung und die unten gebundenen Artefakte nochmals zuordnen. Den zusammengehörigen Implementierungsstand lokal mit expliziter Pfadliste versionieren. Es erfolgt noch kein öffentlicher Push. Die [Release-Checkliste](release-checkliste.md) bleibt verbindlich.
2. Unmittelbar vor dem ersten Tenant-Eingriff die tatsächlichen E-/Q-Sites, Teams, Registerkarten, installierten Versionen, Paketidentität, Provider-/Mirrorpfade, Q-Mitgliedschaften und wirksamen Berechtigungen lesen und lokal dokumentieren. Aktuelles Paket, betroffene Seiten-/Registerkartenkonfigurationen und Mirrors so sichern, dass der Ausgangsstand wiederherstellbar ist. Die Aussage «keine externen Tester» ersetzt diese Zugriffskontrolle nicht.
3. Bei unerwarteten weiteren Paketinstanzen, fehlender Wiederherstellbarkeit, noch nicht eingegrenzten externen Q-Zugriffen oder zusätzlich erforderlichen Berechtigungen anhalten und den Umfang klären. Keine Mitgliedschaft, Gastfreigabe oder Paketordnerberechtigung eigenmächtig verändern.
4. Die vollständigen zehn Dateien des neuen Releaseordners in den vorhandenen E-/Q-Mirrors bereitstellen und nach dem Upload byteweise prüfen. Bisherige Ordner bleiben unangetastet. Neue Q-Releaseordner müssen die bestehende Lesebeschränkung für den vorhandenen Q-Prinzipal übernehmen. Falls dies ohne zusätzliche Rechtevergabe nicht möglich ist, greift der Haltepunkt aus Schritt 3.
5. Gestützt auf die [neue konkrete Freigabe für `0.4.0.1`](eq-wiederholungsversuch-mvp04-0401.md) und erst nach bestandener frischer Vorprüfung das bestehende Tenant-App-Katalog-Paket durch genau den dort hashgebundenen korrigierten Kandidaten ersetzen und aktivieren. `0.4.0.0` ist nicht mehr zu verwenden. Dies ist der gemeinsame E-/Q-Paketeingriff. Keine neue App-Identität, tenantweite Verfügbarkeit oder zusätzliche API-Berechtigung einführen.
6. Die bestehenden E-Appinstanzen aktualisieren, die E-WebParts und E-Teams-Registerkarte auf den jeweiligen neuen same-site Mirror setzen und die technische E-Matrix durchführen. Bei Fehlern keine Q-Abnahme beginnen, sondern den gesicherten Stand wiederherstellen beziehungsweise den Fehler und das weitere Vorgehen abstimmen.
7. Nach bestandener E-Prüfung die bestehenden Q-Appinstanzen und jede Q-Konfiguration auf dasselbe unveränderte Paket und denselben Datenrelease umstellen. Technische Q-Prüfung, Nachweis der unveränderten Rechte und Prüfung in einer frischen Sitzung durchführen. Es werden keine neuen Testpersonen aufgenommen.
8. David Steimer führt die manuelle Q-Prüfung durch und nimmt den konkreten App-/Datenstand ausdrücklich ab. Bis dahin bleibt der Prozess an diesem Haltepunkt stehen. Weder erfolgreiche automatisierte Tests noch die heutige Installationsfreigabe ersetzen diese Abnahme. Ein weiterhin ausstehender Gasttest wird offen ausgewiesen und nicht als bestanden übernommen.
9. Erst nach Q-Abnahme und zusätzlicher konkreter Publikationsfreigabe den abgegrenzten AP17-/AP18-Stand auf GitHub veröffentlichen. Falls ein temporärer Deploy-Key nötig ist, ausschliesslich nach neuer ausdrücklicher Autorisierung und danach wieder entfernen. Den öffentlich erreichbaren Datenpin und sämtliche Manifestartefakte byteweise verifizieren.
10. Erst nach gesonderter Hostingfreigabe und separat festgelegter sowie nachgewiesener Quellstandzuordnung des P-Artefakts den bestehenden P-Stand sichern, den gebundenen geprüften Webbuild vorprüfen und kontrolliert umschalten. Die öffentliche Matrix D01–D12 erneut ausführen. Der öffentliche P-Betrieb und eine Wiederaufnahme des externen Q-Demobetriebs werden erst nach den jeweils erforderlichen Nachweisen ausdrücklich freigegeben.
11. Tatsächliche Deploymentidentitäten, Prüfresultate, verbleibende Grenzen und Freigaben dokumentieren. Personenbezogene und tenantinterne Einzelheiten bleiben in der lokalen oder tenantinternen Evidenz.

## Zielumgebungsprüfung

Die bisherigen [SharePoint-/Teams-Fälle T01–T19](deployment-release-2-mvp-03.md) und [öffentlichen Fälle D01–D12](deployment-oeffentliche-p-auspraegung-ap16.md) werden auf den neuen Stand angewendet. Historisch bestandene Ergebnisse gelten nicht als neue Releaseprüfung. Zusätzlich sind zu prüfen:

| ID | Soll |
| --- | --- |
| R04-01 | Sichtbarer Datenstand MVP 0.4, Format-4-Release mit vollständig validiertem Feiertagskatalog |
| R04-02 | StPO, Zustellung 16.09.2026, zehn Tage: Fristablauf 28.09.2026 |
| R04-03 | IV-Einwand, Zustellung 16.09.2026, unterstützte Berner Anknüpfung: 16.10.2026 |
| R04-04 | IVöB-Zuschlagsbeschwerde, Publikation 06.09.2026, Neurecht: 28.09.2026 |
| R04-05 | Gerichtliche Sozialversicherungs-Nachfrist über Jahreswechsel berücksichtigt ATSG-Stillstand |
| R04-06 | Ungeklärte ATSG-Anknüpfung, Altrecht und vier Sammelpfade bleiben gesperrt |
| R04-07 | DE/FR, feste Modellfelder, echte Auswahlmöglichkeiten, Desktop/Tablet/Mobil und lokale Defaults funktionieren |
| R04-08 | Datum und Kalenderreferenz werden nicht persistiert, Kalenderexport nur aus aktuellem gültigem Resultat |
| R04-09 | Fehlender oder manipulierter Katalog wird vollständig verworfen. Letzter gültiger Stand bleibt erhalten |
| R04-10 | Q-Zugriffe und Mitgliedschaften sind live geprüft. Kein neues Recht und keine neue Gastperson. Ein realer Gasttest erfolgt nur mit einem bereits berechtigten Konto im zulässigen Zugriffsweg und wird bei Nichtverfügbarkeit ausdrücklich als ausstehend markiert |
| R04-11 | Jede SharePoint-/Teams-Instanz lädt ausdrücklich aus ihrem neuen same-site Mirror. Der vollständige neue Datenstand funktioniert in einer frischen Sitzung und nicht bloss aus einem alten Cache |
| R04-12 | David Steimer hat den konkret nachgewiesenen Q-App-/Datenstand manuell geprüft und ausdrücklich abgenommen. Vorher kein Übergang zu GitHub oder P |

In öffentlichen Quellen und öffentlichen Nachweisen bleiben Konten, private Hostingangaben, Zugangsdaten und interne Arbeitsunterlagen ausgeschlossen. Der lokal bereits veränderte historische Word-Projektplan und `Userinput/` sind nicht Bestandteil des Releasecommits.

## Rückfall

Das bisherige SPPKG `0.3.0.0` wurde lokal byteidentisch gesichert. SHA-256: `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1`. Eine lokale Paketsicherung ersetzt nicht die Sicherung der tatsächlichen Zielumgebung vor dem Deployment.

Beim Tenant-Rückfall zuerst die betroffenen Datenpfade auf die unmittelbar vor dem Eingriff gesicherten Vorgänger-Mirrors zurückstellen und dann bei Bedarf das gesicherte Paket wiederherstellen. Die bekannte lokale MVP-0.3-Sicherung darf nicht ungeprüft mit der tatsächlichen Tenant-Baseline gleichgesetzt werden. Wegen der gemeinsamen Paketidentität E und Q zusammen betrachten, alle zuvor erfassten Instanzen kontrollieren und den wiederhergestellten Datenstand sichtbar verifizieren. Eine Teilrücknahme nur einer Oberfläche genügt nicht als Nachweis. Für P wird später der unmittelbar vor dessen Upload gesicherte vollständige Webbestand zurückgespielt. Keine Mischung aus alten und neuen Assets. Neu erstellte Mirror- und Releaseordner bleiben als Nachweise erhalten.
