# Testprotokoll AP14: isolierter Gast-Demobetrieb

Dieses Protokoll dokumentiert die Durchführung des [AP14-Ausführungsplans](gastzugriff-demobetrieb-ap14.md). Die rohe Evidenz bleibt lokal oder tenantintern. Das öffentliche Protokoll enthält weder Gastadressen noch Tenant-IDs, interne Admin-URLs, Tokens oder Einladungslinks.

## 1. Durchführung

| Merkmal | Eintrag |
| --- | --- |
| Startdatum | 31. August 2026 |
| Abschlussdatum | 1. September 2026 |
| Durchgeführt durch | David Steimer mit Codex |
| Status | abgeschlossen, technischer Nachweis ohne Betriebsfreigabe |
| WIP | AP14, ein wesentliches Arbeitspaket |
| Referenzrelease | `v0.3.0` |
| SPFx-Paket | `0.3.0.0` |
| Fachdatenstand | `2026-08-31-mvp-03-approved.1` |
| Zielentscheid | keine Betriebsfreigabe aus AP14, Übergabe des gruppenbasierten Q-Modells an AP15 |

## 2. Referenzidentität G01

| Merkmal | Soll | Ist | Ergebnis |
| --- | --- | --- | --- |
| Git-Tag | `v0.3.0` | Commit `e4602c535fa372f21952081cbfc404d4df259000` | bestanden |
| Paketversion | `0.3.0.0` | `0.3.0.0` | bestanden |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` | identisch | bestanden |
| WebPart-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` | identisch | bestanden |
| Paket SHA-256 | `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1` | identisch | bestanden |
| Datenrelease | `2026-08-31-mvp-03-approved.1` | identisch | bestanden |
| Daten-Pin-Commit | `f80f4019ff56ca51154ba7cd8b767686dd87a9a4` | identisch | bestanden |
| Manifest SHA-256 | `74583fa4dc9cab8ed99af3f9202782d90b02e9e47578f1dd9d2da40d19357be8` | identisch | bestanden |

**G01: bestanden.** Lokales Paket, freigegebener Datenstand, Git-Tag und veröffentlichte Releaseidentität stimmen überein.

## 3. Paketberechtigungen G02

| Prüfung | Ergebnis | Befund |
| --- | --- | --- |
| Clientseitige Lösung | bestanden | `IsClientSideSolution=true` |
| Domainisolation | bestanden | `IsDomainIsolated=false` |
| zusätzliche Graph- oder Web-API-Berechtigungen | bestanden | keine Anforderung in Lösungskonfiguration oder Paket |
| Client-Assets | bestanden | im Paket enthalten |
| Tenant-App-Katalog | bestanden | Paket `0.3.0.0` ist gültig und aktiviert |
| Zielhosts | bestanden | SharePoint-WebPart und Teams-Registerkarte |

**G02: bestanden.** Der Gasttest benötigt keine neue API-Zustimmung und keine zusätzliche Entra-App-Registrierung.

## 4. Bereinigte Konfigurationsmatrix G03

| Bereich | Wirksamer Ausgangszustand | Bewertung für AP14 |
| --- | --- | --- |
| Entra-Gastrolle | Verzeichniszugriff für Gäste eingeschränkt | geeignet |
| Entra-Einladung | Einladung durch einen breiten internen Personenkreis erlaubt | bestehender Governancebefund, für AP14 nicht ausweiten |
| Entra-Identitätsanbieter | Entra ID und E-Mail-Einmalkennwort verfügbar | Primärtest und optionaler G22 technisch vorbereitet |
| eingehende B2B-Zusammenarbeit | standardmässig zugelassen | geeignet für kontrollierte B2B-Aufnahme |
| B2B Direct Connect | standardmässig gesperrt | im Einklang mit dem Nichtziel Shared Channels |
| Conditional Access | keine tenantweite Richtlinie vorhanden | bestehender Sicherheitsbefund, keine Abschwächung durch AP14 |
| SharePoint organisationsweit | neue und bestehende authentifizierte Gäste zugelassen | geeignet, sofern die Demosite enger konfiguriert wird |
| anonyme SharePoint-Links | nicht als Organisationsstandard zugelassen | geeignet |
| SharePoint Standardlink | bestimmte Personen | geeignet |
| SharePoint Standardberechtigung | Bearbeiten | für AP14 nicht übernehmen, Mirror und Seite explizit nur lesbar freigeben |
| Teams-Gastzugriff | aktiviert | geeignet |
| Teams-App | `Fristenrechner Schweiz` entsperrt und organisationsweit verfügbar | geeignet |
| bestehende Demoressourcen | keine Ressource mit den vorgesehenen AP14-Namen gefunden | isolierte Neuanlage möglich |

