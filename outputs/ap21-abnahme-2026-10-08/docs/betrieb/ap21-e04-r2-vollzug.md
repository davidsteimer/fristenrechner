# AP21 E04 R2 – Erfolgreiche SharePoint-Installation

Stand: 8. Oktober 2026. **Der korrigierte Kandidat 0.0.21.2 ist zusätzlich im Tenant-App-Katalog bereitgestellt und auf den zwei freigegebenen E-Sites installiert. Die neue SharePoint-Prüfseite ist publiziert und technisch geprüft. Die reale Geräteabnahme und E05 für den direkten Teams-Host bleiben offen.**

## Auftrag und Ergebnis

David bestätigte «OK, versuche die E04 Installation.» im Anschluss an den [gebundenen R2-Kandidaten](ap21-e-installationsvorlage-r2.md). Diese Freigabe betrifft das zusätzliche AP21-Testpaket, nicht das Betriebspaket. Die [ursprünglichen Scopegrenzen](ap21-e-installationsvorlage.md) bleiben bestehen.

SharePoint hat Revision 2 ohne Manifestfehler angenommen. Der frühere ungültige R1-Eintrag verursachte keinen Konflikt und blieb unangetastet. Die Kataloganzeige von R2 lautet gültig, aktiviert und bereitgestellt, aber nicht tenantweit installiert. Der Bereitstellungsdialog verlangte keine zusätzlichen API-Berechtigungen.

| Schritt | Tatsächlicher Nachweis |
| --- | --- |
| E01 Bindung | Alle 26 R2-Artefaktbindungen vor und nach Vollzug unverändert. Paket, Solution-ID und Component-ID entsprechen dem freigegebenen Kandidaten |
| E02 Ausgangsstand | Zwei E-Sites, Team/Kanal, vorhandene Apps, neue Seitennamensfreiheit, aktueller Teams-Tab und historischer AP5-Tab geprüft. Relevante Paket-, Asset- und Mirrorberechtigungen separat gesichert |
| E03 Mirrorreadback | Elf Dateien je Site, insgesamt 22 Dateien frisch gelesen. Länge und SHA-256 stimmen vollständig mit dem freigegebenen MVP-0.6-Bündel überein |
| E04 Katalog | Zusätzliches Paket hochgeladen, serverseitig gültig und bereitgestellt. Kein Ersetzen des Betriebspakets, keine Bereitstellung auf allen Sites |
| E04 Site-Apps | «Fristenrechner AP21 E-Gerätetest» auf «Fristenrechner Test» und «Entwicklungsumgebung» hinzugefügt. Installationsanzeige und zugehörige Version 0.0.21.2 auf beiden Sites geprüft |
| E04 neue Ansicht | Ausschliesslich auf «Fristenrechner Test»: `AP21-Datumseingabe.aspx`, Titel «AP21 – Datumseingabe (Gerätetest)». Publizierte Seitenversion 2.0. Keine Änderung von Startseite oder Navigation |
| Paket und Code | Frischer Rohreadback von SPPKG und ausgeliefertem Bundle stimmt exakt. Der DOM-Scriptlink der neuen Seite verweist auf dieses Bundle |
| Netz-Erstabruf | Nur den neu erzeugten gebundenen AP21-Cacheeintrag entfernt. Leerer Store mit «Total entries: 0» dokumentiert. Danach alle elf erwarteten Dateien aus dem E-SP-Mirror mit HTTP 200 und Netzübertragung beobachtet. Kein Fallbackhinweis nach Ladeabschluss |
| Unverändertheit | Betriebspaket byteidentisch. Vier Berechtigungsreadbacks unverändert. Bestehende E-SP-Ansicht und aktueller Teams-Tab weiterhin MVP 0.6, historische Registerkarte weiterhin AP5 |
| E05 | Nicht begonnen. Keine neue Teams-Appregistrierung, keine Teams-Katalogmutation, keine neue Registerkarte |
| Reale Geräteabnahme | Ausstehend. Desktop-Edge-Nachweise sind keine iOS-, Safari-, VoiceOver- oder Teams-App-Abnahme |

## Bindung

| Artefakt | Version / SHA-256 |
| --- | --- |
| Testpaket | `0.0.21.2`, 289’708 Bytes, `689310164fd56c5339b93ebf4458621c9772d0d35e281fa2a39469ec1c40f0df` |
| Ausgeliefertes Bundle | `ap21e-fristenrechner-web-part_caea654250ddfa916644.js`, 1’141’251 Bytes, `1f81f9bb3477b50d74849aee0e4fe5bc4045eda419387d68e0268eeeb339569c` |
| Solution-ID | `53750dd9-19a8-42f2-9bad-899090be3192` |
| Component-ID | `e85c1022-b793-43bd-a25e-06c7b0e290da` |
| Datenrelease | `2026-10-01-mvp-06-approved.1` |
| Manifest | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Unverändertes Betriebspaket | `0.6.0.1`, `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587` |

Die neue Seite meldet im DOM `SharePoint Online`, `sharepointMirror` und die gebundene Component-ID. Der sichtbare Quellenlabel allein beweist keinen Mirrorpfad. Der konkrete Pfad wird durch die elf beobachteten SharePoint-Dateianfragen belegt. Manifestpin und Bytes werden aus Paketbindung, Mirrorreadback und erfolgreicher Aktivierung zusammengeführt, nicht als sichtbar angezeigter Hash ausgegeben.

