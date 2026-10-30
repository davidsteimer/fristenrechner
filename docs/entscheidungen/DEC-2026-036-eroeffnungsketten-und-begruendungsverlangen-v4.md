---
id: DEC-2026-036
titel: "Kantonalverfahrenskatalog 4 mit Eröffnungsketten und eigenständigen Begründungsverlangen"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "Fachabnahme AP23G1 vom 22.10.2026 einschliesslich aller 16 Gruppen und begrenzter Fachbehandlungen"
  - "Isolierte Vertrags- und Datenprobe AP23G2 auf dem unverändert abgenommenen lokalen AP23F3-Stand"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-036 Kantonalverfahrenskatalog 4 und Manifest 11

## Ausgangslage

[AP23G1 ist fachlich abgenommen](../fachrecht/abnahme-ap23g1.md). Die 16 neuen UR-/SO-/SH-Gruppen ergänzen die 42 bisherigen Pfade. Vier eigenständige Begründungsverlangen, die spätere begründete Eröffnung nach rechtzeitigem Gesuch, konkrete Gerichtszielbindung, der UR-Art.-22-Hinweis und die neue SH-Verwaltungs-Praxisbindung passen nicht vollständig in die geschlossene Qualifikationssemantik des Katalogs 3.

Die Tagesarithmetik und Regelkalender 3 können die abgenommenen Recheneffekte ausdrücken. Die Lücke betrifft die prüfbare Bedeutung von Handlungen, aktuellen Fallfakten, Hinweisen und Rechtsrollen. Eine Lockerung des alten Lesers oder ein bloss umetikettierter Format-10-Manifest würde diese neue Bedeutung und den notwendigen Consumer verbergen.

## Vorgeschlagener Entscheid

- **Kantonalverfahrenskatalog 4.0.0 sowie Manifest und Mindestconsumer 11.0.0.** Dies sind Komponentenverträge, keine Produktrelease-, Paketversions- oder Betriebsfreigabe.
- Die bisherigen 42 Pfaddefinitionen, Revisionen und Qualifikationsregeln bleiben exakt erhalten. Die 16 neuen Wege verwenden einen geschlossenen V4-Zweig. Keine nachträglichen neuen Pflichtfakten bei Altwegen und keine neuen Wege unter historischer Altsemantik.
- Begründungsanforderung ist eine eigenständige Handlung. UR/SO/SH-Verwaltung erhalten je die qualifizierte Zehntagehandlung, das SH-Obergericht die Dreissigtagehandlung beim selben entscheidenden Gericht. SO/SH setzen das ausdrücklich vorhandene Begründungsangebot voraus. Kein Ersatz durch gewöhnliche Beschwerde, ZPO-Art.-239-Zehntagefrist oder Bundesgerichtsweiterzug.
- Bei der späteren begründeten Eröffnung unterscheidet der Vertrag ursprüngliche Eröffnung und Begründung nach Gesuch. Ein neuer voller Rechtsmittellauf setzt bei Letzterem die erwiesen rechtzeitige Voranforderung voraus. Die Handlungskette wird nicht automatisch aus Defaults oder einem Gesuchsdatum ergänzt.
- Die zwei UR-Zwanzigtage-Rechtsmittelwege erhalten ein gebundenes Art.-22-Hinweisprofil. Acht Tage vor/nach Ostern und 18. Dezember bis 6. Januar werden am qualifizierten Eröffnungsdatum geprüft. `noticeOnlyNoDateChange` verändert weder Empfang noch Zählung oder Fristende. Ein Durchlaufen dieser Zeit ist kein Eröffnungshinweis.
- Konkrete ungeklärte UR-Lokal-Endtagswirkung, behauptete besondere Eröffnungsfolge und koordinierte Beschwerdefrist werden getrennt qualifiziert. Die Koordinationsgrenze gilt nur bei den beiden UR-Beschwerdewegen. Eine bereits bestimmte angeordnete Eingabedauer wird dadurch nicht pauschal gesperrt.
- Vier neue rechtliche Kalenderverwendungen binden UR, SO, SH-Verwaltung und SH-Gericht. **33 physische Kalender und 42 Manifestartefakte bleiben erhalten.** 41 Rohartefakte bleiben bytegleiche F3-Referenzkopien. Physische Datenwiederverwendung vererbt keine rechtliche Verfahrensberechtigung.
- SH-Verwaltung bindet den Berchtoldstag eigenständig an VRG/RTG und den abgenommenen, für das konkrete Ergebnis nicht tragenden Praxisbefund BGer 2C_483/2025 E. 3.1. SH-Gericht bindet ZPO-Gerichtsort und OGE 40/2018/1/K getrennt. Der Verwaltungsweg leitet seine Berechtigung nicht aus `SH-ZPO-ADDITIONAL` ab. Bestehende StPO-/ZPO-Januarentscheidungen bleiben unverändert.
- Die vorhandene Endverschiebungssicherung gilt bei genau der abgenommenen Kollision in den sieben neuen gerichtlichen Gruppen. Kein definitives Datum und Export in dieser Kollision, keine gesetzliche Unberechenbarkeit behaupten und keine Verwaltungssperre ohne Ferien.
- Das vollständige neue Fallfenster lautet 29.08.2026–31.12.2027. Eröffnung, Zähltage, Stillstände und Endverschiebungen müssen durch die jeweils geltende Norm-, Quellen-, Kalender- und Releasebindung gedeckt sein. Das Empfangsjahr allein genügt nicht.
- Rechtsprofile 1.0.0, Feiertagskatalog 2.0.0, Regelkalender 3.0.0, Spezialregimekatalog 3.0.0 und Sozialverfahrenskatalog 2.0.0 bleiben als Formate unverändert. 479 Feiertagsbasisregeln, zwölf gesonderte SO-Regeln, 44 nationale Sozialregeln und 50 BE-Anbindungen werden fachlich nicht erweitert. Persönliche Vorgaben bleiben Format 5.

