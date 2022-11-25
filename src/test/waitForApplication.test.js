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
});

test('Verbose Test', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ status: 200 }));
    await waitForApplication({
        application: "https://www.example.com",
        verbose: true
    });
    expect(consoleLog).toHaveBeenCalled();
});

test('Not Verbose Test', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ status: 200 }));
    await waitForApplication({
        application: "https://www.example.com",
        verbose: false
    });
    expect(consoleLog).not.toHaveBeenCalled();
});

test('Not Verbose (default)', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ status: 200 }));
    await waitForApplication({
        application: "https://www.example.com"
    });
    expect(consoleLog).not.toHaveBeenCalled();
});

test('Ready 2nd time', async () => {
    fetchMock
        .mockReturnValueOnce(Promise.resolve({ status: 400 }))
        .mockReturnValueOnce(Promise.resolve({ status: 200 }));
    const promise = waitForApplication({
        application: "https://www.example.com",
        retry: 1
    });
    await promise;
})

afterEach(() => {
    consoleLog.mockClear();
    fetchMock.mockClear();
});

afterAll(() => {
    consoleLog.mockReset();
    fetchMock.mockReset();
});