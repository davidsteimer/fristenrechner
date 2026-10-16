# MVP 0.8 Publikationspaket zur Freigabe

Stand: 16. Oktober 2026. **P08-01 bis P08-03 sind lokal bereinigt und geprüft. Das konkrete Publikationspaket liegt zur Freigabe vor. Noch keine Commit-, GitHub- oder P-Freigabe.** Die ursprüngliche [Publikationsvorprüfung](publikationsvorpruefung-mvp08.md) bleibt als damaliger Befund unverändert. Dieser Nachtrag dokumentiert die anschliessende Bereinigung. R08-D insgesamt bleibt bis zum gesondert freigegebenen Publikations- und Bereitstellungsvollzug offen.

## Gegenstand der Freigabe

Verbindlich ist die einzelne Datei [publication-package.json](../../outputs/publication-mvp08-2026-10-16/publication-package.json). Sie enthält für jede ausgewählte Datei ihren Repositorypfad, die Bytezahl und SHA-256, zusätzlich den Datencommit, sechs feste Releaseanker und die ausdrücklichen Ausschlüsse. Die separat vorgelegte SHA-256-Prüfsumme bindet diese Liste selbst. Sie steht bewusst nicht im Dokument oder in ihrer eigenen Dateiliste, um eine zirkuläre Hashbindung zu vermeiden.

Die Liste bezeichnet den neu zu veröffentlichenden beziehungsweise geänderten Bestand, nicht nochmals jede unveränderte Datei der bisherigen Repositoryhistorie. Die 42 Dateien des schon vorhandenen lokalen Datencommits sind ausdrücklich eingeschlossen. Das Manifest selbst gehört zusätzlich zur Veröffentlichung. Sein abschliessender lesender Prüflauf erfolgt nach Fertigstellung aller Unterlagen.

| Bestandteil | Abgrenzung |
| --- | --- |
| Bestehender lokaler Datencommit | `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb`, genau 42 Dateien des Datenrelease `2026-10-15-mvp-08-approved.1` |
| Noch zu bildender Publikationscommit | Ausschliesslich die übrigen positiv bezeichneten Dateien plus Publikationsmanifest. Kein pauschales `git add .` |
| Quellstand | Abgenommene AP23-/MVP08-Implementierung, Datenverträge, Tests, Buildwerkzeuge und erforderliche Referenzdaten |
| Öffentliche Nachweise | Bereinigte Kopien mit Originalhash und ausdrücklich ausgewiesenen Auslassungen. Historische Fehlversuche bleiben erkennbar |
| Lebende Dokumentation | README, SPFx-Anleitung, technische Kurzbeschreibung, Dritt-Tenant-Anleitung, aktuelle Verzeichnisse und Releasehinweise |
| Auslieferung | Unveränderte definitive SPFx-, Mirror-, Web- und Recovery-Artefakte |

## Unveränderte Auslieferungsartefakte

Alle vier Dateien liegen unter `outputs/release-mvp08-2026-10-15/`. Diese Bereinigung baut sie nicht neu und verändert weder Rechenlogik noch Rechtsdaten oder die abgenommenen E-/Q-Instanzen.

| Datei | SHA-256 |
| --- | --- |
| `fristenrechner-schweiz-0.8.0.0.sppkg` | `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a` |
| `fristenrechner-mvp08-sharepoint-mirror.zip` | `81359611b5399b1b79c0f9dedb0d5ac540c9192a1382feb67095dadb8e89f8dd` |
| `fristenrechner-mvp08-steimer-web.zip` | `0abbc23d691835e5b04b64975140afb36c4bfa89482ff872c0c76188673f4176` |
| `fristenrechner-schweiz-recovery-0.8.0.1.sppkg` | `8e387297d43df28e2fe4d3c7c9ae239bb2cdc6a9e3216e4c59c928c50d950e7b` |

Das Recovery stellt den Funktionsumfang MVP 0.7 und Format 7 wieder her. Es wurde nicht eingesetzt. Der Datenrelease bleibt auf Manifest und Mindestconsumer `8.0.0` gebunden. Die fünf Tessiner und sieben Bündner Verwaltungswege gelten nur im freigegebenen Zeitraum. Ausserbernische Sozialfreigaben werden nicht ergänzt. #50 zur Höhe des Datumsfelds bleibt im nächsten Release.

