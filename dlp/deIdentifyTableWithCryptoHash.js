// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// sample-metadata:
//  title: Deidentifying the table data with crypto key defined.
//  description: Uses the Data Loss Prevention API to Deidentifying the table data with crypto key defined.
//  usage: node deIdentifyTableWithCryptoHash.js projectId, transientKey
function main(projectId, transientKey) {
  // [START dlp_deidentify_table_with_crypto_hash]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // Crypto key
  // const transientKey = 'YOUR_TRANSIENT_CRYPTO_KEY';

  // The table to de-identify.
  const tableToDeIdentify = {
    headers: [{name: 'userid'}, {name: 'comments'}],
    rows: [
      {
        values: [
          {stringValue: 'user1@example.org'},
          {
            stringValue:
              'my email is user1@example.org and phone is 858-555-0222',
          },
        ],
      },
      {
        values: [
          {stringValue: 'user2@example.org'},
          {
            stringValue:
              'my email is user2@example.org and phone is 858-555-0223',
          },
        ],
      },
      {
        values: [
          {stringValue: 'user3@example.org'},
          {
            stringValue:
              'my email is user3@example.org and phone is 858-555-0224',
          },
        ],
      },
    ],
  };
  async function deIdentifyTableWithCryptoHash() {
    // Specify crypto hash configuration that uses transient key.
    const cryptoHashConfig = {
      cryptoKey: {
        transient: {
          name: transientKey,
        },
      },
    };

    // Construct de-identify request that uses crypto hash configuration.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        infoTypeTransformations: {
          transformations: [
            {
              primitiveTransformation: {
                cryptoHashConfig: cryptoHashConfig,
              },
              infoTypes: [{name: 'PHONE_NUMBER'}, {name: 'EMAIL_ADDRESS'}],
            },
          ],
        },
      },
      item: {table: tableToDeIdentify},
    };

    // Send the request and receive response from the service.
    const [response] = await dlp.deidentifyContent(request);
    const deidentifiedTable = response.item.table;

    // Print the results.
    console.log(
      `Table after de-identification:\n${JSON.stringify(
        deidentifiedTable,
        null,
        2
      )}`
    );
  }

  deIdentifyTableWithCryptoHash();
  // [END dlp_deidentify_table_with_crypto_hash]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