Für den Erstabruf wurde ausschliesslich der passende Eintrag unter IndexedDB `fristenrechner-ap21e / configuredReleases` geleert. Produktcache und persönliche Standards wurden nicht gelöscht. Der Browser-HTTP-Cache wurde nur für diesen DevTools-Lauf vorübergehend deaktiviert und danach wieder aktiviert. Es wurden keine Sicherheits- oder M365-Richtlinien verändert.

## Technische Bedienprüfung

Prüfung durch Codex in Edge auf macOS 27.0.1, Build 26A434, Schweizer Referenztag 8. Oktober 2026. Der lokal installierte Edge-Stand ist 154.0.4258.62, aus den App-Metadaten gelesen. Die Versionsanzeige des laufenden Browserprozesses wurde nicht gesondert abgefragt. Ausschliesslich synthetische Eingaben, keine Speicherung persönlicher Standards, kein Kalenderexport.

| Test | Beobachtung |
| --- | --- |
| Leeres Datumsfeld | Texteingabe mit `TT.MM.JJJJ`, 16 px und linksbündiger Darstellung |
| `5` + Tab | `05.10.2026`, Fokus wechselt zur Frist in Tagen |
| `16.9` + Enter | `16.09.2026`, keine automatische Berechnung |
| `h` + Fokusverlust | `08.10.2026` |
| Französisch `a` + Enter | `08.10.2026`, passende französische Beschriftung und Formatangabe |
| `31.04` und `29.02.2027` | Eingabe bleibt sichtbar. Meldung «Dieses Datum gibt es nicht». Berechnungsklick erzeugt kein Resultat |
| `16.9.26` und `h+10` | Eingabe bleibt sichtbar. Formatfehler. Kein Fristresultat |
| StPO, BE, direkte Zustellung 16.09.2026, zehn Tage | Referenzresultat 28.09.2026, Fristbeginn 17.09.2026, rechnerisches Ende 26.09.2026 |
| Zeichen an ein berechnetes Datum anhängen | Resultat verschwindet sofort, ohne Fokuswechsel. Ungültiger Entwurf erzeugt beim Berechnungsklick kein altes Resultat |
| Exportblock | Ergebnis als nicht operativ freigegeben gekennzeichnet. Kachel «Kalenderexport erst nach Releasefreigabe», kein Exportbutton |
| Kalender abbrechen | Zuvor sichtbarer Entwurf `31.04` bleibt erhalten |
| Kalender auswählen / leeren | Auswahl 16.10.2026 wird übernommen, «Datum leeren» leert das Feld |
| Neuladen | Leeres Datum, kein synthetisches Resultat wiederhergestellt, vorgesehener Release aktiv |

Dies ist ein technischer Installationstest der Hauptdatumseingabe. Die vollständige [Geräteprüfliste](../../outputs/ap21-2026-10-08/geraetepruefung.md) einschliesslich der weiteren Datumsrollen, Touch, VoiceOver und 200 Prozent Zoom bleibt für die realen Oberflächen massgebend. Die lokalen automatischen Pakettests wurden als gebundene Vorleistung geprüft, nicht als neuer Live-Gerätelauf ausgegeben.

## Erhaltene Grenzen und Belege

Die bestehenden E-Ansichten behalten ihren veröffentlichten Stand und ihre Datenquelle. Beim aktuellen Teams-Tab wurden bestehende Listen-, Element- und Webpartinstanzkennung erneut verglichen. Die historische AP5-Registerkarte behält `2026-08-29-ap5-approved.1` und den öffentlichen GitHub-Datenprovider. Kein bestehender Rechner wurde bearbeitet.

Q, P, GitHub, Berechtigungen und Richtlinien wurden nicht verändert. Diese Aussage beschreibt den Vollzug und ist kein vollständiger Liveaudit anderer Umgebungen. Die neue Testapp und ihre erforderlichen Assets sind die ausdrücklich erlaubten zusätzlichen Objekte.

Die SitePages-Abfrage über den Datei-Connector liefert HTTP 400 «Site Pages cannot be accessed as a drive item». Seitenname, Titel, Seiten-ID, Listen-ID, publizierte Version und Webpartinstanz wurden deshalb in der regulären SharePoint-Oberfläche beziehungsweise deren DOM gelesen. Es gab keinen Access-denied-Befund und keine Rechteausweitung. Ein roher ACL-Export der einzelnen Seite wird nicht behauptet.

Die [maschinenlesbare Ergebnisbindung](../../outputs/ap21-e04-r2-2026-10-08/execution-proof.json) ergänzt die unveränderten R1- und R2-Vorbereitungsbelege. Interne Zieladressen, Objektkennungen, Berechtigungsdaten und Rohdateien liegen unter `.work/deployments/2026-10-08-ap21-e04-r2/`. Die lokalen Screenshots unter `outputs/ap21-e04-r2-2026-10-08/` sind interne Prüfbelege und haben keine GitHub-Publikationsfreigabe.

## Nächster Schritt

Die SharePoint-Prüfseite steht für reale Gerätetests bereit. Die direkte iOS-Teams-Prüfung setzt die separat zu konkretisierende und freizugebende E05-Registrierung voraus. Eine Einbettung der SharePoint-Seite würde diesen direkten Teams-Hostnachweis nicht ersetzen.

AP21 ist damit noch nicht fachlich-technisch endabgenommen. Der ungültige R1-Katalogeintrag sowie spätere Testapp- und Paketbereinigungen bleiben einem gesonderten Entscheid vorbehalten. Ein Rückfall war nicht erforderlich.
