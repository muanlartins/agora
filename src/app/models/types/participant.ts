import { ParticipantCategory } from "../enums/participant-category";
import { TournamentRole } from "../enums/tournament-role";

export type Participant = {
  id: string;
  tournament: string;
  name: string;
  society: string;
  subscribedAt: string;
  hasPfp: boolean;
  duoId?: string;
  category?: ParticipantCategory;
  roles?: TournamentRole[];
  emoji?: string;
}
