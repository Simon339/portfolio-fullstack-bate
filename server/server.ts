import { headers } from "next/headers";
import { auth } from "./auth";

await auth.api.getSession({
	headers: await headers() // some endpoints might require headers
})