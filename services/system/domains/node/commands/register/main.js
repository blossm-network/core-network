const deps = require("./deps");

module.exports = async ({ payload, context, claims }) => {
  // Create new roots for the scene and the node.
  const nodeRoot = deps.uuid();

  // Register the scene.
  const {
    tokens,
    references: {
      principle,
      scene: { root: sceneRoot }
    }
  } = await deps
    .command({
      name: "register",
      domain: "scene",
      service: "core"
    })
    .set({ context, claims, tokenFns: { internal: deps.gcpToken } })
    .issue({
      root: nodeRoot,
      domain: process.env.DOMAIN,
      service: process.env.SERVICE,
      network: process.env.NETWORK
    });

  return {
    events: [
      {
        domain: "principle",
        service: principle.service,
        network: principle.network,
        action: "add-roles",
        root: principle.root,
        payload: {
          roles: [
            {
              id: "NodeAdmin",
              root: nodeRoot,
              service: process.env.SERVICE,
              network: process.env.NETWORK
            }
          ]
        }
      },
      {
        action: "register",
        root: nodeRoot,
        payload: {
          network: payload.network,
          scene: {
            root: sceneRoot,
            service: "core",
            network: process.env.NETWORK
          }
        }
      }
    ],
    response: {
      ...(tokens && { tokens }),
      references: {
        node: {
          root: nodeRoot,
          service: process.env.SERVICE,
          network: process.env.NETWORK
        },
        scene: {
          root: sceneRoot,
          service: "core",
          network: process.env.NETWORK
        }
      }
    }
  };
};