## Bereinigung der drei Punkte

### P08-01 Öffentliche Nachweise

Der [öffentliche Evidence-Bestand](../../outputs/publication-mvp08-2026-10-16/evidence/manifest.json) enthält 30 Dateien: zwei pfadbereinigte vollständige AP23-Berichte, 21 vollständige Buildprotokolle und sieben gekennzeichnete Zusammenfassungen. Die Protokolle umfassen auch den fehlgeschlagenen ersten Recovery-Versuch. Ergebnisse, Fehler und damalige Statuswerte werden nicht nachträglich verbessert.

Jede Kopie bindet Originalpfad, Originalhash und -länge, Transformationsart sowie Zielhash und -länge. Bei Zusammenfassungen sind ausgewählte und ausgelassene Felder dokumentiert. Die lokalen Originale bleiben unverändert. Die ursprüngliche Quellenabnahme wird zusätzlich byteidentisch als öffentlicher Releaseanker übernommen.

Unveränderliche ältere Unterlagen dürfen weiterhin auf private Originalnachweise verweisen. Das ist keine Zusage, dass jeder historische Rohbeleg öffentlich abrufbar ist. Die Zuordnung zu den öffentlichen Kopien steht im Evidence-Manifest. Ein öffentlicher Prüfer bestätigt deren Integrität, nicht den gesamten privaten Quellen- oder Recovery-Vollaudit.

### P08-02 Konkrete Auswahl und unabhängiger Testbestand

Ausgeschlossen bleiben insbesondere `.work/`, `Userinput/`, private Zielbindungen, Browser-/HAR-Rohbelege, Website- und Rechnerbackups, vollständige private Build-/Quellenarchive, überzählige ältere Paketkopien sowie das tenantgebundene Werkzeug `verify-r08c-baseline.mjs`.

Die bereits vorbestehende lokale Änderung an `outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx` gehört nicht zur Auswahl und bleibt unangetastet. Die bereits veröffentlichte historische Version wird dadurch weder entfernt noch ersetzt. Die AP23-Erhebungsmappe besteht ihre gesonderte strukturelle Publikationskontrolle und ist bytegleich zum abschliessend geprüften Referenzstand. Kein neuer Export oder fachliche Änderung.

Die Prüfung trennt zwei Kopien:

1. Der reine Auswahlexport enthält genau die Positivliste plus ihr Manifest. Zusätzliche oder fehlende Dateien führen zum Fehler.
2. Der ausführbare öffentliche Testbestand besteht aus einem Archiv des gebundenen Git-HEAD plus genau den ausgewählten Änderungen. Er enthält keine Gitmetadaten oder neuen privaten Originalarchive. Die Standardtests verwenden ausschliesslich diesen Bestand und vorhandene installierte Abhängigkeiten. Das ist kein frischer GitHub-Clone und kein `npm ci`.

Die enge Text-/Archivprüfung ist keine lückenlose Secret- oder Binärprüfung. Rein syntaktische Negativassertionen werden von tatsächlichen Zugangsdaten unterschieden. Bereits veröffentlichte historische Dateien und Metadaten werden nicht rückwirkend bereinigt. Die [Prüfresultate](../../outputs/publication-mvp08-2026-10-16/public-checks.json) und der [Publikationsindex](../../outputs/publication-mvp08-2026-10-16/README.md) dokumentieren den konkreten Umfang.

### P08-03 Lebende Unterlagen

Die aktuellen Einstiegstexte und IT-Unterlagen unterscheiden E/Q auf MVP 0.8 vom letzten dokumentierten P-Stand MVP 0.7. Sie nennen Paket `0.8.0.0`, Format 8, 42 Mirrordateien, Defaults 5, den TI-/GR-Umfang und den passenden Recovery-Weg. Die [Releasehinweise](release-notes-mvp08.md) halten die Grenzen zusammen. Die Aktualisierung schreibt keine historischen Abnahmen oder Betriebsnachweise um.

