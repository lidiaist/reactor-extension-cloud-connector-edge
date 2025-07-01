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

const tokenPattern = /{{([^}]+)}}/;

const containsDataElementToken = (value) => tokenPattern.test(value);

const encodeUriComponentWithToken = (value) => {
  let res;
  let result = '';

  while ((res = RegExp(tokenPattern).exec(value)) !== null) {
    const tokenStartIndex = value.indexOf(res[0]);

    const stringInFrontOfToken = value.substr(0, tokenStartIndex);

    if (stringInFrontOfToken) {
      result += encodeURIComponent(stringInFrontOfToken);
    }

    result += `{{${res[1]}}}`;

    value = value.substring(tokenStartIndex + res[0].length);
  }

  if (value) {
    result += encodeURIComponent(value);
  }

  return result;
};

export default (url, queryParamsArray) => {
  // Extract existing query parameters to preserve configId
  let configId = '';
  let baseUrl = url;

  if (url.includes('?')) {
    const [urlPart, queryPart] = url.split('?');
    baseUrl = urlPart;

    // Extract configId from existing query parameters
    const existingParams = new URLSearchParams(queryPart);
    configId = existingParams.get('configId');
  }

  let queryParams = '';
  let i = 0;

  // Add configId first if it exists
  if (configId) {
    queryParams += `?configId=${encodeURIComponent(configId)}`;
    i = 1;
  }

  // Add other query parameters
  if (queryParamsArray.length > 0) {
    queryParamsArray.forEach((q) => {
      if (q.key && q.key !== 'configId') {
        // Skip configId as it's already added
        queryParams += `${i === 0 ? '?' : '&'}${
          containsDataElementToken(q.key)
            ? encodeUriComponentWithToken(q.key)
            : encodeURIComponent(q.key)
        }=${
          containsDataElementToken(q.value)
            ? encodeUriComponentWithToken(q.value)
            : encodeURIComponent(q.value)
        }`;
        i += 1;
      }
    });
  }

  return baseUrl + queryParams;
};
