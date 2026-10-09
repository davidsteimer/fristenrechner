# AP21 Korrigierter E Testkandidat 0.0.21.2

Stand: 8. Oktober 2026. **Korrektur lokal umgesetzt, neues Paket gebaut und geprüft. Noch keine Freigabe für Upload oder Installation dieses Pakets.** Der Auftrag umfasst die Korrektur und Kandidatenvorbereitung, nicht einen weiteren Tenantzugriff.

## Korrektur und Paketbindung

Der [erste E04-Versuch](ap21-e04-vollzug.md) scheiterte an `App/@Name` im Paketmanifest. Revision 2 trennt den technischen ASCII-Namen vom sichtbaren deutschen Titel. Die [ursprüngliche Installationsvorlage](ap21-e-installationsvorlage.md), der zurückgewiesene Kandidat und seine Bauquellen bleiben unverändert als historische Belege erhalten. Für einen neuen Versuch gelten die Paketbindung und der aktuelle Ausgangsstand dieses Nachtrags. Die übrigen Scopegrenzen, Gerätefälle und Rückfallbedingungen der ursprünglichen Vorlage bleiben bestehen.

| Merkmal | Neuer gebundener Wert |
| --- | --- |
| Kandidat | `ap21-e-device-2026-10-08.2` |
| Paket | [fristenrechner-ap21-e-0.0.21.2.sppkg](../../outputs/ap21-e-testkandidat-r2-2026-10-08/fristenrechner-ap21-e-0.0.21.2.sppkg) |
| Paketversion und Grösse | `0.0.21.2`, 289’708 Bytes |
| SHA-256 | `689310164fd56c5339b93ebf4458621c9772d0d35e281fa2a39469ec1c40f0df` |
| Technischer App-Name | `FristenrechnerAP21EDeviceTest` |
| Sichtbarer Titel | Fristenrechner AP21 E-Gerätetest |
| Solution-ID | `53750dd9-19a8-42f2-9bad-899090be3192` |
| Feature-ID | `88b5e961-a25e-44ff-9f99-38475d6c9d54` |
| Component-ID | `e85c1022-b793-43bd-a25e-06c7b0e290da` |
| Datenrelease | `2026-10-01-mvp-06-approved.1`, Format `6.0.0` |
| Manifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |

Die drei technischen Identitäten gehören weiterhin zur getrennten AP21-Testapp. Es ist eine Korrektur derselben Testapp, keine zweite Testapp und kein Update des Betriebspakets. Die beiden gebundenen E-Sites, jeweiligen MVP-0.6-Mirrors, Cache- und Defaultschlüssel, synthetischen Referenzfälle und vollständige Kalenderexportsperre bleiben unverändert. Rechenkern und Datumseingabe erhalten keine neue Funktion und keine Verhaltensänderung.

