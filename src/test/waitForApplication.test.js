import { jest } from '@jest/globals';

const fetchMock = jest.fn();
jest.unstable_mockModule('node-fetch', () => {
    return { default: fetchMock };
});

const { waitForApplication } = await import('../waitForApplication.mjs');

const DEFAULT_URL = "https://www.example.com";

let consoleLog;
let consoleError;

beforeAll(() => {
    consoleLog = jest.spyOn(console, "log").mockImplementation(() => {
        // Empty mock.
    });
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {
        // Empty mock.
    });
});

test('Verbose Test', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ status: 200 }));

    await waitForApplication({
        application: DEFAULT_URL,
        verbose: true
    });

    expect(consoleLog).toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_URL);
});

test('Not Verbose Test', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ status: 200 }));

    await waitForApplication({
        application: DEFAULT_URL,
        verbose: false
    });

    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_URL);
});

test('Not Verbose (default)', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ status: 200 }));

    await waitForApplication({
        application: DEFAULT_URL,
    });

    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_URL);
});

test('Ready 2nd time', async () => {
    fetchMock
        .mockReturnValueOnce(Promise.resolve({ status: 400 }))
        .mockReturnValueOnce(Promise.resolve({ status: 200 }));

    await waitForApplication({
        application: DEFAULT_URL,
        retry: 1
    });

    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_URL);
});

test('Timeout', async () => {
    fetchMock
        .mockReturnValueOnce(Promise.resolve({ status: 400 }))
        .mockReturnValueOnce(Promise.resolve({ status: 400 }));

    await expect(waitForApplication({
        application: DEFAULT_URL,
        retry: 1,
        timeout: 1
    })).rejects.toThrow();

    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_URL);
});

test('No appliction defined', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ status: 200 }));

    await expect(waitForApplication({
    })).rejects.toThrow();
});

test('No appliction defined 2', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ status: 200 }));

    await expect(waitForApplication({
        application: ''
    })).rejects.toThrow();
});

afterEach(() => {
    consoleLog.mockClear();
    consoleError.mockClear();
    fetchMock.mockClear();
});

afterAll(() => {
    consoleLog.mockReset();
    consoleError.mockReset();
    fetchMock.mockReset();
});