**G03: bestanden.** Die wirksame Baseline ist dokumentiert. AP14 benötigt keine Abschwächung tenantweiter Sicherheitsvorgaben. Die bestehenden Einladerechte und die fehlende Conditional-Access-Richtlinie werden als Governancebefunde festgehalten. Sie werden in diesem Arbeitspaket nicht tenantweit verändert.

## 5. Isolierte Ziele und Bereitstellungsstand

Die Zielnamen wurden vor der Anlage auf erkennbare Kollisionen geprüft. Die beiden Demoressourcen wurden getrennt von den internen Referenzumgebungen erstellt. Öffentliche Nachweise nennen keine Tenant-, Gruppen-, Site- oder Gast-IDs.

| Zweck | Erstellte Ressource | Berechtigungsgrenze und Ist-Stand |
| --- | --- | --- |
| SharePoint-Primärtest | Kommunikationssite `Fristenrechner Gastdemo` | während des Tests nur lesbar für den bezeichneten Gast, nach G20 wieder entzogen, keine anonyme Freigabe |
| SharePoint-App | veröffentlichte Startseite der Demosite | SPFx-Paket `0.3.0.0`, Provider `SharePoint-Mirror`, freigegebener Datenstand ohne Fallback geladen |
| SharePoint-Mirror | same-site Ordner `fristenrechner-data/2026-08-31-mvp-03-approved.1` | ausschliesslich freigegebene Laufzeitdaten, keine Projekt- oder Falldaten |
| Teams-Primärtest | privates Team `Fristenrechner Gastdemo Teams` | während des Tests ein Besitzer und ein bestehender B2B-Gast, Gastmitgliedschaft nach G20 wieder entfernt |
| Teams-Kanal | Standardkanal `Fristenrechner` | neutrale Kanalbeschreibung und App-Registerkarte `Fristenrechner Schweiz` |
| Teams-App | Kanalregisterkarte `Fristenrechner Schweiz` | dieselbe Component-ID, Provider `SharePoint-Mirror`, same-site Datenstand ohne Fallback geladen |
| Teams-Mirror | Ordner `fristenrechner-data/2026-08-31-mvp-03-approved.1` auf der Teamsite | eigene Ordnerberechtigungen, Besitzer Vollzugriff, Besucher und Mitglieder Lesen |

Beide Mirrors wurden aus derselben lokalen Freigabequelle hochgeladen. Die Ordnerstruktur und alle durch das Manifest referenzierten JSON-Dateien sind vorhanden. Eine während der Uploaddiagnose erzeugte Textdatei wurde aus der SharePoint-Demosite in deren Papierkorb verschoben. Die internen Referenzumgebungen `Fristenrechner Test` und `Entwicklungsumgebung` wurden durch AP14 nicht geändert.

Damit der SPFx-Code im Gastprofil geladen werden konnte, war zusätzlich ein eigenes Leserecht auf dem paketbezogenen Ordner unter `ClientSideAssets` nötig. Der Gast erhielt weder Leserecht auf den übrigen App-Katalog noch eine zusätzliche App- oder API-Berechtigung. Das Ordnerrecht und der technisch nötige Traversierungszugriff wurden in G20 wieder entfernt.

## 6. Prüfstatus

