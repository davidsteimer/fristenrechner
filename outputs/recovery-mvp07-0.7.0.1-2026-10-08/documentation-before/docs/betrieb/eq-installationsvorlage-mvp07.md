# MVP 0.7 Installationsvorlage für E und Q

Stand: 8. Oktober 2026. **Vorlage erstellt, keine Installationsfreigabe und kein Vollzug.** Sie bindet das in [R07-B fertiggestellte Paket](releaseartefakte-mvp-07.md) an die vier bestehenden E-/Q-Rechner. Zielwerte stammen aus den dokumentierten bisherigen Installationen. Vor einer Mutation sind sie frisch zu bestätigen.

**Offener technischer Haltepunkt R07C-H01:** Ein Rückfall auf `0.6.0.1` ist für bereits durch MVP 0.7 aktualisierte Browserdatenbanken nicht allein durch Paket- und Mirrorwechsel möglich. Die beauftragte [lokale Rückfallausarbeitung](rueckfall-mvp07.md) trennt Datenrückfall, gezielten Speicherreset und einen vorgeschlagenen Wiederherstellungskandidaten. Der lokale Nachweis ersetzt weder einen zulässigen SharePoint-Paket-Rückweg noch die Zustimmung zu realen Speicheränderungen. Solange kein vollständiger geprüfter und ausdrücklich gebilligter Wiederherstellungsweg vorliegt, bleibt der gemeinsame Katalogwechsel gesperrt. Produktcode, Pakete und echte Browserdaten bleiben unverändert.

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

**Vor jeder Mutation:** Die noch nicht gebundenen echten Teams-Registerkarten-IDs, Webpart-Instanzen und die kanonische Q-SP-Seite frisch identifizieren. Namen und Site allein erlauben keine Auswahl eines beliebigen gleichnamigen Objekts. Frühere Browser-Tab-IDs sind keine dauerhaften Teams-Identitäten. Bei Mehrdeutigkeit oder Abweichung anhalten und die Zielbindung ergänzen, bevor eine geänderte Instanz freigegeben wird.

`providerKind = sharepointMirror` bleibt erhalten. Nur `sharePointMirrorPath` wechselt vom jeweiligen Ordner `2026-10-01-mvp-06-approved.1` auf `2026-10-08-mvp-07-approved.1`. `githubBaseUrl`, übrige Eigenschaften und Host-Sichtbarkeit bleiben in ihrem frisch gesicherten Vorzustand. Ein leeres GitHub-Feld darf nicht unbemerkt einen neuen Standardpin aktivieren. Bei solcher Abweichung vor der Mutation anhalten.

**Die Konfigurationsbegrenzung ist keine Begrenzung der Codewirkung.** Der Austausch im gemeinsamen Tenant-App-Katalog kann alle bereits verbundenen Instanzen erreichen, auch Q vor deren Datenumstellung und die historische AP5-Ansicht. Weitere bekannte Verbraucher sind vorab hinsichtlich ihrer Wirkung einzuordnen. Keine automatische Installation auf zusätzlichen Sites und keine Untersuchung fremder Inhalte zur pauschalen Tenantinventur.

Die historische Registerkarte «V0.1 - Fristenrechner Schweiz» und ihre SharePoint-Seite behalten den GitHub-Provider, ihren expliziten AP5-Pin und den Datenrelease `2026-08-29-ap5-approved.1`. Keine Bearbeitung oder Publikation der historischen Seite. AP21-Testpakete und Testseite, E05, Gäste, Gruppen, Berechtigungen, Richtlinien, GitHub, P, Root-Webauftritt und Sitemap bleiben ausserhalb des Auftrags.

## 3 Vorprüfung und Ablauf nach gesonderter Freigabe

