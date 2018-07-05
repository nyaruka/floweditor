export const ActivityManager = jest.fn().mockImplementation(() => {
    return {
        clearSimulation: jest.fn(),
        setSimulation: jest.fn(),
        notifyListeners: jest.fn(),
        deregister: jest.fn(),
        registerListener: jest.fn(),
        getActivity: jest.fn(),
        getActiveCount: jest.fn(),
        getPathCount: jest.fn()
    };
});

export default ActivityManager;
