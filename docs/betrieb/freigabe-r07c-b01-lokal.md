# R07C-B01 – begrenzte lokale Darstellungskorrektur

Stand: 9. Oktober 2026. Entscheid durch David Steimer in Personalunion. Codex setzt den begrenzten Auftrag um, ohne formelle Freigabe- oder Haftungsverantwortung.

## Auftrag und Umfang

David hat im Projektchat erklärt:

> Bittte bereite die begrenzte Darstellungskorrektur samt neuem Paketkandidaten vor.

Der Auftrag betrifft den dokumentierten [Layoutbefund R07C-B01](eq-vollzugsnachweis-mvp07.md). Lange Auswahleinträge sollen in geschlossenen und geöffneten Listen lesbar umbrechen. Das bereits verwendete Muster für Feiertagsanknüpfungen wird auf die übrigen Rechnerlisten ausgedehnt. Automatische Zeilenhöhe, Auswahlzustände und die schmale Paneldarstellung sind mitzuberücksichtigen.

Freigegeben sind ausschliesslich die lokale Korrektur, zugehörige Regressionstests, der isolierte Bau eines neuen SPFx-Kandidaten und dessen Dokumentation. Beschriftungen, Auswahlwerte, Fachlogik, Datenvertrag, Freigaben und bestehende Datenpins bleiben unverändert. Der Datenrelease bleibt `2026-10-08-mvp-07-approved.1` mit Manifest SHA-256 `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597`.

## Versionsfolge und Abgrenzung

- Neuer lokaler Darstellungskandidat: Solution und Feature `0.7.0.2`, Anwendung und Webpart weiterhin `0.7.0`.
- Das ursprüngliche Paket `0.7.0.0` und dessen versiegelte Artefakte werden nicht überschrieben.
- Das gebilligte Wiederherstellungspaket `0.7.0.1` bleibt unverändert und ausschliesslich dem bisherigen Wiederherstellungszweck zugeordnet.
- Mirror- und Webarchive werden nicht neu gebaut. Die gemeinsame UI-Quelle ist korrigiert, das bisherige Webarchiv enthält diese Korrektur noch nicht.
- Keine Kataloginstallation, App-Aktualisierung, Mirror-/Seiten-/Registerkartenänderung oder Veröffentlichung aus diesem lokalen Auftrag ableiten.
- E/Q, AP5, AP21-Testapps, E05, GitHub, steimer.ch-P, Berechtigungen und Richtlinien bleiben bei dieser Vorbereitung unverändert.

Nach einer Installation von `0.7.0.2` wäre `0.7.0.1` kein höherer Wiederherstellungsstand mehr. **Vor einer solchen Installation muss ein erneut geeigneter Rückfallweg lokal geprüft und gesondert gebilligt werden.** Der bisherige R07C-H01-Entscheid wird nicht auf einen neuen Wiederherstellungskandidaten übertragen.

## Abschlusskriterien der lokalen Vorbereitung

Der Kandidat benötigt einen eigenen Paket-, Bundle- und Quellenhashnachweis. Die Prüfung umfasst geschlossene Titel und geöffnete Optionen, Deutsch und Französisch, schmale Ansichten sowie normale, ausgewählte und deaktivierte Einträge. Der tatsächliche Paketinhalt und seine unveränderten technischen Identitäten sind separat zu prüfen. Ursprüngliche Artefakte, Daten und Recovery bleiben byteidentisch erhalten.

Ein lokaler Prüferfolg schliesst den tatsächlichen Hostbefund nicht. T07 muss nach gesondert freigegebener Installation auf SharePoint und Teams erneut bestanden werden. Das E-Gate und die anschliessende Q-Umstellung bleiben bis dahin offen.
