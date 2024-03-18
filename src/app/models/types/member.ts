import { Society } from "../enums/society";

export type Member = {
  id: string;
  name: string;
  society: keyof typeof Society;
  isTrainee: boolean;
}
