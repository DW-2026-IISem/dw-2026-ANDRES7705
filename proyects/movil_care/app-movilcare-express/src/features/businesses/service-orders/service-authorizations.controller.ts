import { createCrudController } from "../shared/crud.controller";
import {
  AUTHORIZATION_CHANNELS,
  AUTHORIZATION_STATES,
  ServiceAuthorization,
} from "./service-authorizations.model";

export const serviceAuthorizationsController = createCrudController(ServiceAuthorization, {
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

export { AUTHORIZATION_CHANNELS, AUTHORIZATION_STATES };
