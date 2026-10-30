# R10-C E-/Q-Installationsvorlage für MVP 0.10

Fassung 1.0 vom 29. Oktober 2026. **Lokal vorbereitet. Vollzug, Uploads und Rückfall sind noch nicht freigegeben.** Die Vorlage bindet die vier bestehenden Rechnerinstanzen, die definitiven [R10-B-Artefakte](lokaler-releaseabschluss-mvp10.md), den [Rückfallweg](rueckfall-mvp10.md) und die [Hostprüfmatrix](pruefmatrix-mvp10.md). Der dokumentierte Ausgangsstand ist MVP 0.9 gemäss [Q-Abnahme vom 19. Oktober](abnahme-q-mvp09.md). Die tatsächliche Onlinebestätigung erfolgt erst im freigegebenen C01.

## 1. Verbindliche Artefakte

| Gegenstand | Gebundener Stand |
| --- | --- |
| Reguläres Paket | [fristenrechner-schweiz-0.10.0.0.sppkg](../../outputs/release-mvp10-2026-10-28/fristenrechner-schweiz-0.10.0.0.sppkg), **843’895 Bytes**, SHA-256 `7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd` |
| Mirror-ZIP | [fristenrechner-mvp10-sharepoint-mirror.zip](../../outputs/release-mvp10-2026-10-28/fristenrechner-mvp10-sharepoint-mirror.zip), **386’951 Bytes**, SHA-256 `77019f584ea4c0482a3001460f35f312889b910fc46e2aee4aee90bba4edfbf6` |
| Neue Daten | `2026-10-28-mvp-010-approved.1`, **45 Dateien**, Manifest und Mindestconsumer `17.0.0`, Verwaltungsverfahrenskatalog `10.0.0`, Manifest SHA-256 `7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016` |
| Bedingtes Recovery | [fristenrechner-schweiz-recovery-0.10.0.1.sppkg](../../outputs/release-mvp10-2026-10-28/fristenrechner-schweiz-recovery-0.10.0.1.sppkg), **327’129 Bytes**, SHA-256 `0def9a2c4a126f6d7b30d22ebe600c1b471ccd10d6c81b7dfab9745a350d797b`, Anwendung und Funktionsumfang MVP 0.9 |
| Rückfalldaten | `2026-10-18-mvp-09-approved.1`, **42 Dateien**, Format `9.0.0`, Manifest SHA-256 `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265` |
| Erwartetes Ausgangspaket | `0.9.0.0`, **327’130 Bytes**, SHA-256 `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331`. Vor Austausch frisch zu bestätigen |

Die [R10-B-Abschlussquittung](../../outputs/release-mvp10-2026-10-28/local-completion.json), SHA-256 `433110e9d13d03fffb335eee95cde9fc0b0186f5b8d33358d73323aac51ee29b`, wurde für diese Vorbereitung erneut lesend verifiziert. Die abgeschlossenen B-Unterlagen, Pakete und Daten bleiben unverändert. Die Vorbereitung von C enthält keine nachträglich erfundene menschliche B-Abnahme.

Im Tenant-App-Katalog ist ausschliesslich die bestehende Datei **`fristenrechner-schweiz.sppkg` zu ersetzen**. Die versionsbenannte lokale Datei wird nicht zusätzlich als zweiter Katalogeintrag angelegt. Solution `13090feb-a6bf-40fa-9d3c-ec8d90516a60`, Feature `3edf1509-41e9-4a2f-8005-df510eec43b6` und Webpart `596c7f1c-4d3e-4da8-a7be-27a96024f37c` bleiben gleich. Keine zusätzlichen API-Berechtigungen und keine automatische Installation auf weiteren Sites.

Das reguläre Hauptbundle ist `ClientSideAssets/fristenrechner-web-part_bed9b123573683ef2d99.js`, SHA-256 `90f0ace6255e65652a102745a989f50bab03ffd2652b6b1fe6c4461f3e72a93d`. Paketversion, Site-Appversion und tatsächlich geladene Bundlebytes sind getrennt zu prüfen. Der lokale Datenpin `01bbd96a296b0fc4d64cd554acc8cb122c3017a3` ist nicht veröffentlicht und online unverifiziert. Alle vier Instanzen verwenden ihre eigenen bytegeprüften SharePoint-Mirrors. Der unbenutzte GitHub-Pin in den gespeicherten Eigenschaften bleibt erhalten.

## 2. Vier bestehende Ziele und dokumentierter Ausgangsstand

