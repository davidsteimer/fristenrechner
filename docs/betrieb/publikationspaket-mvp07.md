# MVP 0.7 · Konkretes Publikationspaket

Stand: 9. Oktober 2026. **Lokale Freigabevorlage, keine bereits erteilte GitHub- oder P-Freigabe.** Die vier Punkte der [ursprünglichen Publikationsvorprüfung](publikationsvorpruefung-mvp07.md) werden mit den nachstehenden, getrennten Nachweisen geschlossen. Rechenlogik, Rechtsdaten, die [Q-Abnahme](abnahme-q-mvp07.md) und das installierte Paket `0.7.0.2` bleiben unverändert. R07-D insgesamt endet erst nach den gesondert freigegebenen Publikations- und Betriebsschritten.

## 1. Das zur Freigabe vorgelegte Paket

Die [maschinenlesbare Positivliste](../../outputs/publication-mvp07-2026-10-09/publication-package.json) bindet jede ausgewählte Datei mit Pfad, Bytezahl und SHA-256. Sie ist die verbindliche Auswahl für einen späteren Publikationscommit, nicht die Gesamtheit aller Dateien im lokalen Projektordner. Die Positivliste selbst kommt als zusätzliche Datei dazu. Ihre Prüfsumme wird bei der Vorlage separat genannt, damit keine zirkuläre Selbstbindung entsteht.

Der bereits vorhandene Datencommit `331ef3e19d43a6b51d91a502acd6b5443071599f` enthält die 41 Release-Dateien und bleibt unverändert. Die übrigen ausgewählten Änderungen sollen erst nach Freigabe in einen neuen lokalen Publikationscommit übernommen werden. Es wurde in diesem Schritt nichts gestaged oder committet. Auch eine öffentliche Erreichbarkeit des neuen Datenpins wird noch nicht behauptet.

