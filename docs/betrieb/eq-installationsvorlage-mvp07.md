# MVP 0.7 Installationsvorlage für E und Q

Stand: 9. Oktober 2026. **C01 bis C04 bestanden, gemeinsames Katalogpaket und beide E-Apps auf `0.7.0.0`, E-Mirrorpfade umgestellt. Das E-Gate ist noch offen. Q-Apps und Q-Mirrorpfade sind nicht umgestellt.** Einzelheiten stehen im [Zwischenstand des Vollzugs](eq-vollzugsnachweis-mvp07.md). Massgebend bleiben die [E-/Q-Freigabe](eq-freigabe-mvp07.md) und die [H01-Billigung](freigabe-r07c-h01.md). Diese Vorlage bindet das in [R07-B fertiggestellte Paket](releaseartefakte-mvp-07.md) an die vier bestehenden E-/Q-Rechner. Ablaufkriterien und Haltepunkte werden durch Teilnachweise nicht aufgehoben.

**R07C-H01 geschlossen:** Der [am tatsächlichen Paket geprüfte Wiederherstellungskandidat 0.7.0.1](wiederherstellungskandidat-mvp07.md) ist für einen nötigen vollständigen Rückfall ausdrücklich betrieblich gebilligt. Er verbindet archivierte MVP06-Fachlogik mit DB-v2-kompatiblem konfigurationsgebundenem Cache und geschützten Standards. Ein direkter Rückfall auf das ursprüngliche `0.6.0.1` bleibt ungeeignet. Die Billigung ist kein bereits ausgeführter Hostnachweis. Sie ersetzt das reguläre Zielpaket `0.7.0.0` nicht und erlaubt keinen Browserdatenreset.

## 1 Gebundenes Paket und Daten

