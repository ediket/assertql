import { expect } from 'chai';
import _ from 'lodash';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import withAssertions from '../withAssertions';


describe('withAssertions', () => {
  it('should work', async () => {
    const SAMPLE_USER = { id: '1', email: 'foo@test.com' };

    const loggedIn = (data, info, context) => {
      if (!_.get(context, 'rootValue.currentUser.id')) {
        throw new Error('User dose not have enough permission!');
      }
    };

    const userType = new GraphQLObjectType({
      name: 'User',
      fields: withAssertions({
        id: {
          type: GraphQLString,
        },
        email: {
          type: GraphQLString,
          assertions: [loggedIn],
        },
      }),
    });

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
          user: {
            type: userType,
            resolve: () => (SAMPLE_USER),
          },
        }),
      }),
    });

    const query = `
      {
        user {
          id
          email
        }
      }
    `;

    const anonymousRootValue = {};
    const anonymousResult = await graphql(schema, query, anonymousRootValue);
    expect(anonymousResult.errors).to.have.length(1);
    expect(anonymousResult.data).to.deep.equal({
      user: { id: SAMPLE_USER.id, email: null },
    });

    const userRootValue = { currentUser: { id: '1' } };
    const userResult = await graphql(schema, query, userRootValue);
    expect(userResult.errors).to.be.empty;
    expect(userResult.data).to.deep.equal({
      user: SAMPLE_USER,
    });
  });
});
