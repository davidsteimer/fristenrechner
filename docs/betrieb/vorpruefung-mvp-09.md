# MVP 0.9 Lokale Vorprüfung R09-A1

Stand: 18. Oktober 2026. **R09-A1 bestanden. R09-A2, Quellenfreigabe, Datenübernahme und definitive Artefakte stehen aus.**

Grundlage sind die [fachlich-technische AP23E3-Abnahme](../fachrecht/abnahme-ap23e3.md), [DEC-2026-033](../entscheidungen/DEC-2026-033-beschluss.md) und die [lokale UX-Abnahme #50](../ux/abnahme-datumseingabe-issue50-lokal.md). Die [Releaseplanung](deployment-mvp-09.md) trennt die nächsten Freigaben.

## Frisch geprüft

| Prüfung | Ergebnis |
| --- | --- |
| Ursprüngliche AP23E3-QA und Eingaben | Erwarteter QA-Hash bestätigt, alle 330 gebundenen Eingaben und 66 Prüfbelege bytegleich |
| Separate Abnahmesicherung | 417 Dateien plus Archivbeleg, einschliesslich aller 42 Kandidatdateien, tatsächlichem lokalen SPFx-Testpaket und Webassets. Unabhängig erneut geprüft |
| TypeScript-Typprüfung | Bestanden |
| AP23E3-Kandidatenreproduktion im Prüfmodus | Bestanden, keine Neuschreibung des Kandidaten |
| Vollständige Produktregression | 2654 bestanden, keine Fehler, übersprungenen, abgebrochenen oder offenen Tests |
| Lokale Host-Lebenszyklusprüfung | 30 bestanden, keine Fehler oder ausgelassenen Tests |
| Historischer AP5-Vergleich | 1584 vollständige Resultat-/Rechenspurvergleiche bestanden |
| Geschützte Vorher-/Nachher-Dateien | Alle 627 unverändert, einschliesslich Rechtsreleases, Quellenregister, Schemas, E3-Nachweisen und Produkt-/Konfigurationsdateien |
| Neues Archivverfahren | 20 Positiv- und Negativtests bestanden |
| Neues Quelleninventar | 13 Positiv- und Negativtests bestanden |

Die Testebenen überlappen teilweise und werden nicht addiert. Der lokale Hosttest ist kein Nachweis einer installierten SharePoint- oder Teams-App. Die ursprünglichen SPFx-/Webbuild- und Browsernachweise wurden bytegebunden gesichert, nicht als neue definitive Releasebuilds ausgegeben.

Die Bestandsprüfung der vier definitiven MVP08-Dateien bestätigt die historischen Artefaktprüfsummen. Der Ausgangsbetrieb wird aus dem [Produktionsnachweis vom 16. Oktober](produktionsbereitstellung-mvp08-2026-10-16.md) übernommen. Es wurde keine neue Remoteinventur von GitHub, M365 oder steimer.ch durchgeführt.

## Quelleninventar

251 kanonische Quellenkennungen sind erfasst, davon 243 aus der abgenommenen MVP08-Gesamtprüfung und acht neue AP23E1-Kennungen. Die 2078 bisherigen konkreten Quellenverweise bleiben erhalten, 58 kommen hinzu. Eine bestehende Kennung erhält dabei ebenfalls neue Verwendungen. 713 historische Arbeitsmappenverweise bleiben separat und nicht aktivierend.

546 vorhandene MVP08-Belegdateien und acht ursprüngliche E1-Registerantworten sind erneut auf ihre tatsächlichen Bytes geprüft. **Das ist keine erneute inhaltliche Prüfung und keine aktuelle Bestätigung einer Onlinefassung.** Vier der acht neuen Kennungen betreffen bereits bekannte physische Erlasse. Der [Prüfplan R09-A2](../fachrecht/quellenpruefplan-mvp09.md) berücksichtigt deshalb sowohl Quellenidentität als auch konkrete Verwendung.

## Vorbereitete Gates, keine Abnahmeblocker für AP23E3

1. **Neue Quellenfreigabe:** Der technische E3-Kandidat bleibt mit offenem Quellenstatus erhalten. Der zusammengeführte R09-A2-Bericht ist vor Datenübernahme menschlich abzunehmen.
2. **Eigener Format-9-Übernahmeweg:** R08-Werkzeuge, alte Bindungen und synthetische Testfreigaben dürfen keine operative R09-Freigabe erzeugen.
3. **Rückfall auf MVP 0.8:** Das alte Recovery `0.8.0.1` führt auf MVP 0.7 zurück. R09 benötigt einen neuen höheren Paketstand aus der tatsächlichen archivierten MVP08-Basis. Die lokale Datei unter `spfx/sharepoint/solution/` ist eine Altdatei mit Version `0.4.0.1`, nicht das aktuelle Betriebspaket.
4. **Defaults-Rundlauf:** Neue LU-/ZG-/AR-Präferenzen im Format 5 müssen beim MVP08-Rückfall geschützt und bei Wiederaufnahme wieder verwendbar bleiben. Kein Browserdatenreset.
5. **Reale Host- und Geräteprüfung:** Insbesondere #50, Zoom, schmale Ansichten, DE/FR, Quellenwechsel, Cachefehler, neue Fallqualifikation und AP5 später am konkreten E-/Q-Paket.
6. **Kalender/Outlook:** Neue Verfahrensherkunft und Exportinvalidierung frisch prüfen. Vorhandene Outlook-Importnachweise erst nach begründetem Vergleich und separater menschlicher Bestätigung begrenzt wiederverwenden.
7. **P-Risiko:** Der bekannte Header-/Cachebefund bleibt ungelöst. Frischer Vergleich und ein konkreter MVP09-Risikoentscheid bleiben nötig.

Die lebenden Einstiegstexte werden nach der Abnahmesicherung auf den dokumentierten MVP08-Betrieb und den R09-Vorbereitungsstand nachgeführt. Historische Berichte, Freigabevorlagen und Prüfhashes bleiben unverändert.

## Gebundene Nachweise

| Datei | SHA-256 |
| --- | --- |
| [Abnahmearchiv](../../outputs/ap23e3-abnahme-2026-10-18/receipt.json) | `18de59434d8dcb8469d0ebad767e6fcea55be089948335930d496990730da3ea` |
| [Frische technische Vorprüfung](../../outputs/release-mvp09-2026-10-18/preflight.json) | `741b93b7d3237659c28aec6eada30db0f532befd727f0c9a66057ae12828cddf` |
| [Vollständiges Quelleninventar](../../outputs/release-mvp09-2026-10-18/sources/source-inventory.json) | `f1171c9259e27027d1f3da9850f3107897a6cb4d5b6631561165aa2e7df2b4b1` |

Die Vorprüfung wurde mit Node 22 ausgeführt. Neue Werkzeuge sind `archive-ap23e3-acceptance.mjs`, `prepare-mvp09-local.mjs` und `inventory-mvp09-sources.mjs`. Sie schreiben ausschliesslich neue lokale Sicherungen beziehungsweise Prüfprotokolle. Das abgeschlossene Archiv wird aus seinen eigenen Bytes geprüft, unabhängig von später nachgeführten Einstiegstexten.

**Nicht ausgeführt:** neuer Quellenabruf oder vollständiger Inhaltsabgleich, Quellenregisterübernahme, Releasepromotion, Versions-/Pinwechsel, definitiver Build, Recovery-Bau, Commit, Push, Upload, Installation, P-Umschaltung oder Berechtigungsänderung.
