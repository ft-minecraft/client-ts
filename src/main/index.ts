import { main } from "./framework/main";

window.addEventListener("load", async () =>
  main((await import("./scenes/dev")).devScene, "Hello world!")
);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => {
      console.log("Service worker registered");
    })
    .catch((err) => {
      console.log("Service worker registration failed: " + err);
    });
}
