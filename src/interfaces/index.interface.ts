export interface CatalogueData {
  name: string;
  page: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children?: CatalogueData[];
}

export enum CatalogueAction {
  create,
  updateRemove,
  updateRename,
  delete,
  link,
  publish,
}
