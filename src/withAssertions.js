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
      resolve: async (data, info, context) => {
        const assertionResults = await _.chain(asserts)
          .pick(assertions)
          .reduce(async (memo, assert, assertKey) => {
            let result = _.get(data, `_assertionResults.${assertKey}`);

            if (!result) {
              try {
                await assert(data, info, context);
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

        _.each(assertionResults, assertionResult => {
          if (assertionResult !== true) {
            throw assertionResult;
          }
        });

        return resolve(data, info, context);
      },
    };
  });
}


export default withAssertions;
