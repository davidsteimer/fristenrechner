# AP15: Betriebsanweisung für den gruppenbasierten Q-Demobetrieb

## 1. Zweck und Geltungsbereich

Diese Anweisung beschreibt die Aufnahme, Aktualisierung und den Widerruf authentifizierter B2B-Gäste für die Q-Demoumgebung des Fristenrechners. Sie gilt für den geprüften SharePoint- und Teams-Betrieb mit dem privaten Q-Team und dem zentralen Microsoft-365-Gruppenprinzipal.

Sie gilt nicht für:

- öffentliche oder anonyme Zugriffe
- die E-Entwicklungsumgebung
- eine spätere öffentliche P-Ausprägung auf steimer.ch
- Installationen in Dritt-Tenants
- direkte Einzelberechtigungen ausserhalb des beschriebenen Modells

## 2. Betriebsgrundsatz

Eine Gastperson erhält sämtliche Q-Rechte ausschliesslich durch die Mitgliedschaft im privaten Q-Team. Die zugehörige Microsoft-365-Gruppe ist dauerhaft mit den benötigten Q-Ressourcen verbunden.

Nicht zulässig sind:

- direkte Freigaben der Q-Site an einzelne Gäste
- direkte Gastrechte auf dem SharePoint-Mirror
- direkte Gastrechte auf dem `ClientSideAssets`-Paketordner
- Aufnahme als Teambesitzer
- Bearbeitungsrechte auf dem Laufzeitmirror
- anonyme oder organisationsweite Freigabelinks

## 3. Dauerhafte Q-Konfiguration

Vor der ersten Gastaufnahme muss einmalig geprüft sein:

1. Das Q-Team ist privat und besitzt einen bezeichneten Standardkanal für den Fristenrechner.
2. Die Fristenrechner-App ist auf der verbundenen Teamsite installiert und als Kanalregisterkarte eingerichtet.
3. Die Microsoft-365-Gruppe des Q-Teams ist Leser der Q-Kommunikationssite.
4. Der same-site Mirror enthält ausschliesslich den freigegebenen Datenrelease.
5. Die Mitgliedergruppe der Q-Teamsite besitzt auf dem Mirrorordner nur Lesen.
6. Die Q-Microsoft-365-Gruppe besitzt Lesen auf dem konkreten paketbezogenen `ClientSideAssets`-Ordner.
7. Auf der Webebene des Tenant-App-Katalogs besteht für diese Gruppe nur der technisch notwendige beschränkte Zugriff.
8. Der Q-Prinzipal besitzt keine Rolle auf E-Sites, E-Teams oder übrigen App-Katalog-Inhalten.

Diese dauerhafte Konfiguration wird nicht pro Gast wiederholt.

## 4. Gast aufnehmen

1. Prüfen, ob bereits ein passendes B2B-Gastobjekt im Tenant besteht.
2. Falls nicht vorhanden, die Person über den üblichen Microsoft-365- beziehungsweise Entra-Einladungsprozess als Gast einladen.
3. Die Person im Teams Admin Center oder im Team als **Mitglied** in das private Q-Team aufnehmen.
4. Die Person nicht als Besitzer eintragen.
5. Keine zusätzlichen Site-, Mirror- oder Paketordnerrechte erteilen.
6. Die Microsoft-Propagation abwarten. Sie kann mehrere Minuten beanspruchen.
7. Bei einem bereits angemeldeten Gast eine neue Sitzung beziehungsweise Ab- und Neuanmeldung verlangen.
8. Den Aufnahmecheck nach Abschnitt 5 durchführen und protokollieren.

## 5. Aufnahmecheck

Mit dem Gastkonto sind mindestens zu prüfen:

- Q-Team und Kanal sichtbar
- Fristenrechner-Registerkarte lädt
- Q-Kommunikationssite lädt, soweit sie zum vorgesehenen Zugang gehört
- Datenquelle zeigt `SharePoint-Mirror`
- erwarteter Regel- und Kalenderstand wird angezeigt
- Referenzfall StPO, Empfang 16.09.2026 und zehn Tage ergibt 28.09.2026
- Kalenderdatei kann erzeugt werden
- E-Sites und E-Rechner bleiben gesperrt
- der Mirror bietet keine Neu-, Upload-, Bearbeitungs- oder Löschfunktion

Conditional-Access-Vorgaben der Gastorganisation sind einzuhalten. Verlangt die Heimatorganisation eine gesicherte VDI, wird der Check dort durchgeführt.

## 6. Produkt- oder Datenstand aktualisieren

Ein Update des Q-Demobetriebs folgt der allgemeinen Release- und Mirroranleitung. Zusätzlich gilt:

