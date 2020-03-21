const Plumber = jest.fn().mockImplementation(() => {
  return {
    debug: jest.fn(),
    draggable: jest.fn(),
    setSourceEnabled: jest.fn(),
    makeSource: jest.fn(),
    makeTarget: jest.fn(),
    connectExit: jest.fn(),
    removeFromDragSelection: jest.fn(),
    setDragSelection: jest.fn(),
    clearDragSelection: jest.fn(),
    cancelDurationRepaint: jest.fn(),
    repaintForDuration: jest.fn(),
    repaintFor: jest.fn(),
    connect: jest.fn(),
    bind: jest.fn(),
    repaint: jest.fn(),
    remove: jest.fn(),
    recalculate: jest.fn(),
    reset: jest.fn(),
    triggerLoaded: jest.fn()
  };
});

export default Plumber;
