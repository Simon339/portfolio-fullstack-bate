import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
    ...defaultStatements, 
    project: ["create", "share", "update", "delete", "ban", "impersonate-admins",  "impersonate", "get", "unban", "revoke", ], 
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({ 
    project: ["get"], 
    ...adminAc.statements, 
});  
export const admin = ac.newRole({
    project: ["create", "update", "delete", "share", "ban", "impersonate", "unban", "revoke"],
    user: ["impersonate-admins", ...adminAc.statements.user]  
});
export const owner = ac.newRole({ 
    project: ["create", "update", "delete", "share", "ban",  "impersonate", "impersonate-admins", "unban", "revoke"],
    user: ["impersonate-admins", ...adminAc.statements.user] 
}); 