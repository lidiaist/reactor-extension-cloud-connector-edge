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

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Flex, Heading, Picker, Item, View } from '@adobe/react-spectrum';

import WrappedTextField from '../../../components/wrappedTextField';

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

const constructUrl = (baseUrlId, configId, queryParams = []) => {
  const baseUrlOption = BASE_URL_OPTIONS.find(
    (option) => option.id === baseUrlId
  );
  if (!baseUrlOption || !configId) return '';

  let url = `${baseUrlOption.url}?configId=${configId}`;

  // Add additional query parameters
  queryParams.forEach((param) => {
    if (param.key && param.key !== 'configId') {
      url += `&${encodeURIComponent(param.key)}=${encodeURIComponent(param.value || '')}`;
    }
  });

  return url;
};

export default function RequestSectionFields({ onMethodUpdate }) {
  const { setValue, control, watch } = useFormContext();

  const baseUrlId = watch('baseUrlId');
  const configId = watch('configId');
  const queryParamsRaw = watch('queryParams');

  const queryParams = React.useMemo(
    () => queryParamsRaw || [],
    [queryParamsRaw]
  );

  // Update the full URL whenever baseUrlId, configId, or queryParams change
  React.useEffect(() => {
    if (baseUrlId && configId) {
      const fullUrl = constructUrl(baseUrlId, configId, queryParams);
      setValue('url', fullUrl, { shouldValidate: true });
    }
  }, [baseUrlId, configId, queryParams, setValue]);

  return (
    <>
      <Heading level="3">Request</Heading>

      <Flex gap="size-100" width="100%">
        <Controller
          control={control}
          name="method"
          defaultValue=""
          render={({ field: { onChange, onBlur, value } }) => (
            <Picker
              label="Method"
              minWidth="size-2000"
              isRequired
              necessityIndicator="label"
              selectedKey={value}
              items={[
                {
                  id: 'POST',
                  name: 'POST'
                }
              ]}
              onSelectionChange={(v) => {
                onChange(v);
                onMethodUpdate(v);
              }}
              onBlur={onBlur}
            >
              {(item) => <Item>{item.name}</Item>}
            </Picker>
          )}
        />

        <View flex>
          <Flex gap="size-100" width="100%">
            <Controller
              control={control}
              name="baseUrlId"
              defaultValue="production"
              render={({ field: { onChange, onBlur, value } }) => (
                <Picker
                  label="Environment"
                  minWidth="size-2000"
                  isRequired
                  necessityIndicator="label"
                  selectedKey={value}
                  items={BASE_URL_OPTIONS}
                  onSelectionChange={onChange}
                  onBlur={onBlur}
                >
                  {(item) => <Item>{item.name}</Item>}
                </Picker>
              )}
            />

            <View flex>
              <WrappedTextField
                minWidth="size-2000"
                width="100%"
                name="configId"
                label="Config ID"
                isRequired
                necessityIndicator="label"
                description="Enter the configuration ID for the Edge Network."
                supportDataElement
              />
            </View>
          </Flex>
        </View>
      </Flex>

      {/* Hidden field to store the constructed URL */}
      <Controller
        control={control}
        name="url"
        defaultValue=""
        render={() => null}
      />
    </>
  );
}
