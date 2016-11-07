/* eslint no-param-reassign: 0 */
import _ from 'lodash';


function withAssertions(asserts, fields) {
  return _.mapValues(fields, (field, key) => {
    const {
      assertions,
      resolve = (parent) => parent[key],
    } = field;

    if (_.isEmpty(assertions)) return field;

    return {
      ...field,
      resolve: async (data, args, context, info) => {
        const assertionResults = await _.chain(asserts)
          .pick(assertions)
          .reduce(async (memo, assert, assertKey) => {
            let result = _.get(data, `_assertionResults.${assertKey}`);

            if (!result) {
              try {
                await assert(data, args, context, info);
                result = true;
              } catch (err) {
                result = err;
              }
              _.set(data, `_assertionResults.${assertKey}`, result);
            }

            return {
              ...(await memo),
              [assertKey]: result,
            };
          }, Promise.resolve({}))
          .value();

        if (_.every(assertionResults, assertionResult => assertionResult !== true)) {
          throw assertionResults[0];
        }

        return resolve(data, args, context, info);
      },
    };
  });
}


export default withAssertions;
