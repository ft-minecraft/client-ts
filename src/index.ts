import { main } from "./framework/main";

window.addEventListener("load", async () =>
  main((await import("./scenes/dev")).devScene, "Hello world!")
);
