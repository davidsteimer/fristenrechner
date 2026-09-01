# AP15: Testprotokoll E/Q/P-Zielarchitektur und Q-Demobetrieb

| Merkmal | Stand |
| --- | --- |
| Arbeitspaket | AP15 |
| Prüfdatum | 1. September 2026 |
| Produktstand | `v0.3.0`, SPFx-Paket `0.3.0.0` |
| Datenstand | `2026-08-31-mvp-03-approved.1` |
| Prüfumfang | Q01 bis Q12 |
| Ergebnis | 12 von 12 Prüfungen bestanden |
| Betriebsentscheid | beschlossen, [DEC-2026-016](../entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md) |

## 1. Ziel und Abgrenzung

AP15 prüft einen gruppenbasierten Q-Demobetrieb für authentifizierte B2B-Gäste. Eine Person soll mit einer einzigen Mitgliedschaft aufgenommen und wieder vollständig entfernt werden können. Direkte Einzelrechte auf Site, Mirror oder Paketordner sind ausgeschlossen.

Die Prüfung erteilt keine öffentliche Produktionsfreigabe. Eine spätere P-Ausprägung bleibt auf die bestehende steimer.ch-Hosting-Infrastruktur beschränkt. Weitere Kantone, anonymer SharePoint-Zugriff und zusätzliche Hostingangebote sind nicht Gegenstand von AP15.

## 2. Geprüftes Berechtigungsmodell

Als zentraler Zugriffsprinzipal dient die Microsoft-365-Gruppe des privaten Q-Teams. Sie bündelt:

- die Mitgliedschaft im Q-Team und seinen Standardkanälen
- Lesen auf der Q-Kommunikationssite
- Lesen auf dem same-site SharePoint-Mirror
- Lesen auf dem konkreten paketbezogenen `ClientSideAssets`-Ordner
- den technisch notwendigen beschränkten Traversierungszugriff auf den Tenant-App-Katalog

Der Mirror auf der mit dem Q-Team verbundenen SharePoint-Site besitzt eine eigene Berechtigungsgrenze. Teammitglieder können die Laufzeitdaten dort nicht verändern.

## 3. Ergebnis der Prüfmatrix

| ID | Prüfung | Ergebnis | Bereinigter Nachweis |
| --- | --- | --- | --- |
| Q01 | Referenzidentität | bestanden | Paket `0.3.0.0`, Datenrelease `2026-08-31-mvp-03-approved.1`, Manifestformat 3 und freigegebene Artefakte stimmen mit dem bezeichneten Stand überein |
| Q02 | Berechtigungsbaseline | bestanden | E- und Q-Ressourcen, Gruppen, Mitgliedschaften, Mirrorgrenzen und Paketordner wurden vor der Änderung rückgelesen |
| Q03 | zentrale Q-Aufnahme | bestanden | der bestehende B2B-Gast wurde ausschliesslich als Mitglied des privaten Q-Teams aufgenommen |
| Q04 | SharePoint-Q | bestanden | Q-Seite und WebPart luden im Gastprofil wiederholt mit dem freigegebenen Datenstand |
| Q05 | Paket-Assets | bestanden | Lokalisierung und Bundle luden über das Gruppenrecht auf dem konkreten Paketordner, ohne direktes Gastrecht |
| Q06 | read-only Mirror | bestanden | Manifest und acht referenzierte Artefakte waren lesbar, effektive Schreibrechte fehlten |
| Q07 | Teams-Q | bestanden | Q-Team, Registerkarte, `SharePoint-Mirror` und StPO-Referenzresultat 28.09.2026 wurden im zugelassenen Gast-VDI bestätigt |
| Q08 | Berechtigungsdelta | bestanden | die Q-Aufnahme vermittelte ausschliesslich die bezeichneten Q-Rechte |
| Q09 | E-Trennung | bestanden | der Q-Prinzipal vermittelte keinen E-Zugriff, direkte E-Site-Aufrufe wurden abgewiesen und das E-Team enthielt den Gast nicht |
| Q10 | Widerruf | bestanden | Entfernen aus dem Q-Team entzog Q-Site, Q-Teamsite, Mirror und Paket-Asset gemeinsam |
| Q11 | Bestandsschutz | bestanden | interne E- und Q-Referenzressourcen blieben für das Betriebskonto erreichbar, die erneute Q-Aufnahme stellte den Gastbetrieb wieder her |
| Q12 | Betrieb und Nachvollziehbarkeit | bestanden | Aufnahme, Prüfung, Aktualisierung, Widerruf, Wiederaufnahme und Störungsbehandlung sind in der [Betriebsanweisung](q-demobetrieb-ap15-betriebsanweisung.md) dokumentiert |

