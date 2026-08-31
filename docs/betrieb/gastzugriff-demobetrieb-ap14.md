# AP14: Gastzugriff für den isolierten SharePoint- und Teams-Demobetrieb

| Merkmal | Festlegung |
| --- | --- |
| Arbeitspaket | AP14 |
| Dokumentstatus | abgenommen |
| Planungsstand | 31. August 2026 |
| Verantwortlich | David Steimer |
| Ausarbeitung | David Steimer mit Codex |
| Abgenommen am | 31. August 2026 |
| Abgenommen durch | David Steimer |
| Maximale Dauer | 4 Nettoarbeitstage, ausdrücklich als Obergrenze |
| WIP | ein wesentliches Arbeitspaket |
| Entscheidungsbezug | DEC-2026-002, DEC-2026-003, DEC-2026-008, DEC-2026-011 und DEC-2026-013 |
| Technischer Referenzstand | Fristenrechner `v0.3.0`, SPFx-Paket `0.3.0.0` |
| Fachdatenstand | `2026-08-31-mvp-03-approved.1` |

David Steimer hat den Ausführungsplan am 31. August 2026 abgenommen. AP14 ist damit ausführungsbereit. Die Abnahme des Plans ist noch keine Freigabe zur Anlage von Demoressourcen, Einladung von Gästen oder Änderung von Tenant-, SharePoint- und Teams-Berechtigungen. Diese Durchführung beginnt erst mit einem ausdrücklichen Startauftrag.

## 1. Zweck und Entscheidungsfrage

AP14 weist nach, ob der Fristenrechner für Demonstrationen kontrolliert an externe Personen freigegeben werden kann. Der Nachweis umfasst eine moderne SharePoint-Seite und eine Teams-Kanalregisterkarte. Er beschränkt sich auf authentifizierte Microsoft-Entra-B2B-Gäste in einer eigens dafür vorgesehenen Umgebung.

Das Arbeitspaket beantwortet folgende Entscheidungsfrage:

> Kann der freigegebene MVP `v0.3.0` externen Demobenutzenden in SharePoint und Teams bereitgestellt werden, ohne anonyme Freigabe, zusätzliche App-Berechtigungen, Schreibzugriff auf den Datenmirror oder Zugriff auf interne Projektinhalte?

AP14 ist ein Sicherheits-, Berechtigungs- und Laufzeitnachweis. Es erweitert weder den fachlichen Funktionsumfang noch die Zielarchitektur. Ein positives Ergebnis erlaubt einen begrenzten Demobetrieb. Es ist keine allgemeine Extranet-, Produktiv- oder Dritt-Tenant-Freigabe.

## 2. Verbindliche Ausgangslage

- Release `v0.3.0` und das SPFx-Paket `0.3.0.0` sind fachlich, technisch und betrieblich freigegeben.
- Dasselbe SPFx-WebPart läuft intern in SharePoint und Teams und beantragt keine Microsoft-Graph- oder zusätzlichen Web-API-Berechtigungen.
- Der SharePoint-Provider liest den Datenmirror mit `SPHttpClient` im Kontext der angemeldeten Person.
- Persönliche Standards bleiben lokal im Browser. Eine optionale Referenz für den Kalendereintrag wird nicht gespeichert.
- Die App benötigt keine Fallakten, Namen, Aktenzeichen oder besonders schützenswerten Personendaten.
- DEC-2026-013 hält ausdrücklich fest, dass der interne Tenanttest keine Gastfreigabe begründet. Vor einer Gastfreigabe sind Berechtigungsmodell, Datenfreigabe, Teams-App-Richtlinie und Verhalten des SharePoint-Mirrors gesondert zu prüfen.
- Microsoft 365 begrenzt die externe SharePoint-Freigabe sowohl auf Organisations- als auch auf Site-Ebene. Die jeweils restriktivere Einstellung gilt.
- Entra-B2B-Zusammenarbeit, mandantenübergreifender Zugriff, Conditional Access, SharePoint-Freigabe und Teams-Gastzugriff können sich gegenseitig einschränken. AP14 dokumentiert deshalb den wirksamen Gesamtzustand und nicht nur einzelne Schalter im Admin Center.