## Technische Prüfung und Grenzen

Die Prüfungen des ausgewählten Quellstands in der isolierten Kopie sind bestanden:

| Prüfung | Ergebnis |
| --- | --- |
| Produkt und UI | 2’541 Tests bestanden |
| Öffentliche Node-Governance | 249 Tests bestanden, einschliesslich 15 Publikations- und neun Belegprüfer-Tests |
| Python-Governance | 34 Tests bestanden |
| Schema-Selbsttest | Acht Negativfälle bestanden |
| Öffentlicher Webbuild | 25 Tests bestanden, ausschliesslich in der isolierten Kopie |
| Typ- und Integritätsprüfung | Bestanden, 42 Runtime- und sieben Schemadateien gebunden |
| Bereinigte Belege | 30 öffentliche Kopien ohne Originalzugriff geprüft, zusätzlich lokaler Originalabgleich bestanden |
| Geschützte Originale | 2’569 Dateien frisch bytegleich zum vorbestehenden Schutzsnapshot |

Die ausgewiesenen Node-Testgruppen haben keine Fehler, Abbrüche, übersprungenen Tests oder offenen Testmarkierungen. Überlappende Prüfungen werden nicht zu einer neuen Gesamttestzahl addiert. Die definitiven ZIP-/SPFx-Dateien wurden nicht neu gebaut.

Nach Fertigstellung der Dokumente bestätigt die [Abschlusskontrolle](../../outputs/publication-mvp08-2026-10-16/closure-check.json) die unveränderten 221 ausgewählten technischen Eingänge gegenüber dem getesteten Export. Die endgültige Positivliste wird separat vollständig rückgelesen, einschliesslich eines reinen Exports ohne Zusatzdateien. Historische Originale und abgenommene Produktinputs sind separat gegen den vorbestehenden Schutzsnapshot geprüft. Kein neuer Browser-, Geräte-, Gast- oder Outlooktest wird daraus abgeleitet.

Die lokale Prüfung erneuert keinen HEAD-/GET-/Cachebefund auf dem Hosting. Für P bleiben eine frische Sicherung, Vorprüfung, der aktuelle Header-/Cachevergleich, eine dazu passende Bereitstellungsfreigabe und die öffentliche Prüfmatrix erforderlich. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben unverändert.

## Sichtbarkeit und Freigabetext

Bei Veröffentlichung sind Quellcode, Referenzfälle, ausgewählte Arbeitsmappe, technische Einschränkungen, Entscheidungs- und Prüfnachweise sowie die vier Artefakte öffentlich. Der schon bestehende Datencommit trägt als Autor und Committer `David Steimer <davidsteimer@MacBook-Air-von-David.local>`. Diese Git-Metadatensichtbarkeit gehört ausdrücklich zur Freigabe. Die Historie wird nicht umgeschrieben.

Vorschlag für die anschliessende, noch ausstehende Entscheidung. Den Platzhalter durch die separat gelieferte finale Manifestprüfsumme ersetzen:

> Ich gebe die konkrete Positivliste `outputs/publication-mvp08-2026-10-16/publication-package.json` mit SHA-256 `[separat vorgelegte Prüfsumme]` zur lokalen Bildung genau eines zusätzlichen Publikationscommits und zur anschliessenden Veröffentlichung im öffentlichen Repository `davidsteimer/fristenrechner` auf `main` frei. Dies umfasst den bestehenden Datencommit `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb`, das Publikationsmanifest und die beschriebene öffentliche Sichtbarkeit einschliesslich der Gitmetadaten. Rechenlogik, Rechtsdaten, abgenommene Pakete und ausgeschlossene Dateien bleiben unverändert. Ein erforderlicher temporärer Schreibzugang ist separat konkret zu bestätigen. P-Bereitstellung, M365-Änderungen, zusätzliche Commits und eine Änderung der Hostingkonfiguration sind nicht umfasst.

Die Erstellung dieses Vorschlags ist keine erteilte Freigabe. Der aktuelle Schritt erzeugt keinen Commit, Schlüssel, Upload oder Remotezugriff.
