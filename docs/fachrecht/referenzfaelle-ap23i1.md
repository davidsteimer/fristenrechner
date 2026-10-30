# AP23I1 Forschungsreferenzfälle für Glarus und Thurgau

Stand 22. Oktober 2026. Fachlicher Abnahmevorschlag, keine Produktprüfung oder operative Freigabe.

34 Forschungsgruppen, 249 vorgegebene Fälle. 110 Datumssollwerte, 16 begrenzte Endverschiebungskollisionen, 117 Qualifikationsgrenzen und 6 Fenstergrenzen. 0 Abweichungen.

## Gruppen und Forschungsannahmen

| Gruppe | Stufe | Tage | Stillstand |
| --- | --- | ---: | --- |
| GL-ADMIN-30 | competentCantonalDepartmentOrGovernment | 30 | three |
| GL-ADMIN-30-EXCEPTION | competentCantonalDepartmentOrGovernment | 30 | none |
| GL-ADMIN-INTERIM-10 | competentCantonalDepartmentOrGovernment | 10 | three |
| GL-ADMIN-INTERIM-10-EXCEPTION | competentCantonalDepartmentOrGovernment | 10 | none |
| GL-ADMIN-SHORTENED-END | competentCantonalDepartmentOrGovernment | konkret angeordnet | three |
| GL-ADMIN-SHORTENED-END-EXCEPTION | competentCantonalDepartmentOrGovernment | konkret angeordnet | none |
| GL-ADMIN-SHORTENED-INTERIM | competentCantonalDepartmentOrGovernment | konkret angeordnet | three |
| GL-ADMIN-SHORTENED-INTERIM-EXCEPTION | competentCantonalDepartmentOrGovernment | konkret angeordnet | none |
| GL-COURT-30 | cantonalAdministrativeCourt | 30 | three |
| GL-COURT-30-EXCEPTION | cantonalAdministrativeCourt | 30 | none |
| GL-COURT-INTERIM-10 | cantonalAdministrativeCourt | 10 | three |
| GL-COURT-INTERIM-10-EXCEPTION | cantonalAdministrativeCourt | 10 | none |
| GL-COURT-SHORTENED-END | cantonalAdministrativeCourt | konkret angeordnet | three |
| GL-COURT-SHORTENED-END-EXCEPTION | cantonalAdministrativeCourt | konkret angeordnet | none |
| GL-COURT-SHORTENED-INTERIM | cantonalAdministrativeCourt | konkret angeordnet | three |
| GL-COURT-SHORTENED-INTERIM-EXCEPTION | cantonalAdministrativeCourt | konkret angeordnet | none |
| GL-ADMIN-INITIAL-ORDERED | competentCantonalAdministrativeAuthority | konkret angeordnet | none |
| GL-ADMIN-APPEAL-ORDERED | competentCantonalDepartmentOrGovernment | konkret angeordnet | none |
| GL-COURT-ORDERED | cantonalAdministrativeCourt | konkret angeordnet | none |
| TG-ADMIN-ORDERED | administrativeFirstInstance | konkret angeordnet | none |
| TG-REKURS-30 | administrativeAppeal | 30 | none |
| TG-REKURS-SHORTENED | administrativeAppeal | konkret angeordnet | none |
| TG-REKURS-ORDERED | administrativeAppeal | konkret angeordnet | none |
| TG-RR-30 | regierungsratComplaint | 30 | none |
| TG-RR-SHORTENED | regierungsratComplaint | konkret angeordnet | none |
| TG-RR-ORDERED | regierungsratComplaint | konkret angeordnet | none |
| TG-VG-30 | administrativeCourtComplaint | 30 | three |
| TG-VG-SHORTENED | administrativeCourtComplaint | konkret angeordnet | three |
| TG-VG-ORDERED | administrativeCourtComplaint | konkret angeordnet | three |
| TG-VG-PROVISIONAL-30 | administrativeCourtComplaint | 30 | tgNotice |
| TG-VG-PROVISIONAL-SHORTENED | administrativeCourtComplaint | konkret angeordnet | tgNotice |
| TG-VG-PROVISIONAL-ORDERED | administrativeCourtComplaint | konkret angeordnet | tgNotice |
| TG-VG-EXECUTION-5 | administrativeCourtComplaint | 5 | tgNotice |
| TG-VG-EXECUTION-ORDERED | administrativeCourtComplaint | konkret angeordnet | tgNotice |

Alle positiven Fälle setzen ausdrücklich synthetische aktuelle Falltatsachen voraus. Sie sind keine Benutzerdefaults. Der Modus `tgNotice` unterscheidet bei den dafür bestimmten gerichtlichen Ausnahmegruppen den vorhandenen vom vollständig fehlenden Hinweis. Ungeklärte Hinweise erhalten keinen definitiven Datumssollwert.

## Vorgegebene Fälle

