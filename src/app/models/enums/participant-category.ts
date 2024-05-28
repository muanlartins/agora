export enum ParticipantCategory {
  novice = 'novice',
  open = 'open',
  dino = 'dino'
}

export function getParticipantCategoryViewValue(participantCategory: ParticipantCategory) {
  switch(participantCategory) {
    case ParticipantCategory.novice:
      return 'Novice';
    case ParticipantCategory.open:
      return 'Open';
    case ParticipantCategory.dino:
      return 'Dino';
  }
}
