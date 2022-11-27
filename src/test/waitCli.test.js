import { jest } from '@jest/globals';

let consoleError;

const yargsMethodMock = jest.fn().mockImplementation(() => {
    return yargsMock();
});

let yargsMethodArgvMock = yargsMethodMock;

const yargsMock = jest.fn().mockImplementation(() => {
    return {
        option: yargsMethodMock,
        help: yargsMethodMock,
        alias: yargsMethodMock,
        argv: yargsMethodArgvMock
    }
});

jest.unstable_mockModule('yargs', () => {
    return { default: yargsMock };
});

const yargsHelpersHideBinMock = jest.fn();
jest.unstable_mockModule('yargs/helpers', () => {
    return { hideBin: yargsHelpersHideBinMock }
});

const fetchMock = jest.fn();
jest.unstable_mockModule('node-fetch', () => {
    return { default: fetchMock };
});

beforeAll(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {
        // Empty mock.
    });
});

test('CLI Test - failing', async () => {
    expect(process.exitCode).toBeFalsy();
    await import('../waitCli.mjs');
    expect(console.error).toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
});

test('CLI Test - passing', async () => {
    yargsMethodArgvMock = jest.fn().mockImplementation(() => {
        return {
            application: 'https://www.example.com'
        }
    });
    expect(process.exitCode).toBeFalsy();
    await import('../waitCli.mjs');
    expect(process.exitCode).toBeFalsy();
});

afterEach(() => {
    consoleError.mockClear();
    process.exitCode = 0;
});

afterAll(() => {
    consoleError.mockReset();
});