## 3. Zielbetriebsmodell für die Demo

### 3.1 Identität und Anmeldung

- ausschliesslich authentifizierte B2B-Gastkonten
- Primärtest mit einem externen Geschäfts- oder Schulkonto aus einem anderen Entra-Tenant
- optionaler Zusatztest mit E-Mail-Einmalkennwort, sofern SharePoint und der konkrete Demoablauf dies unterstützen
- keine Freigabelinks vom Typ «Jeder» und kein anonymer Zugriff
- keine gemeinsam verwendeten Konten
- kein Umgehen von Conditional Access oder mandantenübergreifenden Richtlinien

Ein Gastkonto wird nur für den Testzeitraum aufgenommen. Einladung, Einlösung, Berechtigungszuweisung und Entzug werden mit Zeitstempel dokumentiert.

### 3.2 Isolierte Zielumgebungen

AP14 verwendet zwei eigens bezeichnete Demoressourcen:

1. eine moderne SharePoint-Site für die Gastdemo
2. ein separates Team mit einem Kanal `Fristenrechner`

Die vorhandenen Sites `Fristenrechner Test` und `Entwicklungsumgebung` bleiben interne Referenzumgebungen. Externe Personen werden weder diesen Sites noch dem bestehenden Entwicklungsteam hinzugefügt. Die Trennung verhindert, dass eine Demo unbeabsichtigt Zugriff auf andere Dateien, Kanäle, Mitgliederlisten oder Projektinformationen eröffnet.

### 3.3 App und Daten

- installiert wird unverändert das freigegebene SPFx-Paket `0.3.0.0`
- der Demobetrieb verwendet primär einen SharePoint-Mirror auf der jeweils zur Demoressource gehörenden Site
- der Mirror enthält ausschliesslich den byteidentischen, freigegebenen Laufzeitrelease `2026-08-31-mvp-03-approved.1`
- Gastpersonen erhalten Leserechte auf App-Seite und Mirror, aber keine Bearbeitungs-, Upload- oder Löschrechte
- der öffentliche GitHub-Provider darf als Vergleichspfad geprüft werden, ist aber keine Voraussetzung für den Demo-Zielbetrieb
- dieselbe Paket- und Datenidentität wird vor und nach der Bereitstellung anhand Versionen und SHA-256-Werten belegt

### 3.4 Testdaten und Datenschutz

Es werden nur fiktive Zustell- und Referenzdaten verwendet. Die Testreferenz darf keine Namen, Fallnummern, E-Mail-Adressen oder Angaben zu realen Verfahren enthalten. Öffentliche Nachweise werden von Gastadressen, Tenant-IDs, Einladungslinks, Tokens und internen URLs bereinigt.

## 4. Hypothesen

| ID | Hypothese | Nachweis |
| --- | --- | --- |
| H1 | Ein authentifizierter B2B-Gast kann das unveränderte WebPart auf einer modernen SharePoint-Seite verwenden. | Vollständiger Gastablauf von Einladung bis Berechnung und Neuladen |
| H2 | Der Gast kann den same-site SharePoint-Mirror mit Leserechten laden, ohne Schreibrecht zu erhalten. | positiver Lese- und negativer Schreibtest |
| H3 | Das unveränderte Paket läuft für einen Gast als Registerkarte in einem dedizierten Team. | direkter Aufruf in Teams Web oder Desktop mit Hostanzeige `Microsoft Teams` |
| H4 | App-Katalog, Teams-App-Richtlinie und Gastzugriffsrichtlinie erlauben die App gezielt, ohne sie anonym oder öffentlich bereitzustellen. | Richtlinien- und Sichtbarkeitsnachweis |
| H5 | Der Gast sieht ausserhalb der dedizierten Demoressourcen keine internen Projektinhalte. | negative Zugriffsprüfungen auf interne Site, Team und Bibliotheken |
| H6 | Berechnung, Sprachen, lokale Standards und Kalenderexport verhalten sich bei Gästen gleich wie im internen Referenzlauf. | fachlicher Vergleich mit der freigegebenen Testmatrix |
| H7 | Der Entzug der Gastberechtigung beendet den Zugriff nachvollziehbar. | Widerrufs- und Neuanmeldetest nach Ablauf vorhandener Sitzungstokens |
| H8 | Die Gastnutzung erzeugt keine neuen Graph-, API- oder App-Berechtigungsanforderungen. | Paket-, Netzwerk- und Konsolenprüfung |