| Schritt | Aktion und Abschlusskriterium | Haltepunkt |
| --- | --- | --- |
| C00 | R07C-H01 anhand der [lokalen Rückfallausarbeitung](rueckfall-mvp07.md) lösen, Paket-/Daten-/Browserrückfall und zulässigen SharePoint-Rückweg konkret belegen | Lokale Wege untersucht. Entscheidung und vollständiger Paket-/Hostnachweis offen. Kein Katalogwechsel |
| C01 | Frische Katalogdatei und Paketversion, vier Site-Apps, konkrete Ansichten und vollständige Eigenschaften lesen. Bisheriges Paket roh sichern. Relevante Mirror-, Paket- und Assetberechtigungen vergleichen. Bestehende Seitendentwürfe erkennen und nicht überschreiben | Abweichender Bestand, fremder Entwurf, unklare Zielidentität oder ungeklärte Codewirkung führen zum Halt |
| C02 | David lädt je einen neuen vollständigen Releaseordner unter den vier vorhandenen Mirror-Eltern hoch. Bestehende Releases bleiben erhalten | Keine Übernahme allein aufgrund sichtbarer Ordner. Konflikt oder abweichende Rechte zuerst klären |
| C03 | Alle 164 Dateien frisch als Rohbytes zurücklesen. Je Ziel 41 Namen, Längen und SHA-256 sowie 40 Manifestreferenzen prüfen. Abschliessendes Inventar und relevante Rechte dokumentieren | Kein Teilrelease, keine zusätzlichen Dateien, keine Freigabe bei Hashabweichung |
| C04 | Nach konkreter Paketfreigabe dieselbe Katalogdatei ersetzen und bereitstellen. Gültig, aktiviert, bereitgestellt und Version prüfen. «Zu allen Sites hinzugefügt» bleibt Nein. Paket und tatsächlich ausgeliefertes Bundle erneut roh vergleichen | Jede Abweichung stoppt weitere Umstellungen |
| C05 | E-SP-App aktualisieren, Mirrorpfad ändern und aktuelle Seite publizieren. E-T-App aktualisieren, bestehenden Tab konfigurieren und gezielt neu laden. Technische E-Matrix und AP5-Erstabruf ausführen | E ist keine technisch isolierte Codeinstallation. Q kann den neuen Code bereits sehen. Keine Q-Konfigurationsumstellung bei blockierendem E-/AP5-Befund |
| C06 | Nach bestandenem E-Gate Q-SP und Q-T entsprechend aktualisieren. Vollständige technische Q-Matrix ausführen | Keine automatische fachliche Q-Abnahme aus Eigentümertests ableiten |
| C07 | Reale Geräteprüfungen, bestehende B2B-Gastanmeldung in zulässiger Umgebung und manuelle fachliche Q-Abnahme durch David | Offene Punkte einzeln ausweisen. GitHub und P bleiben separate Entscheide |

Die [gebundene Prüfmatrix](pruefmatrix-mvp07.md) konkretisiert R07-01 bis R07-16. Historische Nachweise werden als solche wiederverwendet, nicht als neue Hostprüfungen gezählt.

Der frühere Connector-Schreibfehler betraf `create_folder` und endete mit HTTP 403 `accessDenied`. Eine Aufhebung dieser Grenze ist nicht belegt. Deshalb bleibt der Mirrorupload ein manueller Schritt durch David. Keine Wiederholung desselben Schreibwegs oder automatisierte Browserumgehung. Für den anschliessenden Readback bei HTTP 429 die vorgegebene Wartezeit respektieren und das Tempo reduzieren. Leseberechtigung beweist keine Schreibberechtigung.

Die vorbereitete Uploadkopie befindet sich ausschliesslich lokal im privaten Vorbereitungsordner. Es ist **noch nichts hochzuladen**, solange die Vorbedingungen nicht geklärt und der konkrete Schritt nicht beauftragt sind.

## 4 Rückfall und Browserzustand

Der dokumentierte Rückfallkandidat ist [Paket 0.6.0.1](../../outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg), SHA-256 `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587`, zusammen mit den vier bisherigen Format-6-Mirrors und ihren frisch gesicherten Konfigurationen. Das ist noch kein vollständig nachgewiesener Rückfallweg.

Die [Rückfallausarbeitung](rueckfall-mvp07.md) konkretisiert inzwischen die ursprünglichen Punkte unten. Ein gezielter Reset ist nur eine bedingte Alternative für erfasste Speicherkontexte. Für einen vollständigen Rückfall ohne manuelle Löschung wird ein gesonderter Wiederherstellungskandidat als höhere SPFx-Version vorgeschlagen, mit archivierter MVP06-Fachlogik, konfigurationsgebundenem Cache und Schutz der Standards. Das ist noch kein gebautes oder freigegebenes Paket. Das unveränderte `0.7.0.0` wird nicht stillschweigend durch einen neuen Kandidaten ersetzt.

1. Bei einem reinen Daten-/Konfigurationsbefund zuerst die betroffenen alten Mirrorpfade unter dem noch neuen, Format-6-fähigen Consumer wiederherstellen und prüfen. Dies ist ein Datenrückfall, **kein vollständiger Rückfall auf MVP 0.6**.
2. Ein Paketdowngrade darf nie einen alten Consumer mit Format-7-Mirrors zurücklassen. Vorher sämtliche in diesem Auftrag umgestellten Instanzen auf den gesicherten kompatiblen Datenstand zurückführen. Die Zulässigkeit des eigentlichen Downgrades im Katalog und in den bestehenden Site-Apps muss vorab geklärt sein. Keine Deinstallation oder App-Neuanlage als improvisierter Ersatz.
3. **R07C-H01:** Der neue Store öffnet `fristenrechner-spfx` mit Datenbankversion 2. Der archivierte 0.6.0.1-Store verlangt Version 1 und erhält danach `VersionError`. Der lokale Test verwendet die tatsächlichen beiden Implementierungen mit einer ausschliesslich im Prozessspeicher gehaltenen IndexedDB-Testumgebung. Eine separate frische Testsitzung funktioniert beim alten Store, beweist aber keine Wiederherstellung bestehender Nutzer. Diagnose SHA-256 `0864a3ee6fac4175a9a88588f5c673247e506ef0c25336e5ebd85a642c8d8d70`, privater Beleg `rollback-idb-check.json`.
4. Persönliche Standards verwenden weiterhin `fristenrechner.defaults.v1`. Der neue Consumer kann historische Formulare bedienen. Der tatsächlich alte Code verwirft ein v4-Objekt zugunsten der v3-Ausgangswerte, beim blossen Laden wird der gespeicherte Rohwert aber nicht überschrieben. Eine Rückmigration findet damit nicht statt. Eigene Testwerte vorher sichern und anschliessend gezielt wiederherstellen. Nicht vom gleichnamigen Schlüssel auf identische Formate schliessen. Keine pauschale Löschung von LocalStorage, IndexedDB, Cookies oder anderen Browserdaten.
5. Alte offene Rechnerverbindungen können den Datenbankwechsel blockieren. Nur die betroffenen Testsitzungen regulär schliessen und erneut öffnen. Die neue Prüfung muss den wirklichen Erstabruf dokumentieren. «active» im alten Store zu entfernen genügt für den neuen konfigurationsgebundenen Cache nicht.

