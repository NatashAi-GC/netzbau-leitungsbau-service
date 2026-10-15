const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const cds = require('@sap/cds')

const { GET, POST, PUT } = cds.test(__dirname + '/..')

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
})
