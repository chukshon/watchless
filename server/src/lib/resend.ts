import { env } from "@/config/env";
import { Resend } from "resend";

export const RESEND_CLIENT = new Resend(env.RESEND_API_KEY);