| Ziel | Vorhandene Ansicht | Einzig vorgesehenes Konfigurationsdelta |
| --- | --- | --- |
| E-SP «Fristenrechner Test» | `Fristenrechner-MVP.aspx` | Vorhandene App aktualisieren, nur den Mirrorpfad des gebundenen Webparts ändern, aktuelle Seite publizieren |
| E-T «Entwicklungsumgebung» | Kanal «Fristenrechner», Registerkarte «Fristenrechner Schweiz – Teams» | Vorhandene App aktualisieren, nur den Mirrorpfad dieser Registerkarte ändern und speichern |
| Q-SP «Fristenrechner Gastdemo» | Gebundener Rechner auf `Home.aspx` | Nach E-Gate App und Mirrorpfad umstellen, aktuelle Seite publizieren |
| Q-T «Fristenrechner Gastdemo Teams» | Kanal «Fristenrechner», Registerkarte «Fristenrechner Schweiz (1)» | Nach E-Gate App und Mirrorpfad dieser Registerkarte umstellen |

Die konkrete private Zielbindung liegt unter `.work/deployments/2026-10-29-eq-mvp10/vorbereitung/targets.private.json`, **217’661 Bytes**, SHA-256 **`dd50cdd78f9508770be9a5dbe78044256f3e19a1aae1d807635187d1c7103924`**. Der zugehörige `Zielanhang.md` enthält Links, technische Identitäten, vollständige dokumentierte Webparteigenschaften sowie alte und neue Mirrorpfade. Er gehört nicht in die öffentliche Repository-Dokumentation.

Die Ableitung verwendet die tatsächlichen MVP09-Abschlussbelege und die separat erklärte Q-Abnahme. Dokumentiert sind vier Appstände `0.9.0.0`, die aktuelle E-SP-Seite `11.0`, Q-SP `9.0` und beide Teamsitems `1.0`. Historische Rohantworten, beobachtete Konfigurationsänderungen und heutige lokale Hashprüfungen werden getrennt bezeichnet. Bei E-SP ist das damalige Layoutdelta zusätzlich zur Mirroränderung ausdrücklich erfasst. Fehlende vollständige Nachher-Item-/Dateiobjekte werden nicht erfunden. Daraus folgt keine frische Onlinebestätigung. In C01 sind die Identitäten und der Bestand erneut eindeutig zu prüfen. Datei-UniqueId, Listenitem-GUID, Webpartinstanz und Teams-Tab-ID sind unterschiedliche Identitäten. Teamsregisterkarte, Kanal, Team und tatsächliches SharePoint-Iframe müssen zusammenpassen.

**Der gemeinsame Katalogwechsel kann sämtliche bereits verbundenen Verbraucher erreichen**, insbesondere beide Q-Hosts noch vor ihrer App-/Mirrorumstellung, die historische AP5-Ansicht und allfällige weitere bestehende Verbraucher. E zuerst begrenzt die Reihenfolge der Konfigurationsumstellung. Es isoliert die Codeauslieferung nicht. Bei ungeklärten zusätzlichen Auswirkungen anhalten. Keine pauschale Tenantinventur oder zusätzliche Siteinstallation.

## 3. Ablauf und Gates

David Steimer entscheidet und nimmt ab. Codex dokumentiert und führt freigegebene Schritte als KI-Arbeitsinstrument aus. Es besteht keine formelle Zweitfreigabe durch Codex. **Alle nachfolgenden Vollzugsgates sind ausstehend.**

