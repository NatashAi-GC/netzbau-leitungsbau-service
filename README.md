# Leitungsbau-Service

CAP-Service (Node.js) für die Fortschrittserfassung im Leitungsbau. Bauleiter melden pro Leitungsabschnitt die verlegten Meter;
der Service leitet daraus den Status des Abschnitts (`GEPLANT`, `IN_BAU`, `FERTIG`) und den Status des Bauprojekts
(`OFFEN`, `IN_AUSFUEHRUNG`, `ABGESCHLOSSEN`) ab.

Konsumenten sind die mobile Tagesmeldungs-App der Bauleiter (sendet `PATCH`-Requests) und das Controlling-Reporting.

## Datenmodell

- `Bauprojekte` – Projekt mit Sparte (Strom, Gas, Wasser, Glasfaser), Gemeinde, Bauleiter, abgeleitetem Status
- `Leitungsabschnitte` – Abschnitt einer Trasse mit Länge, verlegter Länge, Verlegeart, Status und Bemerkung

## Starten

```bash
npm install
npm run watch        # mit @sap/cds-dk, alternativ: npm start
```

OData-V4-Endpunkt: `http://localhost:4004/odata/v4/leitungsbau`

Beispiel-Requests: `test/requests.http`

## Tests

```bash
npm test
```
