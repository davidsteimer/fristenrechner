---
id: DEC-2026-016
titel: "Gruppenbasierter Q-Demobetrieb mit zentralem M365-Zugriffsprinzip"
status: beschlossen
vorgeschlagen_am: 2026-09-01
entscheidungsdatum: 2026-09-01
klasse: B
entschieden_durch: "David Steimer"
quelle:
  - "Arbeitspaket AP15, GitHub-Issue #32"
  - "AP15-Testprotokoll Q01 bis Q12"
  - "DEC-2026-013"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-016: Gruppenbasierter Q-Demobetrieb mit zentralem M365-Zugriffsprinzip

## Ausgangslage

AP14 hat die technische Gastfähigkeit des unveränderten Fristenrechners in SharePoint und Teams nachgewiesen. Die damalige Matrix verlangte jedoch eine im gesamten Tenant unbelastete Testidentität. Zwei Prüfungen blieben deshalb historisch nicht bestanden, obwohl die vorbestehenden Rechte nicht durch den Fristenrechner erzeugt worden waren.

AP15 beurteilt stattdessen das durch die Q-Aufnahme erzeugte Berechtigungsdelta. Eine Gastperson soll mit einem üblichen Microsoft-365-Aufnahmevorgang alle und nur die benötigten Q-Rechte erhalten. Ein einziger Widerruf soll Site, Team, Mirror und Paketdateien gemeinsam entziehen.

## Geprüfte Optionen

1. **Microsoft-365-Gruppe des privaten Q-Teams als zentraler Zugriffsprinzipal**
   - Vorteil: eine Aufnahme und ein Widerruf pro Person.
   - Vorteil: keine direkten Gastrechte auf Site, Mirror oder Paketordner.
   - Vorteil: üblicher Microsoft-365-Betriebsablauf ohne zusätzliche API-Berechtigungen.
   - Nachteil: Gruppenpropagation und Sitzungscache können den sichtbaren Zustand verzögern.
2. **Direkte Einzelrechte pro Gast**
   - Vorteil: Rechte lassen sich pro Ressource unmittelbar zuweisen.
   - Nachteil: fehleranfälliger Widerruf über mehrere Ressourcen.
   - Nachteil: höherer Betriebsaufwand und schlechtere Nachvollziehbarkeit.
3. **Anonyme oder öffentliche SharePoint-Freigabe**
   - Vorteil: keine Gastaufnahme nötig.
   - Nachteil: passt nicht zum Q-Zweck und erweitert den Zugriff unnötig.
   - Nachteil: löst die separate P-Architektur nicht sauber.
4. **Verzicht auf einen Q-Demobetrieb**
   - Vorteil: kein externer M365-Zugriff.
   - Nachteil: frühe Demonstrationen für Justiz und Justizinformatik wären nur in der Entwicklungsumgebung möglich.

## Entscheid

Der begrenzte Q-Demobetrieb wird mit der Microsoft-365-Gruppe des privaten Q-Teams als einzigem zentralen Zugriffsprinzip freigegeben.

Dabei gelten verbindlich:

- Gastpersonen werden nur als Mitglieder, nie als Besitzer, in das private Q-Team aufgenommen.
- Die Gruppe vermittelt Lesen auf der Q-Kommunikationssite, Lesen auf dem same-site Mirror und Lesen auf dem konkret verwendeten `ClientSideAssets`-Paketordner.
- Auf der App-Katalog-Webebene besteht nur der technisch notwendige beschränkte Zugriff.
- Der Mirror der verbundenen Q-Teamsite besitzt eine eigene Berechtigungsgrenze und bleibt für Teammitglieder schreibgeschützt.
- Direkte Einzelrechte für Gäste sind nicht zulässig.
- Die Q-Gruppe vermittelt keine Rechte auf E-Ressourcen.
- Entfernen aus dem Q-Team ist der ordentliche Widerrufsvorgang.
- Nach Aufnahme oder Widerruf werden Propagation und eine frische Sitzung berücksichtigt.
- Conditional-Access-Vorgaben der Gastorganisation werden eingehalten und nicht umgangen.
- Es dürfen nur vollständig freigegebene App- und Datenstände in Q aktiviert werden.
- Aus dem Q-Entscheid folgt keine öffentliche P-Freigabe.
- Eine spätere öffentliche P-Ausprägung bleibt auf die bestehende steimer.ch-Hosting-Infrastruktur beschränkt.

