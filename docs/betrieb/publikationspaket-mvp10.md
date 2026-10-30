# MVP 0.10 · Konkretes Publikationspaket

Stand: 30. Oktober 2026. Fassung 1.0. **P10-01 bis P10-04 sind lokal abgeschlossen. Das konkrete Publikationspaket wird zur Freigabe vorgelegt. Commitbildung, Push und P-Bereitstellung bleiben ausgeschlossen.** Der gebundene Dateiumfang und seine separat genannte Prüfsumme sind vor Vollzug ausdrücklich freizugeben.

## 1. Auftrag und Ergebnisgrenzen

David Steimer hat erklärt: «Ich gebe die begrenzte lokale Bereinigung von P10-01 bis P10-04 frei.» Grundlage ist die unveränderte [Publikationsvorprüfung](publikationsvorpruefung-mvp10.md). [Q, reale Geräte-/Gastprüfung und begrenzte Outlook-Wiederverwendung sind abgenommen](abnahme-q-mvp10.md).

| Punkt | Umsetzung |
| --- | --- |
| P10-01 | Separate datensparsame öffentliche Zusammenfassungen mit Originalhash/-länge und expliziter Feldauswahl. Originalnachweise, Fehlversuche und damalige Statusflags bleiben unverändert |
| P10-02 | Exakte Positivliste mit relativen Pfaden, Bytes und SHA-256. Datencommit und zusätzliche Publikationsdateien getrennt. Tatsächliche Kopie aus öffentlicher Gitbasis plus Auswahl und separater Nur-Auswahlexport |
| P10-03 | Lebende README-, Daten-, Test-, SPFx-, Architektur-, Fachrechts- und Entscheidungseinstiege sowie beide IT-Unterlagen nachgeführt. MVP10 E/Q abgenommen, letzter dokumentierter P-Stand MVP09. Historische datierte Absätze und ursprüngliche Berichte bleiben erhalten |
| P10-04 | Ausschliesslich neuer Einstieg für `test:source-reviews`, separater Runner, öffentlich tragfähiges Testkontextinventar und gezielte Positiv-/Negativtests. Keine Änderung historischer Validatoren, Indices, Assertions oder Abhängigkeiten |

Rechenlogik, Produktoberfläche, Rechtsdaten, definitive Pakete, bestehende E-/Q-Instanzen, AP5, AP21-Testapps, Rechte und Richtlinien bleiben unverändert. Kein Neubau der Auslieferungsartefakte. Der Nachtrag zur Testorchestrierung wird nicht rückwirkend in den historischen B-Vertrag eingefügt.

## 2. Gebundener Stand und Dateiauswahl

Verbindlich ist [publication-package.json](../../outputs/publication-mvp10-2026-10-30/publication-package.json). Sie nennt jeden ausgewählten Pfad mit Länge und SHA-256. Der bestehende Datencommit `01bbd96a296b0fc4d64cd554acc8cb122c3017a3` enthält genau 45 Laufzeitdateien. Sein Elterncommit ist `70ce67425e046a7a38a4fbe66acbd93c75ca5983`. Die unveränderten bereits veröffentlichten Dateien bilden die Repositorybasis.

Die Positivliste bindet **2’042 Dateien einschliesslich der 45 Datencommitdateien**. Sie ist selbst eine zusätzliche Freigabedatei, ohne Selbstaufnahme in ihr Inventar. Ihre SHA-256 wird nach der Schlussprüfung separat vorgelegt. Ausgewählt sind die gebündelten AP23F–M-/R10-Produktquellen, erforderliche Kandidaten-/Referenzfixtures, Schemata, Tests, Quellenregister und Prüfereignis, Dokumentation, datensparsame Nachweise und vier unveränderte Auslieferungsarchive. Ein Git-Push erstellt keinen GitHub-Release-Anhang.

| Artefakt | Bytes | SHA-256 |
| --- | ---: | --- |
| SPFx `0.10.0.0` | 843’895 | `7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd` |
| SharePoint-Mirror | 386’951 | `77019f584ea4c0482a3001460f35f312889b910fc46e2aee4aee90bba4edfbf6` |
| Statisches Webpaket | 1’060’212 | `a94740a78034e8cc41ae2c4907b917729c6f4743d7a307a60ee25834d550e1b3` |
| Recovery `0.10.0.1` | 327’129 | `0def9a2c4a126f6d7b30d22ebe600c1b471ccd10d6c81b7dfab9745a350d797b` |

