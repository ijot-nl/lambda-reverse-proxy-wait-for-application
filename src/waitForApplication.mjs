/*
 * Copyright 2022 IJoT B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import fetch from 'node-fetch';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers';
import { setTimeout } from 'timers/promises';

const TEN_SECONDS_IN_MS = 10 * 1000;

const argv = yargs(hideBin(process.argv))
    .option('application', {
        alias: 'a',
        description: 'Client-facing URL of application served by the Lambda Reverse Proxy. e.g. https://myapplication.mydomain.com',
        type: 'string'
    })
    .option('verbose', {
        alias: 'v',
        description: 'Run with verbose logging.',
        type: 'boolean'
    })
    .demandOption('application')
    .help()
    .alias('help', 'h')
    .argv;

async function waitForApplication() {
    let response;
    do {
        response = await fetch(argv.application);
        if (response.status >= 400) {
            if (argv.verbose) {
                console.log('Application: ' + argv.application + ' is not ready. Retrying in 10s.');
            }
            await setTimeout(TEN_SECONDS_IN_MS);
        }
    } while (response.status >= 400);

    if (argv.verbose) {
        console.log('Application: ' + argv.application + ' is ready');
    }
}

waitForApplication();
