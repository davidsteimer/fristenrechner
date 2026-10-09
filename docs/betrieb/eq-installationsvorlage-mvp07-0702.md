# MVP 0.7 Korrekturinstallation und Wiederherstellungsweg

Stand: 9. Oktober 2026. **Die begrenzte Installation ist ausgeführt, R07-C ist nach [menschlicher Geräte-/Gastbestätigung und manueller Q-Abnahme](abnahme-q-mvp07.md) geschlossen.** Die [ursprüngliche Freigabe mit geschlossenem R07C-H02](eq-freigabe-mvp07-0702.md) und die nachstehenden Vertragsabschnitte bleiben unverändert erhalten. Diese Vorlage bindet die [Darstellungskorrektur `0.7.0.2`](darstellungskorrektur-mvp07-0702.md) sowie den [lokal geprüften, nicht eingesetzten Recovery `0.7.0.3`](wiederherstellungskandidat-mvp07-0703.md). Frühere Freigaben und Prüfnachweise behalten ihren damaligen Umfang.

Der [gesonderte Vollzugsnachweis](eq-vollzugsnachweis-mvp07-0702.md) dokumentiert Katalog und vier bestehende E-/Q-Instanzen auf `0.7.0.2` mit Datenrelease `2026-10-08-mvp-07-approved.1`, das vor Q-Mutation geschlossene E-Gate, die regulären Desktopprüfungen und alle acht gespeicherten Kalenderdateien. Eigene Testpräferenzen und Ansichten sind bereinigt. David Steimer hat am 9. Oktober 2026 reale Geräteprüfung und Gastzugriff als bestanden bestätigt und Q manuell abgenommen. Die [Abnahmenotiz](abnahme-q-mvp07.md) trennt diese menschliche Bestätigung von technischen Einzelbelegen. F08-Anzeigeort und T09-Wiederverwendung bleiben ausdrücklich qualifiziert, kein automatisierter uneingeschränkter Q-Gesamtpass. R07-D-Publikationsvorprüfung ist der nächste lokale Schritt, noch nicht ausgeführt. Keine GitHub-/P-Freigabe und keine pauschale Outlook-Importwiederverwendung. Die nachstehenden Freigabebedingungen und Sollprüfungen bleiben unverändert.

## 1 Gebundene Pakete und Voraussetzungen