| ID | Kurzbezeichnung | Status | Befund oder nächster Schritt |
| --- | --- | --- | --- |
| G01 | Referenzidentität | bestanden | Paket, Tag, Datenrelease und Prüfsummen stimmen überein |
| G02 | Paketberechtigungen | bestanden | keine zusätzliche API-Zustimmung |
| G03 | Richtlinienbaseline | bestanden | bereinigte Baseline und lokale Rohevidenz erstellt |
| G04 | Gastaufnahme | bestanden | bestehender B2B-Gast mit MFA angemeldet und als Gastidentität verifiziert |
| G05 | SharePoint-Seite | bestanden | veröffentlichte Seite und WebPart im Gastprofil wiederholt geladen, Provider ausschliesslich `SharePoint-Mirror` |
| G06 | read-only Mirror | bestanden | Manifest und referenzierte Artefakte lesbar, keine Neu- oder Uploadaktion und keine bearbeitbaren Rasterzellen, Dateien als schreibgeschützt ausgewiesen |
| G07 | fachliche Referenz | bestanden | StPO, Empfang 16.09.2026 und zehn Tage ergab 28.09.2026, Fristbeginn 17.09.2026 und rechnerisches Ende 26.09.2026 |
| G08 | Fach- und Sperrfälle | bestanden | Art. 67a Abs. 3 VRPG-BE ergab 20.03.2026 samt Sofortanfechtungshinweis, offene und gesperrte Regime blieben deaktiviert |
| G09 | Deutsch und Französisch | bestanden | Eingaben, Meldungen, Resultat, Hinweise und Parameter wurden in beiden Produktsprachen angezeigt |
| G10 | lokale Standards | bestanden | Speichern, Neuladen und Rücksetzen funktionierten im Gastprofil, das Empfangsdatum blieb leer |
| G11 | Kalenderexport | bestanden | erzeugte ICS enthielt Fristdatum 28.09.2026, freien Status, Kategorie `Fristablauf`, Testreferenz und `TRIGGER:-PT112H` |
| G12 | SharePoint-Isolation | bestanden | interne Testsite und nicht freigegebene App-Katalog-Inhalte blieben für den Gast gesperrt |
| G13 | Teams-Aufnahme | nicht bestanden | Beitritt zum Demoteam und App-Nutzung funktionierten, die bestehende Gastidentität sah aber weitere, schon früher zugewiesene Teams |
| G14 | Teams-App-Richtlinie | bestanden | organisationsinterne App war ohne Sideloading oder öffentliche Veröffentlichung verfügbar |
| G15 | Teams-Registerkarte | bestanden | unveränderte SPFx-Komponente lief in der Kanalregisterkarte innerhalb von Microsoft Teams |
| G16 | Teams-Mirror und Parität | bestanden | `SharePoint-Mirror`, Datenstand und StPO-Resultat entsprachen dem SharePoint-Lauf |
| G17 | Teams-Isolation | nicht bestanden | die gewählte Gastidentität war bereits vor AP14 Mitglied des internen Entwicklungsteams und konnte dessen Fristenrechner-Kanal öffnen |
| G18 | Netzwerk und Konsole | bestanden | kein Produktfehler und kein GitHub-Fallback, beobachtete Fremdfehlermeldung stammte ausschliesslich aus einer lokalen Browsererweiterung |
| G19 | Sitzungs- und Profiltrennung | bestanden | neues Browserprofil zeigte nur die Anmeldung, Datum und Referenz wurden nie gespeichert, lokale Defaults blieben auf das verwendete Browserprofil begrenzt |
| G20 | Berechtigungsentzug | bestanden | Site-Leserecht, Demoteam-Mitgliedschaft sowie paketbezogenes App-Katalog-Recht entfernt, frischer SharePoint-Aufruf endete mit Zugriff verweigert |
| G21 | interner Rückfallstand | bestanden | interne SharePoint-Referenzseite lud, interne Teams-App verwendete weiter den Mirror und ergab für den Referenzfall 28.09.2026 |
| G22 | optionales Einmalkennwort | nicht durchgeführt | kein separates Nicht-Entra-Konto im Testumfang |

## 7. Befunde

| ID | Befund | Auswirkung | Behandlung in AP14 |
| --- | --- | --- | --- |
| AP14-F01 | Interne Personen dürfen Gäste tenantweit relativ breit einladen | erhöhtes Governance- und Fehlbedienungsrisiko unabhängig vom Fristenrechner | keine tenantweite Änderung, Demoressourcen strikt isolieren und nur bezeichnetes Testkonto aufnehmen |
| AP14-F02 | Keine Conditional-Access-Richtlinie schützt oder blockiert den Gasttest | der technische Test ist möglich, weist aber keine CA-Kompatibilität nach | Geltungsgrenze im Ergebnisbericht ausdrücklich festhalten |
| AP14-F03 | Organisationsweiter SharePoint-Standard gewährt bei neuen Links Bearbeitungsrechte | darf nicht ungeprüft auf die Demo angewendet werden | explizite Besucherrolle und negativer Schreibtest G06 |
| AP14-F04 | Teams-Gastmitglieder erhalten auf der verbundenen Teamsite standardmässig Bearbeitungsrechte | der Gast könnte den Laufzeitmirror verändern | Vererbung auf dem Mirrorordner beendet und Mitgliedergruppe dort auf Lesen reduziert |
| AP14-F05 | Für die clientseitigen Paketdateien war ein eng begrenztes Leserecht unter `ClientSideAssets` nötig | ohne dieses Recht startet das WebPart für Gäste nicht | eigenes Leserecht nur auf den Paketordner sowie technischer Traversierungszugriff, beides nach dem Test entfernt |
| AP14-F06 | Die bezeichnete Gastidentität besass bereits vor AP14 Mitgliedschaften in mehreren Teams, darunter im internen Entwicklungsteam | G13 und G17 sind nach der ursprünglichen Matrix nicht bestanden, obwohl AP14 diesen Zugriff weder geschaffen noch erweitert hat | historisches Ergebnis beibehalten, künftige Isolation in AP15 anhand von Berechtigungsbaseline, Berechtigungsdelta und Zugriffsweg beurteilen |
| AP14-F07 | Lokale Standards sind an das Browserprofil und nicht an das Entra-Konto gebunden | ein Kontowechsel im selben Browserprofil übernimmt dieselben nicht sensitiven Defaults | als Betriebsgrenze dokumentieren, Zustelldatum und optionale Referenz bleiben ausdrücklich ausgeschlossen |
| AP14-F08 | Teams zeigte das entfernte Demoteam kurzfristig noch als veralteten Navigationseintrag | Sitzungs- und Clientcaches können den sichtbaren Entzug verzögern | administrative Mitgliedsliste und neuer Zugriff bestätigen den Entzug, Navigationseintrag liess sich nicht mehr öffnen |

