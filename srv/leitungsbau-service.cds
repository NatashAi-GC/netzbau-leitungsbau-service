using {netzbau.leitungsbau as db} from '../db/schema';

@path: '/odata/v4/leitungsbau'
service LeitungsbauService {

  entity Bauprojekte        as projection on db.Bauprojekte;

  entity Leitungsabschnitte as projection on db.Leitungsabschnitte;

}

annotate LeitungsbauService.Bauprojekte with {
  status @Core.Computed;
};