| Zweck | Identität |
| --- | --- |
| Reguläre Darstellungskorrektur | `fristenrechner-schweiz-0.7.0.2.sppkg`, SHA-256 `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` |
| Bedingter vollständiger Rückfall | `fristenrechner-schweiz-recovery-0.7.0.3.sppkg`, SHA-256 `9490890245e8aad54a5ec5eae731a0ee895f9fc9439dec19b371315085794702` |
| Ziel im bestehenden Tenant-App-Katalog | Dieselbe Datei `fristenrechner-schweiz.sppkg` ersetzen. Keine zusätzliche versionsbenannte Katalogdatei |
| Technische Identitäten | Solution `13090feb-a6bf-40fa-9d3c-ec8d90516a60`, Feature `3edf1509-41e9-4a2f-8005-df510eec43b6`, Webpart `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Reguläre Daten | `2026-10-08-mvp-07-approved.1`, Manifest SHA-256 `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |
| Daten beim vollständigen Rückfall | Jeweils eigener gesicherter Mirror `2026-10-01-mvp-06-approved.1`, Manifest SHA-256 `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Historische AP5-Ansicht | Eigener expliziter GitHub-Pin und Release `2026-08-29-ap5-approved.1` bleiben erhalten |

Der dokumentierte Ausgangsstand ist das gemeinsame Katalogpaket `0.7.0.0`. Beide E-Apps und E-Mirrorpfade sind umgestellt, die Q-App-/Mirrorumstellung ist noch offen. Dies ist der [vorhandene Vollzugsnachweis](eq-vollzugsnachweis-mvp07.md), keine neue Livebestandsaufnahme. Vor dem Austausch sind Paketbytes, Versionen, vier konkrete Instanzen, vollständige Konfigurationen, relevante Berechtigungen und allfällige Seitendentwürfe frisch eindeutig zu bestätigen und zu sichern. Bei Abweichung oder ungeklärter Codewirkung anhalten.

Die private Zielbindung bleibt `targets.private.json` mit SHA-256 `d09ed734360581645475fb26b015be77138e49bcb89fd43160c5b463dfd242ec`. Ihr lokaler Hash ist erneut bestätigt. URLs, Site-, Registerkarten- und Webpartinstanz-IDs werden im Vollzug aus den gebundenen privaten Belegen abgeglichen, nicht aus Anzeigenamen erraten. Die Zielanhänge bleiben ausserhalb der öffentlichen Unterlagen.

**R07C-H02 ist durch die ausdrückliche Bestätigung von Abschnitt 5 geschlossen.** Die dort verlangten frischen technischen Vorbedingungen bleiben vor dem tatsächlichen Katalogwechsel zwingend. H01 und das damals gebilligte `0.7.0.1` bleiben historische Entscheide für die frühere Versionsfolge.

## 2 Begrenzte Ziele und Reihenfolge

| Ziel | Erlaubtes Delta nach Bestätigung |
| --- | --- |
| E-SP, «Fristenrechner Test» | Bestehende Rechner-App auf `0.7.0.2` aktualisieren. Aktuelle Seite «Fristenrechner-MVP.aspx» prüfen. Bereits korrekt gesetzten MVP07-Mirror und übrige Eigenschaften nicht ändern |
| E-T, «Entwicklungsumgebung» | Bestehende Rechner-App auf `0.7.0.2` aktualisieren. Kanal «Fristenrechner», bestehende Registerkarte «Fristenrechner Schweiz – Teams» prüfen. Bereits korrekt gesetzten MVP07-Mirror und übrige Eigenschaften nicht ändern |
| Q-SP, «Fristenrechner Gastdemo» | Erst nach bestandenem E-Gate bestehende App auf `0.7.0.2` aktualisieren. Im gebundenen Rechner der aktuellen Startseite ausschliesslich auf den verifizierten MVP07-Mirror wechseln und diese Seite publizieren |
| Q-T, «Fristenrechner Gastdemo Teams» | Erst nach bestandenem E-Gate bestehende App auf `0.7.0.2` aktualisieren. Kanal «Fristenrechner», bestehende Registerkarte «Fristenrechner Schweiz (1)» ausschliesslich auf den verifizierten MVP07-Mirror umstellen und speichern |

Der Austausch im gemeinsamen Katalog kann bereits **alle verbundenen Instanzen** erreichen, auch Q vor der App-/Mirrorumstellung, AP5 und allfällige weitere bestehende Verbraucher. Der E-Nachtest ist keine technisch isolierte Codeauslieferung. Keine zusätzliche Site-App installieren und keine pauschale Tenantinventur ausserhalb der gebundenen Ziele durchführen.

Die vier MVP07-Mirrors wurden bereits vollständig hochgeladen und roh geprüft. Ein erneuter Upload ist nicht vorgesehen. Vor Wiederaufnahme die vollständigen Sollbytes und die gesicherten Format-6-Rückfallquellen lesend bestätigen. Bei fehlenden oder abweichenden Dateien anhalten, nicht automatisch überschreiben oder neu hochladen. Provider, inaktive GitHub-Pins und übrige Webparteigenschaften bleiben erhalten.

## 3 Nachtests und Wiederverwendung

Nach Paketwechsel die frisch ausgelieferte SPPKG und das tatsächlich geladene Bundle gegen den jeweiligen lokalen Nachweis vergleichen. Keine neue API-Berechtigung und keine automatische Verteilung auf zusätzliche Sites akzeptieren. Bestehende Site-Apps und tatsächliche Ansichten getrennt nachweisen.

| Nachtest | Umfang auf den beiden E-Hosts |
| --- | --- |
| N01 Identität | Katalog und Site-Apps `0.7.0.2`, zugehöriger Bundlehash, unveränderte aktive Mirrorquelle und MVP07-Manifest |
| N02 Layoutbefund R07C-B01 / T07 | Deutsch und Französisch. Geschlossene Titel und geöffnete Listen, insbesondere Zustellart sowie lange VRPG-/Sozial-/Kalenderanknüpfungen. Breite und schmale wirkliche SharePoint-/Teamsansicht, echter 200-Prozent-Zoom, normale und ausgewählte Einträge sowie vorhandene deaktivierte Optionen. Keine Ellipsen oder abgeschnittenen relevanten Texte. Datum linksbündig, sichtbarer Format-/Hilfetext, normaler Tastaturpfad und Teamsnavigation |
| N03 Funktionsstichproben | F01 Bern und F02 Tessin nach unveränderter Hauptmatrix, zusätzlich F03 SG/StPO mit gesperrtem Ergebnis/Export und F08 EOG. F01/F02 zusätzlich französisch. Datumskurzform bestätigen, Resultat/Export durch erneute Texteingabe sofort invalidieren. Je Host eine deutsche F01- und französische F02-Kalenderdatei tatsächlich speichern und prüfen, kein Outlook-Import |
| N04 AP5 | Historische SharePoint-Seite und Teams-Alias mit explizitem altem Pin, altem Release und neuem Bundle prüfen. StPO `16.09.2026` plus zehn Tage ergibt `28.09.2026`. Keine historische Seite bearbeiten oder publizieren, keine gemeinsamen Standards dort speichern |
| N05 Bereinigung | Nur eigene Testpräferenzen und lokale Testsperren zurücknehmen, ursprünglichen Zustand wiederherstellen. Browserzoom zurücksetzen. Keine pauschale Browserdatenlöschung |

Die vollständigen früheren E-Nachweise für unveränderte Fachregeln, Datenbytes, Cache-/Providerverhalten und Präferenzmigration bleiben mit ihrem tatsächlichen Paketstand `0.7.0.0` gekennzeichnet. Ihre Wiederverwendung stützt sich auf das nachgewiesene reine Darstellungsdelta, unveränderte Daten und die erneuten lokalen Pakettests. Sie werden nicht als frisch ausgeführte Hosttests von `0.7.0.2` gezählt. Neue Befunde oder abweichende Konfigurationen heben die betreffende Wiederverwendung auf und führen zum Halt beziehungsweise gezielten Zusatztest. T07 wird vollständig neu geprüft, nicht durch die lokale Vorschau ersetzt.

**Q bleibt ein eigenständiger Prüfschritt.** Nach bestandenem E-Gate und seiner vorgesehenen App-/Mirrorumstellung die vollständige technische Q-Matrix F01–F09 und T01–T09 ausführen. E-Nachweise ersetzen keine Q-Hostnachweise. Reale Geräte-/VoiceOver-Prüfung, bestehende B2B-Gastanmeldung und manuelle fachliche Q-Abnahme bleiben gemäss T10–T12 gesondert bei David. Conditional Access respektieren.

## 4 Bedingter Rückfall

Bei einem ungeklärten Fehler weitere Umstellungen stoppen. Für reine Daten-/Konfigurationsprobleme kann der bereits beschriebene begrenzte Datenrückfall unter dem regulären Consumer genügen. Ein vollständiger Code-Rückfall darf nur mit dem hier konkret gebilligten Recovery erfolgen:

1. Alle innerhalb dieses Auftrags bereits auf MVP07 umgestellten aktuellen Instanzen auf ihre jeweils gesicherten Format-6-Mirrorpfade zurückführen. Noch nicht umgestellte Q-Instanzen behalten ihre vorhandenen Format-6-Pfade. Nur die hierfür nötigen aktuellen Seiten publizieren beziehungsweise aktuellen Registerkarten speichern. AP5 behält seinen expliziten Pin und wird nicht bearbeitet.
2. Vor dem Codewechsel genaue Zielidentitäten, Konfigurationen, bestehende Paketversion und Rückfallquellen bestätigen. Bei passender Folge `0.7.0.2` → `0.7.0.3` dieselbe Katalogdatei ersetzen und die vier bestehenden Rechner-Apps kontrolliert auf den Wiederherstellungsstand bringen. Keine Deinstallation oder Neuanlage.
3. Rohbytevergleich von Paket und ausgeliefertem Bundle, sichtbaren Wiederherstellungsmodus, Datenquelle und Format-6-Manifest auf allen vier aktuellen Hosts sowie AP5 gesondert prüfen. Den gesicherten StPO-Fall und die Kalenderdatei kontrollieren. Standardschutz mit gesicherten eigenen synthetischen Testwerten prüfen und deren Vorzustand gezielt wiederherstellen.
4. Keine Datenbank, Cookies oder Browserdaten löschen. Gemeinsame Standards bleiben geschützt, eigene Recovery-Standards sind getrennt. Betroffene blockierende Testsitzungen dürfen regulär geschlossen und neu geladen werden, ein ungeklärter Fehler rechtfertigt keinen Datenreset.

Recovery stellt den Funktionsumfang MVP 0.6 wieder her. Die schweizweite MVP07-Kalenderaktivierung, AP21-Datumseingabe und aktuelle Darstellungskorrektur sind dann nicht verfügbar. Das ist der dokumentierte Rückfallumfang, keine neue fachliche Einschränkungsentscheidung. Die gemeinsame Codewirkung gilt auch beim Recovery. Eine spätere reguläre Wiederaufnahme benötigt einen **erneut höheren, separat gebauten und geprüften Paketstand**, beispielsweise `0.7.0.4`. Ein Downgrade auf `0.7.0.2` ist nicht umfasst.

## 5 Ausdrücklich bestätigter gemeinsamer Freigabetext

**Am 9. Oktober 2026 durch David Steimer im Projektchat vollständig erteilt.** Der Wortlaut bleibt nachstehend erhalten. Der tatsächliche Vollzug wird davon getrennt nachgewiesen.

> Ich gebe den Austausch der bestehenden Datei `fristenrechner-schweiz.sppkg` im gemeinsamen steimer.ch-Tenant-App-Katalog vom frisch bestätigten Stand `0.7.0.0` auf `fristenrechner-schweiz-0.7.0.2.sppkg`, Version `0.7.0.2`, mit SHA-256 `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` frei. Mir ist bewusst, dass der gemeinsame Codewechsel sämtliche bereits verbundenen Instanzen erreichen kann, einschliesslich Q vor der App-/Mirrorumstellung, der historischen AP5-Ansicht und allfälliger weiterer bestehender Verbraucher. Keine automatische Installation auf zusätzlichen Sites.
>
> Der Vollzug bleibt auf die vier bestehenden Rechnerinstanzen «Fristenrechner Test», «Entwicklungsumgebung», «Fristenrechner Gastdemo» und «Fristenrechner Gastdemo Teams» gemäss privater Zielbindung mit SHA-256 `d09ed734360581645475fb26b015be77138e49bcb89fd43160c5b463dfd242ec` und deren frischer eindeutiger Bestätigung begrenzt. Die bisherige Ausgangssicherung ist frisch zu bestätigen beziehungsweise gezielt zu ergänzen. Die bereits hochgeladenen MVP07-Mirrors und die gesicherten Format-6-Rückfallquellen sind vollständig gegen die Sollbytes zu prüfen. Bei abweichendem Bestand oder einem ungeklärten Fehler ist anzuhalten.
>
> Websiteinhalte und Appdetails dürfen ausschliesslich für diese bestehenden Rechner-Appupdates geöffnet werden. Zuerst dürfen die beiden E-Apps auf `0.7.0.2` aktualisiert und N01 bis N05 ausgeführt werden. Ihre bereits gesetzten MVP07-Mirrorpfade bleiben erhalten. Erst nach bestandenem E-Gate dürfen die beiden Q-Apps aktualisiert und ausschliesslich deren Mirrorpfade auf `2026-10-08-mvp-07-approved.1` umgestellt werden. Die betreffende aktuelle Q-SharePoint-Seite darf dazu publiziert und die bestehende aktuelle Q-Teamsregisterkarte gespeichert werden. Anschliessend ist die vollständige technische Q-Matrix F01 bis F09 und T01 bis T09 durchzuführen. Synthetische Fälle, gezielte eigene Testpräferenzen und gespeicherte Kalenderdateien sind umfasst, Outlook-Importe nicht. Reale Geräte-/Gastprüfung und manuelle Q-Abnahme bleiben gesondert bei mir.
>
> Ich schliesse R07C-H02 und billige für einen nötigen vollständigen Rückfall das Paket `fristenrechner-schweiz-recovery-0.7.0.3.sppkg`, Version `0.7.0.3`, mit SHA-256 `9490890245e8aad54a5ec5eae731a0ee895f9fc9439dec19b371315085794702`. Dieser darf nach Abschnitt 4 mit den jeweils gesicherten Format-6-Mirrors, unverändertem AP5-Pin, geschützten gemeinsamen Standards und anschliessender Prüfung der vier aktuellen Hosts sowie AP5 ausgeführt werden. Ein Browserdatenreset ist nicht umfasst. Die gemeinsame Codewirkung, der Rückfall auf den Funktionsumfang MVP 0.6 und die Notwendigkeit eines erneut höheren Paketstands für eine spätere reguläre MVP07-Wiederaufnahme sind mir bekannt.
>
> AP21-Testapps, E05, zusätzliche Gäste, M365-Berechtigungen und Richtlinien, GitHub und steimer.ch-P bleiben unverändert. Die historischen AP5-Pins und Daten bleiben erhalten. Keine Deinstallation oder zusätzliche Site-Installation. Fremde Browserpräferenzen dürfen nicht verändert werden.

AP21-Testapps, E05, zusätzliche Gäste, Gruppen, M365-Berechtigungen und Richtlinien, GitHub, steimer.ch-P, Root-Webauftritt und Sitemap bleiben unverändert. Outlook-Importe und Terminlöschungen sind nicht umfasst. David entscheidet in Personalunion. Codex dokumentiert und vollzieht nur die ausdrücklich freigegebenen Schritte, ohne formelle Freigabe- oder Haftungsverantwortung.
