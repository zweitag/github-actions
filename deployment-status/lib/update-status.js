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
exports.updateStatus = void 0;
const github = __importStar(require("@actions/github"));
exports.updateStatus = (status, data) => __awaiter(void 0, void 0, void 0, function* () {
    const client = github.getOctokit(data.token);
    var deployment_id;
    if (!data.deployment_id) {
        const deployment = yield client.repos.createDeployment(Object.assign(Object.assign({}, data), { auto_merge: false, required_contexts: [], transient_environment: true }));
        if ("id" in deployment.data) {
            deployment_id = deployment.data.id;
        }
        else {
            throw ("Deployment could not be created: " + JSON.stringify(deployment.data));
        }
    }
    else {
        deployment_id = data.deployment_id;
    }
    yield client.repos.createDeploymentStatus(Object.assign(Object.assign({}, data), { deployment_id: deployment_id, state: status }));
    return Object.assign(Object.assign({}, data), { deployment_id: deployment_id });
});
