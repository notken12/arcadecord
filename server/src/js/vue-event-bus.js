import mitt from 'mitt';

const bus = mitt();
bus.manualMd = undefined;

export default bus;