Manifest `17.0.0`, Mindestconsumer `17.0.0`, Verwaltungskatalog `10.0.0`, 35 Kalender und 245 ausserbernische Verwaltungspfade plus getrennter BE-Bestand bleiben gebunden. [Releasehinweise und Grenzen](release-notes-mvp10.md). Keine ausserbernische Sozialfreigabe, keine Vollabdeckung kantonaler Spezialgesetze, keine zusätzlichen Produktsprachen.

## 3. Öffentliche Nachweise und Ausschlüsse

[evidence.json](../../outputs/publication-mvp10-2026-10-30/evidence.json) bindet acht Originalberichte als begrenzte Zusammenfassungen, die vorherigen Testquittungen, die 451 ursprünglichen Baueingänge und den neuen CLI-Nachtrag. Keine Originaldatei wird bereinigt überschrieben. Der alte Recoverybericht bleibt beispielsweise mit `roundTripMvp10Pending:true` erhalten. Der spätere erfolgreiche Rundlauf wird daneben belegt. Ebenso bleibt der damalige Outlook-Vorschlagsstatus erhalten, die menschliche Annahme wird getrennt nachgewiesen.

Die öffentlichen Dateiprüfungen benötigen keine privaten Originale. Das beweist ihre Byteintegrität, nicht die unabhängige Rekonstruktion der vollständigen früheren Quellenprüfung oder aller Hostschritte. Vollständige Forschungs-/Bauarchive, private Zielbindungen, HARs, Browseraufnahmen, Rohquellen und Sicherungen bleiben ausserhalb der Auswahl. Bibliografische Register und bestehende historische öffentliche Testfixtures sind davon getrennt. Insbesondere wird genau das Jura-Quellenbindungsregister für den J2-Schematest aufgenommen, ohne seine referenzierten Rohkörper.

Die vorbestehende Änderung des Word-Projektplans V1.0 ist geschützt und nicht ausgewählt. Keine Bereinigung oder Löschung von Benutzerdaten. Persönliche lokale Pfade in neuen Forschungs-/Baunachweisen werden nicht veröffentlicht. Die dafür nicht benötigten Originale und maschinenspezifischen Forschungswerkzeuge bleiben lokal. Ihre historischen Verweise sind keine öffentlichen Abrufzusagen.

Die begrenzte Mustersichtung ist keine umfassende Secret-, Malware-, Metadaten- oder Steganografieprüfung. Die vier Archive wurden tatsächlich gelesen und ihre Bytes erneut gebunden. PNG-Paketicons bleiben bytegleich zu bereits veröffentlichten Icons, ohne neuen pauschalen Bildaudit. Der verbleibende technische Restrisikohinweis ist Bestandteil der Publikationsfreigabe.

## 4. CLI-Nachtrag und Exportprüfung

`npm run test:source-reviews` führt den aktuellen Indexselbsttest, alle 45 Pythonmethoden in getrennten Kontexten und zuletzt die vollständige Node-Governance aus. 32 Methoden verwenden den aktuellen Validator. 13 unveränderte historische Methoden verwenden ausschliesslich den bytegebundenen bereits öffentlichen MVP09-Validator. Eine unvollständige Partition oder ein fehlerhafter Teilprozess führt zum Fehler. Keine Abschwächung von Assertions, keine ausgelassenen Methoden.

Die tatsächliche Repositorykopie wird aus dem lokalen Gitarchiv des vorhandenen Datencommits und ausschliesslich den ausgewählten neuen Bytes erstellt. Sie enthält kein Gitverzeichnis und keine neuen privaten Vollarchive. Vorhandene npm-Abhängigkeiten und Python-Umgebung werden verlinkt. Kein neuer Liveclone, kein frisches `npm ci`, kein neuer SPFx-Bau und keine neue Browser-/M365-/Outlookprüfung.

Die [frischen Exportprüfungen](../../outputs/publication-mvp10-2026-10-30/public-checks.json) sind bestanden:

| Prüfung | Ergebnis |
| --- | --- |
| Produkt/UI | 4’011 Tests in 124 Suiten bestanden |
| Öffentlicher Webauftritt | 199 Tests in 17 Suiten bestanden |
| Vollständiger Quellenprüfaufruf, Node-Governance | 2’956 Tests in 81 Suiten bestanden, einschliesslich der 22 neuen Nachtragstests |
| Python-Governance | Alle 45 Methoden bestanden, 32 aktuell und 13 historisch |
| Aktueller Quellenindex | Selbsttest mit 384 Quellen, 266 produktiven Registereinträgen, acht Ereignissen und acht Negativtests bestanden |
| TypeScript / Laufzeitintegrität | Bestanden, 45 Laufzeitdateien und sieben Schemata erneut geprüft |

