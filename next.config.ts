import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
    },
});

const nextConfig = {
    /* config options here */
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cloud.appwrite.io",
            },
            {
                protocol: "https",
                hostname: "nyc.cloud.appwrite.io",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
            }
        ],
    },
};

export default withPWA(nextConfig);
