import { injectable } from "inversify";

@injectable()
export class PenisFinder {

  private regexp = 'penis';

  public isPenis(stringToSearch: string): boolean {
    return stringToSearch.search(this.regexp) >= 0;
  }
}