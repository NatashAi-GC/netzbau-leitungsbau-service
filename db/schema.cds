namespace netzbau.leitungsbau;

using {
  cuid,
  managed
} from '@sap/cds/common';

type Sparte          : String(10) enum {
  STROM;
  GAS;
  WASSER;
  GLASFASER;
}

type Verlegeart      : String(20) enum {
  OFFENE_BAUWEISE;
  SPUELBOHRUNG;
  PFLUGVERFAHREN;
  EINZUG_LEERROHR;
}

type AbschnittStatus : String(10) enum {
  GEPLANT;
  IN_BAU;
  FERTIG;
}

type ProjektStatus   : String(15) enum {
  OFFEN;
  IN_AUSFUEHRUNG;
  ABGESCHLOSSEN;
}

entity Bauprojekte : cuid, managed {
  projektNr   : String(20) @mandatory;
  bezeichnung : String(120) @mandatory;
  gemeinde    : String(60);
  sparte      : Sparte;
  bauleiter   : String(60);
  status      : ProjektStatus default 'OFFEN';
  abschnitte  : Composition of many Leitungsabschnitte
                  on abschnitte.projekt = $self;
}

entity Leitungsabschnitte : cuid, managed {
  projekt      : Association to Bauprojekte @mandatory;
  abschnittNr  : String(10) @mandatory;
  vonStation   : String(80);
  bisStation   : String(80);
  verlegeart   : Verlegeart;
  laengeMeter  : Integer @mandatory;
  verlegtMeter : Integer default 0;
  status       : AbschnittStatus default 'GEPLANT';
  bemerkung    : String(500);
}
