import { Member } from "./member";

export type Rank = {
  title: any;
  standings: {
    members: Member[],
    value: any
  }[];
}
