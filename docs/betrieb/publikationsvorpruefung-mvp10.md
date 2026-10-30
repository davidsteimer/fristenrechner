# R10-D · Lokale Publikationsvorprüfung MVP 0.10

Stand: 30. Oktober 2026. **Die lokale Publikationsvorprüfung ist abgeschlossen. Vor einer konkreten Publikationsfreigabe sind vier lokale Punkte P10-01 bis P10-04 zu bereinigen.** Die frischen Produkt-/Webregressionen sind bestanden. Kein neuer Produktfehler festgestellt. Keine Commitbildung, Veröffentlichung oder P-Freigabe.

## 1. Auftrag und Statusgrenzen

David Steimer hat die fachliche Q-Abnahme einschliesslich der dokumentierten Restbefunde und die begrenzte Outlook-Wiederverwendung bestätigt. Die reale Geräteprüfung und die tatsächliche Anmeldung des bestehenden B2B-Gasts auf Q-SharePoint und Q-Teams wurden anschliessend ausdrücklich bestätigt. Die [additive Abnahme](abnahme-q-mvp10.md) schliesst C08, ohne die historischen technischen Berichte umzuschreiben.

Beauftragt ist ausschliesslich die lokale Publikationsvorprüfung. Rechenlogik, Rechtsdaten, abgenommenes Paket und installierte E-/Q-Instanzen bleiben unverändert. Der letzte dokumentierte öffentliche P-Stand bleibt [MVP 0.9](produktionsbereitstellung-mvp09-2026-10-19.md). Eine neue Liveinventur von GitHub, M365 oder Hosting ist nicht Bestandteil dieser Prüfung.

Der [Betreiberentscheid vom 19. Oktober](hosting-plattformgrenze-header-cache-2026-10-19.md) gilt weiter: **keine erneute Header-/Cacheprüfung**. Eine konkrete P-Bereitstellung und Risikoübernahme für MVP 0.10 werden dadurch nicht vorweggenommen.

## 2. Unverändert gebundener Produktstand

| Gegenstand | Bindung |
| --- | --- |
| Anwendung / Paket | `0.10.0` / `0.10.0.0` |
| Datenrelease | `2026-10-28-mvp-010-approved.1`, 45 Dateien |
| Lokaler Datencommit | `01bbd96a296b0fc4d64cd554acc8cb122c3017a3` |
| Elterncommit | `70ce67425e046a7a38a4fbe66acbd93c75ca5983` |
| Manifest | 31’184 Bytes, SHA-256 `7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016` |
| Normales SPFx-Paket | 843’895 Bytes, SHA-256 `7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd` |
| Mirror-ZIP | 386’951 Bytes, SHA-256 `77019f584ea4c0482a3001460f35f312889b910fc46e2aee4aee90bba4edfbf6` |
| Web-ZIP | 1’060’212 Bytes, SHA-256 `a94740a78034e8cc41ae2c4907b917729c6f4743d7a307a60ee25834d550e1b3` |
| Recovery `0.10.0.1` | 327’129 Bytes, SHA-256 `0def9a2c4a126f6d7b30d22ebe600c1b471ccd10d6c81b7dfab9745a350d797b` |

Manifest und Mindestconsumer sind `17.0.0`, der Verwaltungskatalog ist `10.0.0`. Er umfasst 245 ausserbernische Verwaltungspfade in 25 Kantonen sowie den getrennten Berner Bestand, 36 Feiertagsbindungen und 46 Stillstandsprofile. Die 35 Kalender ersetzen keine fallbezogene Gebiets- und Zeitqualifikation. Sozialfreigaben bleiben ausschliesslich bernisch und auf 2026–2027 begrenzt. Produktsprachen bleiben DE/FR. Es wird keine vollständige Abdeckung aller kantonalen Spezialgesetze behauptet.