## 8. Ergebnis und Entscheid

Die App ist technisch gastfähig. SharePoint, Teams, zweisprachige Bedienung, Fachlogik, Mirror, lokale Standards und Kalenderexport funktionierten mit dem unveränderten Release `v0.3.0`. Der SharePoint-Mirror blieb schreibgeschützt. Die zusätzlichen Leserechte für die paketbezogenen `ClientSideAssets` konnten auf den benötigten Ordner beschränkt und vollständig zurückgenommen werden.

AP14 endet nach der am Durchführungstag geltenden Matrix mit **Stop und ohne Gastfreigabe**. G13 und G17 waren obligatorisch und sind nach ihrer damaligen Formulierung nicht bestanden. Die verwendete Gastidentität war schon vor AP14 Mitglied des internen Entwicklungsteams. AP14 hat diesen bestehenden Zugriff weder geschaffen noch erweitert und hat ihn mangels Auftrags auch nicht verändert.

AP14 weist die technische Gastfähigkeit des unveränderten Produkts nach. Er weist noch nicht nach, dass die Aufnahme und Entfernung einer Person über einen zentralen Q-Zugriffsprinzipal sämtliche erforderlichen Q-Rechte und ausschliesslich diese Rechte vermittelt. Deshalb wird aus AP14 keine Betriebsfreigabe abgeleitet und DEC-2026-016 nicht beschlossen.

Der AP14-spezifische Zugriff ist aufgeräumt. Der Testgast wurde aus Demosite und Demoteam entfernt. Das paketbezogene Leserecht und der Traversierungszugriff im App-Katalog wurden entzogen. Das bestehende Entra-Gastobjekt und seine vorbestehenden Mitgliedschaften ausserhalb der Demo blieben unverändert.

## 9. Nachtrag zum Zielbild vom 1. September 2026

Das nach AP14 präzisierte Zielbild unterscheidet E, Q und P und sieht für Q einen üblichen M365-Einladungsmechanismus mit zentralem Zugriffsprinzipal vor. Für eine reale Demoperson ist es weder erforderlich noch zweckmässig, sämtliche unabhängig begründeten Berechtigungen im Tenant zu entfernen. Massgebend ist das Berechtigungsdelta, das durch Aufnahme in den Q-Zugriffsprinzipal entsteht.

Die ursprünglichen Resultate G13 und G17 bleiben als historischer Befund bestehen. Für den Nachfolgenachweis gelten folgende Kriterien:

- Berechtigungen der Testidentität vor der Q-Aufnahme sind als Baseline dokumentiert
- die Q-Aufnahme vermittelt ausschliesslich die bezeichneten Q-Rechte
- der Q-Zugriffsprinzipal besitzt keine Rollen oder Mitgliedschaften auf E-Ressourcen
- allfällige vorbestehende Rechte der Person sind ihrem tatsächlichen, von Q unabhängigen Zugriffsweg zugeordnet
- das Entfernen aus dem Q-Zugriffsprinzipal entzieht sämtliche Q-Rechte
- vorbestehende, nicht durch Q vermittelte Rechte bleiben unverändert

Die Umsetzung und Prüfung dieses Modells gehört zu [AP15](e-q-p-zielarchitektur-ap15.md). AP14 ist damit als technische Untersuchung abgeschlossen. Es wird nicht rückwirkend freigegeben und löst keinen Release aus.