## 5. Umfang und Nichtziele

### 5.1 Im Umfang

- Baseline der wirksamen Entra-, SharePoint- und Teams-Einstellungen
- Einrichtung oder Verwendung ausdrücklich isolierter Demoressourcen
- Einladung eines kontrollierten externen Testkontos
- minimale Berechtigungszuweisung für SharePoint und Teams
- SharePoint-Mirror mit freigegebenem MVP-0.3-Datenrelease
- Installation oder Aktualisierung des unveränderten Pakets `0.3.0.0`
- Positiv-, Negativ-, Widerrufs- und Laufzeittests
- Vergleich mit dem internen Referenzlauf
- bereinigtes Testprotokoll und Entscheidungsgrundlage
- vollständige Rücknahme des Testgastzugriffs, falls kein Go beschlossen wird

### 5.2 Nicht im Umfang

- anonyme Freigabe oder «Jeder»-Links
- Gastzugriff auf die vorhandene Entwicklungs- oder interne Testumgebung
- Shared Channels und Entra B2B Direct Connect
- öffentliche Veröffentlichung der Teams-App oder Aufnahme in einen App Store
- neue Graph-, Entra- oder Web-API-Berechtigungen
- automatisierte Einladung, Benutzerverwaltung oder Lizenzierung
- Zugriff auf reale Verfahrensdaten
- produktiver Support für beliebige Identitätsanbieter und Tenantkonfigurationen
- allgemeine Freigabe für sämtliche externen Personen oder Dritt-Tenants
- Änderung von Rechenkern, GUI, Fachdaten oder Datenformat

## 6. Rollen und Verantwortlichkeiten

| Rolle | Aufgabe in AP14 | Aktuelle Besetzung |
| --- | --- | --- |
| Auftraggeber und Freigabe | Ziel und Go-Entscheid bestätigen | David Steimer |
| Projektleitung | Arbeitspaket, WIP, Risiken und Abschluss steuern | David Steimer |
| Informationssicherheit und Datenschutz | Berechtigungsgrenzen und Nachweise beurteilen | David Steimer |
| M365-Administration | Einstellungen prüfen und freigegebene Änderungen ausführen | David Steimer oder ausdrücklich autorisierte Administration |
| Fach- und Produkttest | Berechnung, Sprachen und Kalenderexport vergleichen | David Steimer |
| Technische Ausarbeitung | Analyse, Konfiguration, Tests und Dokumentation unterstützen | Codex |

Die Rollen bleiben im Hinblick auf ein späteres Betriebskonzept getrennt. In der aktuellen Einpersonenphase werden die menschlichen Funktionen durch David Steimer wahrgenommen. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe-, Organ- oder Haftungsverantwortung.

## 7. Voraussetzungen und minimale Berechtigungen

### 7.1 Vorbereitende Read-only-Erhebung

Vor jeder Änderung werden folgende wirksamen Einstellungen dokumentiert:

- Entra-Einstellungen für externe Zusammenarbeit und Einladungsberechtigung
- mandantenübergreifender Standard sowie allfällige organisationsspezifische Regeln des Gast-Tenants
- anwendbare Conditional-Access-Richtlinien
- SharePoint-Organisationsstufe für externe Freigabe
- externe Freigabestufe der vorgesehenen Demo-Site
- Teams-Gastzugriff und app-zentrierte Verwaltung der organisationsinternen App
- App-Katalog, Paketversion und Installation auf den Demo-Sites

Wo für eine Änderung eine privilegierte Rolle nötig ist, wird nur die engste geeignete Rolle für die kürzest nötige Dauer verwendet. Bestehende Sicherheitsvorgaben werden nicht für den Test abgeschwächt. Ein durch Conditional Access verhinderter Gastzugriff ist ein relevantes Testergebnis und kein Fehler, den AP14 eigenmächtig umgeht.

### 7.2 Berechtigungsmatrix

| Objekt | Gastrecht | Muss möglich sein | Darf nicht möglich sein |
| --- | --- | --- | --- |
| Entra-Tenant | B2B-Gast | Anmeldung und Zugriff auf zugewiesene Ressourcen | Verzeichnisdurchsicht über die wirksame Gastrolle hinaus |
| SharePoint-Demosite | Lesen | Seite öffnen und WebPart ausführen | Seiten, Listen, Bibliotheken oder Berechtigungen ändern |
| Laufzeitmirror | Lesen | Manifest und referenzierte JSON-Artefakte abrufen | Dateien hochladen, ersetzen oder löschen |
| internes `Fristenrechner Test` | kein Recht | negative Prüfung liefert Zugriff verweigert | Inhalte oder Metadaten lesen |
| Demo-Team | Gastmitglied | Kanal und Registerkarte verwenden | administrative Team- oder App-Änderungen |
| internes Team `Entwicklungsumgebung` | kein Recht | negative Prüfung liefert Zugriff verweigert | Kanäle, Dateien oder Mitglieder einsehen |
| lokaler Browser | normale Webspeicherung | validierten Release und persönliche Standards lokal halten | Speicherung realer Falldaten oder Weitergabe an andere Profile |

Teams-Gastmitglieder können auf Ressourcen der zugrunde liegenden SharePoint-Site weitergehende Rechte erhalten als reine SharePoint-Besuchende. Das wird nicht theoretisch vorausgesetzt, sondern im realen Demo-Team geprüft. Das Demo-Team enthält deshalb keinerlei interne Inhalte ausser der App, dem Mirror und neutralen Hinweisen.

## 8. Vorgehen und Zeitbox

| Schritt | Inhalt | Obergrenze |
| --- | --- | ---: |
| 1 | Baseline, Zielressourcen und wirksame Richtlinien erheben | 0,5 AT |
| 2 | Demo-Site, Demo-Team, App und read-only Mirror bereitstellen | 0,75 AT |
| 3 | B2B-Gast einladen und SharePoint-Prüfungen ausführen | 0,75 AT |
| 4 | Teams-Prüfungen und hostübergreifenden Vergleich ausführen | 0,75 AT |
| 5 | Negativ-, Isolations-, Widerrufs- und Rückfalltests ausführen | 0,75 AT |
| 6 | Nachweise bereinigen, Entscheidungsgrundlage und Betriebsgrenzen dokumentieren | 0,5 AT |
| **Gesamt** |  | **4,0 AT** |

Die Zeiten sind Nettoaufwand. Wartezeiten für Richtlinienausbreitung oder die Annahme einer Einladung zählen nicht als Arbeitsaufwand. Wird die Obergrenze erreicht, endet der Spike mit dem bis dahin belegten Ergebnis. Der Umfang wird nicht stillschweigend erweitert.

## 9. Prüfkatalog

