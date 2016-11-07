# Install

```bash
npm install assertql -S
```

# Usage

```js
import _ from 'lodash';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';
import { withAssertions } from 'assertql';


const loggedIn = (data, args, context, info) => {
  if (!_.get(info, 'rootValue.currentUser.id')) {
    throw new Error('User dose not have enough permission!');
  }
};

const hasRole = (role) => (data, args, context, info) => {
  const roles = _.get(info, 'rootValue.currentUser.roles', []);
  if (!_.includes(roles, role)) {
    throw new Error('User dose not have enough permission!');
  }
};

const isAdmin = hasRole('admin');

const isMe = (data, args, context, info) => {
  if (data.id !== _.get(info, 'rootValue.currentUser.id'))
    throw new Error('User dose not have enough permission!');
  }
};

const userType = new GraphQLObjectType({
  name: 'User',
  fields: withAssertions({
    loggedIn,
    isAdmin,
    isMe,
  }, {
    id: {
      type: GraphQLString,
      // if no assertion, field is public
    },
    email: {
      type: GraphQLString,
      // logged in user, self, admin can read this field
      assertions: ['loggedIn', 'isMe', 'isAdmin'],
    },
    point: {
      type: GraphQLInt,
      // self, admin can read this field
      assertions: ['isMe', 'isAdmin'],
    },
  }),
});
```
