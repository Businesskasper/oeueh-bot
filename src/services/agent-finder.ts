import { injectable } from 'inversify';

@injectable()
export class AgentFinder {
  private regexp = 'agent';

  public isAgent(stringToSearch: string): boolean {
    return stringToSearch.search(this.regexp) >= 0;
  }
}
