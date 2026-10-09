# AP21 Tab Navigation mit dem Magic Keyboard auf dem iPad

Stand: 8. Oktober 2026. **Geringfügiger, von David akzeptierter Umgebungsbefund ohne Produktänderung. Die genaue technische Ursache bleibt ungeklärt.** Der unabhängige Kontrollversuch zeigt dasselbe Verhalten wie die AP21-Prüfseite. Eine vollständige AP21-Abnahme wird damit nicht erklärt.

Dieser Nachtrag ergänzt den unveränderten [E04-R2-Installationsnachweis](ap21-e04-r2-vollzug.md) für Testpaket `0.0.21.2`. Die dort dokumentierte erfolgreiche Desktop-Tab-Prüfung bleibt ein Nachweis für die damals geprüfte Umgebung.

## Gerätebeobachtungen

Prüfperson: David Steimer. iPad mit Magic Keyboard, Betriebssystem gemäss Nutzerangabe 27.0. Die Gerätetests wurden von David im Projektchat berichtet, nicht durch Codex auf dem iPad beobachtet. Exaktes iPad-Modell, Systembuild und Browserversionen wurden nicht erhoben.

| Prüfung | Berichtetes Ergebnis |
| --- | --- |
| Darstellung und Eingabehilfe | Darstellung einschliesslich Formatangabe und Hilfe korrekt. Bestätigung mit Enter funktioniert |
| macOS | Tab funktioniert |
| iPad in Chrome, Edge und Safari mit Magic Keyboard, Tastatursteuerung aus | `5` bleibt unverändert, kein Feldwechsel mit Tab. Dasselbe Navigationsproblem im gewöhnlichen Feld «Frist in Tagen» |
| iPad mit Bildschirmtastatur | Der entsprechende Feldwechsel funktioniert, der Magic-Keyboard-Befund tritt nicht auf |
| iPad mit Magic Keyboard, Tastatursteuerung ein | Weiterschalten funktioniert. Zusätzlich wird laut David jeweils die ganze Seite markiert |
| Unabhängiges Minimalformular mit Magic Keyboard | Identisches Verhalten: Tastatursteuerung aus ohne Reaktion auf Tab, eingeschaltet erwartete Reaktion mit zusätzlicher Markierung |

Für den Minimalversuch wurde kein bestimmter Browser separat benannt. Die Datumsergänzung mit eingeschalteter Tastatursteuerung wurde nicht gesondert bestätigt. Auf der Kontrollseite existiert absichtlich keine Datumsergänzung.

## Unabhängiger Kontrollversuch

Codex stellte vorübergehend über die lokale Netzwerkadresse des Macs eine einzelne HTML-Seite bereit. Diese enthielt zwei beschriftete native Felder in DOM-Reihenfolge, zuerst `type="text"`, danach `type="number"`. Keine Bibliotheken, kein JavaScript, kein `tabindex`, kein `autofocus`, keine eigene Fokusdarstellung und keine SharePoint-Einbettung. Erwartet wurde allein der Cursorwechsel vom ersten ins zweite Feld nach `5` und Tab. Die `5` musste unverändert bleiben.

Die ausgelieferte Seite wurde am Mac bytegleich geprüft. Andere Pfade lieferten HTTP 404, POST HTTP 405. Es gab weder Eingabe- noch Zugriffsprotokollierung. Nach Davids Ergebnisrückmeldung wurde der temporäre Server beendet. Produktcode, Pakete, installierte Apps, Mirrors und M365-Einstellungen blieben unverändert. Keine Veröffentlichung auf GitHub oder steimer.ch.

Die lokale Kontrollseite bleibt unter `.work/ap21-tab-minimal/index.html` als nicht versionierte Diagnoseunterlage erhalten. SHA-256: `73d5ec4f78eb9a8ab331723dff080cbfcc3bc017eaeec485f84b440e1cd2f0bb`.

## Einordnung und Entscheid

Das Verhalten tritt auch ohne unseren Anwendungscode und ohne SharePoint auf. Es ist deshalb kein ausschliesslich durch die AP21-Datumskomponente oder die SharePoint-Einbettung erklärbarer Befund. Welcher Teil der iPadOS-, Browser- oder Tastatursteuerung die physische Tab-Navigation beeinflusst, ist damit nicht bestimmt. Ein konkreter Apple-Fehler wird nicht behauptet.

Die zusätzliche Markierung ist mit einer Fokushervorhebung der systemweiten Bedienungshilfe vereinbar. Apple beschreibt diese Hervorhebung in der [Anleitung zur iPad-Tastatursteuerung](https://support.apple.com/de-ch/guide/ipad/ipad5f765d6f/ipados). Ob David eine solche Hervorhebung einer Bediengruppe oder eine Textauswahl sieht, bleibt ohne visuelle Prüfung offen.

David hielt vor dem Minimalversuch ausdrücklich fest: «Dieser Befund ist geringfügig und kein Grund etwas zu ändern.» Daraus folgt für diesen Befund:

- Keine Änderung am Produktcode und kein neuer Paketkandidat.
- Die systemweite Tastatursteuerung wird nicht zur Nutzungsvoraussetzung erklärt. Ihr ursprünglicher Zustand kann wiederhergestellt werden, die tatsächliche Rückstellung wurde nicht nachgeprüft.
- Die Einschränkung der physischen Tab-Navigation bleibt dokumentiert und vorerst ohne weitere Untersuchung. Sie ist gemäss Davids Einordnung kein Änderungsgrund, aber auch kein bestandener Tab-Test in dieser Konfiguration.
- Die übrigen [Geräteprüfungen und AP21-Abnahmegrenzen](../../outputs/ap21-2026-10-08/geraetepruefung.md), insbesondere die gesonderte E05-Freigabe und der direkte Teams-Hostnachweis, bleiben von diesem begrenzten Entscheid unberührt.

Die bestehenden hashgebundenen Installations- und Prüfnachweise werden durch diesen Nachtrag nicht überschrieben oder rückwirkend geändert.
