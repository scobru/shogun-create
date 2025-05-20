const { createBrowserClient } = require("./index");

const client = createBrowserClient(["http://localhost:8765/gun"], {
  useLocalStorage: true,
  useRadisk: true,
  radiskPath: "radata",
});

client.get("hello").put({data:"world"});

client.get("hello").once((data) => {
  console.log(data);
});
