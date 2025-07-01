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

import { screen, act } from '@testing-library/react';
import renderView from '../../__tests_helpers__/renderView';
import { changeInputValue, click } from '../../__tests_helpers__/jsDomHelpers';

import SendData from '../sendData';
import createExtensionBridge from '../../__tests_helpers__/createExtensionBridge';
import addQueryParamsToUrl from '../../utils/addQueryParamsToUrl';
import getRequestSettings from '../components/requestSection/getSettings';

let extensionBridge;
let nativeFetch;

beforeEach(() => {
  nativeFetch = window.fetch;

  window.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: 'ENced3ee3ef1504a758fc26ea34b604996',
              type: 'environments',
              attributes: {
                name: 'Production',
                status: 'succeeded',
                stage: 'production'
              },
              relationships: {
                adobe_certificate: {
                  links: {
                    related:
                      'https://reactor-engd.adobe.io/environments/ENced3ee3ef1504a758fc26ea34b604996/adobe_certificate',
                    self: 'https://reactor-engd.adobe.io/environments/ENced3ee3ef1504a758fc26ea34b604996/relationships/adobe_certificate'
                  },
                  data: null
                }
              }
            },
            {
              id: 'EN37a50054443e4d92867d38790b3432e5',
              type: 'environments',
              attributes: {
                name: 'Staging',
                status: 'succeeded',
                stage: 'staging'
              }
            },
            {
              id: 'EN341385718d3b4007ac810d2313b891d3',
              type: 'environments',
              attributes: {
                name: 'Development',
                status: 'succeeded',
                stage: 'development'
              }
            }
          ],
          included: [
            {
              id: 'CE5bf4cd1dd96c411db1f1f47bf72ab5e1',
              type: 'certificates',
              attributes: {
                created_at: '2025-04-04T21:46:53.286Z',
                expires_at: '2026-04-28T23:59:59.000Z',
                display_name: 'Adobe Development Certificate',
                stage: 'development',
                status: 'current',
                variable_name: 'ADOBE_MTLS_CERTIFICATE',
                version: 'a5fe5c03dbd346d3827e07b7fe76d1a3',
                updated_at: '2025-04-04T21:46:54.120Z'
              }
            }
          ],
          meta: {
            pagination: {
              current_page: 1,
              next_page: null,
              prev_page: null,
              total_pages: 1,
              total_count: 3
            }
          }
        })
    })
  );

  extensionBridge = createExtensionBridge();
  window.extensionBridge = extensionBridge;
});

afterEach(() => {
  delete window.extensionBridge;
  window.fetch = nativeFetch;
});

const getTextFieldByLabel = (label) => screen.getByLabelText(label);

const getFromFields = () => ({
  methodSelect: screen.getByLabelText(/method/i, { selector: 'button' }),
  environmentSelect: screen.queryByLabelText(/environment/i, {
    selector: 'button'
  }),
  configIdInput: screen.queryByLabelText(/config id/i),
  addAnotherButton: screen.queryByRole('button', { name: /add another/i }),
  queryParamsTab: screen.getByText(/query parameters/i, {
    selector: 'div[role="tablist"] span'
  }),
  headersTab: screen.getByText(/headers/i, {
    selector: 'div[role="tablist"] span'
  }),
  bodyTab: screen.queryByText(/^body$/i, {
    selector: 'div[role="tablist"] span'
  }),
  bodyRawInput: screen.queryByLabelText('Body (Raw)'),
  bodyRawCheckbox: screen.queryByLabelText('Raw'),
  bodyJsonCheckbox: screen.queryByLabelText('JSON Key-Value Pairs Editor'),
  saveResponseCheckbox: screen.queryByLabelText('Save the request response'),
  responseKeyInput: screen.queryByLabelText(/response key/i)
});