## Migration und technische Prüfung

Die [Vertragsvorlage AP23G2](../architektur/verwaltungsverfahrensvertrag-ap23g2.md), getrennten Kandidatenschemata und tatsächlichen Strukturbytes legen die neue Semantik offen. Ältere Reader müssen den neuen Vertrag geschlossen ablehnen. Neu gehashte Definitionsänderungen, umetikettierte Formate oder auf alte Inventargrössen zurückgeschnittene Kandidaten dürfen keine Aktivierung erzeugen.

Die Strukturprobe umfasst elf Katalogerlasse, 58 Pfade und Qualifikationsregeln, 20 Stillstandsprofile, 13 rechtliche Kalenderverwendungen und 33 physische Kalender. Sie ist kein vollständig neu gebundener Datenrelease. Vor späterer Aktivierung sind sämtliche Zielkomponenten-, Pfad-, Quellenprüfungs- und Freigabereferenzen konsistent auf die konkreten Zielbytes zu binden. Kopierte historische Freigaben gelten nur für den damaligen Stand.

Neue Eröffnungsherkunft, Voranforderung, Koordination, Lokalwirkung und besondere Einwände sind aktuelle Falltatsachen. Sie werden nicht in persönlichen Standards gespeichert. Ein Rückfall auf einen älteren Reader wählt für einen unbekannten neuen Pfad keinen ähnlichen Altweg und löscht keine Browserdaten. Historische Formate und AP5 bleiben geschützt.

Die isolierte Prüfung muss die 115 abgenommenen G1-Erwartungen am tatsächlichen Kandidaten, Bestandsidentitäten und gezielte Manipulationen nachweisen. Die getrennte Python-Probe verwendet keine Produktmodule als Sollwertgeber. Eine erfolgreiche Strukturprüfung ist noch kein Nachweis der künftigen UI-, Runtime- oder Exportsperre.

## Entscheidstatus und Folgeauftrag

**Vorgeschlagen, noch nicht beschlossen.** Die fachliche G1-Abnahme und der G2-Start sind keine technische Vertragsbestätigung. AP23G2 und DEC-2026-036 werden David separat vorgelegt. G3 startet erst nach technischer Abnahme, gesondertem Vertragsbeschluss und anschliessendem Auftrag.

Native Schemata, produktive Reader, Rechenkern, UI, Pakete und freigegebene Rechtsdaten bleiben in G2 unverändert. Keine Releasequellenpromotion, Auslieferungsbauten, Commits, Quellpushs, Uploads, Installationen oder E/Q/P-Freigaben. Die reguläre Auslieferung bleibt gemäss [DEC-2026-034](DEC-2026-034-gebuendelter-schweizausbau.md) bis zur vereinbarten Kantonsabdeckung gebündelt. David entscheidet in Personalunion, Codex bereitet und prüft ohne formelle Freigabe- oder Haftungsverantwortung.
