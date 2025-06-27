// https://nuxt.com/docs/api/configuration/nuxt-config
import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";

export default defineNuxtConfig({
    compatibilityDate: "2025-05-15",
    devtools: { enabled: true },
    builder: "webpack",
    hooks: {
        "webpack:config": function (configs) {
            for (const config of configs) {
                config.output = config.output || {};
                config.output.publicPath = "http://127.0.0.1:3000/";
                if (
                    !config.plugins?.some((plugin) =>
                        plugin
                            ? plugin.constructor.name ===
                              "ModuleFederationPlugin"
                            : console.error("plugin is null")
                    )
                ) {
                    config.plugins = config.plugins || [];
                    config.plugins.push(
                        new ModuleFederationPlugin({
                            name: "host_app",
                            remotes: {
                                remote_app:
                                    "remote_app@http://127.0.0.1:3001/remoteEntry.js",
                            },
                            shared: {
                                vue: {
                                    singleton: true,
                                },
                                "vue-router": {
                                    singleton: true,
                                },
                            },
                            dts: {
                                generateTypes: {
                                    compilerInstance: "vue-tsc",
                                },
                            },
                        })
                    );
                }
            }
        },
    },
    experimental: {
        asyncEntry: true,
    },
    ssr: false,
    routeRules: {
        "/**": {
            cors: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
                "Content-Security-Policy":
                    "base-uri 'self'; default-src * 'unsafe-inline' 'unsafe-eval'",
            },
        },
    },
});