**Zum Schliessen von H01 erforderlich:** ein konkret beschriebener Wiederherstellungsweg für bereits verwendete Sitzungen, ein entsprechender lokaler Nachweis und ein ausdrücklicher Entscheid zu allfälligen zusätzlichen Auswirkungen. Eine Produktkorrektur mit neuem Paket erfordert eine neue Artefaktbindung. Ein Eingriff in bestehende Browserdaten benötigt eine gesonderte, genau begrenzte Freigabe. Diese Vorlage erteilt weder das eine noch das andere.

## 5 Vorgeschlagener Freigabetext nach Schliessen von H01

**Noch nicht beschlossen und derzeit nicht zur unmittelbaren Ausführung geeignet.** Der geschlossene H01-Nachweis und die frische Zielbestätigung sind vor Verwendung dieses Texts zu ergänzen. Ändert sich das Paket, müssen Datei, Version und Prüfsumme neu gebunden werden.

> Ich gebe den Austausch der bestehenden Datei `fristenrechner-schweiz.sppkg` im gemeinsamen steimer.ch-Tenant-App-Katalog von der frisch bestätigten Version `0.6.0.1` auf das Paket `fristenrechner-schweiz-0.7.0.0.sppkg`, Version `0.7.0.0`, mit SHA-256 `bc8abe70c791f58d2cea9fb66ea568f604bcacae35fec9ae29aadeca5e0c6e09` frei. Mir ist bewusst, dass der gemeinsame Codewechsel sämtliche bereits mit dem Paket verbundenen Instanzen betreffen kann, einschliesslich Q vor dessen Konfigurationsumstellung und der historischen AP5-Ansicht. Keine automatische Installation auf zusätzlichen Sites.
>
> Der Vollzug bleibt auf die vier bestehenden Instanzen «Fristenrechner Test», «Entwicklungsumgebung», «Fristenrechner Gastdemo» und «Fristenrechner Gastdemo Teams» gemäss der privaten Zielbindung mit SHA-256 `d09ed734360581645475fb26b015be77138e49bcb89fd43160c5b463dfd242ec` und deren frischer eindeutiger Bestätigung begrenzt. Websiteinhalte und Appdetails dürfen ausschliesslich für diese bestehenden Rechner-Appupdates geöffnet werden. Nach meinem manuellen Mirrorupload und bestandenem Rohbytevergleich darf jeweils nur der Mirrorpfad auf den Datenrelease `2026-10-08-mvp-07-approved.1` umgestellt werden. Die zwei aktuellen SharePoint-Seiten dürfen hierzu publiziert und die bestehenden aktuellen Teamsregisterkarten entsprechend gespeichert werden.
>
> Der Katalogwechsel setzt den ausdrücklich geschlossenen Rückfallpunkt R07C-H01, eine gesicherte aktuelle Ausgangslage und vollständig geprüfte Mirrors voraus. Danach dürfen die beschriebenen technischen Tests mit synthetischen Fällen einschliesslich gezielter eigener Testpräferenzen und gespeicherter Kalenderdateien, aber ohne Outlook-Import, durchgeführt werden. Ein Rückfall darf nur nach dem zuvor konkret gebilligten Verfahren erfolgen. Bei abweichendem Bestand oder einem ungeklärten Fehler ist anzuhalten. Historischer AP5-Pin und Daten bleiben erhalten. AP21-Testapps, E05, M365-Berechtigungen und Richtlinien, zusätzliche Gäste, GitHub und steimer.ch-P bleiben unverändert. Reale Gastprüfung und manuelle Q-Abnahme erfolgen gesondert durch mich.

David entscheidet in Personalunion. Codex erstellt die Vorlage und führt später nur die konkret freigegebenen Schritte aus, ohne formelle Freigabe- oder Haftungsverantwortung.
