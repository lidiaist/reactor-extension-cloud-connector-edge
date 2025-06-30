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

export default ({ queryParams = [] }) => {
  const errors = {};

  // Check if configId parameter exists and has a value
  const configIdParam = queryParams.find((param) => param.key === 'configId');

  if (!configIdParam) {
    errors.queryParams = 'configId query parameter is required';
  } else if (!configIdParam.value || configIdParam.value.trim() === '') {
    errors[`queryParams.${queryParams.indexOf(configIdParam)}.value`] =
      'configId value is required';
  } else {
    // Validate configId format (UUID format: 599ca3ec-4a21-4659-8dff-e292ad8d5fa4)
    // Also allow data element tokens like {{configId}}
    const configIdValue = configIdParam.value.trim();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const dataElementRegex = /^{{.+}}$/;

    if (
      !uuidRegex.test(configIdValue) &&
      !dataElementRegex.test(configIdValue)
    ) {
      errors[`queryParams.${queryParams.indexOf(configIdParam)}.value`] =
        'configId must be a valid UUID format (e.g., 599ca3ec-4a21-4659-8dff-e292ad8d5fa4) or a data element (e.g., {{configId}})';
    }
  }

  return errors;
};