Die lokale Prüfung beschränkt den technischen Namen bewusst auf ASCII-Buchstaben und Ziffern, beginnend mit einem Buchstaben und maximal 64 Zeichen. Sie vermeidet damit das im Katalog beanstandete Zeichen. Sie ist keine vollständige Prüfung des SharePoint-XSD. Die [Microsoft-Spezifikation zu NameDefinition](https://learn.microsoft.com/en-us/sharepoint/dev/schema/namedefinition-simpletype-sharepoint-add-in-manifest) und der tatsächlich verwendete SPFx-Paketierer bilden die Grundlage. Erst ein neuer Katalogversuch kann die serverseitige Annahme nachweisen.

## Lokale Prüfergebnisse

- 186 SPFx-Quelltests bestanden.
- 31 Tests am fertigen SPPKG bestanden. Davon acht Tests der Datumseingabe, 15 bestehende Isolationstests und acht neue Manifest- und XML-Tests.
- Der neue Manifesttest scheitert am alten, unveränderten SPPKG erwartungsgemäss genau am technischen Namen. Damit ist die Fehlererkennung am ursprünglichen Befund nachgewiesen.
- 105 von 106 gebauten Quelldateien sind identisch mit Revision 1. Ausschliesslich die generierte Kandidatenkonfiguration enthält neue Kennung, Namen und Paketversion. Keine UI-, Parser- oder Rechenkernquelle wurde geändert.
- Alle 153 AP21-Vorleistungsartefakte, alle 24 Bindungen des ersten E-Kandidaten, alle 204 Dateien des AP22C3-Abnahmearchivs und die E04-Vollzugsbelege bleiben unverändert.
- Die 15 bekannten Lintwarnungen bestehen fort. Kein neuer Buildfehler. Keine Abhängigkeit nachinstalliert.

Paket, Bauquellen und Protokolle sind im [R2-Prüfnachweis](../../outputs/ap21-e-testkandidat-r2-2026-10-08/README.md) gebunden. Eine lokale Prüfung ist keine Geräteabnahme und keine operative Freigabe.

## Ausgangsstand vor einem erneuten Versuch

Der ungültige Katalogeintrag `fristenrechner-ap21-e-0.0.21.1.sppkg` bleibt gemäss E04-Nachweis vorhanden, nicht bereitgestellt und bisher ohne Site-Installation. Seine Entfernung ist weiterhin nicht freigegeben. Da R2 dieselbe Solution-ID verwendet, muss der Katalogbestand vor einem Upload erneut gezielt geprüft werden. Eine konfliktfreie parallele Ablage wird nicht vorausgesetzt. Verlangt SharePoint eine ungeklärte Ersetzung oder Bereinigung, wird angehalten und der konkrete Eingriff gesondert vorgelegt. Das Betriebspaket darf keinesfalls ersetzt werden.

Vor einer Mutation sind die zwei E-Ziele, bestehende Paket- und Instanzkonfigurationen sowie die relevanten Berechtigungen frisch zu bestätigen. Die noch offenen E02-Nachweise aus dem ersten Versuch sind zu vervollständigen. Die elf Dateien je Mirror werden erneut zurückgelesen. Die Prüfung vom ersten E04-Versuch bleibt ein historischer Nachweis, keine fortdauernde Livegarantie.

Das Paket wird nur auf «Fristenrechner Test» und «Entwicklungsumgebung» installiert. Auf der Testsite bleibt `AP21-Datumseingabe.aspx` mit dem Titel «AP21 – Datumseingabe (Gerätetest)» das einzige neue Seitenziel. E05 für eine neue Teams-App-Registrierung, Katalogübernahme und gezielte Zulassung bleibt separat. Ohne E05 wird keine neue Teams-Registerkarte eingerichtet.

## Vorlage für die erneute Freigabe

> Ich gebe den erneuten begrenzten E04-Installationsversuch mit `fristenrechner-ap21-e-0.0.21.2.sppkg`, Version `0.0.21.2`, SHA-256 `689310164fd56c5339b93ebf4458621c9772d0d35e281fa2a39469ec1c40f0df` und den hier gebundenen Identitäten frei. Das Paket darf zusätzlich zum unveränderten Betriebspaket in den bestehenden Tenant-App-Katalog aufgenommen und ausschliesslich auf «Fristenrechner Test» und «Entwicklungsumgebung» installiert werden. Auf «Fristenrechner Test» darf die Seite `AP21-Datumseingabe.aspx` mit dem Titel «AP21 – Datumseingabe (Gerätetest)» erstellt werden. Die App verwendet ausschliesslich die jeweiligen unveränderten MVP-0.6-Mirrors. Technische Tests und die Vorbereitung der realen Geräteprüfung sind erlaubt, ausschliesslich mit synthetischen Fällen und ohne Kalenderexport. Ein ungeklärter Konflikt mit dem ungültigen R1-Katalogeintrag führt zum Halt, dessen Entfernung ist nicht eingeschlossen. E05, Betriebspaket, bestehende Instanzen, Q, AP5, P, GitHub, Berechtigungen und Richtlinien bleiben unverändert. Der begrenzte Rückfall umfasst ausschliesslich neu erzeugte Testansichten gemäss ursprünglicher Vorlage, keine Entfernung von App- oder Katalogpaketen.

Diese Vorlage ist noch keine erteilte Freigabe. Die bisherigen Paketbytes `0.0.21.1` werden durch den lokalen Korrekturauftrag nicht stillschweigend durch `0.0.21.2` ersetzt.