| Gate | Handlung nach Freigabe | Erforderlicher Nachweis |
| --- | --- | --- |
| C01 Ausgangssicherung | Katalogdatei und Ressourcen, vier Apps und Konfigurationen, beide AP5-Ansichten sowie erforderliche Rechte lesend prüfen und privat sichern. Bestehende Entwürfe, vollständige Canvas-Inhalte und dekodierte Eigenschaften erfassen | Frischer MVP09-Bestand eindeutig. Sicherung mit Rohbytes und Hashes, keine ungeklärte Fremdänderung. Eine REST-Konfigurationssicherung wird nicht als Roh-ASPX-Datei bezeichnet |
| C02 Manueller Mirrorupload | Nach U01 und bestandenem C01 lädt David die 45 unveränderten Dateien in jeden der vier genau bezeichneten neuen Releaseordner hoch | Kein Überschreiben, keine zusätzliche Verzeichnisebene und keine Rechteänderung. Kein automatisierter Mirrorupload durch Codex |
| C03 Byteprüfung | Je Host alle 45 neuen und alle 42 eigenen alten Dateien vollständig zurücklesen. Verzeichnisbestände, Manifestreferenzen und relevante Berechtigungen abgleichen | **180 neue und 168 Rückfalldateien, insgesamt 348 Originalantworten**. Keine fehlenden oder zusätzlichen Dateien. Historische lokale Kopien ersetzen diese frischen Abrufe nicht |
| C04 Katalog und E | Nur nach C01–C03, H01 und I01 sowie unmittelbarer Istkontrolle Katalogdatei ersetzen und beide bestehenden E-Apps aktualisieren. Anschliessend pro E-Host T03 vorbereiten, dann nur dessen Mirrorpfad umstellen | Paket `0.10.0.0`, erwartetes Bundle, fehlerfreie Appzustände. Vollständiger Eigenschaftsvergleich erlaubt ausschliesslich `sharePointMirrorPath` als beabsichtigtes Delta |
| C05 E-Gate | Vorgeschriebenen E-Umfang der Matrix, beide Q-Verbraucher unter neuem Code mit ihren noch alten Format-9-Mirrors sowie AP5 prüfen | Alle E-, Mischbetriebs- und AP5-Gates bestanden. Noch keine Q-Konfigurationsumstellung |
| C06 Q | Erst nach C05 beide vorhandenen Q-Apps aktualisieren. T03 vor dem jeweiligen Quellenwechsel vorbereiten. Nur Mirrorpfad umstellen, aktuelle Seite publizieren oder bestehende Registerkarte speichern | Identischer gebundener Paket- und Datenstand, vollständige Rücklesung, keine weiteren Eigenschaftsänderungen |
| C07 Q-Technik | Vollständige Q-Matrix durchführen. Acht tatsächliche Host-Kalenderdateien zusammenführen. Eigene Testzustände gezielt zurücknehmen | Getrennte Resultate pro Test und Host. Keine pauschale Übernahme eines E-Passes nach Q |
| C08 Menschliche Abnahme | Geräteprüfung, bestehender Gastzugriff und fachliche Q-Abnahme durch David. Outlook-Wiederverwendung oder zusätzlicher Test separat entscheiden | Ausdrückliche, an Paket, Release und Restpunkte gebundene Bestätigung |

Das Mirror-ZIP enthält die 45 Dateien unmittelbar ab `manifest.json`. Der neue Zielordner heisst überall `2026-10-28-mvp-010-approved.1`, die vier Elternpfade stehen ausschliesslich im privaten Zielanhang. Die Vorbereitung stellt eine lokal geprüfte Uploadkopie unter `.work/deployments/2026-10-29-eq-mvp10/manueller-upload/2026-10-28-mvp-010-approved.1` bereit. **Jetzt noch nicht hochladen.** Bei bereits vorhandenem Remoteziel oder Ersetzungsfrage anhalten und den Bestand klären.

Die [Sollinventare](../../outputs/release-mvp10-2026-10-28/r10c/mirror-inventories.json) binden beide Releases. Die 168 historisch zurückgelesenen MVP09-Dateien werden bei der Vorbereitung lokal erneut geprüft. C03 erfordert trotzdem die frischen Remoteantworten jedes eigenen Mirrors. AP5 bleibt separat an seinen bisherigen Pin und seine acht historischen Dateien gebunden.

## 4. Speicher- und Netzwerkprüfungen

Eine eigene isolierte Prüfsitzung verwenden. Vor dem ersten eigenen Speichertest Existenz und exakte Rohwerte vorhandener Standards im tatsächlichen Speicherkontext erfassen. MVP09 und MVP10 verwenden Standardsversion 5. Vier Ansichten können Speicher teilen. Geteilte Kontexte seriell prüfen. Fremde oder zwischenzeitlich geänderte Werte nicht überschreiben.

Vor jedem geplanten Mirrorpfadwechsel den alten Format-9-Stand unter dem neuen Code regulär laden, dessen quellgebundenen Cache belegen und das Fehlen des neuen Cacheeintrags feststellen. Erst danach den neuen Manifestabruf gezielt blockieren und die neue Quelle speichern. Die Regel muss den **tatsächlich beobachteten Request** treffen. SharePoint kann einen REST-Dateiabruf verwenden. Eine direkte Dateiadresse ist dafür kein ausreichender Ersatz. Vor Reload Ziel, Muster und Aktivierung kontrollieren. Keine breite Platzhalterregel wie `*://*`.