| Fall | Gruppe | Auslöser | Tage | Erwartung | Zweck |
| --- | --- | --- | ---: | --- | --- |
| GL-ADMIN-30-BASIC | GL-ADMIN-30 | 02.10.2026 | 30 | 02.11.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-30-WINTER | GL-ADMIN-30 | 14.12.2026 | 30 | 29.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-30-EASTER | GL-ADMIN-30 | 19.03.2027 | 30 | 03.05.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-30-COLLISION | GL-ADMIN-30 | 18.02.2027 | 30 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| GL-ADMIN-30-OLD-LAW | GL-ADMIN-30 | 02.10.2026 | 30 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-30-WRONG-DURATION | GL-ADMIN-30 | 02.10.2026 | 31 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| GL-ADMIN-30-EXCEPTION-BASIC | GL-ADMIN-30-EXCEPTION | 02.10.2026 | 30 | 02.11.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-30-EXCEPTION-WINTER | GL-ADMIN-30-EXCEPTION | 14.12.2026 | 30 | 13.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-30-EXCEPTION-EASTER | GL-ADMIN-30-EXCEPTION | 19.03.2027 | 30 | 19.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-30-EXCEPTION-OLD-LAW | GL-ADMIN-30-EXCEPTION | 02.10.2026 | 30 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-30-EXCEPTION-WRONG-DURATION | GL-ADMIN-30-EXCEPTION | 02.10.2026 | 31 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| GL-ADMIN-INTERIM-10-BASIC | GL-ADMIN-INTERIM-10 | 02.10.2026 | 10 | 12.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-INTERIM-10-WINTER | GL-ADMIN-INTERIM-10 | 14.12.2026 | 10 | 11.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-INTERIM-10-EASTER | GL-ADMIN-INTERIM-10 | 19.03.2027 | 10 | 13.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-INTERIM-10-COLLISION | GL-ADMIN-INTERIM-10 | 10.03.2027 | 10 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| GL-ADMIN-INTERIM-10-OLD-LAW | GL-ADMIN-INTERIM-10 | 02.10.2026 | 10 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-INTERIM-10-WRONG-DURATION | GL-ADMIN-INTERIM-10 | 02.10.2026 | 11 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| GL-ADMIN-INTERIM-10-EXCEPTION-BASIC | GL-ADMIN-INTERIM-10-EXCEPTION | 02.10.2026 | 10 | 12.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-INTERIM-10-EXCEPTION-WINTER | GL-ADMIN-INTERIM-10-EXCEPTION | 14.12.2026 | 10 | 24.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-INTERIM-10-EXCEPTION-EASTER | GL-ADMIN-INTERIM-10-EXCEPTION | 19.03.2027 | 10 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-INTERIM-10-EXCEPTION-OLD-LAW | GL-ADMIN-INTERIM-10-EXCEPTION | 02.10.2026 | 10 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-INTERIM-10-EXCEPTION-WRONG-DURATION | GL-ADMIN-INTERIM-10-EXCEPTION | 02.10.2026 | 11 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| GL-ADMIN-SHORTENED-END-BASIC | GL-ADMIN-SHORTENED-END | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-SHORTENED-END-WINTER | GL-ADMIN-SHORTENED-END | 14.12.2026 | 7 | 06.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-SHORTENED-END-EASTER | GL-ADMIN-SHORTENED-END | 19.03.2027 | 7 | 12.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-SHORTENED-END-COLLISION | GL-ADMIN-SHORTENED-END | 13.03.2027 | 7 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| GL-ADMIN-SHORTENED-END-OLD-LAW | GL-ADMIN-SHORTENED-END | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-SHORTENED-END-NO-SHORTENING | GL-ADMIN-SHORTENED-END | 02.10.2026 | 7 | Gültige konkrete Verkürzung der Rechtsmittelfrist nach Art. 89 Abs. 2 mit bestimmter Tagesdauer liegt vor. Keine freie Fristwahl. | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| GL-ADMIN-SHORTENED-END-BELOW-MIN | GL-ADMIN-SHORTENED-END | 02.10.2026 | 1 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| GL-ADMIN-SHORTENED-END-ABOVE-MAX | GL-ADMIN-SHORTENED-END | 02.10.2026 | 30 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| GL-ADMIN-SHORTENED-END-EXCEPTION-BASIC | GL-ADMIN-SHORTENED-END-EXCEPTION | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-SHORTENED-END-EXCEPTION-WINTER | GL-ADMIN-SHORTENED-END-EXCEPTION | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-SHORTENED-END-EXCEPTION-EASTER | GL-ADMIN-SHORTENED-END-EXCEPTION | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-SHORTENED-END-EXCEPTION-OLD-LAW | GL-ADMIN-SHORTENED-END-EXCEPTION | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-SHORTENED-END-EXCEPTION-NO-SHORTENING | GL-ADMIN-SHORTENED-END-EXCEPTION | 02.10.2026 | 7 | Gültige konkrete Verkürzung der Rechtsmittelfrist nach Art. 89 Abs. 2 mit bestimmter Tagesdauer liegt vor. Keine freie Fristwahl. | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| GL-ADMIN-SHORTENED-END-EXCEPTION-BELOW-MIN | GL-ADMIN-SHORTENED-END-EXCEPTION | 02.10.2026 | 1 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| GL-ADMIN-SHORTENED-END-EXCEPTION-ABOVE-MAX | GL-ADMIN-SHORTENED-END-EXCEPTION | 02.10.2026 | 30 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| GL-ADMIN-SHORTENED-INTERIM-BASIC | GL-ADMIN-SHORTENED-INTERIM | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-SHORTENED-INTERIM-WINTER | GL-ADMIN-SHORTENED-INTERIM | 14.12.2026 | 7 | 06.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-SHORTENED-INTERIM-EASTER | GL-ADMIN-SHORTENED-INTERIM | 19.03.2027 | 7 | 12.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-SHORTENED-INTERIM-COLLISION | GL-ADMIN-SHORTENED-INTERIM | 13.03.2027 | 7 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| GL-ADMIN-SHORTENED-INTERIM-OLD-LAW | GL-ADMIN-SHORTENED-INTERIM | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-SHORTENED-INTERIM-NO-SHORTENING | GL-ADMIN-SHORTENED-INTERIM | 02.10.2026 | 7 | Gültige konkrete Verkürzung der Rechtsmittelfrist nach Art. 89 Abs. 2 mit bestimmter Tagesdauer liegt vor. Keine freie Fristwahl. | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| GL-ADMIN-SHORTENED-INTERIM-BELOW-MIN | GL-ADMIN-SHORTENED-INTERIM | 02.10.2026 | 1 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| GL-ADMIN-SHORTENED-INTERIM-ABOVE-MAX | GL-ADMIN-SHORTENED-INTERIM | 02.10.2026 | 10 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| GL-ADMIN-SHORTENED-INTERIM-EXCEPTION-BASIC | GL-ADMIN-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-SHORTENED-INTERIM-EXCEPTION-WINTER | GL-ADMIN-SHORTENED-INTERIM-EXCEPTION | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-SHORTENED-INTERIM-EXCEPTION-EASTER | GL-ADMIN-SHORTENED-INTERIM-EXCEPTION | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-SHORTENED-INTERIM-EXCEPTION-OLD-LAW | GL-ADMIN-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-SHORTENED-INTERIM-EXCEPTION-NO-SHORTENING | GL-ADMIN-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 7 | Gültige konkrete Verkürzung der Rechtsmittelfrist nach Art. 89 Abs. 2 mit bestimmter Tagesdauer liegt vor. Keine freie Fristwahl. | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| GL-ADMIN-SHORTENED-INTERIM-EXCEPTION-BELOW-MIN | GL-ADMIN-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 1 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| GL-ADMIN-SHORTENED-INTERIM-EXCEPTION-ABOVE-MAX | GL-ADMIN-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 10 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| GL-COURT-30-BASIC | GL-COURT-30 | 02.10.2026 | 30 | 02.11.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-COURT-30-WINTER | GL-COURT-30 | 14.12.2026 | 30 | 29.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-COURT-30-EASTER | GL-COURT-30 | 19.03.2027 | 30 | 03.05.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-COURT-30-COLLISION | GL-COURT-30 | 18.02.2027 | 30 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| GL-COURT-30-OLD-LAW | GL-COURT-30 | 02.10.2026 | 30 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-COURT-30-WRONG-DURATION | GL-COURT-30 | 02.10.2026 | 31 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| GL-COURT-30-EXCEPTION-BASIC | GL-COURT-30-EXCEPTION | 02.10.2026 | 30 | 02.11.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-COURT-30-EXCEPTION-WINTER | GL-COURT-30-EXCEPTION | 14.12.2026 | 30 | 13.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-COURT-30-EXCEPTION-EASTER | GL-COURT-30-EXCEPTION | 19.03.2027 | 30 | 19.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-COURT-30-EXCEPTION-OLD-LAW | GL-COURT-30-EXCEPTION | 02.10.2026 | 30 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-COURT-30-EXCEPTION-WRONG-DURATION | GL-COURT-30-EXCEPTION | 02.10.2026 | 31 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| GL-COURT-INTERIM-10-BASIC | GL-COURT-INTERIM-10 | 02.10.2026 | 10 | 12.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-COURT-INTERIM-10-WINTER | GL-COURT-INTERIM-10 | 14.12.2026 | 10 | 11.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-COURT-INTERIM-10-EASTER | GL-COURT-INTERIM-10 | 19.03.2027 | 10 | 13.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-COURT-INTERIM-10-COLLISION | GL-COURT-INTERIM-10 | 10.03.2027 | 10 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| GL-COURT-INTERIM-10-OLD-LAW | GL-COURT-INTERIM-10 | 02.10.2026 | 10 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-COURT-INTERIM-10-WRONG-DURATION | GL-COURT-INTERIM-10 | 02.10.2026 | 11 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| GL-COURT-INTERIM-10-EXCEPTION-BASIC | GL-COURT-INTERIM-10-EXCEPTION | 02.10.2026 | 10 | 12.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-COURT-INTERIM-10-EXCEPTION-WINTER | GL-COURT-INTERIM-10-EXCEPTION | 14.12.2026 | 10 | 24.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-COURT-INTERIM-10-EXCEPTION-EASTER | GL-COURT-INTERIM-10-EXCEPTION | 19.03.2027 | 10 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-COURT-INTERIM-10-EXCEPTION-OLD-LAW | GL-COURT-INTERIM-10-EXCEPTION | 02.10.2026 | 10 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-COURT-INTERIM-10-EXCEPTION-WRONG-DURATION | GL-COURT-INTERIM-10-EXCEPTION | 02.10.2026 | 11 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| GL-COURT-SHORTENED-END-BASIC | GL-COURT-SHORTENED-END | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-COURT-SHORTENED-END-WINTER | GL-COURT-SHORTENED-END | 14.12.2026 | 7 | 06.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-COURT-SHORTENED-END-EASTER | GL-COURT-SHORTENED-END | 19.03.2027 | 7 | 12.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-COURT-SHORTENED-END-COLLISION | GL-COURT-SHORTENED-END | 13.03.2027 | 7 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| GL-COURT-SHORTENED-END-OLD-LAW | GL-COURT-SHORTENED-END | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-COURT-SHORTENED-END-NO-SHORTENING | GL-COURT-SHORTENED-END | 02.10.2026 | 7 | Gültige konkrete Verkürzung der Rechtsmittelfrist nach Art. 89 Abs. 2 mit bestimmter Tagesdauer liegt vor. Keine freie Fristwahl. | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| GL-COURT-SHORTENED-END-BELOW-MIN | GL-COURT-SHORTENED-END | 02.10.2026 | 1 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| GL-COURT-SHORTENED-END-ABOVE-MAX | GL-COURT-SHORTENED-END | 02.10.2026 | 30 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| GL-COURT-SHORTENED-END-EXCEPTION-BASIC | GL-COURT-SHORTENED-END-EXCEPTION | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-COURT-SHORTENED-END-EXCEPTION-WINTER | GL-COURT-SHORTENED-END-EXCEPTION | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-COURT-SHORTENED-END-EXCEPTION-EASTER | GL-COURT-SHORTENED-END-EXCEPTION | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-COURT-SHORTENED-END-EXCEPTION-OLD-LAW | GL-COURT-SHORTENED-END-EXCEPTION | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-COURT-SHORTENED-END-EXCEPTION-NO-SHORTENING | GL-COURT-SHORTENED-END-EXCEPTION | 02.10.2026 | 7 | Gültige konkrete Verkürzung der Rechtsmittelfrist nach Art. 89 Abs. 2 mit bestimmter Tagesdauer liegt vor. Keine freie Fristwahl. | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| GL-COURT-SHORTENED-END-EXCEPTION-BELOW-MIN | GL-COURT-SHORTENED-END-EXCEPTION | 02.10.2026 | 1 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| GL-COURT-SHORTENED-END-EXCEPTION-ABOVE-MAX | GL-COURT-SHORTENED-END-EXCEPTION | 02.10.2026 | 30 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| GL-COURT-SHORTENED-INTERIM-BASIC | GL-COURT-SHORTENED-INTERIM | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-COURT-SHORTENED-INTERIM-WINTER | GL-COURT-SHORTENED-INTERIM | 14.12.2026 | 7 | 06.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-COURT-SHORTENED-INTERIM-EASTER | GL-COURT-SHORTENED-INTERIM | 19.03.2027 | 7 | 12.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-COURT-SHORTENED-INTERIM-COLLISION | GL-COURT-SHORTENED-INTERIM | 13.03.2027 | 7 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| GL-COURT-SHORTENED-INTERIM-OLD-LAW | GL-COURT-SHORTENED-INTERIM | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-COURT-SHORTENED-INTERIM-NO-SHORTENING | GL-COURT-SHORTENED-INTERIM | 02.10.2026 | 7 | Gültige konkrete Verkürzung der Rechtsmittelfrist nach Art. 89 Abs. 2 mit bestimmter Tagesdauer liegt vor. Keine freie Fristwahl. | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| GL-COURT-SHORTENED-INTERIM-BELOW-MIN | GL-COURT-SHORTENED-INTERIM | 02.10.2026 | 1 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| GL-COURT-SHORTENED-INTERIM-ABOVE-MAX | GL-COURT-SHORTENED-INTERIM | 02.10.2026 | 10 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| GL-COURT-SHORTENED-INTERIM-EXCEPTION-BASIC | GL-COURT-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-COURT-SHORTENED-INTERIM-EXCEPTION-WINTER | GL-COURT-SHORTENED-INTERIM-EXCEPTION | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-COURT-SHORTENED-INTERIM-EXCEPTION-EASTER | GL-COURT-SHORTENED-INTERIM-EXCEPTION | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-COURT-SHORTENED-INTERIM-EXCEPTION-OLD-LAW | GL-COURT-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-COURT-SHORTENED-INTERIM-EXCEPTION-NO-SHORTENING | GL-COURT-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 7 | Gültige konkrete Verkürzung der Rechtsmittelfrist nach Art. 89 Abs. 2 mit bestimmter Tagesdauer liegt vor. Keine freie Fristwahl. | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| GL-COURT-SHORTENED-INTERIM-EXCEPTION-BELOW-MIN | GL-COURT-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 1 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| GL-COURT-SHORTENED-INTERIM-EXCEPTION-ABOVE-MAX | GL-COURT-SHORTENED-INTERIM-EXCEPTION | 02.10.2026 | 10 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| GL-ADMIN-INITIAL-ORDERED-BASIC | GL-ADMIN-INITIAL-ORDERED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-INITIAL-ORDERED-WINTER | GL-ADMIN-INITIAL-ORDERED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-INITIAL-ORDERED-EASTER | GL-ADMIN-INITIAL-ORDERED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-INITIAL-ORDERED-OLD-LAW | GL-ADMIN-INITIAL-ORDERED | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-APPEAL-ORDERED-BASIC | GL-ADMIN-APPEAL-ORDERED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-ADMIN-APPEAL-ORDERED-WINTER | GL-ADMIN-APPEAL-ORDERED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-ADMIN-APPEAL-ORDERED-EASTER | GL-ADMIN-APPEAL-ORDERED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-ADMIN-APPEAL-ORDERED-OLD-LAW | GL-ADMIN-APPEAL-ORDERED | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-COURT-ORDERED-BASIC | GL-COURT-ORDERED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| GL-COURT-ORDERED-WINTER | GL-COURT-ORDERED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| GL-COURT-ORDERED-EASTER | GL-COURT-ORDERED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| GL-COURT-ORDERED-OLD-LAW | GL-COURT-ORDERED | 02.10.2026 | 7 | Art. 140a VRG greift für die aktuell betroffene Instanz nicht. Kein unter früherem Recht weiterzuführendes Altverfahren. | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-ADMIN-ORDERED-BASIC | TG-ADMIN-ORDERED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-ADMIN-ORDERED-WINTER | TG-ADMIN-ORDERED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-ADMIN-ORDERED-EASTER | TG-ADMIN-ORDERED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-ADMIN-ORDERED-OLD-LAW | TG-ADMIN-ORDERED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-REKURS-30-BASIC | TG-REKURS-30 | 02.10.2026 | 30 | 02.11.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-REKURS-30-WINTER | TG-REKURS-30 | 14.12.2026 | 30 | 13.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-REKURS-30-EASTER | TG-REKURS-30 | 19.03.2027 | 30 | 19.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-REKURS-30-OLD-LAW | TG-REKURS-30 | 02.10.2026 | 30 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-REKURS-30-WRONG-DURATION | TG-REKURS-30 | 02.10.2026 | 31 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| TG-REKURS-SHORTENED-BASIC | TG-REKURS-SHORTENED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-REKURS-SHORTENED-WINTER | TG-REKURS-SHORTENED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-REKURS-SHORTENED-EASTER | TG-REKURS-SHORTENED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-REKURS-SHORTENED-OLD-LAW | TG-REKURS-SHORTENED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-REKURS-SHORTENED-NO-SHORTENING | TG-REKURS-SHORTENED | 02.10.2026 | 7 | tg.specificShorteningQualifiedNotQualified | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| TG-REKURS-SHORTENED-BELOW-MIN | TG-REKURS-SHORTENED | 02.10.2026 | 4 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| TG-REKURS-SHORTENED-ABOVE-MAX | TG-REKURS-SHORTENED | 02.10.2026 | 30 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| TG-REKURS-ORDERED-BASIC | TG-REKURS-ORDERED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-REKURS-ORDERED-WINTER | TG-REKURS-ORDERED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-REKURS-ORDERED-EASTER | TG-REKURS-ORDERED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-REKURS-ORDERED-OLD-LAW | TG-REKURS-ORDERED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-RR-30-BASIC | TG-RR-30 | 02.10.2026 | 30 | 02.11.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-RR-30-WINTER | TG-RR-30 | 14.12.2026 | 30 | 13.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-RR-30-EASTER | TG-RR-30 | 19.03.2027 | 30 | 19.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-RR-30-OLD-LAW | TG-RR-30 | 02.10.2026 | 30 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-RR-30-WRONG-DURATION | TG-RR-30 | 02.10.2026 | 31 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| TG-RR-SHORTENED-BASIC | TG-RR-SHORTENED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-RR-SHORTENED-WINTER | TG-RR-SHORTENED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-RR-SHORTENED-EASTER | TG-RR-SHORTENED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-RR-SHORTENED-OLD-LAW | TG-RR-SHORTENED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-RR-SHORTENED-NO-SHORTENING | TG-RR-SHORTENED | 02.10.2026 | 7 | tg.specificShorteningQualifiedNotQualified | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| TG-RR-SHORTENED-BELOW-MIN | TG-RR-SHORTENED | 02.10.2026 | 4 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| TG-RR-SHORTENED-ABOVE-MAX | TG-RR-SHORTENED | 02.10.2026 | 30 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| TG-RR-ORDERED-BASIC | TG-RR-ORDERED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-RR-ORDERED-WINTER | TG-RR-ORDERED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-RR-ORDERED-EASTER | TG-RR-ORDERED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-RR-ORDERED-OLD-LAW | TG-RR-ORDERED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-VG-30-BASIC | TG-VG-30 | 02.10.2026 | 30 | 02.11.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-VG-30-WINTER | TG-VG-30 | 14.12.2026 | 30 | 29.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-VG-30-EASTER | TG-VG-30 | 19.03.2027 | 30 | 03.05.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-VG-30-COLLISION | TG-VG-30 | 18.02.2027 | 30 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| TG-VG-30-OLD-LAW | TG-VG-30 | 02.10.2026 | 30 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-VG-30-WRONG-DURATION | TG-VG-30 | 02.10.2026 | 31 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| TG-VG-SHORTENED-BASIC | TG-VG-SHORTENED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-VG-SHORTENED-WINTER | TG-VG-SHORTENED | 14.12.2026 | 7 | 06.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-VG-SHORTENED-EASTER | TG-VG-SHORTENED | 19.03.2027 | 7 | 12.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-VG-SHORTENED-COLLISION | TG-VG-SHORTENED | 13.03.2027 | 7 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| TG-VG-SHORTENED-OLD-LAW | TG-VG-SHORTENED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-VG-SHORTENED-NO-SHORTENING | TG-VG-SHORTENED | 02.10.2026 | 7 | tg.specificShorteningQualifiedNotQualified | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| TG-VG-SHORTENED-BELOW-MIN | TG-VG-SHORTENED | 02.10.2026 | 4 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| TG-VG-SHORTENED-ABOVE-MAX | TG-VG-SHORTENED | 02.10.2026 | 30 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| TG-VG-ORDERED-BASIC | TG-VG-ORDERED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-VG-ORDERED-WINTER | TG-VG-ORDERED | 14.12.2026 | 7 | 06.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-VG-ORDERED-EASTER | TG-VG-ORDERED | 19.03.2027 | 7 | 12.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-VG-ORDERED-COLLISION | TG-VG-ORDERED | 13.03.2027 | 7 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| TG-VG-ORDERED-OLD-LAW | TG-VG-ORDERED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-VG-PROVISIONAL-30-BASIC | TG-VG-PROVISIONAL-30 | 02.10.2026 | 30 | 02.11.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-VG-PROVISIONAL-30-WINTER | TG-VG-PROVISIONAL-30 | 14.12.2026 | 30 | 13.01.2027 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-VG-PROVISIONAL-30-EASTER | TG-VG-PROVISIONAL-30 | 19.03.2027 | 30 | 19.04.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-VG-PROVISIONAL-30-COLLISION | TG-VG-PROVISIONAL-30 | 18.02.2027 | 30 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| TG-VG-PROVISIONAL-30-NOTICE-ABSENT | TG-VG-PROVISIONAL-30 | 14.12.2026 | 30 | 29.01.2027 | Eindeutig vollständig fehlender massgebender Hinweis, nur innerhalb dieser gerichtlichen Ausnahmegruppe. |
| TG-VG-PROVISIONAL-30-NOTICE-INCOMPLETE | TG-VG-PROVISIONAL-30 | 14.12.2026 | 30 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-PROVISIONAL-30-NOTICE-DISPUTED | TG-VG-PROVISIONAL-30 | 14.12.2026 | 30 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-PROVISIONAL-30-OLD-LAW | TG-VG-PROVISIONAL-30 | 02.10.2026 | 30 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-VG-PROVISIONAL-30-WRONG-DURATION | TG-VG-PROVISIONAL-30 | 02.10.2026 | 31 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| TG-VG-PROVISIONAL-SHORTENED-BASIC | TG-VG-PROVISIONAL-SHORTENED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-VG-PROVISIONAL-SHORTENED-WINTER | TG-VG-PROVISIONAL-SHORTENED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-VG-PROVISIONAL-SHORTENED-EASTER | TG-VG-PROVISIONAL-SHORTENED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-VG-PROVISIONAL-SHORTENED-COLLISION | TG-VG-PROVISIONAL-SHORTENED | 13.03.2027 | 7 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| TG-VG-PROVISIONAL-SHORTENED-NOTICE-ABSENT | TG-VG-PROVISIONAL-SHORTENED | 14.12.2026 | 7 | 06.01.2027 | Eindeutig vollständig fehlender massgebender Hinweis, nur innerhalb dieser gerichtlichen Ausnahmegruppe. |
| TG-VG-PROVISIONAL-SHORTENED-NOTICE-INCOMPLETE | TG-VG-PROVISIONAL-SHORTENED | 14.12.2026 | 7 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-PROVISIONAL-SHORTENED-NOTICE-DISPUTED | TG-VG-PROVISIONAL-SHORTENED | 14.12.2026 | 7 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-PROVISIONAL-SHORTENED-OLD-LAW | TG-VG-PROVISIONAL-SHORTENED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-VG-PROVISIONAL-SHORTENED-NO-SHORTENING | TG-VG-PROVISIONAL-SHORTENED | 02.10.2026 | 7 | tg.specificShorteningQualifiedNotQualified | Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht. |
| TG-VG-PROVISIONAL-SHORTENED-BELOW-MIN | TG-VG-PROVISIONAL-SHORTENED | 02.10.2026 | 4 | durationOutsideQualifiedRange | Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze. |
| TG-VG-PROVISIONAL-SHORTENED-ABOVE-MAX | TG-VG-PROVISIONAL-SHORTENED | 02.10.2026 | 30 | durationOutsideQualifiedRange | Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation. |
| TG-VG-PROVISIONAL-ORDERED-BASIC | TG-VG-PROVISIONAL-ORDERED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-VG-PROVISIONAL-ORDERED-WINTER | TG-VG-PROVISIONAL-ORDERED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-VG-PROVISIONAL-ORDERED-EASTER | TG-VG-PROVISIONAL-ORDERED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-VG-PROVISIONAL-ORDERED-COLLISION | TG-VG-PROVISIONAL-ORDERED | 13.03.2027 | 7 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| TG-VG-PROVISIONAL-ORDERED-NOTICE-ABSENT | TG-VG-PROVISIONAL-ORDERED | 14.12.2026 | 7 | 06.01.2027 | Eindeutig vollständig fehlender massgebender Hinweis, nur innerhalb dieser gerichtlichen Ausnahmegruppe. |
| TG-VG-PROVISIONAL-ORDERED-NOTICE-INCOMPLETE | TG-VG-PROVISIONAL-ORDERED | 14.12.2026 | 7 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-PROVISIONAL-ORDERED-NOTICE-DISPUTED | TG-VG-PROVISIONAL-ORDERED | 14.12.2026 | 7 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-PROVISIONAL-ORDERED-OLD-LAW | TG-VG-PROVISIONAL-ORDERED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-VG-EXECUTION-5-BASIC | TG-VG-EXECUTION-5 | 02.10.2026 | 5 | 07.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-VG-EXECUTION-5-WINTER | TG-VG-EXECUTION-5 | 14.12.2026 | 5 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-VG-EXECUTION-5-EASTER | TG-VG-EXECUTION-5 | 19.03.2027 | 5 | 24.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-VG-EXECUTION-5-COLLISION | TG-VG-EXECUTION-5 | 15.03.2027 | 5 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| TG-VG-EXECUTION-5-NOTICE-ABSENT | TG-VG-EXECUTION-5 | 14.12.2026 | 5 | 04.01.2027 | Eindeutig vollständig fehlender massgebender Hinweis, nur innerhalb dieser gerichtlichen Ausnahmegruppe. |
| TG-VG-EXECUTION-5-NOTICE-INCOMPLETE | TG-VG-EXECUTION-5 | 14.12.2026 | 5 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-EXECUTION-5-NOTICE-DISPUTED | TG-VG-EXECUTION-5 | 14.12.2026 | 5 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-EXECUTION-5-OLD-LAW | TG-VG-EXECUTION-5 | 02.10.2026 | 5 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| TG-VG-EXECUTION-5-WRONG-DURATION | TG-VG-EXECUTION-5 | 02.10.2026 | 6 | statutoryDurationMismatch | Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert. |
| TG-VG-EXECUTION-ORDERED-BASIC | TG-VG-EXECUTION-ORDERED | 02.10.2026 | 7 | 09.10.2026 | Grundfall mit positiv geklärter aktueller Fallqualifikation. |
| TG-VG-EXECUTION-ORDERED-WINTER | TG-VG-EXECUTION-ORDERED | 14.12.2026 | 7 | 21.12.2026 | Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands. |
| TG-VG-EXECUTION-ORDERED-EASTER | TG-VG-EXECUTION-ORDERED | 19.03.2027 | 7 | 30.03.2027 | Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen. |
| TG-VG-EXECUTION-ORDERED-COLLISION | TG-VG-EXECUTION-ORDERED | 13.03.2027 | 7 | Offen: Zähltag 20.03.2027, gewöhnliche Endverschiebung 22.03.2027 | Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein. |
| TG-VG-EXECUTION-ORDERED-NOTICE-ABSENT | TG-VG-EXECUTION-ORDERED | 14.12.2026 | 7 | 06.01.2027 | Eindeutig vollständig fehlender massgebender Hinweis, nur innerhalb dieser gerichtlichen Ausnahmegruppe. |
| TG-VG-EXECUTION-ORDERED-NOTICE-INCOMPLETE | TG-VG-EXECUTION-ORDERED | 14.12.2026 | 7 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-EXECUTION-ORDERED-NOTICE-DISPUTED | TG-VG-EXECUTION-ORDERED | 14.12.2026 | 7 | exceptionNoticeUnresolved | Kein definitives Resultat bei unklarer Hinweisqualifikation. |
| TG-VG-EXECUTION-ORDERED-OLD-LAW | TG-VG-EXECUTION-ORDERED | 02.10.2026 | 7 | I1-TG-currentProceduralLawQualified | Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts. |
| GL-ADMIN-30-WINDOW-BEFORE | GL-ADMIN-30 | 28.08.2026 | 30 | Ausserhalb des vollständigen Fallfensters | Auslöser und gesamte Folgerechnung müssen vom Fenster gedeckt sein. |
| GL-ADMIN-30-WINDOW-AFTER | GL-ADMIN-30 | 01.01.2028 | 30 | Ausserhalb des vollständigen Fallfensters | Auslöser und gesamte Folgerechnung müssen vom Fenster gedeckt sein. |
| GL-ADMIN-30-WINDOW-END-CROSSING | GL-ADMIN-30 | 31.12.2027 | 30 | Ausserhalb des vollständigen Fallfensters | Auslöser und gesamte Folgerechnung müssen vom Fenster gedeckt sein. |
| TG-ADMIN-ORDERED-WINDOW-BEFORE | TG-ADMIN-ORDERED | 28.08.2026 | 7 | Ausserhalb des vollständigen Fallfensters | Auslöser und gesamte Folgerechnung müssen vom Fenster gedeckt sein. |
| TG-ADMIN-ORDERED-WINDOW-AFTER | TG-ADMIN-ORDERED | 01.01.2028 | 7 | Ausserhalb des vollständigen Fallfensters | Auslöser und gesamte Folgerechnung müssen vom Fenster gedeckt sein. |
| TG-ADMIN-ORDERED-WINDOW-END-CROSSING | TG-ADMIN-ORDERED | 31.12.2027 | 7 | Ausserhalb des vollständigen Fallfensters | Auslöser und gesamte Folgerechnung müssen vom Fenster gedeckt sein. |
| GL-COURT-ORDERED-FAHRT | GL-COURT-ORDERED | 31.03.2027 | 1 | 02.04.2027 | Angeordnete GL-Tagesfrist zählt während Osterferien, Endtag fällt auf die Näfelser Fahrt. |
| TG-ADMIN-ORDERED-NO-GL-FAHRT | TG-ADMIN-ORDERED | 31.03.2027 | 1 | 01.04.2027 | Keine Übernahme des Glarner Fahrttags in TG. |
| GL-ADMIN-30-QUAL-AUTHORITYLEVEL | GL-ADMIN-30 | 02.10.2026 | 30 | Nur kantonale Zielstelle im Kanton Glarus. | Kommunale Zielstelle ist nicht der freigegebene kantonale Umfang. |
| GL-ADMIN-30-QUAL-SPECIALLAW | GL-ADMIN-30 | 02.10.2026 | 30 | Kein ungeklärter Steuer-, Beschaffungs-, Sozial-, politischer oder sonstiger Spezialweg. | Keine neue Sozialanbindung über den allgemeinen Verwaltungsweg. |
| GL-ADMIN-30-QUAL-QUALIFIEDOPENING | GL-ADMIN-30 | 02.10.2026 | 30 | Rechtlich massgebende qualifizierte schriftliche Eröffnung, keine ungeklärte Fiktion, Publikation oder mangelhafte Eröffnung. | Ungeklärte Eröffnung trägt keinen positiven Rechtsmittelbeginn. |
| GL-ADMIN-30-QUAL-OPENINGMODE | GL-ADMIN-30 | 02.10.2026 | 30 | Direkte qualifizierte schriftliche Eröffnung oder schriftliche Bestätigung nach unverzüglichem Verlangen gemäss Art. 76 Abs. 2–3. Keine ungeklärte elektronische Plattform-Eröffnung nach Art. 32 Abs. 1a. | Plattformquittung nicht ungeprüft als allgemeine schriftliche Eröffnung behandeln. |
| GL-ADMIN-30-QUAL-DEADLINEMETHOD | GL-ADMIN-30 | 02.10.2026 | 30 | Vorwärts laufende Tagesfrist, kein fixer Termin und keine rückwärts laufende Frist. | Fixer Termin gehört nicht unter die vorwärts laufende Tagesfrist. |
| GL-ADMIN-30-QUAL-PAYMENTORFIXEDAPPOINTMENT | GL-ADMIN-30 | 02.10.2026 | 30 | Eine Eingabe oder Beschwerde, keine Zahlung und kein wahrzunehmender Termin. | Keine Berechnung einer Kostenvorschusszahlung als Beschwerde. |
| GL-ADMIN-30-QUAL-TARGETAUTHORITY | GL-ADMIN-30 | 02.10.2026 | 30 | Beschwerdeziel ist ein zuständiges kantonales Departement oder der Regierungsrat nach Art. 103 VRG. | Keine freie Feiertagskantonswahl anstelle der zuständigen Zielstelle. |
| GL-ADMIN-30-QUAL-DECISIONTYPE | GL-ADMIN-30 | 02.10.2026 | 30 | Ordentliches End-/Nichteintretensobjekt, kein falsch qualifizierter Zwischenentscheid. | Zwischenentscheid darf nicht unter der Dreissigtagegruppe verborgen werden. |
| GL-ADMIN-30-QUAL-ART90EXCEPTION | GL-ADMIN-30 | 02.10.2026 | 30 | Keine Ausnahme nach Art. 90 Abs. 3. Insbesondere ist nicht jede kurze oder dringliche Frist ferienfrei. | Ferienausnahme muss den Normalweg verlassen. |
| GL-ADMIN-30-EXCEPTION-QUAL-ART90EXCEPTION | GL-ADMIN-30-EXCEPTION | 02.10.2026 | 30 | Unmittelbare ernste Gefahr nach Art. 90 Abs. 3, nicht lediglich besondere Dringlichkeit. Die übrigen dort genannten Objekte sind als Zwischenentscheid zu qualifizieren. | Besondere Dringlichkeit allein ist keine unmittelbare ernste Gefahr. |
| GL-COURT-ORDERED-QUAL-DURATIONBASIS | GL-COURT-ORDERED | 02.10.2026 | 7 | Genaue tatsächlich angeordnete Tagesdauer, keine als Eingabefrist verdeckte verkürzte gesetzliche Beschwerdefrist. | Verkürzte gesetzliche Frist ist keine gewöhnliche Eingabeanordnung. |
| TG-REKURS-30-QUAL-NODIFFERENTSPECIALDEADLINERULE | TG-REKURS-30 | 02.10.2026 | 30 | I1-TG-noDifferentSpecialDeadlineRule | Abweichendes Spezialrecht nicht durch den VRG-Normalwert ersetzen. |
| TG-VG-30-QUAL-NOTINSURANCECOURT | TG-VG-30 | 02.10.2026 | 30 | tg.notInsuranceCourtNotQualified | Keine zusätzliche Versicherungsgerichtsfreigabe. |
| TG-VG-30-QUAL-HOLIDAYEXCEPTION | TG-VG-30 | 02.10.2026 | 30 | tg.holidayExceptionNotQualified | Gerichtlicher Ausnahmegegenstand benötigt seinen eigenen Hinweiszweig. |
| TG-VG-30-QUAL-LEGALLYEFFECTIVEWRITTENSERVICE | TG-VG-30 | 02.10.2026 | 30 | I1-TG-legallyEffectiveWrittenService | Blosse mündliche Kenntnisnahme genügt nicht für den Rechtsmittelbeginn. |
| TG-RR-30-QUAL-REGIERUNGSRATCOMPETENCEBASIS | TG-RR-30 | 02.10.2026 | 30 | tg.regierungsratCompetenceBasisNotQualified | Regierungsrat ist keine allgemeine frei wählbare Beschwerdeinstanz. |
| TG-VG-PROVISIONAL-ORDERED-QUAL-NOTICEAPPLIESTOCURRENTORDER | TG-VG-PROVISIONAL-ORDERED | 02.10.2026 | 7 | tg.noticeAppliesToCurrentOrderNotQualified | Frühere Belehrung wird nicht automatisch auf eine spätere Anordnung übertragen. |
| TG-VG-PROVISIONAL-ORDERED-QUAL-NOTICEDOCUMENTQUALIFIED | TG-VG-PROVISIONAL-ORDERED | 02.10.2026 | 7 | tg.noticeDocumentQualifiedNotQualified | Fehlender Hinweis im falschen Dokument ist kein positiver Rückausnahmebeleg. |
| TG-VG-EXECUTION-5-QUAL-ACTUALENFORCEMENTDECISION | TG-VG-EXECUTION-5 | 02.10.2026 | 5 | tg.actualEnforcementDecisionNotQualified | Kein tatsächlicher qualifizierter Vollstreckungsentscheid. |
| TG-VG-EXECUTION-5-QUAL-NOTMEREWARNING | TG-VG-EXECUTION-5 | 02.10.2026 | 5 | tg.notMereWarningNotQualified | Blosse Vollstreckungsandrohung erhält keinen Fünftagesweiterzug. |
| TG-VG-EXECUTION-5-QUAL-NOTORIGINALSUBSTANTIVEDECISION | TG-VG-EXECUTION-5 | 02.10.2026 | 5 | tg.notOriginalSubstantiveDecisionNotQualified | Neuer materieller Sachentscheid ist nicht die reine Vollstreckungsverfügung. |
| TG-VG-EXECUTION-5-QUAL-NOCONFLICTINGPERIODINFORMATION | TG-VG-EXECUTION-5 | 02.10.2026 | 5 | tg.noConflictingPeriodInformationNotQualified | Konkrete Dreissigtagebelehrung wird nicht still durch fünf Tage ersetzt. |
| TG-VG-EXECUTION-5-QUAL-NOTSCHKGMONEYENFORCEMENT | TG-VG-EXECUTION-5 | 02.10.2026 | 5 | tg.notSchkgMoneyEnforcementNotQualified | Kein SchKG-Geldvollstreckungsweg. |
| TG-VG-EXECUTION-5-QUAL-QUALIFIEDENFORCEMENTREVIEWSCOPE | TG-VG-EXECUTION-5 | 02.10.2026 | 5 | tg.enforcementReviewScopeNotQualified | Kein verkleideter erneuter Weiterzug gegen die materielle Sache. |
| TG-RR-30-SECOND-QUALIFIED-COMPETENCE | TG-RR-30 | 02.10.2026 | 30 | 02.11.2026 | Zweite ausdrücklich zugelassene Zuständigkeitsalternative nach § 55 Abs. 1 Ziff. 9. |

