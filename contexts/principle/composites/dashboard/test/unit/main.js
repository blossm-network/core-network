const { expect } = require("chai")
  .use(require("sinon-chai"));
const { restore, fake, replace } = require("sinon");

const main = require("../../main");
const deps = require("../../deps");

describe("Composite unit tests", () => {
  afterEach(() => {
    restore();
  });
  it("should return successfully", async () => {
    const nodes = "some-nodes";
    const readFake = fake.returns({ body: nodes });
    const setFake = fake.returns({
      read: readFake,
    });
    const viewStoreFake = fake.returns({
      set: setFake,
    });
    replace(deps, "viewStore", viewStoreFake);
    const result = await main({ context });
    expect(setFake).to.have.been.calledWith({
      context,
      tokenFns: { internal: deps.gcpToken },
    });
    expect(readFake).to.have.been.calledWith();
    expect(viewStoreFake).to.have.been.calledWith({
      name: "nodes",
      context: "principle",
    });
    expect(result).to.deep.equal({ nodes });
  });
});