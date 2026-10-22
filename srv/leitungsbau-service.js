const cds = require('@sap/cds')
const { ermittleAbschnittStatus, ermittleProjektStatus } = require('./lib/status')

const LOG = cds.log('leitungsbau')

module.exports = class LeitungsbauService extends cds.ApplicationService {
  init() {
    const { Bauprojekte, Leitungsabschnitte } = this.entities

    /**
     * Plausibilisierung und Statusableitung für Leitungsabschnitte.
     * Der Status wird nie vom Client übernommen, sondern immer aus
     * verlegter Länge und Abschnittslänge abgeleitet.
     */
    this.before(['CREATE', 'UPDATE'], Leitungsabschnitte, async req => {
      let { laengeMeter, verlegtMeter } = req.data

      if (req.event === 'UPDATE') {
        if (laengeMeter === undefined && verlegtMeter === undefined) {
          return
        }
        const id = req.data.ID || (req.params && req.params[0])
        const existing = await SELECT.one.from(Leitungsabschnitte, id).columns('laengeMeter', 'verlegtMeter')
        if (existing) {
          if (laengeMeter === undefined) laengeMeter = existing.laengeMeter
          if (verlegtMeter === undefined) verlegtMeter = existing.verlegtMeter
        }
      } else {
        if (verlegtMeter === undefined) verlegtMeter = 0
      }

      if (laengeMeter !== undefined && laengeMeter <= 0) {
        return req.error(400, 'Die Abschnittslänge muss größer 0 m sein.', 'laengeMeter')
      }
      if (verlegtMeter < 0) {
        return req.error(400, 'Die verlegte Länge darf nicht negativ sein.', 'verlegtMeter')
      }
      if (laengeMeter !== undefined && verlegtMeter > laengeMeter) {
        return req.error(
          400,
          `Die verlegte Länge (${verlegtMeter} m) überschreitet die Abschnittslänge (${laengeMeter} m).`,
          'verlegtMeter'
        )
      }

      req.data.status = ermittleAbschnittStatus(verlegtMeter, laengeMeter)
    })

    /**
     * Nach jeder Änderung an einem Abschnitt den Status des zugehörigen Bauprojekts nachziehen.
     */
    this.after(['CREATE', 'UPDATE'], Leitungsabschnitte, async (_, req) => {
      const abschnitt = await SELECT.one.from(Leitungsabschnitte, req.data.ID).columns('projekt_ID')
      if (abschnitt?.projekt_ID) await this.aktualisiereProjektstatus(abschnitt.projekt_ID)
    })

    this.aktualisiereProjektstatus = async projektID => {
      const abschnitte = await SELECT.from(Leitungsabschnitte).columns('status').where({ projekt_ID: projektID })
      const status = ermittleProjektStatus(abschnitte)
      await UPDATE(Bauprojekte, projektID).with({ status })
      LOG.debug(`Projekt ${projektID}: Status -> ${status}`)
    }

    return super.init()
  }
}