## 3. Tatsächlich ausgeführte lokale Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Laufzeit-/Schemaintegrität | Bestanden. 45 Laufzeitdateien, sieben Schemata, exakte lokale Gitblobs und Commiteltern geprüft |
| Normales Paket, Mirror und Web | Bestanden. Tatsächliche Archive gelesen. 18 Paketdateien, 45 Mirrordateien und zwölf Webdateien gegen die Baubindung verglichen, einschliesslich `.htaccess` |
| Recovery | Tatsächliche Paket-/Archivprüfung bestanden. 114 Eingangsbindungen und 157 archivierte Dateien des getrennten Vierpaketrundlaufs erneut bytegeprüft. Kein Neubau, neuer Rundlauf oder Host-Rückfall behauptet |
| E-/Q-Abschluss C07 | Neunzehn benannte gespeicherte Teilnachweise erneut geprüft, Gesamtnachweis mit 2’959 Eingängen reproduziert. Keine erneute gleichzeitige Onlineaufnahme |
| Outlook-Wiederverwendung | Technischen Vergleich gegen unveränderte Baueingänge und tatsächliche Kalenderdateien erneut geprüft. Kein neuer Outlook-Import |
| TypeScript | `tsc --noEmit` in getrennter Kopie bestanden |
| Produkt-/UI-Standardtests | 4’011 Tests in 124 Suiten bestanden, keine Fehler, Abbrüche oder übersprungenen Tests |
| Web-Standardtests | 199 Tests in 17 Suiten bestanden, keine Fehler, Abbrüche oder übersprungenen Tests |
| Node-Governance | 2’934 Tests in 79 Suiten bestanden, keine Fehler oder übersprungenen Tests |
| Quellenregister-/Indexselbsttest | Bestanden. 384 Registerquellen, davon 266 im produktiven Registerstatus, acht Ereignisse und acht Negativtests. Das ist kein neuer inhaltlicher Quellenabgleich |
| Python-Governance | Alle 45 Methoden bestanden, 32 im aktuellen und 13 im unveränderten historischen Kontext. Keine ausgelassenen Methoden oder abgeschwächten Aussagen |
| Bisheriger npm-Alias | Fehler reproduziert. Ungetrennte Discovery führt zwei historische Indexprüfungen mit dem heutigen Validator aus. **Nicht bestanden**, gesonderter Punkt P10-04 |
| Abschliessende Erhaltungskontrolle | 1’798 gesondert geschützte Dateien und alle 4’764 Standardkopie-Eingänge gegen den Ausgangsschnappschuss geprüft. Originalpakete, Rechtsdaten, geschützter Word-Projektplan, HEAD und Git-Index unverändert |

### Prüfkopie und Wiederverwendungsgrenzen

Die frische Kopie enthält **4’764 ausdrücklich inventarisierte Eingänge**. Sie verwendet dieselben 124 Produkt-, 79 Governance- und 17 Websuiten des abgeschlossenen B-Portabilitätslaufs. Die aktuelle Suiteauswahl im ursprünglichen Repository stimmt ebenfalls vollständig mit dieser Auswahl überein. Alle Kopieeingänge wurden vor und nach den jeweiligen Läufen bytegeprüft. Private aktuelle Quellen-/Abnahmearchive, `.git`, Hostnachweise und das aktuelle Release-Bauarchiv sind nicht in die Kopie übernommen. Bestehende npm-Abhängigkeiten und die Python-Umgebung werden verlinkt. Es wurde weder ein frisches `npm ci` noch ein neuer GitHub-Clone ausgeführt. Der bereits öffentlich gebundene historische ELG-Volltext bleibt als ausdrücklich ausgewiesene Referenz enthalten.

Die Standardkopie ist **noch nicht der endgültige öffentliche Dateiexport**. Dieser muss nach Festlegung der Positivliste separat geprüft werden. Historische Privatprüfungen bleiben getrennt. Testbauten entstehen ausschliesslich in der isolierten Kopie, nicht als Ersatz der definitiven Releaseartefakte.

Gegenüber dem B-Portabilitätsinventar sind vier lebende Dokumentationseinstiege und der bereits im B-Abschluss gebundene Finalizer weitergeführt. Die 451 produktiven Baueingänge stimmen weiterhin mit dem tatsächlichen Bau überein. Von 1’311 archivierten Referenzfixtures unterscheidet sich die aktuelle Datei `tests/public-app/ap19c3-build.test.ts` in Testtitel und Versionsvergleich `0.9.0` → `0.10.0`. Diese Änderung ist bereits im erfolgreichen B-Standardlauf 05 gebunden. Der frühere Bauarchivstand bleibt unverändert. Es handelt sich nicht um eine neue Produktänderung dieser Vorprüfung.

Die Produktprüfungen verwenden Node `22.23.2`. Die privaten Browsernachweisprüfer benötigen teilweise das native `RegExp.escape` und werden mit ihrer vorhandenen Node-24-Laufzeit geprüft. Ein erster C07-Aufruf mit Node 22 scheiterte an dieser fehlenden Funktion. Der unveränderte C07-Prüfer wurde danach mit Node `24.19.0` erfolgreich ausgeführt. Der fehlgeschlagene Aufruf bleibt erhalten, die Produkt-Toolchain wird nicht auf Node 24 umgestellt.