| ID | Prüfung | Erfolgskriterium | Nachweis |
| --- | --- | --- | --- |
| G01 | Referenzidentität | App-Version, Datenrelease, Manifest- und Pakethash stimmen mit `v0.3.0` überein | Versions- und Hashprotokoll |
| G02 | Paketberechtigungen | Installation oder Update verlangt keine Graph- oder zusätzliche Web-API-Zustimmung | App-Katalog- und Paketnachweis |
| G03 | Richtlinienbaseline | wirksame Entra-, Cross-Tenant-, SharePoint-, Teams- und App-Einstellungen sind vor Änderungen festgehalten | bereinigte Konfigurationsmatrix |
| G04 | Gastaufnahme | Einladung wird vom vorgesehenen externen Konto eingelöst und die Identität erscheint als B2B-Gast | Zeitstempel und bereinigter Identitätsnachweis |
| G05 | SharePoint-Seite | Gast öffnet die Demosite, lädt das WebPart und kann die Seite neu laden | Screenshot und Konsolenprotokoll |
| G06 | read-only Mirror | Gast lädt Manifest und alle Artefakte des Mirrors, kann aber keine Datei erstellen, ersetzen oder löschen | positiver Lese- und negativer Schreibtest |
| G07 | fachliche Referenz | StPO, Empfang 16.09.2026, zehn Tage ergibt 28.09.2026 | Resultat und Rechenspur |
| G08 | Fach- und Sperrfälle | mindestens ein VRPG-Spezialfall und ein fachlich gesperrter Fall verhalten sich wie im internen Referenzlauf | Vergleichsprotokoll |
| G09 | Deutsch und Französisch | Eingabe, Meldungen, Resultat und Rechenspur funktionieren in beiden Produktsprachen | Screenshots |
| G10 | lokale Standards | Speichern und Rücksetzen der Standards funktioniert im Gastprofil ohne serverseitige Profildaten | Funktions- und Netzwerkprüfung |
| G11 | Kalenderexport | `.ics` enthält Fristdatum, Kategorie `Fristablauf`, freien Status und Erinnerung 4 Tage 16 Stunden vorher | Dateiprüfung, kein Import in ein reales Gastpostfach nötig |
| G12 | SharePoint-Isolation | Gast erhält keinen Zugriff auf interne Testsite, andere Bibliotheken oder nicht freigegebene Inhalte | negative URL- und Navigationsprüfungen |
| G13 | Teams-Aufnahme | Gast kann dem dedizierten Demo-Team beitreten und nur die vorgesehenen Demoressourcen sehen | Teams-Sichtprüfung |
| G14 | Teams-App-Richtlinie | organisationsinterne App ist für den Gast verfügbar, ohne Sideloading oder öffentliche Veröffentlichung | App-Verfügbarkeitsnachweis |
| G15 | Teams-Registerkarte | dieselbe Component-ID läuft als Kanalregisterkarte und meldet den Host `Microsoft Teams` | Screenshot und Laufzeitprotokoll |
| G16 | Teams-Mirror und Parität | Registerkarte lädt den same-site Mirror und liefert dieselben Referenzresultate wie SharePoint | Provider- und Resultatvergleich |
| G17 | Teams-Isolation | Gast sieht weder das interne Team `Entwicklungsumgebung` noch dessen Kanäle, Dateien oder Mitglieder | negative Zugriffsprüfung |
| G18 | Netzwerk und Konsole | keine Produktfehler und keine unerwarteten Endpunkte, Tokens oder personenbezogenen Daten im Netzwerkverkehr | bereinigtes Netzwerk- und Konsolenprotokoll |
| G19 | Sitzungs- und Profiltrennung | Abmelden, Kontowechsel und neues Browserprofil legen keine Standards oder Eingaben eines anderen Profils offen | Ablaufprotokoll |
| G20 | Berechtigungsentzug | nach Entfernen des Gasts und Ablauf oder Widerruf der Sitzung ist kein neuer Zugriff auf Site, Team oder Mirror möglich | Widerrufsprotokoll |
| G21 | interner Rückfallstand | interne Referenzumgebungen funktionieren nach dem Test unverändert | kurzer Regressionstest |
| G22 | optionales Einmalkennwort | ein unterstütztes Nicht-Entra-Konto kann die SharePoint-Demo mit Einmalkennwort verwenden | optionaler Zusatznachweis, nicht Go-kritisch |

