# DEC-2026-040 Dynamische Feiertagsbindung und jährliche Büroschliesstage

Datum: 27. Oktober 2026. Status: **Vorschlag, nicht beschlossen**. Entscheider: David Steimer. Grundlage: [fachliche Abnahme AP23K1](../fachrecht/abnahme-ap23k1.md). Technische Ausarbeitung: [AP23K2](../architektur/verwaltungsverfahrensvertrag-ap23k2.md).

## Ausgangslage

Der beschlossene Kantonalverfahrenskatalog 7.0.0 mit Manifest und Mindestconsumer 14.0.0 bindet Verwaltungspfade an einen festen Kalender. Der ergänzende VwVG-Verweis im Basler Gerichtsverfahren verlangt dagegen die rechtlich qualifizierte Feiertagsanknüpfung an Partei oder Vertretung. Ausserkantonale Kalenderdaten werden damit nicht zu zusätzlichen kantonalen Verwaltungsverfahrensfreigaben.

Im Baselbieter Verfahren gelten nach GOG § 46 zusätzlich bestimmte ganze Schliessungstage der kantonalen Verwaltungsbüros als Endverschiebungstage. Die 13 fachlich abgenommenen Jahresdaten sind keine neuen ewigen Feiertagsregeln. Die regionale Fasnachtsoption am 09.02.2027 bleibt nur dann sperrend, wenn sie das rechtliche Enddatum verändert. Eine neue Benutzerauswahl darf diese ungeklärte Rechtswirkung nicht positiv entscheiden.

Der bisherige geschlossene Vertrag bildet diese beiden Wirkungen nicht ab. Die fachliche Abnahme von K1 ist kein Beschluss über ein neues Format.

## Geprüfte Alternativen

| Alternative | Beurteilung |
| --- | --- |
| Katalog 7 unverändert weiterverwenden | Keine ausdrückliche dynamische Rechtsbindung und kein Vertrag für Jahres-Schliesstage. Eine still veränderte Bedeutung bestehender Felder wäre nicht abwärtskompatibel |
| UI oder vorhandene Feiertagsdateien mit Sonderlogik ergänzen | Würde normative Auflösung und Provenienz aus der Datenbindung herauslösen oder Bundesverwendungen derselben Kalender mit BL-Schliesstagen verändern |
| Eigener geschlossener Katalogzweig mit getrennten Wirkungen | Explizite neue Semantik bei unveränderten historischen Zweigen, Kalenderdateien und bisherigen Fachobjekten. Vorgeschlagen |

## Entscheidvorschlag

1. **Kantonalverfahrenskatalog 8.0.0**, **Manifest 15.0.0** und **Mindestconsumer 15.0.0** einführen. Der neue Zweig bleibt bis zur technischen Abnahme und diesem ausdrücklichen Beschluss vorgeschlagen.
2. Für die 16 BS-/BL-Wege einen geschlossenen V8-Zweig mit eindeutig qualifiziertem aktuellem Eröffnungstag verwenden. Kein automatisches Rekonstruieren von Zustellfiktionen, Folgeeröffnungen oder Verlängerungsbewilligungen.
3. Drei neue rechtliche Kalenderbindungen unterscheiden: BS-Verwaltung mit festem BS-Anker, BS-Gericht mit genau einem rechtlich feststehenden Partei-/Vertretungskanton und BL mit festem BL-Anker plus gesonderter jährlicher Endverschiebungspolicy.
4. Die vorhandenen terminalen VwVG-Feiertagszuordnungen ausschliesslich als geprüfte Datumsprojektionen für den BS-Gerichtsanker verwenden. Keine Vererbung von Bundes-Verfahrensfreigabe, Bundes-Gerichtsferien oder fremder kantonaler Verwaltungsregeln. Regionale Fakten und die tatsächlich gebundene Januaralternative bleiben Bestandteil der eindeutigen Auflösung.
5. Die 13 BL-Ganzschliesstage in einer quellen- und jahresgebundenen Policy im Verwaltungskatalog führen. Sie wirken nur bei der Endverschiebung und ausschliesslich auf die daran gebundenen BL-Verfahren. Keine Änderung der 35 bestehenden Kalender oder der 499 Katalogregeln.
6. Die ungeklärte BL-Fasnachtswirkung automatisch durch zwei sonst gleiche vollständige Rechnungen prüfen. Bei unterschiedlichen rechtlichen Ergebnissen weder definitives Resultat noch Kalenderexport. Kein Override über aktuelle Fallfakten, Defaults oder ein regionales GUI-Auswahlfeld.
7. Kalenderauswahl, jährliche Endverschiebungspolicy, aktuelle Qualifikation, Eröffnung, Zeitdeckung und Quellen zusätzlich ausdrücklich in Eligibility und Ergebnisprovenienz binden. Erklärende Metadaten sind keine Rechen- oder Exportberechtigung.

## Migration und unveränderte Komponenten

Die 149 bisherigen Wege und ihre Fachobjekte bleiben exakt erhalten. Die isolierte Probe ergänzt 16 Wege und umfasst damit 165. Die bisherigen Kalender und nichtadministrativen Manifestartefakte bleiben rohbytegleich. Rechtsprofile 1.0.0, Feiertagskatalog 2.0.0, Regelkalender 3.0.0, Spezialregimekatalog 3.0.0 und Sozialverfahrenskatalog 2.0.0 benötigen dafür keine neue Formatversion. Die 44 Sozialregeln und 50 BE-Anbindungen werden nicht erweitert.

Standards bleiben in Version 5. Ein stabiler Weg darf gespeichert werden, aktuelle Eröffnungstatsachen, Tagesdatum, Referenz, Vertretungs-/Gebietsqualifikation und Fallfreigaben werden dadurch nicht erfunden. Ein alter Consumer muss einen unbekannten neuen Weg erhalten und sperren, nicht auf einen Ersatzweg umdeuten. Ein allgemeiner Browserdatenreset ist keine Migration.

Das vollständige Fallfenster bleibt 29.08.2026–31.12.2027. Auch ein Jahreswechsel und jeder zusätzliche Endverschiebungstag müssen gedeckt sein. Die Basler gerichtliche VwVG-Verweisung hat zwei Normabschnitte für 2026 und 2027. Baselbieter Schliessungen werden jahresgebunden und nicht auf 2028 fortgeschrieben.

## Freigabegrenzen

Der Beschluss würde den technischen Produktvertrag bestätigen, nicht dessen native Implementation oder einen Datenrelease. AP23K3 braucht einen gesonderten Startauftrag. Source Release, Paketbau, Publikation und Betrieb folgen den bestehenden getrennten Gates. K2 selbst umfasst nur isolierte lokale Schema-, Struktur- und Rechenproben.

MVP 0.9 bleibt der freigegebene Betrieb. Die 19 endständig abgenommenen Kantone werden durch K1 und K2 noch nicht zu 21 integrierten Kantonen. Keine zusätzlichen Sozialanbindungen, keine unabhängigen kommunalen Erlasse, keine Änderungen an AP5, AP21, E/Q/P, Mirrors oder Berechtigungen. DEC-2026-034 und die gebündelte nächste Auslieferung bleiben unverändert.

**Offen: technische Abnahme AP23K2 und ausdrücklicher Beschluss DEC-2026-040.**