Der kalte Fehlabruf muss sicher sperren und darf weder den Cache des alten Releases noch den unpublizierten GitHub-Pin verwenden. Nach Entfernung der Sperre normal laden. Anschliessend den warmen Fehlabruf mit dem verifizierten Cache derselben Datenkonfiguration prüfen. Netzwerkbeleg, UI-Zustand und erneute Berechnung sind getrennt zu dokumentieren. Browserstatus `0` allein belegt keinen bestimmten Sperrgrund. Ein lokal gefiltertes HAR beweist nicht die Abwesenheit sämtlicher anderer Browserrequests.

Eigene Testregeln nach jedem Fall entfernen und den normalen Wiederanlauf prüfen. Eigene Testpräferenzen und Zoomzustände kontrolliert zurücknehmen. Kein allgemeiner Browserdatenreset. Das Löschen auch eines eigenen Cacheeintrags oder ein temporärer Mirror-Rückwechsel zur Wiederholung erfordert eine separate konkrete Zustimmung. Scheitert die Bedienverbindung, gelten sichtbare Zustände und tatsächliche Rücklesungen. Ein versuchter Klick ist kein Ausführungsnachweis.

Kalenderexporte enthalten nur synthetische Referenzen. Gespeicherte Dateien werden geprüft, **nicht in Outlook importiert**. Aktuelle Hostnachweise können durch lokale Pakettests oder frühere Outlook-Importe nicht ersetzt werden.

## 5. Rückfall und fortbestehende Grenzen

**R10C-H01** bindet zwei Stufen des [Rückfalls](rueckfall-mvp10.md): den begrenzten Rückwechsel einzelner umgestellter Konfigurationen auf ihren eigenen gesicherten Format-9-Mirror unter neuem Code und nötigenfalls den vollständigen Rückfall mit `0.10.0.1` auf MVP09. Vor dem gemeinsamen Recovery-Codewechsel müssen alle vier aktuellen Konfigurationen auf ihren eigenen alten Quellen stehen. Ist dies nicht sicher herstellbar, anhalten.

Das Recovery nimmt die 20 in AP23F bis AP23M ergänzten Kantone und R10-U1 zurück. Die ursprüngliche MVP09-Abdeckung von BE, TI, GR, LU, ZG und AR sowie die damalige Feldhöhenkorrektur bleiben erhalten. Unbekannte, beschädigte, zukünftige oder im Recovery nicht unterstützte V5-Standards sind rohbytegleich zu schützen. Bewusstes Speichern oder Zurücksetzen kompatibler Standards kann den gemeinsam verwendeten Schlüssel ändern. Keine automatische Rücksicherung über inzwischen geänderte fremde Werte.

Nach einer tatsächlichen Installation von Recovery `0.10.0.1` braucht die reguläre Wiederaufnahme einen neu gebauten und separat gebundenen Paketstand **mindestens `0.10.0.2`**. Der lokale Vierphasenlauf ist kein SPFx-Downgrade-Nachweis und ermächtigt nicht zu einem weiteren Build.

Die fachlichen Grenzen aus A2/B bleiben bestehen, insbesondere die Sozialfreigaben nur BE 2026–2027, qualifizierte Zeitfenster, AI-Behandlung, FR-/NE-Vorbehalte, Januargrenzen sowie abgegrenzte kommunale und besondere Verfahren. Produktsprachen bleiben DE/FR. Der Quellenprüftermin 15. November 2026 bleibt offen. Wird der Vollzug wesentlich verzögert oder liegt eine neue materielle Erkenntnis vor, ist deren Bedeutung vor Installation zu klären.

**R10B-CLI-H01 bleibt offen.** Der historische Sammelalias `npm run test:source-reviews` ist nicht grün. Die 45 Pythonprüfungen sind mit dem ausdrücklich geprüften getrennten Aufruf bestanden. Dieser technische Nachtrag betrifft die spätere Quellpublikation und wird nicht durch Installation erledigt. Die definitiven Artefakte und die B-Nachweise werden dafür nicht verändert.

