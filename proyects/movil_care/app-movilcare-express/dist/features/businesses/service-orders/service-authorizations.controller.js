"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHORIZATION_STATES = exports.AUTHORIZATION_CHANNELS = exports.serviceAuthorizationsController = void 0;
const crud_controller_1 = require("../shared/crud.controller");
const service_authorizations_model_1 = require("./service-authorizations.model");
Object.defineProperty(exports, "AUTHORIZATION_CHANNELS", { enumerable: true, get: function () { return service_authorizations_model_1.AUTHORIZATION_CHANNELS; } });
Object.defineProperty(exports, "AUTHORIZATION_STATES", { enumerable: true, get: function () { return service_authorizations_model_1.AUTHORIZATION_STATES; } });
exports.serviceAuthorizationsController = (0, crud_controller_1.createCrudController)(service_authorizations_model_1.ServiceAuthorization, {
    fields: [
        "diagnosticId",
        "state",
        "authorizedAmount",
        "channel",
        "respondedAt",
        "notes",
        "recordedBy",
    ],
    requiredFields: ["diagnosticId", "state", "authorizedAmount", "channel"],
});
//# sourceMappingURL=service-authorizations.controller.js.map