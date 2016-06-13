import _ from 'lodash';


function withAssertions(fields) {
  return _.mapValues(fields, (field, key) => {
    const {
      assertions,
      resolve = (parent) => parent[key],
    } = field;

    if (_.isEmpty(assertions)) return field;

    return {
      ...field,
      resolve: (data, info, context) => {
        assertions.forEach(assertion => assertion(data, info, context));
        return resolve(data, info, context);
      },
    };
  });
}


export default withAssertions;