Bei abweichender Identität, Katalogversion, Paketbytes, Konfiguration, fremdem Entwurf, zusätzlichem Rechtebedarf oder ungeklärtem Testfehler anhalten. Abweichungen werden nicht still als neuer Sollstand übernommen. AP5-Pin, Daten, Webparts und historischer Entwurf bleiben erhalten. Keine Deinstallation, zusätzlichen Sites oder Registerkarten, AP21-/E05-Änderung, zusätzlichen Gäste, M365-Rechte- oder Richtlinienänderung. GitHub, P, Root-Webauftritt, Sitemap, DNS, E-Mail und Hosting bleiben ausgeschlossen. Der dokumentierte Header-/Cachebefund wird nicht erneut geprüft.

## 6. Konkreter Freigabeentwurf

**Noch nicht erteilt.** Die folgende Erklärung bezieht sich auf Fassung 1.0, die private Zielbindung und die separat ausgewiesene SHA-256-Prüfsumme der [gesamten Vorlagenbindung](../../outputs/release-mvp10-2026-10-28/r10c/proposal.json).

> Ich gebe R10C-U01, R10C-H01 und R10C-I01 gemäss der gebundenen R10-C-Vorlage, Fassung 1.0 vom 29.10.2026, frei. Beginne mit C01, der frischen Ausgangssicherung. Den anschliessenden manuellen Upload der unveränderten 45-Dateien-Mirrors in die vier neuen gebundenen Releaseordner übernehme ich. Kein Mirrorupload durch Codex, kein Überschreiben bestehender Daten und keine Rechteänderung.
>
> Ich gebe den Austausch der bestehenden Katalogdatei `fristenrechner-schweiz.sppkg` vom frisch bestätigten Stand `0.9.0.0` auf `0.10.0.0`, SHA-256 `7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd`, frei. Die gemeinsame Codewirkung auf sämtliche bereits verbundenen Verbraucher einschliesslich Q vor dessen Umstellung und AP5 ist mir bekannt. Keine automatische oder zusätzliche Siteinstallation.
>
> Der Vollzug bleibt auf die vier bestehenden Rechnerinstanzen gemäss der in Abschnitt 2 gebundenen privaten Zielprüfsumme und ihrer frischen eindeutigen Bestätigung begrenzt. Websiteinhalte und Appdetails dürfen nur für diese Appupdates geöffnet werden. Vor dem Katalogwechsel müssen C01–C03 bestanden und H01 geschlossen sein. Zuerst beide E-Apps mit ihren MVP10-Mirrors, nach bestandenem E-Gate beide Q-Apps mit ihren MVP10-Mirrors. Ausschliesslich die erforderlichen aktuellen SharePoint-Seiten dürfen publiziert und die bestehenden aktuellen Teamsregisterkarten gespeichert werden.
>
> Die gebundene technische Matrix mit synthetischen Fällen, eigenen Testpräferenzen, exakt begrenzten lokalen Manifest-Sperrregeln und tatsächlich gespeicherten Kalenderdateien ist umfasst. Outlook-Importe, allgemeine Browserdatenresets, Cachelöschungen und vorübergehende Mirror-Rückwechsel zur Testwiederholung sind nicht umfasst.
>
> Ich billige den begrenzten Datenrückfall sowie nötigenfalls den vollständigen Rückfall mit `0.10.0.1`, SHA-256 `0def9a2c4a126f6d7b30d22ebe600c1b471ccd10d6c81b7dfab9745a350d797b`, nach dem gebundenen Ablauf auf MVP09 und die jeweils eigenen gesicherten Format-9-Mirrors. Vor dem Recovery-Codewechsel müssen alle vier aktuellen Konfigurationen auf Format 9 stehen. AP5 und geschützte Standards-v5-Rohwerte bleiben erhalten. Die gemeinsame Codewirkung, die Rücknahme der 20 neuen Kantone und von R10-U1 sowie der danach erforderliche höhere Paketstand für eine reguläre Wiederaufnahme sind mir bekannt.
>
> Bei abweichendem Bestand oder ungeklärtem Fehler ist anzuhalten. Geräte-/Gastprüfung und manuelle Q-Abnahme bleiben bei mir. Zusätzliche Builds, Commits, GitHub-Push, P, Outlook-Importe, neue Gäste, Berechtigungs- und Richtlinienänderungen sowie Betriebsfreigaben bleiben ausgeschlossen. R10B-CLI-H01 bleibt vor der Quellpublikation gesondert zu behandeln.

Die [lokale Vorlagenprüfung](../../outputs/release-mvp10-2026-10-28/r10c/proposal-verification.json) bestätigt die Bindung und die lokale Konsistenz. Sie ist weder Onlinebestandsprüfung noch Vollzugsfreigabe.