Ein zusätzlicher Aufruf des historischen B-Gesamtfinalizers scheitert an seiner damaligen Grenze für neue Dateien, konkret dem später erstellten R10-C-Vorbereitungsskript. Er wird **nicht** als vollständig grün ausgegeben und nicht nachträglich aufgeweicht. Die aktuellen Artefakt-, Host- und Erhaltungsprüfungen sind additive Nachweise für den fortgeschrittenen Projektstand. Öffentliche Nachweiskopien dürfen keine Ausführbarkeit des alten Gesamtfinalizers gegen beliebige spätere Arbeitsstände versprechen.

## 4. Publikationsbefunde und vorgeschlagene lokale Bereinigung

| Kennung | Befund | Begrenzte nächste Arbeit |
| --- | --- | --- |
| **P10-01** | Öffentliche Nachweise fehlen als konsistente, datensparsame und prüfbare Auswahl. Forschungs-/Bauberichte enthalten teilweise absolute Rechnerpfade. Private Hostbelege enthalten konkrete Tenant-, Browser- und Speicherbindungen | Separate öffentliche Nachweiskopien beziehungsweise Zusammenfassungen mit Hashbindung an die unveränderten Originale erstellen. Private Rohbelege, Quellenarchive, Browseraufnahmen und Sicherungen ausschliessen. Ausdrücklich zwischen öffentlich reproduzierbarer Integrität und privatem vollständigem Fach-/Hostnachweis unterscheiden |
| **P10-02** | Die konkrete Positivliste ist noch nicht geschlossen. Es gibt umfangreiche unversionierte Zwischenstände neben den erforderlichen Änderungen. Eine technisch portable Testkopie ist keine publizierte Dateiauswahl | Exakte Pfad-/Byte-/SHA-256-Liste und Ausschlüsse erstellen, gegen bestehenden Datencommit abgrenzen und den tatsächlichen ausgewählten Export ohne private Originale prüfen. Kein pauschales `git add` und keine Commitbildung in diesem Schritt |
| **P10-03** | Lebende Einstiegstexte und IT-Unterlagen sind nicht konsistent. Teile stehen noch bei B-Vorbereitung oder MVP 0.9. Die IT-Unterlagen nennen sogar MVP 0.8 als letzten öffentlichen Stand | README, Dokumentationseinstiege, Daten-/Test-/SPFx-README sowie technische Kurzdokumentation und Dritt-Tenant-Anleitung gezielt auf den nachgewiesenen MVP10-E-/Q-Stand nachführen. MVP09 bleibt letzter dokumentierter P-Stand. Historische Freigaben und Originalberichte nicht überschreiben |
| **P10-04** | **R10B-CLI-H01** ist reproduziert. `npm run test:source-reviews` endet trotz gültigem aktuellem Index mit zwei historischen Indexfehlern. Der anschliessende Node-Teil des Alias wird deshalb nicht erreicht | Ausschliesslich den Testeinstieg auf die bereits bewährten getrennten Pythonkontexte umstellen, den aktuellen Indexselbsttest und Node-Governance vollständig beibehalten. Gezielte Positiv-/Negativtests, separate Änderungsbindung und Exportnachtest. Keine Anpassung historischer Indices, Fachregeln, Assertions oder Abhängigkeiten |

**Diese vier Bereinigungen sind vorgeschlagen, nicht ausgeführt.** Insbesondere wird der alte B-Vertrag nicht rückwirkend so umgeschrieben, als hätte er die neue Aliasänderung bereits umfasst. Ein späterer CLI-Nachtrag erhält eine eigene Vorher-/Nachher-Bindung. Die abgenommenen Paketbytes müssen dafür nicht neu gebaut werden.

### Umfang und Datenschutz der Sichtung

Am Inventarstichtag wurden 75 geänderte versionierte und 22’123 unversionierte Dateien erfasst. Diese Zahl ist **nicht** der Releaseumfang. Die vorläufige Klassifikation umfasst 1’903 Prüfkandidaten, 644 ausdrückliche Privat-/Benutzermaterialausschlüsse, 13’211 gesondert auszuwählende Nachweisdateien und 6’440 sonstige nicht ausgewählte Dateien.

1’902 vorläufige Textkandidaten wurden auf begrenzte Muster geprüft. 51 Dateien enthalten Rechnerpfad-Muster, 167 Verweise auf private Arbeitsbereiche und drei ein Tenantadress-Muster. Die drei Adresstreffer betreffen Prüfskripte, unter anderem ein ausdrückliches Verbot des Tenantnamens in öffentlichen Dokumenten. Solche Treffer sind Prüfanlässe, nicht automatisch Datenschutzverletzungen. Keine Treffer für die geprüften konkreten Zugangsschlüssel-/signierten-URL-Muster. Daraus folgt **keine vollständige Geheimnisfreiheit**.