G01 bis G21 sind obligatorisch. G22 erweitert die Aussagekraft für einfache SharePoint-Demos, entscheidet aber nicht über die Freigabe des primären B2B-Szenarios.

## 10. Evidenz und Datenschutz

Die rohe Evidenz bleibt lokal oder tenantintern und wird nicht automatisch veröffentlicht. Sie kann Identitäten, Tenant- und Siteangaben oder Sicherheitskonfigurationen enthalten.

Im öffentlichen Repository werden nur bereinigte Nachweise abgelegt:

- keine vollständigen E-Mail-Adressen von Gastkonten
- keine Einladungs-, Anmelde- oder Freigabelinks
- keine Tokens, Cookies, Sitzungskennungen oder Tenantgeheimnisse
- keine Screenshots mit internen Sites, Teams, Mitgliedern oder Dateien ausserhalb der Demoressourcen
- keine vollständige Abbildung sicherheitsrelevanter Richtlinien, wenn daraus unnötige Angriffsfläche entstünde
- eindeutige Test-IDs, Zeitstempel, Soll, Ist und Ergebnis bleiben erhalten

Das öffentliche Ergebnis muss nachvollziehbar sein, ohne eine Bedienungsanleitung für den Tenant oder eine Liste interner Ressourcen zu werden.

## 11. Entscheidungslogik

### Go

Ein begrenzter Gast-Demobetrieb kann freigegeben werden, wenn:

- G01 bis G21 bestanden sind
- ausschliesslich authentifizierte B2B-Gäste zugelassen werden
- App, Mirror und Demoressourcen von internen Inhalten getrennt sind
- der Gast den Mirror lesen, aber nicht verändern kann
- keine neuen Graph-, API- oder übermässigen Benutzerrechte nötig sind
- Isolation und Berechtigungsentzug nachgewiesen sind

Das Go gilt nur für die dokumentierte Konfiguration und die bezeichneten Demoressourcen.

### Bedingtes Go

Ein SharePoint-only-Demobetrieb kann getrennt beschlossen werden, wenn SharePoint vollständig besteht, Teams aber ausschliesslich an einer dokumentierten Gast- oder App-Richtlinie scheitert. Die Teams-Freigabe bleibt dann gesperrt. Ein technischer oder sicherheitsbezogener Fehler der App erlaubt kein bedingtes Go.

### Stop

AP14 endet ohne Gastfreigabe, wenn insbesondere:

- anonymer Zugriff oder ein «Jeder»-Link erforderlich wäre
- der Gast interne Sites, Teams, Dateien oder Mitglieder einsehen kann
- der Gast den Laufzeitmirror oder andere Demo-Inhalte verändern kann
- zusätzliche weitreichende App-, Graph- oder Verzeichnisberechtigungen nötig wären
- die App nur durch Abschwächung verbindlicher Sicherheits- oder Conditional-Access-Richtlinien funktioniert
- der Zugriff nach dokumentiertem Entzug nicht wirksam beendet werden kann
- die Paket- oder Datenidentität vom freigegebenen Stand abweicht

## 12. Rückfall und Aufräumen

Bei Stop oder bedingtem Go werden nicht freigegebene Pfade geschlossen. Dazu gehören je nach Ergebnis:

- Gast aus Demo-Team und Demo-Site entfernen
- noch offene Freigabelinks löschen
- Gastkonto im Tenant sperren oder entfernen, sofern es für keinen anderen genehmigten Zweck benötigt wird
- Demo-App-Instanz oder Demoressourcen deaktivieren, wenn sie nicht weiterverwendet werden
- offene Sitzungen nach den verfügbaren administrativen Möglichkeiten widerrufen
- App-Katalogpaket und interne Referenzumgebungen unverändert belassen

