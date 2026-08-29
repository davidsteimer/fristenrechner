# Tenant-Laufnachweis SPK-SPFX-01

## Zweck und Datenschutz

Dieser Nachweis dokumentiert den realen Lauf des Spike-Pakets in SharePoint Online und Microsoft Teams am 29. August 2026. Das Repository ist öffentlich. Exakte Tenant-URLs, Site- und Gruppen-IDs, Kanal-IDs, Kontoinformationen sowie Screenshots mit internen Navigationselementen werden deshalb nicht veröffentlicht.

Die vollständigen Bildschirmbelege wurden lokal im gitignorierten QA-Verzeichnis `.work/spfx-tenant-evidence/` geprüft und verbleiben ausserhalb der Versionsverwaltung.

## Bereitgestellte Komponenten

| Merkmal | Ergebnis |
| --- | --- |
| Umgebung | nicht produktiver M365-Testtenant von steimer.ch |
| Testsite | dedizierte, gruppenfreie SharePoint-Kommunikationswebsite |
| App-Katalog | neu aktivierter Tenant-App-Katalog |
| Paketversion | 1.0.0.0 |
| Paketstatus | gültig und aktiviert |
| Paket SHA-256 | `558dd7c5c227650b251046e467e38a5c5ed2f59ad2b5147e09aebbf012d763f1` |
| SharePoint-Seite | moderne Testseite mit dem Spike-WebPart |
| Teams-Ziel | bestehendes nicht produktives Testteam, Standardkanal für den Fristenrechner |
| Mirror | byteidentischer AP5-Release in einer Dokumentbibliothek der Testsite |

## Datenstand

| Merkmal | Wert |
| --- | --- |
| Release-ID | `2026-08-29-ap5-approved.1` |
| Manifest SHA-256 | `c84840ad56833cab6fca254b96dd8002dbb20f94f189a948587accd69aed3de6` |
| Artefakte | 5 Rechtsprofile und 2 Kalender |
| Abdeckung | 29. August 2026 bis 31. Dezember 2028 |
| GitHub-Basis | unveränderlicher Git-Commit, im WebPart konfiguriert |
| SharePoint-Basis | serverrelativer Bibliotheksordner, im WebPart konfiguriert |

## SharePoint-Lauf

1. Die App wurde der dedizierten Testsite hinzugefügt.
2. Das WebPart wurde auf einer modernen SharePoint-Seite platziert und mit dem Mirrorpfad konfiguriert.
3. Der Host wurde als `SharePoint Online` erkannt.
4. Der GitHub-Provider aktivierte den Release um 11:12:37 Uhr vollständig validiert und atomar.
5. Der SharePoint-Mirrorprovider aktivierte denselben Release um 11:13:05 Uhr vollständig validiert und atomar.
6. Release-ID, Manifestprüfsumme, sieben Artefakte und Abdeckung stimmten überein.
7. Deutsch und Französisch wurden vollständig gerendert.
8. Ein Dropdown wurde per Tastatur bedient. Der Fokus wechselte mit dem Tabulator nachvollziehbar zum Datumsfeld.

## Teams-Lauf

1. Die App war nach der tenantweiten Aktivierung im Teams-Appdialog sichtbar.
2. Der erste Konfigurationsversuch schlug fehl, weil die App auf der dem Team zugeordneten SharePoint-Website noch nicht lokal hinzugefügt war.
3. Nach dieser lokalen Site-Installation lud die Konfiguration ohne Fehler.
4. Dieselbe SPFx-Komponente wurde als Kanalregisterkarte gespeichert.
5. Die Option für einen automatischen Kanalbeitrag wurde vor dem Speichern deaktiviert.
6. Der Host wurde als `Microsoft Teams` erkannt.
7. Der GitHub-Provider aktivierte den Release um 11:23:01 Uhr vollständig validiert und atomar.
8. Deutsch und Französisch wurden vollständig gerendert.
9. Nach einem erneuten Laden stellte die Komponente den letzten gültigen Stand aus IndexedDB wieder her.

Der SharePoint-Mirrorpfad blieb in dieser konkreten Teams-Registerkarte absichtlich leer. WebPart-Eigenschaften werden je Instanz gespeichert und nicht von der SharePoint-Testseite übernommen. Der reale Mirrornachweis erfolgte auf der SharePoint-Testsite. Für einen späteren Mirrorbetrieb in Teams muss der Release auf der Teamwebsite bereitgestellt oder der Provider für einen ausdrücklich getesteten tenantinternen Cross-Site-Abruf erweitert werden.

## Externe und Gastzugriffe

Externe und Gastzugriffe wurden absichtlich nicht aktiviert oder geprüft. AP7 verlangte ein internes Testkonto mit normalen Leserechten auf Site und Mirror. Der Test umfasste kein Extranet- oder Gastbetriebsszenario.

Aus dem erfolgreichen internen Tenantlauf folgt deshalb keine Freigabe für Gastkonten. Ein allfälliger Gastbetrieb benötigt vor seiner Aktivierung einen eigenen Nachweis für SharePoint- und Teams-Berechtigungen, App-Richtlinien, Datenfreigabe und Mirrorzugriff.

## Berechtigungen

| Prüfung | Ergebnis |
| --- | --- |
| Microsoft-Graph-Berechtigung | nicht beantragt und nicht benötigt |
| zusätzliche Web-API-Berechtigung | nicht beantragt und nicht benötigt |
| Entra-App-Registrierung | nicht erstellt und nicht benötigt |
| Geheimnis oder Zertifikat | nicht verwendet |
| SharePoint-Mirror | mit dem Benutzerkontext über `SPHttpClient` gelesen |
| Teams-App | durch vorhandene Richtlinie auffindbar und zulässig |

## Paketkorrektur

Der erste Upload wurde von SharePoint abgelehnt, weil der technische `Name` im Appmanifest einen typografischen Gedankenstrich enthielt und damit die `NameDefinition` verletzte. Der technische Paketname wurde auf `Fristenrechner Schweiz SPFx Machbarkeitsspike` geändert. Der sichtbare Produkttitel `Fristenrechner Schweiz – Spike` und die Component-ID blieben unverändert.

Das nach der Korrektur reproduzierbar gebaute Paket wurde erneut mit `unzip -t` geprüft. Alle 21 Einträge sind intakt.

## Schluss

Die reale M365-Ausführung bestätigt die gemeinsame SPFx-Zielarchitektur. SharePoint Online und Microsoft Teams verwenden dasselbe Paket, dieselbe Component-ID, dieselbe Fluent-UI-Komponente und denselben providerneutralen Datenkern. Der GitHub-Feed und der SharePoint-Mirror liefern denselben vollständig validierten Datenrelease. Die Erstbereitstellung erfordert einen App-Katalog und lokale Site-Installationen, aber keine zusätzliche API-Berechtigung.
