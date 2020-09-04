"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const update_status_1 = require("./update-status");
const constats_1 = require("./constats");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const context = github.context;
            const logUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}/checks`;
            const status = core.getInput("initial_status", {
                required: false,
            }) || "pending";
            const environment = core.getInput("environment", { required: false }) || "production";
            const ref = core.getInput("ref", { required: false }) || context.ref;
            const environment_url = core.getInput("environment_url", { required: false }) || logUrl;
            const statusUpdateData = yield update_status_1.updateStatus(status, {
                token: core.getInput("token", { required: true }),
                owner: context.repo.owner,
                repo: context.repo.repo,
                sha: context.sha,
                ref: ref,
                log_url: logUrl,
                environment: environment,
                environment_url: environment_url,
                target_url: logUrl,
            });
            core.saveState(constats_1.State.StatusUpdateData, statusUpdateData);
            core.setOutput("deployment_id", statusUpdateData.deployment_id);
        }
        catch (error) {
            core.error(error);
            core.setFailed(error.message);
        }
    });
}
run();
