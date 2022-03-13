export default {
  hosts: [
    {
      id: '1',
      ip: 'localhost',
      port: 2001,
      shardList: [0],
    },
    {
      id: '2',
      ip: 'localhost',
      port: 2002,
      shardList: [1],
    },
  ],
  totalShards: 2,
  ipcApiPort: 2000,
}