## Kalender und unabhängige Nachrechnung

Die Forschungslisten enthalten je zehn benannte Feiertagsdaten. Die beiden bytegebundenen Bestandskalender enthalten zusätzlich drei ohnehin sonntägliche Herkunftsregeln. Verglichen wird die Endtagszulässigkeit einschliesslich Wochenenden an 1’460 Tagen in 2026 und 2027. Die GL-Fahrtregel wird unabhängig einschliesslich Karwochenverschiebung geprüft. Keine Produktkalender werden verändert.

`node scripts/check-ap23i1-references.mjs --write` prüft die vorgegebenen Erwartungen durch Tagesfortschaltung. `python scripts/check_ap23i1_independent.py --write` prüft sie durch getrennte vollständige Datumsenumeration und selbst berechnete Ostertermine. Beide importieren keine Produktmodule und berechnen keine Zustellfiktion oder tatsächliche Einreichung.

Das Fenster 29.08.2026–31.12.2027 umfasst Auslöser, Zählung, Stillstand und Endverschiebung vollständig. Ein nachträgliches rechnerisches Übereinstimmen bestätigt nicht von selbst die Rechtsauslegung. Reine Endverschiebung in einen neu beginnenden Stillstand bleibt deshalb im genau bezeichneten Fall ohne definitives Forschungsresultat.

Fixture SHA-256: `5ac2b60af93ee9ee329b75484356c3442c6a93baf20ac26e4971c208d5d298c8`. [Node-Nachweis](../../outputs/ap23i1-2026-10-22/reference-verification.json), [Python-Nachweis](../../outputs/ap23i1-2026-10-22/reference-independent-verification.json).

Grundlagen: [Fachvorlage](verwaltungsverfahren-ap23i1.md) und [Quellenprüfung](quellenpruefung-ap23i1.md). Aufnahme und Grenzen liegen zur menschlichen Fachabnahme vor.
