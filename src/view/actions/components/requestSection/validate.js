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

export default ({ url, baseUrlId, configId }) => {
  const errors = {};

  // Validate baseUrlId
  if (!baseUrlId) {
    errors.baseUrlId = 'Please select an environment';
  }

  // Validate configId
  if (!configId) {
    errors.configId = 'Please provide a Config ID';
  } else if (typeof configId === 'string' && configId.trim() === '') {
    errors.configId = 'Please provide a Config ID';
  } else {
    // Check UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(configId.trim())) {
      errors.configId =
        'Config ID must be a valid UUID format (e.g., 12345678-1234-1234-1234-123456789abc)';
    }
  }

  // Validate the constructed URL if we have both components
  if (
    url &&
    !url.match(
      /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]+\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
    )
  ) {
    errors.url = 'Invalid URL constructed from environment and Config ID';
  }

  return errors;
};
