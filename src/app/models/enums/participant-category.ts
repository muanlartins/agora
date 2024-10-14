export enum ParticipantCategory {
  schools = 'schools',
  novice = 'novice',
  open = 'open',
  dino = 'dino'
}

export function getParticipantCategoryViewValue(participantCategory: ParticipantCategory) {
  switch(participantCategory) {
    case ParticipantCategory.schools:
      return 'Schools';
    case ParticipantCategory.novice:
      return 'Novice';
    case ParticipantCategory.open:
      return 'Open';
    case ParticipantCategory.dino:
      return 'Dino';
  }
}