## Begründung

Q01 bis Q12 sind bestanden. Der reale Widerrufstest entzog mit der einzigen Teammitgliedschaft gleichzeitig den Zugriff auf Q-Site, Q-Teamsite, Mirror und Paketdatei. Die Gruppenrechte blieben bestehen und die erneute Aufnahme stellte den Q-Betrieb wieder her. Damit ist das Modell einfacher, vollständiger und besser prüfbar als direkte Einzelrechte.

Der Ansatz benötigt keine neuen Graph-, Entra- oder tenantweiten App-Berechtigungen. Er entspricht dem Ziel einer adminarmen Installation und dem üblichen M365-Einladungsmechanismus.

## Folgen

### Auswirkungen

- Die [Betriebsanweisung](../betrieb/q-demobetrieb-ap15-betriebsanweisung.md) wird für Aufnahme, Update, Widerruf und Wiederaufnahme verbindlich.
- Der Q-Demobetrieb darf nur mit dem geprüften Gruppenmodell und vollständig freigegebenen Releases betrieben werden.
- Die E-Entwicklungsumgebung bleibt organisatorisch und technisch getrennt.
- Dritt-Tenant-Installationen verwenden weiterhin ihre eigenen Berechtigungsmodelle und die veröffentlichte Installationsanleitung.

### Risiken und Grenzen

- Microsoft-365-Gruppen und bestehende Sitzungen können Änderungen verzögert anzeigen.
- Teams kann entzogene Teams oder Kanäle vorübergehend als alte Navigationseinträge anzeigen.
- Die Heimatorganisation eines Gasts kann den zulässigen Zugriffsweg durch Conditional Access einschränken.
- Die Q-Umgebung ist nicht anonym und ersetzt keine öffentliche P-Ausprägung.
- Projektleitung, Betrieb, Prüfung und Freigabe liegen derzeit bei derselben Person.

### Folgearbeiten und Rückabwicklung

- Bei jedem Release werden Q-Registerkarte, Mirror, Referenzfall und Kalenderexport erneut geprüft.
- Der Gastzugang kann jederzeit durch Entfernen aus dem Q-Team widerrufen werden.
- Die dauerhaften Gruppenrechte werden nur bei Ausserbetriebnahme oder einem neuen Architekturentscheid entfernt.
- Eine Änderung des zentralen Berechtigungsmodells erhält eine neue DEC-ID mit gegenseitigen Verweisen.

## Nachweise

- [AP15-Zielarchitektur und Ausführungsplan](../betrieb/e-q-p-zielarchitektur-ap15.md)
- [AP15-Testprotokoll Q01 bis Q12](../betrieb/e-q-p-testprotokoll-ap15.md)
- [Betriebsanweisung Q-Demobetrieb](../betrieb/q-demobetrieb-ap15-betriebsanweisung.md)
- [AP14-Testprotokoll](../betrieb/gastzugriff-ap14-testprotokoll.md)
- [DEC-2026-013](DEC-2026-013-spfx-zielarchitektur.md)
- [GitHub-Issue #32](https://github.com/davidsteimer/fristenrechner/issues/32)

## Entscheidstatus

David Steimer hat DEC-2026-016 am 1. September 2026 ausdrücklich beschlossen und den begrenzten Q-Demobetrieb für vollständig freigegebene Releases freigegeben. Zum Zeitpunkt dieses Entscheids war die öffentliche P-Ausprägung ausdrücklich nicht freigegeben. Sie wurde später gestützt auf AP16 mit [DEC-2026-018](DEC-2026-018-freigabe-oeffentlicher-p-betrieb.md) freigegeben. DEC-2026-016 hat den Status `beschlossen`.

## Verantwortlichkeit

Entschieden wird durch David Steimer. Codex hat den Entwurf und die technischen Nachweise vorbereitet, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.
