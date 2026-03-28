"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsActive = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
    Role["ORGANIZER"] = "ORGANIZER";
})(Role || (exports.Role = Role = {}));
var IsActive;
(function (IsActive) {
    IsActive["ACTIVE"] = "ACTIVE";
    IsActive["INACTIVE"] = "INACTIVE";
    IsActive["BLOCKED"] = "BLOCKED";
})(IsActive || (exports.IsActive = IsActive = {}));
