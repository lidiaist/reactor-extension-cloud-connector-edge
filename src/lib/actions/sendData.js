/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const byteArrayToString = (buf) =>
  new TextDecoder('utf-8').decode(new Uint8Array(buf));

module.exports = ({
  arc: { ruleStash = {} },
  utils: { fetch, mtlsFetch, getSettings }
}) => {
  let headers = {};

  const settings = getSettings();
  const { url, headers: settingsHeaders, method, responseKey } = settings;
  let { body, useMtls = false } = settings;

  // Debug logging
  console.log('🔍 Event Forwarding Debug:', {
    url,
    method,
    headers: settingsHeaders,
    body: typeof body === 'string' ? body : JSON.stringify(body, null, 2),
    useMtls,
    responseKey
  });

  // Use native fetch if Adobe fetch utilities are not available
  const fetchFunction = useMtls ? mtlsFetch || fetch : fetch || global.fetch;

  // Fallback to native fetch if Adobe utilities fail
  if (!fetchFunction) {
    throw new Error(
      'No fetch function available. Please check your Event Forwarding configuration.'
    );
  }

  if (settingsHeaders && settingsHeaders.length > 0) {
    headers = settingsHeaders.reduce((accumulator, o) => {
      accumulator[o.key] = o.value;
      return accumulator;
    }, {});
  }

  if (typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  const fetchOptions = {
    method,
    body,
    headers
  };

  return fetchFunction(url, fetchOptions)
    .then((r) => {
      // Debug response
      console.log('✅ Request sent successfully:', {
        status: r.status,
        statusText: r.statusText,
        url: r.url
      });

      const accRuleStash = ruleStash['data-sharing-at-the-edge'] || {
        responses: {}
      };

      if (responseKey) {
        return r
          .arrayBuffer()
          .then(byteArrayToString)
          .then((bodyResponse) => {
            accRuleStash.responses[responseKey] = bodyResponse;
            return accRuleStash;
          });
      }

      return accRuleStash;
    })
    .catch((error) => {
      // Debug errors
      console.error('❌ Event Forwarding Error:', {
        message: error.message,
        stack: error.stack,
        url,
        method,
        body
      });
      throw error;
    });
};