Die Textinhalte der vier tatsächlichen Auslieferungsarchive enthalten keine Treffer dieser Muster. Die zwei Paket-PNGs sind bytegleich zu den bereits veröffentlichten MVP09-Icons. Das ist kein neuer visueller Metadatencheck beliebiger Binärdateien. Der geänderte historische Word-Projektplan und vorhandene Website-/Download-Sicherungen sind ausdrücklich ausgeschlossen. Ihre Inhalte wurden nicht bereinigt oder publiziert. Die Sicherungsinhalte wurden für diese Sichtung nicht geöffnet.

Auch die Autor-/Committerangaben, Zeitstempel und Historie des bestehenden Datencommits werden bei einem Push sichtbar. Diese Gitmetadatensichtbarkeit ist in der späteren konkreten Publikationsfreigabe ausdrücklich einzuschliessen. Der Commit wird nicht umgeschrieben.

## 5. Fortbestehende Produkt- und Betriebsgrenzen

- Die in der [Q-Abnahme](abnahme-q-mvp10.md) akzeptierten BL-/VD-Textbefunde bleiben unverändert für den Folgeschritt vorgemerkt. Keine versteckte Produktkorrektur im Publikationspaket.
- Fall-, Orts-, Zeit- und Spezialrechtsgrenzen bleiben unverändert, einschliesslich der dokumentierten AI-, FR- und NE-Behandlung.
- Geräte-/Gastbestätigung und Outlook-Wiederverwendung sind menschliche Entscheidungen, keine durch Codex nachträglich selbst ausgeführten Prüfungen.
- Historische AP5-Daten/Pins, AP21-Testapps, E05, Berechtigungen, Richtlinien und Hostingkonfiguration bleiben unverändert.
- Kein neuer Supportauftrag, kein Header-/Cachetest und keine pauschale Risikoübernahme für andere Fehler.

## 6. Übergabe und nächster Entscheid

Als nächster Schritt wird die **begrenzte lokale Bereinigung P10-01 bis P10-04** empfohlen. Danach wird ein konkretes Publikationspaket mit Positivliste, separater Prüfsumme, Datencommit, neuem lokalen Nachweis und klaren Ausschlüssen zur Freigabe vorgelegt.

Erst nach dieser Freigabe folgen Commitbildung und separat autorisierter GitHub-Zugang beziehungsweise Push. P-Sicherung, Zielbindung, Stage, Umschaltung, Prüfmatrix und Betriebsfreigabe bleiben eine eigene Stufe. Diese Vorprüfung erlaubt keine der genannten externen Handlungen.

## 7. Nachweisbindungen

Die folgenden Prüfsummen binden die privaten Originalnachweise dieser Vorprüfung. Sie sind keine pauschale Freigabe zur Veröffentlichung dieser Dateien. Die spätere öffentliche Fassung muss private Inhalte ausschliessen und jede Transformation gesondert ausweisen.

| Nachweis | Bytes | SHA-256 |
| --- | ---: | --- |
| Inventar der frischen Standardkopie | 969’621 | `f62156700eb313a2e7b414e99b3314b26be8b9722b57e6a073140b4766b35e80` |
| Sichtungs-/Ausschlussinventar | 6’043’903 | `9c15c81cffa3d579d28105fb918ea704f57a3770ea915efb8132ce8bbfad0d65` |
| Produktprüfquittung | 449 | `702e64c3d06c38368050a4e34c7cba4ea5443f76a4faee294e3896995efee4be` |
| Webprüfquittung | 444 | `d79218df29e9fef84ea5c182d7cc290ccff4b5acdd21ef473d4364c9ac25b916` |
| Node-Governancequittung | 455 | `793fa8b2945752dc3e1bca4351c51bfc2e3a92d91a56b3c0998268f23ef59e57` |
| Getrennte Pythonkontexte | 1’024’877 | `8dfcae42bc8b416c550b823363e4c72989ac2ec679b96c3acfdf3fb2460217c2` |
| C07-/Outlook-Wiederholung und Rundlaufbindungen | 1’211 | `4c0ccbf60c5af6fe17b1ec656215a169b15fb5c3994e6fa7417bcbb586d074c4` |
| Abschliessende Erhaltungskontrolle | 263 | `e939a80749c3bb8f79d2b2e2d1e9b5c83dc0752d905c60622b290b0f71c6a52b` |

Die Rohlogs der fehlgeschlagenen Aufrufe bleiben getrennt erhalten. Sie werden weder gelöscht noch in einen pauschalen Grünstatus einbezogen. Die technische Abschlussquittung bindet zusätzlich diese Dokumentfassung, die menschliche Abnahmenotiz, alle Prüflogs und die vier offenen Publikationspunkte. **Vorprüfung abgeschlossen ist nicht gleich Publikation freigegeben.**
