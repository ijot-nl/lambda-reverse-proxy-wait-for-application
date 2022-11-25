import { jest } from '@jest/globals';

const fetchMock = jest.fn();
jest.unstable_mockModule('node-fetch', () => {
    return { default: fetchMock };
});

const { waitForApplication } = await import('../waitForApplication.mjs');

let consoleLog;

beforeAll(() => {
    consoleLog = jest.spyOn(console, "log").mockImplementation(() => {
        // Empty mock.
    });
    fetchMock.mockReturnValue(Promise.resolve({ status: 200 }));
});

test('Verbose Test', async () => {
    await waitForApplication({
        application: "https://www.example.com",
        verbose: true
    });
    expect(consoleLog).toHaveBeenCalled();
});

test('Not Verbose Test', async () => {
    await waitForApplication({
        application: "https://www.example.com",
        verbose: false
    });
    expect(consoleLog).not.toHaveBeenCalled();
});

test('Not Verbose (default)', async () => {
    await waitForApplication({
        application: "https://www.example.com"
    });
    expect(consoleLog).not.toHaveBeenCalled();
});

afterEach(() => {
    consoleLog.mockClear();
    fetchMock.mockClear();
});

afterAll(() => {
    consoleLog.mockReset();
    fetchMock.mockReset();
});