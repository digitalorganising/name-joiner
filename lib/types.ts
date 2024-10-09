interface Flavoring<FlavorT> {
  _type?: FlavorT;
}
export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

export type CSVRow<Field extends string> = Record<
  Field,
  string | number | boolean | null
>;

export type LoadedCSV<Field extends string> = {
  data: CSVRow<Field>[];
  fields: Field[];
  idField: Field;
  nameField: Field;
  emailField?: Field;
};
