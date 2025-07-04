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

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const changePickerValue = async (pickerTrigger, value) => {
  // Use userEvent for more realistic interaction
  await userEvent.click(pickerTrigger);

  // Alternative: try keyboard interaction if click doesn't work
  if (pickerTrigger.getAttribute('aria-expanded') === 'false') {
    await userEvent.type(pickerTrigger, '{arrowdown}');
  }

  // Wait for the dropdown to open and options to be available
  await waitFor(
    async () => {
      const options = await screen.findAllByRole('option');
      if (options.length === 0) {
        throw new Error('Options not loaded yet');
      }
    },
    { timeout: 3000 }
  );

  const option = await screen.findByRole('option', { name: value });
  await userEvent.click(option);

  // Wait for the picker to close and value to be selected
  await waitFor(
    () => {
      if (pickerTrigger.getAttribute('aria-expanded') === 'true') {
        throw new Error('Picker still open');
      }
    },
    { timeout: 2000 }
  );
};

export const changeInputValue = async (input, value) => {
  await userEvent.clear(input);
  if (value) {
    await userEvent.type(input, value);
  }
};

export const click = async (newTab) => {
  await userEvent.click(newTab);
};
