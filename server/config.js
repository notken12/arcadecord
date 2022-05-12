// get architecture from config
import architecture from './config/architecture.js';

export const { hosts } = architecture;

export function loadHostConfig() {
  const hostId = process.argv[2];
  const host = hosts.find((host) => host.id === hostId);

  if (host == null) {
    // Use environment vars for config
    const host = {
      port: Number(process.env.PORT),
      name: process.env.HOST_NAME,
      id: Number(process.env.HOST_ID),
    };
    if (host.port == null || host.name == null || host.id == null) {
      throw new Error(
        'Arcadecord: Host configuration has missing fields. Set them using the environment variables PORT, HOST_NAME, and HOST_ID. Or provide a host ID from server/config/architecture.js as an argument.'
      );
    }
    return host;
  } else {
    // Use architecture.json for config
    return host;
  }
}
