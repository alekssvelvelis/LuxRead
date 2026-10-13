import UserAgent from "user-agents";

export const randomizeUserAgent = (): string => {
    const ua = new UserAgent();
    return ua.toString();
};