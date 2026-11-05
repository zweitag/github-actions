import * as core from "@actions/core";
import { updateStatus } from "./update-status.js";
import { State } from "./constats.js";
async function run() {
    const statusUpdateData = JSON.parse(core.getState(State.StatusUpdateData));
    await updateStatus("success", statusUpdateData);
}
run();
