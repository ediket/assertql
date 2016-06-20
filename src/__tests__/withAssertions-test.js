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
  const SAMPLE_USER = { id: '1', email: 'foo@test.com', name: 'foo' };

  it('should work', async () => {
    const loggedIn = (data, info, context) => {
      if (!_.get(context, 'rootValue.currentUser.id')) {
        throw new Error('User dose not have enough permission!');
      }
    };

    const userType = new GraphQLObjectType({
      name: 'User',
      fields: withAssertions({ loggedIn }, {
        id: {
          type: GraphQLString,
        },
        email: {
          type: GraphQLString,
          assertions: ['loggedIn'],
        },
      }),
    });

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
          user: {
            type: userType,
            resolve: () => _.clone(SAMPLE_USER),
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
      user: _.pick(SAMPLE_USER, 'id', 'email'),
    });
  });

  it('should cache result', async () => {
    const loggedIn = (data, info, context) => {
      if (!_.get(context, 'rootValue.currentUser.id')) {
        throw new Error('User dose not have enough permission!');
      }
    };

    const userType = new GraphQLObjectType({
      name: 'User',
      fields: withAssertions({ loggedIn }, {
        id: {
          type: GraphQLString,
        },
        email: {
          type: GraphQLString,
          assertions: ['loggedIn'],
        },
        name: {
          type: GraphQLString,
          assertions: ['loggedIn'],
        },
      }),
    });

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
          user: {
            type: userType,
            resolve: () => _.clone(SAMPLE_USER),
          },
        }),
      }),
    });

    const query = `
      {
        user {
          id
          email
          name
        }
      }
    `;

    const anonymousRootValue = {};
    const anonymousResult = await graphql(schema, query, anonymousRootValue);
    expect(anonymousResult.errors).to.have.length(2);
    expect(anonymousResult.data).to.deep.equal({
      user: { id: SAMPLE_USER.id, email: null, name: null },
    });

    const userRootValue = { currentUser: { id: '1' } };
    const userResult = await graphql(schema, query, userRootValue);
    expect(userResult.errors).to.be.empty;
    expect(userResult.data).to.deep.equal({
      user: _.pick(SAMPLE_USER, 'id', 'email', 'name'),
    });
  });

  it('should work with async assertion', async () => {
    const throwError = async () => {
      throw new Error();
    };

    const userType = new GraphQLObjectType({
      name: 'User',
      fields: withAssertions({ throwError }, {
        id: {
          type: GraphQLString,
        },
        email: {
          type: GraphQLString,
          assertions: ['throwError'],
        },
      }),
    });

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
          user: {
            type: userType,
            resolve: () => _.clone(SAMPLE_USER),
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
  });
});
