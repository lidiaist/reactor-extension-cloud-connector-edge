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
    url: 'https://edge.adobedc.net/ee/v1/collect'
  },
  {
    id: 'pre-prod',
    url: 'https://edge.adobedc.net/ee-pre-prod/v1/collect'
  }
];

const parseUrl = (url) => {
  if (!url) {
    return {
      baseUrlId: 'production',
      configId: '12345678-1234-1234-1234-123456789abc'
    };
  }

  // Try to match against known base URLs
  for (const option of BASE_URL_OPTIONS) {
    if (url.startsWith(option.url)) {
      const urlObj = new URL(url);
      const configId =
        urlObj.searchParams.get('configId') ||
        '12345678-1234-1234-1234-123456789abc';

      return {
        baseUrlId: option.id,
        configId
      };
    }
  }

  // If URL doesn't match known patterns, default to production
  // and try to extract configId if it's in query params
  try {
    const urlObj = new URL(url);
    const configId =
      urlObj.searchParams.get('configId') ||
      '12345678-1234-1234-1234-123456789abc';

    return {
      baseUrlId: 'production',
      configId
    };
  } catch {
    // If URL is invalid, use defaults
    return {
      baseUrlId: 'production',
      configId: '12345678-1234-1234-1234-123456789abc'
    };
  }
};

export default ({ settings }) => {
  const defaultUrl =
    settings?.url ||
    'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc';
  const { baseUrlId, configId } = parseUrl(defaultUrl);

  return {
    method: settings?.method || 'POST',
    url: defaultUrl,
    baseUrlId,
    configId
  };
};
