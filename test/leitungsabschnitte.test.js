const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const cds = require('@sap/cds')

const { GET, POST, PUT, PATCH } = cds.test(__dirname + '/..')

const PROJEKT_GAS = 'a1f3c2e0-0001-4c1a-9a00-000000000003'
const ABSCHNITT_GA01 = 'b2e4d3f1-0002-4d2b-8b00-000000000301'
const BASE = '/odata/v4/leitungsbau'

describe('LeitungsbauService – Leitungsabschnitte', () => {
  it('liefert die Abschnitte eines Projekts', async () => {
    const { data } = await GET(`${BASE}/Bauprojekte(${PROJEKT_GAS})/abschnitte`)
    assert.equal(data.value.length, 2)
  })

  it('leitet beim Anlegen den Status aus der verlegten Länge ab', async () => {
    const { data } = await POST(`${BASE}/Leitungsabschnitte`, {
      projekt_ID: PROJEKT_GAS,
      abschnittNr: 'GA-03',
      vonStation: 'Bahnhofstr. 88',
      bisStation: 'Bahnhofstr. 120',
      verlegeart: 'OFFENE_BAUWEISE',
      laengeMeter: 200,
      verlegtMeter: 50
    })
    assert.equal(data.status, 'IN_BAU')
  })

  it('lehnt beim Anlegen eine verlegte Länge über der Abschnittslänge ab', async () => {
    await assert.rejects(
      POST(`${BASE}/Leitungsabschnitte`, {
        projekt_ID: PROJEKT_GAS,
        abschnittNr: 'GA-04',
        laengeMeter: 100,
        verlegtMeter: 150
      }),
      err => err.response?.status === 400
    )
  })

  it('setzt einen vollständig verlegten Abschnitt bei Aktualisierung auf FERTIG', async () => {
    const { data } = await PUT(`${BASE}/Leitungsabschnitte(${ABSCHNITT_GA01})`, {
      projekt_ID: PROJEKT_GAS,
      abschnittNr: 'GA-01',
      vonStation: 'Regelanlage Bahnhofstr.',
      bisStation: 'Kreuzung Hunnenstr.',
      verlegeart: 'OFFENE_BAUWEISE',
      laengeMeter: 520,
      verlegtMeter: 520
    })
    assert.equal(data.status, 'FERTIG')
  })

  it('ändert den Status des Abschnitts nicht, wenn nur eine Bemerkung hinzugefügt wird (PATCH)', async () => {
    const abschnittId = 'b2e4d3f1-0002-4d2b-8b00-000000000103' // G-03 is IN_BAU initially
    const { data } = await PATCH(`${BASE}/Leitungsabschnitte(${abschnittId})`, {
      bemerkung: 'Neue Bemerkung vom Bauleiter'
    })
    assert.equal(data.status, 'IN_BAU')
    assert.equal(data.bemerkung, 'Neue Bemerkung vom Bauleiter')
  })

  it('schließt das Projekt ab, wenn der letzte offene Abschnitt vollständig verlegt wird (PATCH)', async () => {
    const abschnittId = 'b2e4d3f1-0002-4d2b-8b00-000000000103'
    const projektId = 'a1f3c2e0-0001-4c1a-9a00-000000000001'

    // Update the last section to be fully laid out
    const { data } = await PATCH(`${BASE}/Leitungsabschnitte(${abschnittId})`, {
      verlegtMeter: 480
    })
    assert.equal(data.status, 'FERTIG')

    // Fetch the project status to check if it is closed
    const { data: projData } = await GET(`${BASE}/Bauprojekte(${projektId})`)
    assert.equal(projData.status, 'ABGESCHLOSSEN')
  })

  it('lehnt eine verlegte Länge ab, die größer als die ursprüngliche Abschnittslänge ist (PATCH)', async () => {
    const abschnittId = 'b2e4d3f1-0002-4d2b-8b00-000000000103'
    await assert.rejects(
      PATCH(`${BASE}/Leitungsabschnitte(${abschnittId})`, {
        verlegtMeter: 999
      }),
      err => err.response?.status === 400
    )
  })
})
