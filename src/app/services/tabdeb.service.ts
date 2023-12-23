import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from 'src/app/models/token';
import { Observable, of } from 'rxjs';
import { User } from 'src/app/models/user';
import { Judge } from '../models/judge';
import { Debate } from '../models/debate';
import { Debater } from '../models/debater';
import { Duo } from '../models/duo';

const BASE_URL = "https://bvgmvdgrcvnpvu5ho3y2ttxbpe0txcfp.lambda-url.sa-east-1.on.aws";
// const BASE_URL = "https://localhost:7044";

const ENDPOINTS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  signup: '/user',
  getUser: '/user',
  updateUser: '/user/update',
  getAllJudges: '/judges',
  createJudge: '/judge',
  getAllDebates: '/debates',
  createDebate: '/debate',
  getAllDebaters: '/debaters',
  createDebater: '/debater',
  getAllDuos: '/duos',
  createDuo: '/duo'
}

@Injectable({
  providedIn: 'root'
})
export class TabdebService {

  constructor(private httpClient: HttpClient) { }

  public login(login: string, password: string): Observable<Token> {
    return this.httpClient.post<string>(BASE_URL + ENDPOINTS.login, {
      login,
      password
    });
  }

  public refresh(token: string) {
    return this.httpClient.get<Token>(BASE_URL + ENDPOINTS.refresh, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }

  public signup(login: string, password: string): Observable<boolean> {
    return this.httpClient.post<boolean>(BASE_URL + ENDPOINTS.signup, {
      login,
      password
    });
  }

  public getUser(token: string): Observable<User> {
    return this.httpClient.get<User>(BASE_URL + ENDPOINTS.getUser, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }

  public updateUser(token: string, nickname: string, fullName: string): Observable<boolean> {
    return this.httpClient.post<boolean>(BASE_URL + ENDPOINTS.updateUser, {
      nickname,
      fullName
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }

  public getAllJudges(token: string): Observable<Judge[]> {
    // return this.httpClient.get<Judge[]>(BASE_URL + ENDPOINTS.getAllJudges, {
    //   headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    // });

    return of([
      {
          "id": "e80f93f4-bfbd-469c-9a55-117799f7dd70",
          "name": "Luan Martins"
      },
      {
          "id": "5f3a8ad4-1e56-4af9-92b6-cce2892dc933",
          "name": "Vinicius Brasileiro"
      },
      {
          "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
          "name": "Desconhecido"
      },
      {
          "id": "808a60e2-63a9-4510-b2f8-735640584c2d",
          "name": "Nathália Magalhães"
      },
      {
          "id": "507c382a-d6db-4886-ab0e-7c998ce48ef5",
          "name": "Maju Minto"
      },
      {
          "id": "ca344042-e453-4a15-90d8-a94e5733a87a",
          "name": "Camila Caleones"
      }
    ]);
  }

  public createJudge(token: string, name: string): Observable<Judge> {
    return this.httpClient.post<Judge>(BASE_URL + ENDPOINTS.createJudge, {
      name
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }

  public getAllDebates(token: string): Observable<Debate[]> {
    // return this.httpClient.get<Debate[]>(BASE_URL + ENDPOINTS.getAllDebates, {
    //   headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    // });

    return of([
      {
          "id": "aac1c30f-99f1-4b9f-a4b5-dee571a0703c",
          "pm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "lo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dpm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dlo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mg": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mo": {
              "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
              "name": "Luis Otávio"
          },
          "gw": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "ow": {
              "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
              "name": "Isabella Romanholi"
          },
          "pmSp": 70,
          "loSp": 65,
          "dpmSp": 71,
          "dloSp": 65,
          "mgSp": 71,
          "moSp": 74,
          "gwSp": 71,
          "owSp": 72,
          "og": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "oo": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "cg": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "co": {
              "id": "64d3f0da-9210-4b57-a29d-05ddfca2f422",
              "a": {
                  "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
                  "name": "Luis Otávio"
              },
              "b": {
                  "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
                  "name": "Isabella Romanholi"
              }
          },
          "chair": {
              "id": "ca344042-e453-4a15-90d8-a94e5733a87a",
              "name": "Camila Caleones"
          },
          "wings": [
              {
                  "id": "e80f93f4-bfbd-469c-9a55-117799f7dd70",
                  "name": "Luan Martins"
              }
          ],
          "motion": "Esta Casa prefere viver em um mundo onde adultos têm a opção de se submeter ao Kolinahr",
          "infoSlides": [
              "A humanidade atingiu a velocidade de dobra espacial. Isso ocasionou o primeiro contato oficial do planeta Terra com os Vulcanos, uma raça alienígena altamente lógica e centrada na razão. Os Vulcanos, como gesto de boa vontade, ensinaram a alguns humanos o Kolinahr, um ritual vulcano destinado a alcançar o domínio completo e a supressão das emoções, concentrando-se apenas na lógica pura. Essa prática é vista como uma jornada rumo à disciplina pessoal e à clareza de pensamento. O processo de Kolinahr envolve um treinamento rigoroso de mente e de disciplina. Ele é projetado para ajudar os indivíduos a controlarem impulsos emocionais e aprimorar o raciocínio lógico. Nem todos que começam o treinamento de Kolinahr o concluem com sucesso. Para fins deste debate, o debate se passa no mundo real, não em Star Trek. O mundo hoje entra em uma nova era de exploração espacial e descoberta de novos planetas."
          ],
          "date": "2023-12-20T19:23:26.194Z",
          "thematic": "Fantasia",
          "prefix": "ECP",
          "tournament": "IV Epic"
      },
      {
          "id": "fe6575cd-df1a-4fe1-926e-a05d951fe927",
          "pm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "lo": {
              "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
              "name": "Luis Otávio"
          },
          "dpm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dlo": {
              "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
              "name": "Isabella Romanholi"
          },
          "mg": {
              "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
              "name": "João Miranda"
          },
          "mo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "gw": {
              "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
              "name": "Cecília Antunes"
          },
          "ow": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "pmSp": 73,
          "loSp": 76,
          "dpmSp": 72,
          "dloSp": 74,
          "mgSp": 75,
          "moSp": 71,
          "gwSp": 74,
          "owSp": 71,
          "og": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "oo": {
              "id": "64d3f0da-9210-4b57-a29d-05ddfca2f422",
              "a": {
                  "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
                  "name": "Luis Otávio"
              },
              "b": {
                  "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
                  "name": "Isabella Romanholi"
              }
          },
          "cg": {
              "id": "8f6db49d-92aa-4e8b-bc4d-a454712e4349",
              "a": {
                  "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
                  "name": "Cecília Antunes"
              },
              "b": {
                  "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
                  "name": "João Miranda"
              }
          },
          "co": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "chair": {
              "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
              "name": "Desconhecido"
          },
          "wings": [
              {
                  "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
                  "name": "Desconhecido"
              }
          ],
          "motion": "ECAQ nenhuma das duas opções é o Navio de Teseu",
          "infoSlides": [
              "O Navio de Teseu é um artefato de um museu. Com o tempo, suas tábuas de madeira apodreceram e foram trocadas por novas tábuas. Quando não resta qualquer tábua original, ele ainda é o Navio de Teseu?  Por outro lado, se as tábuas removidas são restauradas e remontadas, sem a parte podre, esse seria o Navio de Teseu?",
              "Para os fins deste debate, isto não é necessariamente um debate somente sobre o navio de Teseu."
          ],
          "date": "2023-12-21T17:37:30.081Z",
          "thematic": "Fantasia",
          "prefix": "ECAQ",
          "tournament": "IV Epic"
      },
      {
          "id": "3675740a-06c3-4f1f-9813-e514c6a57e6e",
          "pm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "lo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dpm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dlo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mg": {
              "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
              "name": "Luis Otávio"
          },
          "mo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "gw": {
              "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
              "name": "Isabella Romanholi"
          },
          "ow": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "pmSp": 73,
          "loSp": 76,
          "dpmSp": 71,
          "dloSp": 75,
          "mgSp": 72,
          "moSp": 69,
          "gwSp": 73,
          "owSp": 70,
          "og": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "oo": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "cg": {
              "id": "64d3f0da-9210-4b57-a29d-05ddfca2f422",
              "a": {
                  "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
                  "name": "Luis Otávio"
              },
              "b": {
                  "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
                  "name": "Isabella Romanholi"
              }
          },
          "co": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "chair": {
              "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
              "name": "Desconhecido"
          },
          "wings": [
              {
                  "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
                  "name": "Desconhecido"
              }
          ],
          "motion": "ECAQ é legítimo o uso das maldições imperdoaveis pelos membros da Ordem da Fênix na luta contra as trevas",
          "infoSlides": [
              "Ordem da Fênix é uma organização secreta de resistência a Lord Voldemort e seus Comensais da Morte, os quais exercem ações violentas e eugenistas na busca da raça pura bruxa, através de feitiços das trevas e morte e perseguição a seus opositores. A Ordem da Fênix atua através de ataques repentinos e discretos com o intuito de acabar com a rebelião das trevas.\n\nAs maldições imperdoáveis (avada kedava, cruciatus e imperius) são os feitiços mais poderosos do mundo bruxo sendo consideradas das trevas. Aquele que faz uso destas é condenado à prisão perpétua em Azkaban e uma parte de sua alma é perdida. São recorrentemente utilizadas por Lord Voldemort e seus Comensais da Morte"
          ],
          "date": "2023-12-21T17:33:51.878Z",
          "thematic": "Fantasia",
          "prefix": "ECAQ",
          "tournament": "IV Epic"
      },
      {
          "id": "5940ec85-c73b-48c1-8be3-a6dc433f3b01",
          "pm": {
              "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
              "name": "Cecília Antunes"
          },
          "lo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dpm": {
              "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
              "name": "João Miranda"
          },
          "dlo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mg": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "gw": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "ow": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "pmSp": 73,
          "loSp": 69,
          "dpmSp": 75,
          "dloSp": 69,
          "mgSp": 76,
          "moSp": 72,
          "gwSp": 73,
          "owSp": 71,
          "og": {
              "id": "8f6db49d-92aa-4e8b-bc4d-a454712e4349",
              "a": {
                  "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
                  "name": "Cecília Antunes"
              },
              "b": {
                  "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
                  "name": "João Miranda"
              }
          },
          "oo": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "cg": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "co": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "chair": {
              "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
              "name": "Desconhecido"
          },
          "wings": [
              {
                  "id": "5f3a8ad4-1e56-4af9-92b6-cce2892dc933",
                  "name": "Vinicius Brasileiro"
              }
          ],
          "motion": "Esta Casa prefere viver em um mundo onde adultos têm a opção de se submeter ao Kolinahr",
          "infoSlides": [
              "A humanidade atingiu a velocidade de dobra espacial. Isso ocasionou o primeiro contato oficial do planeta Terra com os Vulcanos, uma raça alienígena altamente lógica e centrada na razão. Os Vulcanos, como gesto de boa vontade, ensinaram a alguns humanos o Kolinahr, um ritual vulcano destinado a alcançar o domínio completo e a supressão das emoções, concentrando-se apenas na lógica pura. Essa prática é vista como uma jornada rumo à disciplina pessoal e à clareza de pensamento. O processo de Kolinahr envolve um treinamento rigoroso de mente e de disciplina. Ele é projetado para ajudar os indivíduos a controlarem impulsos emocionais e aprimorar o raciocínio lógico. Nem todos que começam o treinamento de Kolinahr o concluem com sucesso. Para fins deste debate, o debate se passa no mundo real, não em Star Trek. O mundo hoje entra em uma nova era de exploração espacial e descoberta de novos planetas."
          ],
          "date": "2023-12-21T12:39:35.694Z",
          "thematic": "Fantasia",
          "prefix": "ECP",
          "tournament": "IV Epic"
      },
      {
          "id": "2eb58e16-97a4-4380-9531-81f84d8be4f8",
          "pm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "lo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dpm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dlo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mg": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mo": {
              "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
              "name": "João Miranda"
          },
          "gw": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "ow": {
              "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
              "name": "Cecília Antunes"
          },
          "pmSp": 72,
          "loSp": 68,
          "dpmSp": 71,
          "dloSp": 67,
          "mgSp": 66,
          "moSp": 69,
          "gwSp": 68,
          "owSp": 72,
          "og": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "oo": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "cg": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "co": {
              "id": "8f6db49d-92aa-4e8b-bc4d-a454712e4349",
              "a": {
                  "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
                  "name": "Cecília Antunes"
              },
              "b": {
                  "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
                  "name": "João Miranda"
              }
          },
          "chair": {
              "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
              "name": "Desconhecido"
          },
          "wings": [
              {
                  "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
                  "name": "Desconhecido"
              }
          ],
          "motion": "ECAQ é legítimo o uso das maldições imperdoaveis pelos membros da Ordem da Fênix na luta contra as trevas",
          "infoSlides": [
              "Ordem da Fênix é uma organização secreta de resistência a Lord Voldemort e seus Comensais da Morte, os quais exercem ações violentas e eugenistas na busca da raça pura bruxa, através de feitiços das trevas e morte e perseguição a seus opositores. A Ordem da Fênix atua através de ataques repentinos e discretos com o intuito de acabar com a rebelião das trevas.\n\nAs maldições imperdoáveis (avada kedava, cruciatus e imperius) são os feitiços mais poderosos do mundo bruxo sendo consideradas das trevas. Aquele que faz uso destas é condenado à prisão perpétua em Azkaban e uma parte de sua alma é perdida. São recorrentemente utilizadas por Lord Voldemort e seus Comensais da Morte"
          ],
          "date": "2023-12-21T17:35:30.463Z",
          "thematic": "Fantasia",
          "prefix": "ECAQ",
          "tournament": "IV Epic"
      },
      {
          "id": "f046c36f-67f0-4ff0-b0ee-e832b13f55af",
          "pm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "lo": {
              "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
              "name": "Luis Otávio"
          },
          "dpm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dlo": {
              "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
              "name": "Isabella Romanholi"
          },
          "mg": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "gw": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "ow": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "pmSp": 73,
          "loSp": 71,
          "dpmSp": 72,
          "dloSp": 69,
          "mgSp": 67,
          "moSp": 75,
          "gwSp": 66,
          "owSp": 76,
          "og": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "oo": {
              "id": "64d3f0da-9210-4b57-a29d-05ddfca2f422",
              "a": {
                  "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
                  "name": "Luis Otávio"
              },
              "b": {
                  "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
                  "name": "Isabella Romanholi"
              }
          },
          "cg": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "co": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "chair": {
              "id": "5f3a8ad4-1e56-4af9-92b6-cce2892dc933",
              "name": "Vinicius Brasileiro"
          },
          "wings": [
              {
                  "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
                  "name": "Desconhecido"
              }
          ],
          "motion": "EC apoia a filosofia de Darth Traya",
          "infoSlides": [
              "Darth Traya, conhecida como Kreia antes de sua queda, foi uma Jedi que se autoexilou. Seus pontos de vista incluem o ceticismo em relação aos ideais, sugerindo que a verdadeira compreensão vem do questionamento e até da traição das próprias crenças. Ela acredita no valor de não criar dependência através da ajuda, tendo dito: \"Se você se preocupa com os outros, então dispense a piedade e o sacrifício e reconheça o valor de deixá-los travar suas próprias batalhas”."
          ],
          "date": "2023-12-21T13:15:23.382Z",
          "thematic": "Fantasia",
          "prefix": "ECA",
          "tournament": "IV Epic"
      },
      {
          "id": "c42d9030-a31e-4177-8678-247a0ec86e3f",
          "pm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "lo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dpm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dlo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mg": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mo": {
              "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
              "name": "João Miranda"
          },
          "gw": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "ow": {
              "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
              "name": "Cecília Antunes"
          },
          "pmSp": 73,
          "loSp": 73,
          "dpmSp": 74,
          "dloSp": 75,
          "mgSp": 71,
          "moSp": 70,
          "gwSp": 73,
          "owSp": 71,
          "og": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "oo": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "cg": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "co": {
              "id": "8f6db49d-92aa-4e8b-bc4d-a454712e4349",
              "a": {
                  "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
                  "name": "Cecília Antunes"
              },
              "b": {
                  "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
                  "name": "João Miranda"
              }
          },
          "chair": {
              "id": "507c382a-d6db-4886-ab0e-7c998ce48ef5",
              "name": "Maju Minto"
          },
          "wings": [
              {
                  "id": "808a60e2-63a9-4510-b2f8-735640584c2d",
                  "name": "Nathália Magalhães"
              }
          ],
          "motion": "EC faria uma nova edição dos Jogos Vorazes com Snow e seus apoiadores.",
          "infoSlides": [
              "Panem é formada por uma Capital e 12 distritos. Antes dos eventos relatados na franquia Jogos Vorazes, sabe-se que Panem foi palco de uma guerra civil liderada pelo Distrito 13 contra a Capital. A guerra acabou quando o Distrito 13 parou de apoiar secretamente os rebeldes, em troca de conseguirem independência da Capital. Publicamente, o Distrito 13 aparentava destruição para desmoralizar a rebelião. Sem o apoio do Distrito 13, rapidamente a Capital subjugou os outros distritos e houve muitas mortes de ambos os lados.\n\nA Capital promulgou novas leis restringindo as liberdades civis e como um lembrete cruel e uma punição pesada aos distritos a Capital instituiu os Jogos Vorazes. Uma competição de sobrevivência em que apenas 1 pessoa dos distritos saí viva. ",
              "Coriolanus Snow nasceu na Capital e é o presidente tirânico e supremacista de Panem, que aprimorou os Jogos Vorazes e o transformou em um grande espetáculo para a Capital. Imagine um contexto hipotético em que os sobreviventes dos Jogos Vorazes formam uma aliança para derrubar a Capital. Eles conseguiram derrubar Snow e seus apoiadores sem precisar matá-los."
          ],
          "date": "2023-12-21T13:27:21.607Z",
          "thematic": "Fantasia",
          "prefix": "ECF",
          "tournament": "IV Epic"
      },
      {
          "id": "9965d750-07b8-4f8d-ba71-665901d2d191",
          "pm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "lo": {
              "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
              "name": "Cecília Antunes"
          },
          "dpm": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dlo": {
              "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
              "name": "João Miranda"
          },
          "mg": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "gw": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "ow": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "pmSp": 74,
          "loSp": 75,
          "dpmSp": 73,
          "dloSp": 76,
          "mgSp": 72,
          "moSp": 70,
          "gwSp": 71,
          "owSp": 68,
          "og": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "oo": {
              "id": "8f6db49d-92aa-4e8b-bc4d-a454712e4349",
              "a": {
                  "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
                  "name": "Cecília Antunes"
              },
              "b": {
                  "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
                  "name": "João Miranda"
              }
          },
          "cg": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "co": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "chair": {
              "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
              "name": "Desconhecido"
          },
          "wings": [
              {
                  "id": "e80f93f4-bfbd-469c-9a55-117799f7dd70",
                  "name": "Luan Martins"
              }
          ],
          "motion": "EC apoia a filosofia de Darth Traya",
          "infoSlides": [
              "Darth Traya, conhecida como Kreia antes de sua queda, foi uma Jedi que se autoexilou. Seus pontos de vista incluem o ceticismo em relação aos ideais, sugerindo que a verdadeira compreensão vem do questionamento e até da traição das próprias crenças. Ela acredita no valor de não criar dependência através da ajuda, tendo dito: \"Se você se preocupa com os outros, então dispense a piedade e o sacrifício e reconheça o valor de deixá-los travar suas próprias batalhas”."
          ],
          "date": "2023-12-21T13:19:34.585Z",
          "thematic": "Fantasia",
          "prefix": "ECA",
          "tournament": "IV Epic"
      },
      {
          "id": "6940b98f-e19d-450a-a1ca-1f840d902cfc",
          "pm": {
              "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
              "name": "Luis Otávio"
          },
          "lo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "dpm": {
              "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
              "name": "Isabella Romanholi"
          },
          "dlo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mg": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "mo": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "gw": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "ow": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "pmSp": 70,
          "loSp": 69,
          "dpmSp": 69,
          "dloSp": 68,
          "mgSp": 73,
          "moSp": 75,
          "gwSp": 71,
          "owSp": 73,
          "og": {
              "id": "64d3f0da-9210-4b57-a29d-05ddfca2f422",
              "a": {
                  "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
                  "name": "Luis Otávio"
              },
              "b": {
                  "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
                  "name": "Isabella Romanholi"
              }
          },
          "oo": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "cg": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "co": {
              "id": "345f1fae-390d-4011-9e93-3885c173c850",
              "a": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              },
              "b": {
                  "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
                  "name": "Desconhecido"
              }
          },
          "chair": {
              "id": "3787b15a-2ab5-4672-895e-946cf3ad2a05",
              "name": "Desconhecido"
          },
          "wings": [
              {
                  "id": "e80f93f4-bfbd-469c-9a55-117799f7dd70",
                  "name": "Luan Martins"
              }
          ],
          "motion": "EC faria uma nova edição dos Jogos Vorazes com Snow e seus apoiadores.",
          "infoSlides": [
              "Panem é formada por uma Capital e 12 distritos. Antes dos eventos relatados na franquia Jogos Vorazes, sabe-se que Panem foi palco de uma guerra civil liderada pelo Distrito 13 contra a Capital. A guerra acabou quando o Distrito 13 parou de apoiar secretamente os rebeldes, em troca de conseguirem independência da Capital. Publicamente, o Distrito 13 aparentava destruição para desmoralizar a rebelião. Sem o apoio do Distrito 13, rapidamente a Capital subjugou os outros distritos e houve muitas mortes de ambos os lados.\n\nA Capital promulgou novas leis restringindo as liberdades civis e como um lembrete cruel e uma punição pesada aos distritos a Capital instituiu os Jogos Vorazes. Uma competição de sobrevivência em que apenas 1 pessoa dos distritos saí viva. ",
              "Coriolanus Snow nasceu na Capital e é o presidente tirânico e supremacista de Panem, que aprimorou os Jogos Vorazes e o transformou em um grande espetáculo para a Capital. Imagine um contexto hipotético em que os sobreviventes dos Jogos Vorazes formam uma aliança para derrubar a Capital. Eles conseguiram derrubar Snow e seus apoiadores sem precisar matá-los."
          ],
          "date": "2023-12-21T13:32:01.245Z",
          "thematic": "Fantasia",
          "prefix": "ECF",
          "tournament": "IV Epic"
      }
    ]);
  }

  public createDebate(
    token: string,
    pm: Debater,
    lo: Debater,
    dpm: Debater,
    dlo: Debater,
    mg: Debater,
    mo: Debater,
    gw: Debater,
    ow: Debater,
    pmSp: number,
    loSp: number,
    dpmSp: number,
    dloSp: number,
    mgSp: number,
    moSp: number,
    gwSp: number,
    owSp: number,
    og: Duo,
    oo: Duo,
    cg: Duo,
    co: Duo,
    chair: Judge,
    wings: Judge[],
    motion: string,
    infoSlides: string[],
    date: string,
    thematic: string,
    prefix: string,
    tournament: string
  ): Observable<Debate> {
    return this.httpClient.post<Debate>(BASE_URL + ENDPOINTS.createDebate, {
      pm,
      lo,
      dpm,
      dlo,
      mg,
      mo,
      gw,
      ow,
      pmSp,
      loSp,
      dpmSp,
      dloSp,
      mgSp,
      moSp,
      gwSp,
      owSp,
      og,
      oo,
      cg,
      co,
      chair,
      wings,
      motion,
      infoSlides,
      date,
      thematic,
      prefix,
      tournament
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }

  public getAllDebaters(token: string): Observable<Debater[]> {
    // return this.httpClient.get<Debater[]>(BASE_URL + ENDPOINTS.getAllDebaters, {
    //   headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    // });

    return of([
      {
          "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
          "name": "Cecília Antunes"
      },
      {
          "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
          "name": "Luis Otávio"
      },
      {
          "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
          "name": "Desconhecido"
      },
      {
          "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
          "name": "João Miranda"
      },
      {
          "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
          "name": "Isabella Romanholi"
      }
    ]);
  }

  public createDebater(token: string, name: string): Observable<Debater> {
    return this.httpClient.post<Debater>(BASE_URL + ENDPOINTS.createDebater, {
      name
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }

  public getAllDuos(token: string): Observable<Duo[]> {
    // return this.httpClient.get<Duo[]>(BASE_URL + ENDPOINTS.getAllDuos, {
    //   headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    // });

    return of([
      {
          "id": "8f6db49d-92aa-4e8b-bc4d-a454712e4349",
          "a": {
              "id": "95d0d9f0-4be6-4b20-9094-c35247945b27",
              "name": "Cecília Antunes"
          },
          "b": {
              "id": "d03e1e28-cdb1-424a-88e9-f797805dfe59",
              "name": "João Miranda"
          }
      },
      {
          "id": "345f1fae-390d-4011-9e93-3885c173c850",
          "a": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          },
          "b": {
              "id": "c8222638-a8ee-43db-9692-a7e40db60b73",
              "name": "Desconhecido"
          }
      },
      {
          "id": "64d3f0da-9210-4b57-a29d-05ddfca2f422",
          "a": {
              "id": "6b041d7e-5770-4b99-bae0-60d1890ebef2",
              "name": "Luis Otávio"
          },
          "b": {
              "id": "41aa740c-07f2-4746-a8b8-6adda7ef1e66",
              "name": "Isabella Romanholi"
          }
      }
    ]);
  }

  public createDuo(token: string, a: Debater, b: Debater): Observable<Duo> {
    return this.httpClient.post<Duo>(BASE_URL + ENDPOINTS.createDuo, {
      a,
      b
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }
}
