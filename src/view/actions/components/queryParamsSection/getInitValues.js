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

import getEmptyQueryParam from './getEmptyValue';
import getQueryParamsFromUrl from '../../../utils/getQueryParamsFromUrl';

export default ({ settings }) => {
  const allQueryParams = getQueryParamsFromUrl(settings?.url);

  // Filter out configId since it's handled separately in the request section
  const queryParams = allQueryParams.filter(
    (param) => param.key !== 'configId'
  );

  if (queryParams.length === 0) {
    // Add empty row for additional parameters
    queryParams.push(getEmptyQueryParam());
  }

  return {
    queryParams
  };
};
