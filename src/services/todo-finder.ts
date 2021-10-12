import { injectable } from 'inversify';

@injectable()
export class TodoFinder {
  private regexp = 'todo';

  public isTodo(stringToSearch: string): boolean {
    return stringToSearch.search(this.regexp) >= 0;
  }
}
