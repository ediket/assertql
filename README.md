# Install

```bash
npm install assertql -S
```

# Usage

```js
import { expect } from 'chai';
import _ from 'lodash';
import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { withAssertions } from 'assertql';


const loggedIn = (data, info, context) => {
  if (!_.get(context, 'rootValue.currentUser.id')) {
    throw new Error('User dose not have enough permission!');
  }
};

const self = (data, info, context) => {
  if (data.id !== _.get(context, 'rootValue.currentUser.id'))
    throw new Error('User dose not have enough permission!');
  }
};

const hasRole = (role) => (data, info, context) => {
  const roles = _.get(context, 'rootValue.currentUser.roles', []);
  if (!_.includes(roles, role)) {
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
      assertions: [loggedIn, _.some(hasRole('admin'), self)],
    },
  }),
});
```