| Gegenstand | Verbindlicher Wert |
| --- | --- |
| Lokale Paketdatei | [fristenrechner-schweiz-0.7.0.0.sppkg](../../outputs/release-mvp07-2026-10-08/artifacts/fristenrechner-schweiz-0.7.0.0.sppkg), 291'920 Bytes |
| Paket SHA-256 | `bc8abe70c791f58d2cea9fb66ea568f604bcacae35fec9ae29aadeca5e0c6e09` |
| Ziel im bestehenden Katalog | Vorhandene Datei `fristenrechner-schweiz.sppkg` ersetzen, keine zusätzliche versionsbenannte Katalogdatei |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Feature-ID | `3edf1509-41e9-4a2f-8005-df510eec43b6` |
| Webpart-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Versionswechsel | Dokumentierter Ausgang `0.6.0.1` → Ziel `0.7.0.0`, Anwendung `0.7.0` |
| Hauptbundle | `fristenrechner-web-part_f1f22b6187784c63f8ec.js`, SHA-256 `4c61cc5f9db88fda4c5b795f3b17b6b8fc214b328813f3035adc8e0d1a0d4df5` |
| Mirrortransport | [fristenrechner-mvp07-sharepoint-mirror.zip](../../outputs/release-mvp07-2026-10-08/artifacts/fristenrechner-mvp07-sharepoint-mirror.zip), SHA-256 `ed603938f86849aec55dd5cdc83c300a8ae6437e4bb8eb62f3d7b5fa7e6753ca` |
| Datenrelease | `2026-10-08-mvp-07-approved.1`, Manifest und Mindestconsumer `7.0.0` |
| Manifest SHA-256 | `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |
| Mirrorumfang | Je Ziel 41 Laufzeitdateien und 2'362'261 Bytes, zusammen 164 frisch zurückzulesende Dateien |

Die drei Releasearchive und 191 archivierten Baubelege wurden für diese Vorbereitung erneut lokal geprüft. Ein Neubau mit anderer Prüfsumme ist nicht umfasst. Der unveröffentlichte lokale Datenpin `331ef3e19d43a6b51d91a502acd6b5443071599f` ist **kein Nachweis einer erreichbaren GitHub-Quelle**. E/Q verwenden ausschliesslich ihre eigenen verifizierten SharePoint-Mirrors.

## 2 Vier konkrete Ziele und begrenztes Änderungsdelta

| Kürzel | Bestehende Instanz | Vorgesehene Änderung nach Freigabe |
| --- | --- | --- |
| E-SP | Site «Fristenrechner Test», Seite «Fristenrechner-MVP.aspx» | Bestehende Site-App aktualisieren, nur Mirrorpfad im bestehenden Rechner ändern, ausschliesslich diese aktuelle Seite publizieren |
| E-T | Site und Team «Entwicklungsumgebung», Kanal «Fristenrechner», Registerkarte «Fristenrechner Schweiz – Teams» | Bestehende Site-App aktualisieren, nur Mirrorpfad der bestehenden direkten Rechnerregisterkarte ändern |
| Q-SP | Site «Fristenrechner Gastdemo», bestehender Rechner auf der Startseite | Bestehende Site-App aktualisieren, nur Mirrorpfad im bestehenden Rechner ändern, ausschliesslich diese aktuelle Seite publizieren |
| Q-T | Site und Team «Fristenrechner Gastdemo Teams», Kanal «Fristenrechner», Registerkarte «Fristenrechner Schweiz (1)» | Bestehende Site-App aktualisieren, nur Mirrorpfad der bestehenden direkten Rechnerregisterkarte ändern |

Die **private Zielbindung** liegt unter `.work/deployments/2026-10-08-eq-mvp07/vorbereitung/`. `Zielanhang.md` enthält die konkreten URLs und Pfade. `targets.private.json` bindet Site-, Bibliotheks- und Elternordner-IDs an archivierte Belege. SHA-256 dieser Zielbindung: `d09ed734360581645475fb26b015be77138e49bcb89fd43160c5b463dfd242ec`. Diese privaten Dateien gehören nicht pauschal in das öffentliche Repository.

**Vor jeder Mutation:** Die konkreten Teams-Registerkarten-IDs, Webpart-Instanzen und die kanonische Q-SP-Seite wurden in C01 frisch gebunden und privat gesichert. Vor einer weiteren Mutation diese Bindung eindeutig bestätigen. Namen und Site allein erlauben keine Auswahl eines beliebigen gleichnamigen Objekts. Frühere Browser-Tab-IDs sind keine dauerhaften Teams-Identitäten. Bei Mehrdeutigkeit oder Abweichung anhalten und die Zielbindung ergänzen, bevor eine geänderte Instanz freigegeben wird.

`providerKind = sharepointMirror` bleibt erhalten. Nur `sharePointMirrorPath` wechselt vom jeweiligen Ordner `2026-10-01-mvp-06-approved.1` auf `2026-10-08-mvp-07-approved.1`. `githubBaseUrl`, übrige Eigenschaften und Host-Sichtbarkeit bleiben in ihrem frisch gesicherten Vorzustand. Ein leeres GitHub-Feld darf nicht unbemerkt einen neuen Standardpin aktivieren. Bei solcher Abweichung vor der Mutation anhalten.

**Die Konfigurationsbegrenzung ist keine Begrenzung der Codewirkung.** Der Austausch im gemeinsamen Tenant-App-Katalog kann alle bereits verbundenen Instanzen erreichen, auch Q vor deren Datenumstellung und die historische AP5-Ansicht. Weitere bekannte Verbraucher sind vorab hinsichtlich ihrer Wirkung einzuordnen. Keine automatische Installation auf zusätzlichen Sites und keine Untersuchung fremder Inhalte zur pauschalen Tenantinventur.

Die historische Registerkarte «V0.1 - Fristenrechner Schweiz» und ihre SharePoint-Seite behalten den GitHub-Provider, ihren expliziten AP5-Pin und den Datenrelease `2026-08-29-ap5-approved.1`. Keine Bearbeitung oder Publikation der historischen Seite. AP21-Testpakete und Testseite, E05, Gäste, Gruppen, Berechtigungen, Richtlinien, GitHub, P, Root-Webauftritt und Sitemap bleiben ausserhalb des Auftrags.

## 3 Vorprüfung und Ablauf nach gesonderter Freigabe

| Schritt | Aktion und Abschlusskriterium | Haltepunkt |
| --- | --- | --- |
| C00 | Den [am Paket geprüften Wiederherstellungsweg](wiederherstellungskandidat-mvp07.md) samt höherer Version, alten Mirrors und Standardschutz betrieblich billigen. Bekannte Lifecycle-Grenzen des unveränderten regulären Pakets berücksichtigen | Abgeschlossen durch [H01-Freigabe](freigabe-r07c-h01.md). C01 bis C03 wurden vor dem Katalogwechsel abgeschlossen |
| C01 | Frische Katalogdatei und Paketversion, vier Site-Apps, konkrete Ansichten und vollständige Eigenschaften lesen. Bisheriges Paket roh sichern. Relevante Mirror-, Paket- und Assetberechtigungen vergleichen. Bestehende Seitendentwürfe erkennen und nicht überschreiben | Abweichender Bestand, fremder Entwurf, unklare Zielidentität oder ungeklärte Codewirkung führen zum Halt |
| C02 | David lädt je einen neuen vollständigen Releaseordner unter den vier vorhandenen Mirror-Eltern hoch. Bestehende Releases bleiben erhalten | Keine Übernahme allein aufgrund sichtbarer Ordner. Konflikt oder abweichende Rechte zuerst klären |
| C03 | Alle 164 Dateien frisch als Rohbytes zurücklesen. Je Ziel 41 Namen, Längen und SHA-256 sowie 40 Manifestreferenzen prüfen. Abschliessendes Inventar und relevante Rechte dokumentieren | Kein Teilrelease, keine zusätzlichen Dateien, keine Freigabe bei Hashabweichung |
| C04 | Nach konkreter Paketfreigabe dieselbe Katalogdatei ersetzen und bereitstellen. Gültig, aktiviert, bereitgestellt und Version prüfen. «Zu allen Sites hinzugefügt» bleibt Nein. Paket und tatsächlich ausgeliefertes Bundle erneut roh vergleichen | Jede Abweichung stoppt weitere Umstellungen |
| C05 | E-SP-App aktualisieren, Mirrorpfad ändern und aktuelle Seite publizieren. E-T-App aktualisieren, bestehenden Tab konfigurieren und gezielt neu laden. Technische E-Matrix und AP5-Erstabruf ausführen | E ist keine technisch isolierte Codeinstallation. Q kann den neuen Code bereits sehen. Keine Q-Konfigurationsumstellung bei blockierendem E-/AP5-Befund |
| C06 | Nach bestandenem E-Gate Q-SP und Q-T entsprechend aktualisieren. Vollständige technische Q-Matrix ausführen | Keine automatische fachliche Q-Abnahme aus Eigentümertests ableiten |
| C07 | Reale Geräteprüfungen, bestehende B2B-Gastanmeldung in zulässiger Umgebung und manuelle fachliche Q-Abnahme durch David | Offene Punkte einzeln ausweisen. GitHub und P bleiben separate Entscheide |

Die [gebundene Prüfmatrix](pruefmatrix-mvp07.md) konkretisiert R07-01 bis R07-16. Historische Nachweise werden als solche wiederverwendet, nicht als neue Hostprüfungen gezählt.

Der frühere Connector-Schreibfehler betraf `create_folder` und endete mit HTTP 403 `accessDenied`. Eine Aufhebung dieser Grenze ist nicht belegt. Deshalb bleibt der Mirrorupload ein manueller Schritt durch David. Keine Wiederholung desselben Schreibwegs oder automatisierte Browserumgehung. Für den anschliessenden Readback bei HTTP 429 die vorgegebene Wartezeit respektieren und das Tempo reduzieren. Leseberechtigung beweist keine Schreibberechtigung.

Die vorbereitete Uploadkopie liegt weiterhin im privaten Vorbereitungsordner. David hat die vier neuen Releaseordner hochgeladen, C01 bis C03 wurden vor dem Katalogwechsel vollständig abgeschlossen. Bestehende Releases und Rechte bleiben erhalten. Der [Vollzugsnachweis](eq-vollzugsnachweis-mvp07.md) hält C04 und die E-Umstellung fest. Q bleibt bis zum bestandenen E-Gate bei seinen bisherigen App-/Datenkonfigurationen, auch wenn der gemeinsame neue Code bereits wirken kann.

## 4 Rückfall und Browserzustand

Der lokal geprüfte Code-Rückfall ist jetzt das [Wiederherstellungspaket 0.7.0.1](../../outputs/recovery-mvp07-0.7.0.1-2026-10-08/artifacts/fristenrechner-schweiz-recovery-0.7.0.1.sppkg), SHA-256 `9e028245f3df72a6c13056e45624971389c573fc89da0e9d76cf9f2188fcc7d9`, zusammen mit den vier bisherigen Format-6-Mirrors und ihren frisch gesicherten Konfigurationen. Solution-, Feature- und Webpart-ID bleiben identisch. Das alte Paket `0.6.0.1` bleibt Archivgrundlage, ist aber nicht der vorgesehene auszuliefernde Wiederherstellungsconsumer.

Der [neue Paketnachweis](wiederherstellungskandidat-mvp07.md) ergänzt die unverändert erhaltene [Rückfalldiagnose](rueckfall-mvp07.md). Der gewählte Kandidat benötigt keine manuelle Datenbanklöschung und schreibt keine gemeinsamen v4-Standards um. Ein tatsächlicher Rückfall mit diesem Kandidaten wurde nicht ausgeführt. Der reguläre Katalog-/E-Site-Appwechsel auf das unveränderte Zielpaket `0.7.0.0` ist erfolgt.

1. Bei einem reinen Daten-/Konfigurationsbefund zuerst die betroffenen alten Mirrorpfade unter dem noch neuen, Format-6-fähigen Consumer wiederherstellen und prüfen. Dies ist ein Datenrückfall, **kein vollständiger Rückfall auf MVP 0.6**.
2. Für den vollständigen Code-Rückfall zuerst alle in diesem Auftrag umgestellten aktuellen Instanzen auf ihre gesicherten alten Format-6-Mirrorpfade zurückführen. AP5 bleibt bei seinem expliziten Pin. Danach nur bei frisch passender Versionsfolge das gebundene Paket `0.7.0.1` unter der bestehenden Katalogdatei bereitstellen und die bestehenden Site-Apps aktualisieren. Keine Deinstallation oder App-Neuanlage. Vor und nach dem Wechsel tatsächliche Paket-/Bundle-/Manifestidentität prüfen.
3. **R07C-H01:** Der ursprüngliche Store aus `0.6.0.1` verlangt Datenbankversion 1 und erhält nach dem MVP07-Upgrade `VersionError`. Der neue Wiederherstellungsconsumer öffnet Version 2 und verwendet ausschliesslich den erneut validierten Cache der konkreten Quelle. Im echten Paketcode sind Wiederanlauf, fehlende/falsche Quelle, AP5-Abgrenzung und Speichererhalt lokal geprüft. Vier aktuelle Hosts und AP5 müssen nach einer späteren Bereitstellung zusätzlich tatsächlich geprüft werden.
4. Persönliche gemeinsame Standards unter `fristenrechner.defaults.v1` bleiben im Wiederherstellungsmodus bytegleich. Eigene Standards dieses Modus werden ausschliesslich unter `fristenrechner.defaults.recovery-mvp06.v1` gespeichert und zurückgesetzt. Kein Rückmigrieren von v4. Eigene Testwerte vorher sichern und anschliessend gezielt wiederherstellen. Keine pauschale Löschung von LocalStorage, IndexedDB, Cookies oder anderen Browserdaten.
5. Alte offene Rechnerverbindungen können den Datenbankwechsel blockieren. Nur betroffene Testsitzungen regulär schliessen und neu laden. Der reguläre unveränderte `0.7.0.0`-Consumer enthält die zwei zusätzlich im Wiederherstellungskandidaten behobenen Lifecycle-Grenzen noch. Ein blockierter Zugriff führt zum Halt, nicht zur Datenlöschung. Unveränderliche Mirrorordner und der richtige tatsächliche Erstabruf sind nachzuweisen. Für eine spätere Wiederaufnahme der regulären MVP07-Funktion nach `0.7.0.1` einen erneut höheren, separat geprüften Paketstand vorsehen. Der lokale Test der vorhandenen `0.7.0.0`-Bytes belegt keinen betrieblichen Downgrade.

**H01 ist betrieblich geschlossen:** David hat den gebundenen Wiederherstellungsweg einschliesslich gemeinsamer Codewirkung, Auslieferungsfolge und anschliessender Hostprüfung ausdrücklich gebilligt. Der [gesonderte Entscheid](freigabe-r07c-h01.md) ergänzt den früheren lokalen Bauauftrag. Ein Datenbankreset bleibt ausgeschlossen.

## 5 Erteilter Freigabetext und ergänzender Rückfallentscheid

Der folgende Text wurde durch David erteilt und in der [Freigabenotiz](eq-freigabe-mvp07.md) festgehalten. Anschliessend hat er [H01 geschlossen](freigabe-r07c-h01.md) und den bedingten Wiederherstellungsvollzug mit Paket `0.7.0.1`, SHA-256 `9e028245f3df72a6c13056e45624971389c573fc89da0e9d76cf9f2188fcc7d9`, gebilligt. Noch offene technische Voraussetzungen bleiben wirksam. Ändert sich ein Paket oder die Auslieferungsfolge, muss die Vorlage neu gebunden werden.

> Ich gebe den Austausch der bestehenden Datei `fristenrechner-schweiz.sppkg` im gemeinsamen steimer.ch-Tenant-App-Katalog von der frisch bestätigten Version `0.6.0.1` auf das Paket `fristenrechner-schweiz-0.7.0.0.sppkg`, Version `0.7.0.0`, mit SHA-256 `bc8abe70c791f58d2cea9fb66ea568f604bcacae35fec9ae29aadeca5e0c6e09` frei. Mir ist bewusst, dass der gemeinsame Codewechsel sämtliche bereits mit dem Paket verbundenen Instanzen betreffen kann, einschliesslich Q vor dessen Konfigurationsumstellung und der historischen AP5-Ansicht. Keine automatische Installation auf zusätzlichen Sites.
>
> Der Vollzug bleibt auf die vier bestehenden Instanzen «Fristenrechner Test», «Entwicklungsumgebung», «Fristenrechner Gastdemo» und «Fristenrechner Gastdemo Teams» gemäss der privaten Zielbindung mit SHA-256 `d09ed734360581645475fb26b015be77138e49bcb89fd43160c5b463dfd242ec` und deren frischer eindeutiger Bestätigung begrenzt. Websiteinhalte und Appdetails dürfen ausschliesslich für diese bestehenden Rechner-Appupdates geöffnet werden. Nach meinem manuellen Mirrorupload und bestandenem Rohbytevergleich darf jeweils nur der Mirrorpfad auf den Datenrelease `2026-10-08-mvp-07-approved.1` umgestellt werden. Die zwei aktuellen SharePoint-Seiten dürfen hierzu publiziert und die bestehenden aktuellen Teamsregisterkarten entsprechend gespeichert werden.
>
> Der Katalogwechsel setzt den ausdrücklich geschlossenen Rückfallpunkt R07C-H01, eine gesicherte aktuelle Ausgangslage und vollständig geprüfte Mirrors voraus. Danach dürfen die beschriebenen technischen Tests mit synthetischen Fällen einschliesslich gezielter eigener Testpräferenzen und gespeicherter Kalenderdateien, aber ohne Outlook-Import, durchgeführt werden. Ein Rückfall darf nur nach dem zuvor konkret gebilligten Verfahren erfolgen. Bei abweichendem Bestand oder einem ungeklärten Fehler ist anzuhalten. Historischer AP5-Pin und Daten bleiben erhalten. AP21-Testapps, E05, M365-Berechtigungen und Richtlinien, zusätzliche Gäste, GitHub und steimer.ch-P bleiben unverändert. Reale Gastprüfung und manuelle Q-Abnahme erfolgen gesondert durch mich.

David entscheidet in Personalunion. Codex erstellt die Vorlage und führt später nur die konkret freigegebenen Schritte aus, ohne formelle Freigabe- oder Haftungsverantwortung.