Das Aufräumen wird als Teil von G20 und G21 protokolliert. Materielle Löschungen werden erst nach aufgelöstem Zielobjekt und im Rahmen des abgenommenen AP14 ausgeführt.

## 13. Lieferobjekte und Definition of Done

AP14 ist abgeschlossen, wenn folgende Lieferobjekte vorliegen:

- abgenommener Ausführungsplan AP14
- bereinigte Konfigurations- und Berechtigungsmatrix
- ausgefülltes Testprotokoll G01 bis G22
- dokumentierte Paket-, Release- und Mirroridentität
- technischer Ergebnisbericht mit Go, bedingtem Go oder Stop
- aktualisierte Anleitung für Installation und Betrieb in Dritt-Tenants
- bei Go ein Entscheid DEC-2026-016 mit genauer Geltungsgrenze
- bei Go eine kurze Betriebsanweisung für Einladung, Freigabe, Widerruf und jährliche Kontrolle
- bereinigter öffentlicher Nachweis ohne personenbezogene oder sicherheitskritische Details
- fachlich-technische Abnahme durch David Steimer

Ein positiver technischer Einzeltest genügt nicht. Die Gastfreigabe bleibt bis zur dokumentierten Abnahme aller obligatorischen Prüfungen gesperrt.

## 14. Referenzen

- [Microsoft: Einstellungen für externe Zusammenarbeit konfigurieren](https://learn.microsoft.com/en-us/entra/external-id/external-collaboration-settings-configure)
- [Microsoft: Mandantenübergreifende Zugriffseinstellungen für B2B-Zusammenarbeit](https://learn.microsoft.com/en-us/entra/external-id/cross-tenant-access-settings-b2b-collaboration)
- [Microsoft: Übersicht zur externen SharePoint-Freigabe](https://learn.microsoft.com/en-us/sharepoint/external-sharing-overview)
- [Microsoft: Externe Freigabe für eine Site ändern](https://learn.microsoft.com/en-us/sharepoint/change-external-sharing-site)
- [Microsoft: Moderne SharePoint-Gastfreigabe](https://learn.microsoft.com/en-us/sharepoint/modern-experience-sharing-permissions)
- [Microsoft: Gastzugriff in Teams](https://learn.microsoft.com/en-us/microsoftteams/guest-access)
- [Microsoft: Gastzugriff in Teams aktivieren oder deaktivieren](https://learn.microsoft.com/en-us/microsoftteams/set-up-guests)
- [Microsoft: Benutzerdefinierte Apps in Teams verwalten](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [DEC-2026-013](../entscheidungen/DEC-2026-013-spfx-zielarchitektur.md)
- [Technische Kurzdokumentation](../architektur/technische-kurzdokumentation.md)
- [Installation und Betrieb in Dritt-Tenants](installation-und-betrieb-dritttenants.md)
- [Release-2-Deployment und Testmatrix](deployment-release-2-mvp-03.md)

## 15. Abweichungen und bewusste Vereinfachungen

AP14 folgt HERMES 2022 agil mit klarem Auftrag, Zeitbox, Ergebnis, Entscheidung und WIP-Limit. Projektleitung, Informationssicherheit, Fachtest und Freigabe sind wegen der Einpersonenphase nicht personell getrennt. Diese Abweichung wird transparent ausgewiesen. Die Nachweise bleiben so strukturiert, dass ein späteres Vieraugenprinzip ohne neues Datenmodell ergänzt werden kann.

Die bestehenden Qualitätsziele nach eCH-0059 und WCAG 2.1 AA werden im Gastbetrieb nicht reduziert. AP14 ist jedoch kein vollständiges erneutes Accessibility-Audit, weil Oberfläche und Produktcode unverändert bleiben.