describe('Send data view', () => {
  test('sets form values from settings', async () => {
    renderView(SendData);

    await act(async () => {
      await extensionBridge.init({
        settings: {
          method: 'POST',
          url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc&a=b',
          headers: [
            {
              key: 'c',
              value: 'd'
            }
          ],
          body: {
            e: 'f'
          },
          responseKey: 'keyName'
        }
      });
    });

    const {
      methodSelect,
      environmentSelect,
      configIdInput,
      headersTab,
      bodyTab,
      responseKeyInput,
      saveResponseCheckbox
    } = getFromFields();

    expect(methodSelect).toHaveTextContent('POST');
    // The URL should be parsed correctly to production environment and UUID configId
    expect(environmentSelect).toHaveTextContent('Production');
    expect(configIdInput.value).toBe('12345678-1234-1234-1234-123456789abc');

    // Need to click query params tab since default is now body tab
    const { queryParamsTab } = getFromFields();
    await click(queryParamsTab);

    const queryKeyInput = getTextFieldByLabel('Query Param Key 0');
    const queryValueInput = getTextFieldByLabel('Query Param Value 0');

    expect(queryKeyInput.value).toBe('a');
    expect(queryValueInput.value).toBe('b');

    expect(responseKeyInput.value).toBe('keyName');
    expect(saveResponseCheckbox).toBeChecked();

    await click(headersTab);

    const headerKeyInput = getTextFieldByLabel('Header Key 0');
    const headerValueInput = getTextFieldByLabel('Header Value 0');

    expect(headerKeyInput.value).toBe('c');
    expect(headerValueInput.value).toBe('d');

    await click(bodyTab);

    const { bodyJsonCheckbox } = getFromFields();
    await click(bodyJsonCheckbox);

    const bodyKeyInput = getTextFieldByLabel('Body JSON Key 0');
    const bodyValueInput = getTextFieldByLabel('Body JSON Value 0');

    expect(bodyKeyInput.value).toBe('e');
    expect(bodyValueInput.value).toBe('f');
  });

  test('sets body raw form value from settings', async () => {
    renderView(SendData);

    await act(async () => {
      extensionBridge.init({
        settings: {
          method: 'POST',
          body: '{"e":"f"}'
        }
      });
    });

    const { bodyTab } = getFromFields();
    await click(bodyTab);

    const { bodyRawInput } = getFromFields();
    expect(bodyRawInput.value).toBe('{"e":"f"}');
  });

  test('URL construction works with existing URL patterns', async () => {
    renderView(SendData);

    // Test with production URL
    await act(async () => {
      extensionBridge.init({
        settings: {
          method: 'POST',
          url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc',
          headers: [{ key: 'c', value: 'd' }],
          body: { e: 'f' }
        }
      });
    });

    let settings = extensionBridge.getSettings();
    expect(settings.url).toBe(
      'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc'
    );
    expect(settings.method).toBe('POST');
  });

  test('URL construction works with pre-production URLs', async () => {
    renderView(SendData);

    // Test with pre-production URL
    await act(async () => {
      extensionBridge.init({
        settings: {
          method: 'POST',
          url: 'https://edge.adobedc.net/ee-pre-prod/v1/collect?configId=87654321-4321-4321-4321-ba9876543210',
          headers: [{ key: 'cc', value: 'dd' }],
          body: { ee: 'ff' },
          responseKey: 'keyName'
        }
      });
    });

    const settings = extensionBridge.getSettings();
    expect(settings.url).toBe(
      'https://edge.adobedc.net/ee-pre-prod/v1/collect?configId=87654321-4321-4321-4321-ba9876543210'
    );
    expect(settings.method).toBe('POST');
    expect(settings.headers).toEqual([{ key: 'cc', value: 'dd' }]);
    expect(settings.body).toEqual({ ee: 'ff' });
    expect(settings.responseKey).toBe('keyName');
  });

  test('preserves configId when adding query parameters', async () => {
    renderView(SendData);

    await act(async () => {
      extensionBridge.init({
        settings: {
          method: 'POST',
          url: 'https://edge.adobedc.net/ee-pre-prod/v1/collect?configId=87654321-4321-4321-4321-ba9876543210'
        }
      });
    });

    // Add query parameters and verify configId is preserved
    const { queryParamsTab } = getFromFields();
    await click(queryParamsTab);

    const queryKeyInput = getTextFieldByLabel('Query Param Key 0');
    const queryValueInput = getTextFieldByLabel('Query Param Value 0');

    await changeInputValue(queryKeyInput, 'testParam');
    await changeInputValue(queryValueInput, 'testValue');

    // Verify URL includes both configId and additional query params
    const settings = extensionBridge.getSettings();
    expect(settings.url).toBe(
      'https://edge.adobedc.net/ee-pre-prod/v1/collect?configId=87654321-4321-4321-4321-ba9876543210&testParam=testValue'
    );
  }, 10000);

  // Unit test for URL construction functions
  test('URL construction and query parameter handling work correctly', () => {
    // Test 1: Preserves configId when adding other params
    const originalUrl =
      'https://edge.adobedc.net/ee-pre-prod/v1/collect?configId=12345678-1234-1234-1234-123456789abc';
    const queryParams = [{ key: 'testParam', value: 'testValue' }];
    const result = addQueryParamsToUrl(originalUrl, queryParams);

    expect(result).toBe(
      'https://edge.adobedc.net/ee-pre-prod/v1/collect?configId=12345678-1234-1234-1234-123456789abc&testParam=testValue'
    );

    // Test 2: Handles multiple parameters
    const multipleParams = [
      { key: 'param1', value: 'value1' },
      { key: 'param2', value: 'value2' }
    ];
    const result2 = addQueryParamsToUrl(originalUrl, multipleParams);

    expect(result2).toBe(
      'https://edge.adobedc.net/ee-pre-prod/v1/collect?configId=12345678-1234-1234-1234-123456789abc&param1=value1&param2=value2'
    );

    // Test 3: getSettings constructs URL from baseUrlId and configId
    const settingsResult = getRequestSettings({
      method: 'POST',
      baseUrlId: 'pre-prod',
      configId: '87654321-4321-4321-4321-ba9876543210'
    });

    expect(settingsResult.url).toBe(
      'https://edge.adobedc.net/ee-pre-prod/v1/collect?configId=87654321-4321-4321-4321-ba9876543210'
    );
    expect(settingsResult.method).toBe('POST');
  });

  test('sets settings from body raw value', async () => {
    renderView(SendData);

    await act(async () => {
      extensionBridge.init({
        settings: {
          method: 'POST',
          body: '{"e":"f"}'
        }
      });
    });

    const { bodyTab } = getFromFields();
    await click(bodyTab);

    const { bodyRawInput } = getFromFields();
    await changeInputValue(bodyRawInput, '{{"ee":"ff"}');

    expect(extensionBridge.getSettings()).toEqual({
      method: 'POST',
      url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc',
      body: { ee: 'ff' }
    });
  });

  test('handles form validation correctly', async () => {
    renderView(SendData);

    await act(async () => {
      extensionBridge.init({
        settings: {
          method: 'POST',
          url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc&a=b',
          headers: [
            {
              key: 'c',
              value: 'd'
            }
          ],
          body: {
            e: 'f'
          }
        }
      });
    });

    const { headersTab, bodyTab, configIdInput } = getFromFields();

    // Check ConfigId input
    expect(configIdInput).not.toHaveAttribute('aria-invalid', 'true');

    // Check ConfigId empty case
    await changeInputValue(configIdInput, '');

    await act(async () => {
      extensionBridge.validate();
    });

    expect(configIdInput).toHaveAttribute('aria-invalid', 'true');

    // Test valid ConfigId
    await changeInputValue(
      configIdInput,
      '87654321-4321-4321-4321-ba9876543210'
    );

    await act(async () => {
      extensionBridge.validate();
    });

    expect(configIdInput).not.toHaveAttribute('aria-invalid', 'true');

    // Check HEADERS Section
    await click(headersTab);

    const { addAnotherButton } = getFromFields();
    await click(addAnotherButton);

    let headersKeyInput0 = getTextFieldByLabel('Header Key 0');
    let headersValueInput0 = getTextFieldByLabel('Header Value 0');

    const headersKeyInput1 = getTextFieldByLabel('Header Key 1');
    const headersValueInput1 = getTextFieldByLabel('Header Value 1');

    // Check fields are not already invalid.
    expect(headersKeyInput0).not.toHaveAttribute('aria-invalid');
    expect(headersValueInput0).not.toHaveAttribute('aria-invalid');
    expect(headersKeyInput1).not.toHaveAttribute('aria-invalid');
    expect(headersValueInput1).not.toHaveAttribute('aria-invalid');

    // Validate case when header key is empty and value is not.
    await changeInputValue(headersKeyInput0, '');

    await act(async () => {
      extensionBridge.validate();
    });

    headersKeyInput0 = getTextFieldByLabel('Header Key 0');
    headersValueInput0 = getTextFieldByLabel('Header Value 0');

    expect(headersKeyInput0).toHaveAttribute('aria-invalid', 'true');
    expect(headersValueInput0).not.toHaveAttribute('aria-invalid');

    // Check BODY Section
    await click(bodyTab);

    const { bodyJsonCheckbox } = getFromFields();
    await click(bodyJsonCheckbox);

    const { addAnotherButton: addAnotherButton2 } = getFromFields();
    await click(addAnotherButton2);

    let bodyJsonPairsKeyInput0 = getTextFieldByLabel('Body JSON Key 0');
    let bodyJsonPairsValueInput0 = getTextFieldByLabel('Body JSON Value 0');

    const bodyJsonPairsKeyInput1 = getTextFieldByLabel('Body JSON Key 1');
    const bodyJsonPairsValueInput1 = getTextFieldByLabel('Body JSON Value 1');

    // Check fields are not already invalid.
    expect(bodyJsonPairsKeyInput0).not.toHaveAttribute('aria-invalid');
    expect(bodyJsonPairsValueInput0).not.toHaveAttribute('aria-invalid');
    expect(bodyJsonPairsKeyInput1).not.toHaveAttribute('aria-invalid');
    expect(bodyJsonPairsValueInput1).not.toHaveAttribute('aria-invalid');

    // Validate case when header key is empty and value is not.
    await changeInputValue(bodyJsonPairsKeyInput0, '');

    await act(async () => {
      extensionBridge.validate();
    });

    bodyJsonPairsKeyInput0 = getTextFieldByLabel('Body JSON Key 0');
    bodyJsonPairsValueInput0 = getTextFieldByLabel('Body JSON Value 0');
    expect(bodyJsonPairsKeyInput0).toHaveAttribute('aria-invalid', 'true');
    expect(bodyJsonPairsValueInput0).not.toHaveAttribute('aria-invalid');
  }, 10000);

  test('validates configId UUID format correctly', async () => {
    renderView(SendData);

    await act(async () => {
      extensionBridge.init({
        settings: {
          method: 'POST',
          url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc'
        }
      });
    });

    const { configIdInput } = getFromFields();

    // Test 1: Empty configId value should show error
    await changeInputValue(configIdInput, '');

    await act(async () => {
      extensionBridge.validate();
    });

    expect(configIdInput).toHaveAttribute('aria-invalid', 'true');

    // Test 2: Invalid UUID format should show error
    await changeInputValue(configIdInput, 'invalid-uuid-format');

    await act(async () => {
      extensionBridge.validate();
    });

    expect(configIdInput).toHaveAttribute('aria-invalid', 'true');

    // Test 3: Valid UUID format should pass
    await changeInputValue(
      configIdInput,
      '599ca3ec-4a21-4659-8dff-e292ad8d5fa4'
    );

    await act(async () => {
      extensionBridge.validate();
    });

    expect(configIdInput).not.toHaveAttribute('aria-invalid', 'true');
  }, 15000);

  describe('query params editor', () => {
    test('allows you to add a new row', async () => {
      renderView(SendData);

      await act(async () => {
        extensionBridge.init({
          settings: {
            url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc&a=b'
          }
        });
      });

      // Need to click query params tab since default is now body tab
      const { queryParamsTab } = getFromFields();
      await click(queryParamsTab);

      const { addAnotherButton } = getFromFields();
      await click(addAnotherButton);

      const keyInput = getTextFieldByLabel('Query Param Key 1');
      const valueInput = getTextFieldByLabel('Query Param Value 1');

      await changeInputValue(keyInput, 'c');
      await changeInputValue(valueInput, 'd');

      expect(extensionBridge.getSettings()).toEqual({
        body: {
          events: [
            {
              xdm: {
                eventType: '{{xdm.eventType}}',
                timestamp: '{{xdm.timestamp}}',
                identityMap: '{{xdm.identityMap}}'
              }
            }
          ]
        },
        method: 'POST',
        url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc&a=b&c=d'
      });
    });

    test('allows you to delete a row', async () => {
      renderView(SendData);

      await act(async () => {
        extensionBridge.init({
          settings: {
            url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc&a=b&c=d'
          }
        });
      });

      // Need to click query params tab since default is now body tab
      const { queryParamsTab } = getFromFields();
      await click(queryParamsTab);

      const deleteButton = getTextFieldByLabel('Delete Query Param 1');
      await click(deleteButton);

      expect(extensionBridge.getSettings()).toEqual({
        body: {
          events: [
            {
              xdm: {
                eventType: '{{xdm.eventType}}',
                timestamp: '{{xdm.timestamp}}',
                identityMap: '{{xdm.identityMap}}'
              }
            }
          ]
        },
        method: 'POST',
        url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc&a=b'
      });
    });
  });

  describe('headers editor', () => {
    test('allows you to add a new row', async () => {
      renderView(SendData);

      await act(async () => {
        extensionBridge.init({
          settings: {
            method: 'POST',
            url: '',
            headers: [
              {
                key: 'a',
                value: 'b'
              }
            ]
          }
        });
      });

      const { headersTab } = getFromFields();
      await click(headersTab);

      const { addAnotherButton } = getFromFields();
      await click(addAnotherButton);

      const keyInput = getTextFieldByLabel('Header Key 1');
      const valueInput = getTextFieldByLabel('Header Value 1');

      await changeInputValue(keyInput, 'c');
      await changeInputValue(valueInput, 'd');

      expect(extensionBridge.getSettings()).toEqual({
        method: 'POST',
        url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc',
        headers: [
          {
            key: 'a',
            value: 'b'
          },
          {
            key: 'c',
            value: 'd'
          }
        ],
        body: {
          events: [
            {
              xdm: {
                eventType: '{{xdm.eventType}}',
                timestamp: '{{xdm.timestamp}}',
                identityMap: '{{xdm.identityMap}}'
              }
            }
          ]
        }
      });
    });

    test('allows you to delete a row', async () => {
      renderView(SendData);

      await act(async () => {
        extensionBridge.init({
          settings: {
            method: 'POST',
            url: '',
            headers: [
              {
                key: 'a',
                value: 'b'
              },
              {
                key: 'c',
                value: 'd'
              }
            ]
          }
        });
      });

      const { headersTab } = getFromFields();
      await click(headersTab);

      const deleteButton = getTextFieldByLabel('Delete Header 1');
      await click(deleteButton);

      expect(extensionBridge.getSettings()).toEqual({
        method: 'POST',
        url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc',
        headers: [
          {
            key: 'a',
            value: 'b'
          }
        ],
        body: {
          events: [
            {
              xdm: {
                eventType: '{{xdm.eventType}}',
                timestamp: '{{xdm.timestamp}}',
                identityMap: '{{xdm.identityMap}}'
              }
            }
          ]
        }
      });
    });
  });

  describe('body editor', () => {
    test('allows you to add a new row', async () => {
      renderView(SendData);

      await act(async () => {
        extensionBridge.init({
          settings: {
            method: 'POST',
            url: '',
            body: {
              a: 'b'
            }
          }
        });
      });

      const { bodyTab } = getFromFields();
      await click(bodyTab);

      const { bodyJsonCheckbox } = getFromFields();
      await click(bodyJsonCheckbox);

      const { addAnotherButton } = getFromFields();
      await click(addAnotherButton);

      const keyInput = getTextFieldByLabel('Body JSON Key 1');
      const valueInput = getTextFieldByLabel('Body JSON Value 1');

      await changeInputValue(keyInput, 'c');
      await changeInputValue(valueInput, 'd');

      expect(extensionBridge.getSettings()).toEqual({
        method: 'POST',
        url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc',
        body: {
          a: 'b',
          c: 'd'
        }
      });
    });

    test('allows you to delete a row', async () => {
      renderView(SendData);

      await act(async () => {
        extensionBridge.init({
          settings: {
            method: 'POST',
            url: '',
            body: {
              a: 'b',
              c: 'd'
            }
          }
        });
      });

      const { bodyTab } = getFromFields();
      await click(bodyTab);

      const { bodyJsonCheckbox } = getFromFields();
      await click(bodyJsonCheckbox);

      const deleteButton = getTextFieldByLabel('Delete Body JSON 1');
      await click(deleteButton);

      expect(extensionBridge.getSettings()).toEqual({
        method: 'POST',
        url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc',
        body: {
          a: 'b'
        }
      });
    });

    test('returns the same JSON data when changing editor modes', async () => {
      renderView(SendData);

      await act(async () => {
        extensionBridge.init({
          settings: {
            method: 'POST',
            url: '',
            body: {
              a: 'b',
              c: 'd'
            }
          }
        });
      });

      const { bodyTab } = getFromFields();
      await click(bodyTab);

      const { bodyJsonCheckbox } = getFromFields();
      await click(bodyJsonCheckbox);

      expect(extensionBridge.getSettings()).toEqual({
        method: 'POST',
        url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc',
        body: { a: 'b', c: 'd' }
      });
    });

    test('does not lose the non JSON raw body when switching editor modes', async () => {
      renderView(SendData);

      await act(async () => {
        extensionBridge.init({
          settings: {
            method: 'POST',
            url: '',
            body: '{a:"b",c:"d"}a'
          }
        });
      });

      const { bodyTab } = getFromFields();
      await click(bodyTab);

      const { bodyJsonCheckbox } = getFromFields();
      await click(bodyJsonCheckbox);

      expect(extensionBridge.getSettings()).toEqual({
        method: 'POST',
        url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc'
      });

      const { bodyRawCheckbox } = getFromFields();
      await click(bodyRawCheckbox);

      expect(extensionBridge.getSettings()).toEqual({
        method: 'POST',
        url: 'https://edge.adobedc.net/ee/v1/collect?configId=12345678-1234-1234-1234-123456789abc',
        body: '{a:"b",c:"d"}a'
      });
    });
  });
});
