import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
    ...defaultStatements, 
    project: ["create", "share", "update", "delete", "ban"], 
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({ 
    project: ["create"], 
    ...adminAc.statements, 
});  
export const admin = ac.newRole({
    project: ["create", "update", "delete", "share", "ban"],
    ...adminAc.statements, 
});
export const owner = ac.newRole({ 
    project: ["create", "update", "delete", "share", "ban"],
    ...adminAc.statements, 
}); 