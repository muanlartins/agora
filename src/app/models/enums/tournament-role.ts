export enum TournamentRole {
  debater = 'debater',
  judge = 'judge',
  observer = 'observer',
  ca = 'ca',
  dca = 'dca',
  equity = 'equity',
  tabby = 'tabby',
  advisor = 'advisor',
  convenor = 'convenor'
}

export function getTournamentRoleViewValue(tournamentRole: TournamentRole) {
  switch(tournamentRole) {
    case TournamentRole.debater:
      return 'Debatedor';
    case TournamentRole.judge:
      return 'Juíz';
    case TournamentRole.observer:
      return 'Observador';
    case TournamentRole.ca:
      return 'CA';
    case TournamentRole.dca:
      return 'DCA';
    case TournamentRole.equity:
      return 'Equidade';
    case TournamentRole.tabby:
      return 'Tabby';
    case TournamentRole.advisor:
      return 'Advisor';
    case TournamentRole.convenor:
      return 'Convenor';
  }
}
