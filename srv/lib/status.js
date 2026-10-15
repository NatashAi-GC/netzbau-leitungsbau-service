/**
 * Fachliche Regeln für den Status von Leitungsabschnitten und Bauprojekten.
 */

/**
 * Ermittelt den Status eines Leitungsabschnitts aus verlegter und geplanter Länge.
 * @param {number} verlegtMeter bereits verlegte Meter
 * @param {number} laengeMeter  Länge des Abschnitts in Metern
 * @returns {'GEPLANT'|'IN_BAU'|'FERTIG'}
 */
function ermittleAbschnittStatus(verlegtMeter, laengeMeter) {
  if (!verlegtMeter || verlegtMeter <= 0) return 'GEPLANT'
  if (verlegtMeter >= laengeMeter) return 'FERTIG'
  return 'IN_BAU'
}

/**
 * Ermittelt den Projektstatus aus den Status aller Abschnitte des Projekts.
 * @param {Array<{status: string}>} abschnitte
 * @returns {'OFFEN'|'IN_AUSFUEHRUNG'|'ABGESCHLOSSEN'}
 */
function ermittleProjektStatus(abschnitte) {
  if (!abschnitte.length) return 'OFFEN'
  if (abschnitte.every(a => a.status === 'FERTIG')) return 'ABGESCHLOSSEN'
  if (abschnitte.some(a => a.status !== 'GEPLANT')) return 'IN_AUSFUEHRUNG'
  return 'OFFEN'
}

module.exports = { ermittleAbschnittStatus, ermittleProjektStatus }