1. Nur ein vollständig freigegebener App- und Datenstand darf aktiviert werden.
2. Der neue Datenrelease wird atomar als eigener Mirrorordner bereitgestellt.
3. Manifest und sämtliche referenzierten Artefakte müssen byteidentisch zum freigegebenen Release sein.
4. Der Provider bleibt auf `SharePoint-Mirror` und den freigegebenen Releaseordner eingestellt.
5. Die Mitgliedergruppe der Q-Teamsite bleibt auf dem neuen Mirrorordner auf Lesen beschränkt.
6. Ein Paketupdate darf das Gruppenrecht nur auf den konkret verwendeten neuen Paketordner ausdehnen.
7. Alte Paketordnerrechte werden erst entfernt, wenn kein aktiver oder rückfallfähiger Stand mehr darauf angewiesen ist.
8. SharePoint- und Teams-Referenzfall, Provider, Datenstand, Rechenspur und Kalenderexport werden erneut geprüft.
9. Gastmitgliedschaften werden für ein Produktupdate nicht einzeln verändert.

## 7. Gastzugang widerrufen

1. Die bezeichnete Person aus dem privaten Q-Team entfernen.
2. Keine dauerhaften Q-Gruppenrechte auf Site, Mirror oder Paketordner löschen.
3. Die Microsoft-Propagation abwarten.
4. Administrativ prüfen, dass die Person nicht mehr Mitglied des Q-Teams ist.
5. Mit einer frischen Gastsitzung oder nach erneuter Anmeldung prüfen:
   - Q-Kommunikationssite verweigert den Zugriff
   - Q-Teamsite verweigert den Zugriff
   - Mirror-Manifest ist nicht lesbar
   - paketbezogene SPFx-Datei ist nicht lesbar
6. Veraltete Team- oder Kanaleinträge im Client nicht mit einem wirksamen Recht verwechseln. Der Ressourcenaufruf muss scheitern.
7. Den Widerruf mit Datum, ausführender Person und Prüfergebnis dokumentieren.

Die Entfernung des Entra-Gastobjekts ist ein separater Tenantentscheid. Sie ist für den Q-Widerruf nicht erforderlich und darf nicht mit sachfremden Mitgliedschaften vermischt werden.

## 8. Wiederaufnahme

Eine frühere Gastperson wird wie eine neue Person ausschliesslich wieder als Mitglied in das Q-Team aufgenommen. Nach der Propagation ist eine neue Sitzung vorzusehen. Zusätzliche Einzelrechte sind auch bei einer verzögerten Sitzung nicht zu erteilen.

## 9. Störungsbehandlung

| Symptom | Wahrscheinliche Ursache | Massnahme |
| --- | --- | --- |
| Q-Team sichtbar, Rechner fehlt | alte Navigation, fehlende Gruppenpropagation oder alte Sitzung | Mitgliedschaft administrativ prüfen, Propagation abwarten, neu anmelden |
| SharePoint zeigt nach Wiederaufnahme weiterhin «Zugriff erforderlich» | Sitzung enthält den früheren Entzugszustand | neue Sitzung oder Ab- und Neuanmeldung verwenden |
| SPFx-WebPart bleibt leer | Paket-Asset nicht über den konkreten Ordner lesbar | Gruppenrecht auf dem aktiven Paketordner und beschränkten Traversierungszugriff prüfen |
| Datenquelle ist nicht `SharePoint-Mirror` | falsche WebPart-Konfiguration oder Fallback | Mirrorpfad, Provider und aktiven Release prüfen |
| Mirror ist bearbeitbar | Berechtigungsgrenze fehlt oder Mitgliedergruppe besitzt Schreiben | Betrieb stoppen und Mirrorordner auf Lesen begrenzen |
| Teams-Anmeldung ausserhalb der VDI scheitert | Conditional Access der Gastorganisation | zugelassene gesicherte Umgebung verwenden, Richtlinie nicht umgehen |

## 10. Minimaler Betriebsnachweis

Für jede Aufnahme, Aktualisierung und jeden Widerruf werden mindestens festgehalten:

- Datum und Uhrzeit
- ausführende Person
- Art der Aktion
- interne Referenz auf die Gastidentität
- aktiver App- und Datenstand
- Ergebnis von Site-, Team-, Mirror- und Paketprüfung
- allfällige Propagations- oder Conditional-Access-Besonderheiten

Personenbezogene Identifikatoren und Tenantkennungen gehören in die lokale oder tenantinterne Evidenz, nicht in das öffentliche Repository.

## 11. Verantwortlichkeit

David Steimer nimmt derzeit Betrieb, Prüfung und Freigabe in Personalunion wahr. Die Rollen bleiben für ein künftiges Vieraugenprinzip getrennt dokumentiert. Codex kann die Durchführung und Dokumentation unterstützen, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.