In den drei Node-Gesamtläufen gibt es keine Fehler, Abbrüche, übersprungenen Tests oder offenen Testmarkierungen. Alle Prüfungen sind gegen ihre tatsächlichen Eingangsinventare gebunden. Die erste Testkopie umfasste 7’254 Dateien. Vor dem erfolgreichen CLI-Nachlauf wurde sie ausschliesslich um das erforderliche Jura-Metadatenregister und Publikationsdokumentation auf 7’258 Dateien ergänzt. Produkt- und Laufzeiteingänge blieben unverändert. Dokumentationsabschlüsse und die beiden öffentlichen Abschlussberichte nach den technischen Läufen werden gesondert verglichen. Der finale Nur-Auswahlexport enthält exakt die 2’042 Positivlistendateien und die Manifestdatei.

Die [Erhaltungs- und Abschlusskontrolle](../../outputs/publication-mvp10-2026-10-30/closure-check.json) bindet 6’545 geschützte Dateien, die vier tatsächlichen Archive und die 451 ursprünglichen Baueingänge. Einzige nachträgliche Änderung unter den Baueingängen ist der separat freigegebene npm-Testalias. Dessen ursprüngliche Bauversion bleibt erhalten. HEAD und Git-Index sind unverändert. 48 Originaldateien mit persönlichen Rechnerpfaden bleiben ausserhalb der Publikationsauswahl.

Der erste Exportaufruf erreichte wegen eines zu kleinen lokalen Ausgabepuffers noch keine Testkopie. Der nachfolgende technische Erstlauf enthielt eine zu breite Quellenordner-Ausschlussregel. Dadurch fehlte ausschliesslich das bibliografische Jura-Register für 172 J2-Schematests. Die 45 Pythonmethoden waren bereits bestanden. Der Fehler wird durch Aufnahme genau dieses unveränderten Metadatenregisters korrigiert, nicht durch Änderung oder Auslassen des Tests. Fehlversuche werden nicht als bestandene Läufe gezählt.

## 5. Gitmetadaten und nächster Vollzug

Autor und Committer des bestehenden Datencommits sind `David Steimer <davidsteimer@Air-von-David.lan>`, Autor-/Committerzeit 28.10.2026, 20:01:45 +0100. Bei Veröffentlichung werden diese Angaben samt Commitnachricht und Historie öffentlich sichtbar. Die vorhandene Commit-ID wird nicht umgeschrieben. Ein späterer Publikationscommit macht ebenfalls seine tatsächlich verwendeten Gitmetadaten sichtbar.

Vorgesehen ist nach Freigabe genau ein zusätzlicher Publikationscommit, der nur die gegenüber dem Datencommit neuen/geänderten Positivlistendateien sowie die Positivliste selbst enthält. Anschliessend könnten beide Commits auf `main` im öffentlichen Repository `davidsteimer/fristenrechner` veröffentlicht werden. Vor Indexbildung und Push sind Auswahl, Bytes, Gitbestand und Ziel frisch zu prüfen. Abweichungen führen zum Halt. Ein erforderlicher temporärer Schreibzugang wird separat konkret bestätigt und nach verifiziertem Push unmittelbar entfernt.

## 6. Freigabevorlage

> Ich gebe das vorgelegte Publikationspaket MVP 0.10 mit der separat genannten SHA-256 der Positivliste, dem bestehenden Datencommit `01bbd96a296b0fc4d64cd554acc8cb122c3017a3` und der beschriebenen Gitmetadatensichtbarkeit zur Bildung genau eines Publikationscommits und zur anschliessenden Veröffentlichung beider Commits auf `main` im öffentlichen Repository `davidsteimer/fristenrechner` frei. Ausschliesslich die gebundene Positivliste und ihre eigene Manifestdatei sind umfasst. Die öffentliche Sichtbarkeit und das beschriebene begrenzte technische Prüfrestrisiko sind mir bewusst. Einen temporären Schreibzugang bestätigen wir separat. Rechenlogik, Rechtsdaten, abgenommene Artefakte, E/Q, AP5, M365-Rechte und Hosting bleiben unverändert. Eine P-Bereitstellung oder P-Risikoübernahme ist nicht eingeschlossen.

P bleibt eine separate Stufe mit frischer Sicherung, konkreter Ziel-/Rückfallbindung, Stage, öffentlicher Prüfmatrix und abschliessender Betriebsfreigabe. Die [Hostingplattformgrenze](hosting-plattformgrenze-header-cache-2026-10-19.md) wird gemäss Betreiberentscheid **nicht erneut geprüft**. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben unverändert. Letzter dokumentierter öffentlicher Stand ist MVP 0.9, ohne neue Liveinventur.

David Steimer nimmt die menschlichen Fach-, Projekt- und Freigaberollen wahr. Codex unterstützt als dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
