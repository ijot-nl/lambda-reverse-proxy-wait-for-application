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
import { setTimeout } from 'timers/promises';

const DEFAULT_RETRY_INTERVAL = 10;
const DEFAULT_TIMEOUT_INTERVAL = 2500;

const ONE_SECOND_IN_MS = 1000;
const HTTP_400_BAD_REQUEST = 400;

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
 * @throws: Will throw an error if application parameter is missing, or if a timeout occurs.
 * 
 */
async function waitForApplication(parameters) {
    const verbose = parameters.verbose;
    const retryInterval = parameters.retry ? parameters.retry : DEFAULT_RETRY_INTERVAL;
    const timeoutInterval = parameters.timeout ? parameters.timeout : DEFAULT_TIMEOUT_INTERVAL;
    const application = parameters.application;

    if (!application) {
        const message = 'Application not defined. Aborting.'
        console.error(message);
        throw new Error(message);
    }

    logIfVerboseLoggingEnabled(verbose, 'Waiting for: ' + application);
    logIfVerboseLoggingEnabled(verbose, 'Retry interval (seconds): ' + retryInterval);
    logIfVerboseLoggingEnabled(verbose, 'Timeout interval (seconds): ' + timeoutInterval);

    let timeout = performance.now() + timeoutInterval * ONE_SECOND_IN_MS;
    let response;
    do {
        response = await fetch(application);
        if (response.status >= HTTP_400_BAD_REQUEST) {
            logIfVerboseLoggingEnabled(verbose, 'Application: ' + application + ' is not ready. Retrying in ' + retryInterval + 's.');
            if (performance.now() > timeout) {
                const message = 'Application did not become ready within the timeout period (' + timeoutInterval + 's). Aborting.'
                console.error(message);
                throw new Error(message);
            } else {
                await setTimeout(retryInterval * ONE_SECOND_IN_MS);
            }
        } else {
            logIfVerboseLoggingEnabled(verbose, 'Application: ' + application + ' is ready');
        }
    } while (response.status >= HTTP_400_BAD_REQUEST);
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

export { waitForApplication, DEFAULT_RETRY_INTERVAL, DEFAULT_TIMEOUT_INTERVAL };
export default waitForApplication;
