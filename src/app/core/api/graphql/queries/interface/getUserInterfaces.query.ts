import { gql } from 'apollo-angular';

export const getUserInterfacesQuery = gql(`
query GetUserInterfaces($id: UUID!) {
          user(id: $id) {
            userInterfaces {
              nodes {
                order
                interface {
                  id
                  name
                }
              }
            }
          }
        }
        `);
