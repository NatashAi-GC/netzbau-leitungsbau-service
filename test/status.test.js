const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { ermittleAbschnittStatus, ermittleProjektStatus } = require('../srv/lib/status')

describe('ermittleAbschnittStatus', () => {
  it('ohne verlegte Meter ist der Abschnitt GEPLANT', () => {
    assert.equal(ermittleAbschnittStatus(0, 500), 'GEPLANT')
  })

  it('teilweise verlegt ist IN_BAU', () => {
    assert.equal(ermittleAbschnittStatus(120, 500), 'IN_BAU')
  })

  it('vollständig verlegt ist FERTIG', () => {
    assert.equal(ermittleAbschnittStatus(500, 500), 'FERTIG')
  })
})

describe('ermittleProjektStatus', () => {
  it('ohne Abschnitte OFFEN', () => {
    assert.equal(ermittleProjektStatus([]), 'OFFEN')
  })

  it('alle Abschnitte FERTIG ergibt ABGESCHLOSSEN', () => {
    assert.equal(ermittleProjektStatus([{ status: 'FERTIG' }, { status: 'FERTIG' }]), 'ABGESCHLOSSEN')
  })

  it('mindestens ein Abschnitt begonnen ergibt IN_AUSFUEHRUNG', () => {
    assert.equal(ermittleProjektStatus([{ status: 'FERTIG' }, { status: 'GEPLANT' }]), 'IN_AUSFUEHRUNG')
  })
})
