import { State } from "../models/types/state";

export function getState(): State {
  return localStorage.getItem('state') ? JSON.parse(localStorage.getItem('state')!) : {};
}

export function setState(state: State): void {
  localStorage.setItem('state', JSON.stringify(state));
}
