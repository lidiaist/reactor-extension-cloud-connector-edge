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

const BASE_URL_OPTIONS = [
  {
    id: 'production',
    name: 'Production',
    url: 'https://edge.adobedc.net/ee/v1/collect'
  },
  {
    id: 'pre-prod',
    name: 'Pre-Production',
    url: 'https://edge.adobedc.net/ee-pre-prod/v1/collect'
  }
];

const constructUrl = (baseUrlId, configId) => {
  const baseUrlOption = BASE_URL_OPTIONS.find(
    (option) => option.id === baseUrlId
  );
  if (!baseUrlOption || !configId) return '';

  return `${baseUrlOption.url}?configId=${configId}`;
};

export default ({ method, url, baseUrlId, configId }) => {
  // If no URL is provided but we have baseUrlId and configId, construct it
  let finalUrl = url;
  if (!url && baseUrlId && configId) {
    finalUrl = constructUrl(baseUrlId, configId);
  }

  // Return only the essential properties needed for action execution
  // baseUrlId and configId are internal form management properties
  // and shouldn't be part of the final action settings
  return {
    method,
    url: finalUrl
  };
};
