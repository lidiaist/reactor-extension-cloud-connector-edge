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

export default ({ settings }) => {
  let bodyRaw = settings?.body || '';

  if (typeof bodyRaw === 'object') {
    bodyRaw = JSON.stringify(bodyRaw, null, 2);
  }

  // If no settings exist (new action), provide default XDM event structure
  const defaultBody = {
    events: [
      {
        xdm: {
          eventType: '{{xdm.eventType}}',
          timestamp: '{{xdm.timestamp}}',
          identityMap: '{{xdm.identityMap}}'
          // Add additional fields from your XDM data element
          // Example: web: '{{xdm.web}}', commerce: '{{xdm.commerce}}'
        }
      }
    ]
  };

  return {
    bodyType: 'raw',
    bodyRaw: bodyRaw || JSON.stringify(defaultBody, null, 2),
    bodyJsonPairs: []
  };
};