| Auslieferungsgegenstand | Bytezahl und SHA-256 |
| --- | --- |
| [Unverändertes, auf E/Q abgenommenes SPFx-Paket 0.7.0.2](../../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg) | 291’895 Bytes · `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` |
| [Unveränderter SharePoint-Mirror](../../outputs/release-mvp07-2026-10-08/artifacts/fristenrechner-mvp07-sharepoint-mirror.zip) | 218’372 Bytes · `ed603938f86849aec55dd5cdc83c300a8ae6437e4bb8eb62f3d7b5fa7e6753ca` |
| [Neuer korrigierter Webkandidat für P](../../outputs/release-mvp07-web-corrected-0702-2026-10-09/artifacts/fristenrechner-mvp07-steimer-web-corrected-0702.zip) | 606’775 Bytes · `9f986c7d8f8d6366914f9605f46b2fd87987fcbdaf17875ce9d2c4d044b07228` |
| [Unverändertes Datenmanifest](../../data/releases/2026-10-08-mvp-07-approved.1/manifest.json) | `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |

Der Webkandidat enthält Anwendung `0.7.0`, die Darstellungskorrektur aus `0.7.0.2` und die unveränderten 41 Datendateien von `2026-10-08-mvp-07-approved.1`. Er ersetzt als vorgesehener P-Kandidat das ursprüngliche Web-ZIP vom 8. Oktober. Dieses bleibt historisch erhalten und wird nicht überschrieben. Ein neuer SPFx-Build war nicht erforderlich.

## 2. P07-01 · Öffentliche Tests und privater Vollaudit

Genau fünf namentlich bestimmte MVP07-Privatsuiten sind aus dem öffentlichen Standardlauf in einen eigenen Befehl ausgelagert. Andere oder künftige Tests werden nicht pauschal ausgeschlossen. Die beiden Public-Build-Assertions für AP21/AP22C3 erwarten jetzt exakt Paket `0.7.0.2`. Ihre übrigen Kandidaten-, Daten- und Pinprüfungen bleiben bestehen.

Der neue öffentliche Integritätsprüfer verlangt die unveränderte Quellenabnahme, 42 direkt gebundene öffentliche Quellenbelege, die 41 Laufzeitdateien und 14 Governance-Bindungen. Das sind nach Bereinigung von Überschneidungen 98 Pflichtdateien. Die 541 privaten Quellenbelege bleiben über die Quellenabnahme gebunden, werden im öffentlichen Lauf aber ausdrücklich **nicht erneut geprüft**. Fehlende öffentliche Dateien, manipulierte Freigaben, unzulässige Zusatzdateien oder Symlinks führen zu Fehlern.

```sh
npm run check
npm run test:source-reviews
npm run test:data:mvp07
npm run test:portability:mvp07
node scripts/verify-mvp07-publication.mjs
.venv/bin/python -B scripts/prepare_mvp07_web_correction.py --check --public-readback
```

Der vollständige private Weg bleibt `npm run test:source-reviews:private:mvp07`. Er verlangt weiterhin sämtliche Originalbelege und scheitert im öffentlichen Export erwartungsgemäss. Die Übernahmevalidatoren und die bereits erteilte Quellenabnahme wurden nicht abgeschwächt. Ein öffentlicher Integritätsnachweis ist keine wiederholte materielle Rechtsprüfung.

Die bestehenden vollständigen historischen Archivprüfer behalten ihre ursprünglichen Anforderungen. Soweit private oder pfadhaltige Originalbelege bewusst nicht veröffentlicht werden, sind diese Vollaudits nicht allein aus dem öffentlichen Bestand reproduzierbar. Sie werden nicht durch stilles Überspringen fehlender Dateien erfolgreich gemacht. Der aktuelle Webreadback ist dagegen eigenständig ohne private Belege ausführbar.

## 3. P07-02 · Neues Webarchiv ohne neue Produktlogik

Der [separate Baunachweis](../../outputs/release-mvp07-web-corrected-0702-2026-10-09/artifact-verification.json) bindet 102 ausgewählte archivierte Produkteingänge aus dem `0.7.0.2`-Bau, 41 unveränderte Release-Dateien und zwei historische normative Vergleichskalender. 40 zusätzliche Testeingänge und vier Prüfwerkzeuge sind getrennt bezeichnet. Die ursprünglichen 181 Produkteingänge werden dadurch weder umdefiniert noch rückwirkend verändert.

Zwei normale MVP07-Webbuilds in frischen isolierten Verzeichnissen liefern dieselben zwölf Webdateien. ZIP-Inhalt, CRC, Hashes und deterministischer Wiederholungsbau sind geprüft. Wrapper, `.htaccess`, Favicon, drei MIT-Lizenztexte und drei Vendor-Bundles bleiben unverändert. Der tatsächliche neue `web/`-Baum ist anschliessend [lokal visuell und interaktiv geprüft](../../outputs/publication-mvp07-2026-10-09/browser/README.md), einschliesslich DE/FR bei 390/720 Pixel und französischer Breitansicht bei 1280 Pixel.

Das ist keine neue Geräte-/Gastabnahme und keine öffentliche Hostingprüfung. Ein einfacher lokaler HTTP-Server wertet `.htaccess` nicht aus. Aus den korrekten Archivbytes folgt deshalb keine Behebung des bekannten Livehostingbefunds.

## 4. P07-03 · Öffentliche Auswahl und Datenschutz

Die Positivliste enthält Quellcode, Tests, Verträge, Daten, ausgewählte technische Nachweise, die definitive AP22A-Matrix V1.0 und die bezeichneten Releaseartefakte. Es gibt kein pauschales `git add` für den Arbeitsbaum oder `outputs/`.

Ausgeschlossen und unverändert lokal erhalten bleiben insbesondere:

- Website-Backups und deren entpackte Inhalte.
- Die vorbestehende fremde Änderung am historischen Word-Projektplan V1.0. Im sauberen Testexport bleibt dessen bisherige Git-Version erhalten.
- Private Arbeitsbereiche, Quellenrohbelege, HAR-Dateien und der private AP21-TAR-Snapshot.
- Drei alte AP21-E-Paketdateien beziehungsweise Archivkopien mit fest eingebundenen Tenantadressen. Sie werden nicht umgepackt oder vermeintlich bereinigt ausgeliefert.
- Persönliche Pfade enthaltende historische Originalprotokolle sowie nicht benötigte interne Screenshots und ältere Excel-Arbeitskopien.

Die zwei lebenden Matrixskripte verwenden neu `FRISTENRECHNER_PYTHON` oder `python3` statt eines persönlichen absoluten Interpreterpfads. Das ändert keine Tabellenlogik und baut keine Arbeitsmappe neu. Die Originalkopien der Skripte in historischen Nachweisen bleiben unverändert und sind bei pfadhaltigem Inhalt ausgeschlossen.

Die ausgewählten ZIP-, SPPKG- und XLSX-Dateien wurden intern gelesen und auf Archivintegrität, sichere Mitgliedspfade, Verschlüsselung und die abgegrenzten Muster für persönliche Pfade, konkrete Tenantadressen, dienstliche E-Mail-Adressen, private Schlüssel und GitHub-Zugangsdaten geprüft. Die definitive Matrix V1.0 enthält keine Makros, eingebetteten Objekte, externen Arbeitsmappenverknüpfungen oder persönlichen Dokumenteigenschaften. Ihre fachlichen Zellen und Quellenlinks bleiben unverändert. Die neuen Screenshots zeigen ausschliesslich synthetische lokale UI-Fälle. Dies ist eine begrenzte Publikationskontrolle, kein lückenloser Secret- oder Sicherheitsnachweis für alle Binärformate.

**Git-Metadaten:** Der vorhandene Datencommit verwendet die bisherige Autoren-/Committerkennung mit lokaler Geräte-E-Mail. Eine spätere Veröffentlichung macht auch diese Metadaten sichtbar. Sie wurden nicht umgeschrieben. Die GitHub-Freigabe muss diese Sichtbarkeit mitumfassen. Historische Hashberichte können ausgeschlossene lokale Belege benennen. Solche Referenzen sind keine Veröffentlichung der Originaldateien.

## 5. P07-04 · Lebende Unterlagen

[Technische Kurzdokumentation](../architektur/technische-kurzdokumentation.md), [Dritt-Tenant-Anleitung](installation-und-betrieb-dritttenants.md), [Releasehinweise](release-notes-mvp07.md) und [SPFx-Einstieg](../../spfx/README.md) sind auf den abgenommenen E-/Q-Stand nachgeführt. Die Mirroranleitung führt exakt die 41 Pfade des tatsächlichen Format-7-Manifests auf.

Konfigurationsgebundener Cache, Defaults Version 4, schweizweite qualifizierte Bundesverfahren und weiterhin auf Bern/2026–2027 begrenzte Sozialfreigaben sind getrennt erklärt. Der genehmigte, nicht ausgeführte E-/Q-Rückfall verwendet Recovery `0.7.0.3` und die gesicherten Format-6-Mirrors, keinen Browserdatenreset oder pauschalen Paketdowngrade. P bleibt gemäss letztem dokumentiertem Produktionsnachweis auf MVP 0.6. Eine frische Livebestandsaufnahme war nicht Teil dieses lokalen Schritts.

## 6. Schlussprüfung und Nachweisgrenzen

Die [sieben Prüfläufe im bereinigten Export](../../outputs/publication-mvp07-2026-10-09/public-checks.json) sind vollständig bestanden. Die Kopie besteht aus dem bisherigen Git-Stand mit ausschliesslich den ausgewählten Ergänzungen, ohne private Belege oder Git-Verzeichnis und mit verhinderter Git-Suche im übergeordneten Projekt. Bereits installierte Node-/Python-Abhängigkeiten wurden wiederverwendet. Das ist kein frischer GitHub-Clone und kein neues `npm ci`.

| Prüfung | Ergebnis |
| --- | --- |
| `npm run check` | Typecheck, 2270 Produkttests, 16 Webtests und beide Builds bestanden |
| Öffentliche Quellen-/Governanceprüfung | Selbsttest, 30 Python-Tests und 218 Node-Tests bestanden |
| Öffentliche MVP07-Datenprüfung | 98 öffentliche Pflichtdateien und 41 Laufzeitdateien bestätigt |
| Portabilität | 11 Node- und 5 Python-Tests bestanden |
| AP22-Datenverträge | 69 Python-Tests bestanden |
| Neues Webarchiv | Eigenständiger Readback ohne private Eingänge bestanden |
| Webarchiv-Schutzprüfungen | 8 Python-Tests bestanden |

Die Zahlen sind je Prüflauf ausgewiesen. Einzelne Prüfungen überschneiden sich und werden deshalb nicht zu einer vermeintlichen Zahl einzigartiger Tests addiert. Die bereinigten Protokollkopien und die Hashes der unveränderten Originalprotokolle sind im Ergebnisnachweis gebunden. Nach dem Testlauf wurden nur die bezeichneten lebenden Dokumente, abgeleitete Nachweise und die Dateiendungen der fünf byteidentischen JPEG-Bilder fertiggestellt. Laufzeit-, Test-, Daten- und Baueingänge werden vor der Versiegelung gegen die tatsächlich getestete Exportkopie verglichen.

Der separate **private Vollaudit** ist ebenfalls bestanden: 583 gebundene Quellenbelege, 79 private Tests und der strenge Datenvalidator. Das ist eine technische Wiederholungsprüfung der bereits abgenommenen Quellenbindung, keine neue fachliche Abnahme. Das vollständige Originalprotokoll bleibt privat.

Der [Unverändertheitsnachweis](../../outputs/publication-mvp07-2026-10-09/preservation-check.json) bestätigt alle 230 archivierten Dateien des SPFx-Korrekturbaues und die 41 Release-Dateien. Von den 181 gebundenen Produkteingängen sind 180 byteidentisch. Einzig die Testbefehle in `package.json` wurden geändert, alle anderen Felder bleiben identisch. Auch die [begrenzte Datenschutzkontrolle](../../outputs/publication-mvp07-2026-10-09/privacy-review.json) ist dokumentiert. Die finale Positivliste wird nach dieser Dokumentarbeit nochmals vollständig gegen die ausgewählten Datei- und Archivbytes geprüft.

Die [ursprüngliche Vorprüfung](publikationsvorpruefung-mvp07.md) bleibt als damaliger Befund unverändert. Lokale automatisierte Prüfungen, neue Browser-Sichtprüfung, frühere Hostnachweise und menschliche Abnahmen werden nicht zu einem angeblich vollständig automatisierten Gesamtnachweis vermischt. F08-Anzeigeort und T09-Wiederverwendung bleiben qualifiziert.

## 7. Jetzt erforderliche Entscheidungen

1. **Outlook:** Den [begründeten Wiederverwendungsvorschlag](outlook-wiederverwendung-mvp07.md) für MVP 0.7 ausdrücklich bestätigen oder einen neuen gesonderten Test beauftragen. Hier wurde nichts importiert oder gelöscht.
2. **GitHub:** Die konkrete Positivliste samt ihrer separat vorgelegten SHA-256-Prüfsumme zur lokalen Commitbildung und anschliessenden Veröffentlichung im öffentlichen Repository `davidsteimer/fristenrechner` freigeben. Dies umfasst den bestehenden Datencommit und die beschriebene Git-Metadatensichtbarkeit. Ein erforderlicher temporärer Schreibzugang ist separat konkret zu bestätigen.
3. **P anschliessend:** Frische Sicherung und Bestandsprüfung, erneuter HEAD-/GET-/Cachevergleich, gegebenenfalls neuer begrenzter Risikoentscheid, Vorprüfung des bezeichneten korrigierten Web-ZIP und öffentliche Prüfmatrix. Frühere Hosting-Risikoentscheide gelten nicht automatisch für MVP 0.7. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben unverändert, sofern kein gesonderter Auftrag erfolgt.

Diese Vorlage erteilt selbst keine Freigabe. David Steimer entscheidet in Personalunion. Codex erstellt und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
