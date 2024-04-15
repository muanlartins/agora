import { DebateStyle } from "../enums/debate-style";
import { DebateVenue } from "../enums/debate-venue";
import { MotionTheme } from "../enums/motion-theme";
import { Member } from "./member";

export type Debate = {
  id: string;
  date: string;
  time: string;
  style: keyof typeof DebateStyle;
  venue: keyof typeof DebateVenue;
  motionType: string;
  motionTheme: keyof typeof MotionTheme;
  motion: string;
  points: number[];
  infoSlides?: string[];
  debaters: Member[];
  sps?: number[];
  chair: Member;
  wings?: Member[];
  tournament?: string;
}
