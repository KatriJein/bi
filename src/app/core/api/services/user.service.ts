import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';
import { getUserQuery } from '../graphql/queries/user/getUser.query';
import { UserDto } from '../../store/user';
import { GetUserType } from '../graphql/types/user/getUser.type';
import { GraphqlService } from './grapghql.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private graphql: GraphqlService) {}

  getUserByNameAndPassword(
    name: string,
    password: string
  ): Observable<UserDto | null> {
    return this.graphql
      .watchQuery<GetUserType>(undefined, getUserQuery, { name, password })
      .pipe(
        map((data) => this.transformResponse(data)),
        catchError((error) => {
          console.error('Error loading user:', error);
          return of(null);
        })
      );
  }

  private transformResponse(data: GetUserType): UserDto | null {
    if (!data?.users?.edges?.length) {
      return null;
    }

    const userNode = data.users.edges[0].node;

    return {
      id: userNode.id,
      name: userNode.name,
      role: undefined,
    };
  }

  // getUserByNameAndPassword(
  //   name: string,
  //   password: string
  // ): Observable<UserDto | null> {
  //   return this.graphql
  //     .mutate<GetUserType>(undefined, getUserQuery, {
  //       username: name,
  //       password,
  //     })
  //     .pipe(
  //       map((data) => this.transformResponse(data)),
  //       catchError((error) => {
  //         console.error('Error loading user:', error);
  //         return of(null);
  //       })
  //     );
  // }

  // private transformResponse(data: GetUserType): UserDto | null {
  //   if (!data?.authenticate.query.users?.nodes?.length) {
  //     return null;
  //   }

  //   const userNode = data.authenticate.query.users?.nodes[0];

  //   return {
  //     id: userNode.id,
  //     name: userNode.name,
  //     role: undefined,
  //   };
  // }
}
