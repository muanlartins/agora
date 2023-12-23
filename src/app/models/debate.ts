import { Debater } from "./debater";
import { Duo } from "./duo";
import { Judge } from "./judge";

export type Debate = {
  id: string;
  pm: Debater;
  lo: Debater;
  dpm: Debater;
  dlo: Debater;
  mg: Debater;
  mo: Debater;
  gw: Debater;
  ow: Debater;
  pmSp: number;
  loSp: number;
  dpmSp: number;
  dloSp: number;
  mgSp: number;
  moSp: number;
  gwSp: number;
  owSp: number;
  og: Duo;
  oo: Duo;
  cg: Duo;
  co: Duo;
  chair: Judge;
  wings: Judge[];
  motion: string;
  infoSlides: string[];
  date: string;
  thematic: string;
  prefix: string;
  tournament: string;
}