## 4. Referenz- und Wiederaufnahmetest

Der technische Teams-Kontrolllauf meldete den Host `Microsoft Teams`, verwendete `SharePoint-Mirror` und berechnete für StPO, Empfang 16.09.2026 und zehn Tage den 28.09.2026. Fristbeginn war der 17.09.2026, rechnerisches Fristende der 26.09.2026.

Nach dem vollständigen Widerruf wurde die bezeichnete Person erneut als Gastmitglied in das Q-Team aufgenommen. Die Wiederaufnahme wurde in der durch die Heimatorganisation zugelassenen VDI geprüft. Bestätigt wurden:

- Q-Team und Q-Registerkarte sichtbar
- Rechner funktionsfähig
- Kalenderdatei beziehungsweise Termingenerator funktionsfähig
- Provider `SharePoint-Mirror`
- korrekter Regel- und Kalenderstand
- Referenzresultat 28.09.2026

## 5. Sicherheits- und Betriebsbefunde

### 5.1 Conditional Access

Die Heimatorganisation der Testidentität erlaubt die Teams-Anmeldung nur in einer gesicherten Umgebung. Der Gasttest wurde deshalb in der zugelassenen VDI abgeschlossen. Diese Vorgabe wurde weder abgeschwächt noch umgangen. Sie ist keine Einschränkung des Fristenrechners, kann aber den zulässigen Zugriffsweg einzelner Gastorganisationen bestimmen.

### 5.2 Verzögerte Teams-Navigation

Nach dem Entzug kann ein alter Team- oder Kanaleintrag im Teams-Client vorübergehend sichtbar bleiben. Massgebend sind die administrative Mitgliedschaft und der effektive Ressourcenzugriff. Im Test waren E-Sites und E-Rechner nicht zugänglich.

### 5.3 Sitzungsaktualisierung

Eine bestehende SharePoint-Sitzung kann nach Widerruf oder Wiederaufnahme noch den früheren Berechtigungszustand anzeigen. Nach Ablauf der Microsoft-Propagation ist eine Ab- und Neuanmeldung beziehungsweise eine neue Sitzung vorzusehen. Zusätzliche Einzelrechte sind dafür weder nötig noch zulässig.

### 5.4 Keine zusätzlichen App-Rechte

Die App benötigt weiterhin keine Microsoft-Graph-, Entra- oder tenantweiten API-Berechtigungen. Der Kalenderexport bleibt vollständig clientseitig.

## 6. Ergebnis und Entscheidbedarf

Q01 bis Q12 sind bestanden. Der zentrale Q-Prinzipal ist funktionsfähig, auf die bezeichneten Ressourcen begrenzt und mit einem einzigen Mitgliedschaftsentzug widerrufbar. Die Voraussetzungen für einen begrenzten Q-Demobetrieb des geprüften Release sind technisch erfüllt.

David Steimer hat mit [DEC-2026-016](../entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md) am 1. September 2026 den begrenzten Q-Demobetrieb für vollständig freigegebene Releases freigegeben. Die öffentliche P-Ausprägung bleibt ausdrücklich nicht freigegeben.

## 7. Verantwortlichkeit

David Steimer nimmt in der aktuellen Einpersonenphase Projektleitung, Betrieb, Prüfung und Freigabe wahr. Die Rollen bleiben für ein späteres Vieraugenprinzip getrennt dokumentiert. Codex hat Konfiguration, Nachweise und Dokumente unterstützt, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.
