#!/usr/bin/env node
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

const argv = yargs(hideBin(process.argv))
    .option('application', {
        alias: 'a',
        description: 'Client-facing URL of application served by the Lambda Reverse Proxy. e.g. https://myapplication.mydomain.com',
        type: 'string',
        demandOption: true
    })
    .option('verbose', {
        alias: 'v',
        description: 'Run with verbose logging.',
        type: 'boolean',
        default: false
    })
    .option('retry', {
        alias: 'r',
        descrtiption: 'Retry interval in seconds.',
        type: 'number',
        default: 10
    })
    .option('timeout', {
        alias: 't',
        description: 'Timeout in seconds',
        type: 'number',
        default: 2500
    })
    .help()
    .alias('help', 'h')
    .argv;

/**
 * Wait for a service to be up and ready.
 * An HTTP response of 400 or more is assumed to be a temporary failure.
 * An HTTP response of 399 ot lower is assumed to be ready.
 * 
 * @param: {Object} parameters - Parameters from the command line.
 * @param: {string} parameters.application - The URL of the service e.g. https://myapplication.mydomain.com
 * @param: {boolean} parameters.verbose - Run with verbose logging.parameters
 * @param: {number} parameters.retry - Retry interval (seconds)
 * @param: {number} parameters.timeout - Timeout interval (seconds)
 * 
 */
async function waitForApplication(parameters) {
    logIfVerboseLoggingEnabled(parameters.verbose, 'Waiting for: ' + parameters.application);
    logIfVerboseLoggingEnabled(parameters.verbose, 'Retry interval (seconds): ' + parameters.retry);
    logIfVerboseLoggingEnabled(parameters.verbose, 'Timeout interval (seconds): ' + parameters.timeout);

    let timeout = Date.now() + parameters.timeout * 1000;
    let response;
    do {
        response = await fetch(parameters.application);
        if (response.status >= 400) {
            logIfVerboseLoggingEnabled(parameters.verbose, 'Application: ' + parameters.application + ' is not ready. Retrying in ' + parameters.retry + 's.');
            if (Date.now() > timeout) {
                console.error('Application did not become ready within the timeout period (' + parameters.timeout + 's). Aborting.');
                process.exitCode = 1;
            } else {
                await setTimeout(parameters.retry * 1000);
            }
        } else {
            logIfVerboseLoggingEnabled(parameters.verbose, 'Application: ' + parameters.application + ' is ready');
        }
    } while (response.status >= 400 && !process.exitCode);
}

/**
 * Logs a message to the console, if verbose logging is enabled.
 * 
 * @param: {boolean} verbose - Verbose logging enabled if true.
 * @param: {*} message - The message to be logged.
 * 
 */
function logIfVerboseLoggingEnabled(verbose, message) {
    if (verbose) {
        console.log(message);
    }
}

waitForApplication(argv);

export default waitForApplication;
