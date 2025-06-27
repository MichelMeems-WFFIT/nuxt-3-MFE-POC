# nuxt-3-MFE-POC
A Proof of Concept for Module Federation using Nuxt 3 in Nuxt 3

## How to Clone and run

### Prereqisits

- Docker (e.g. Docker Desktop)
- VSCode
- Linux (WSL / Standalone)

### Start Devcontainer

1. Open VSCode in Project Roboto
2. Press `F1`
3. Choose option `Dev Containers: Reopen in Container`

### Start Remote Application

```bash
cd remote-app
pnpm install
pnpm dev
```

### Start Host Application

```bash
cd ../host
pnpm install
pnpm dev
```

## Steps to create Project

### Create Projects for POC

> [!INFO]
>
> Both use Default Settings

```bash
pnpm create nuxt host
pnpm create nuxt remote-app
```

### Install required Dependencies to Project

> [!INFO]
>
> All are Required to medicate compiler errors
> Run command in both Projects

```bash
pnpm add @module-federation/enhanced
pnpm add -D @nuxt/webpack-builder css-loader esbuild-loader ofetch postcss postcss-loader ufo vue-loader vue-style-loader vue-tsc webpack-hot-middleware
```

### Host Settings

    ```typescript
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
    ```

### Remote Settings

    ```typescript
    // https://nuxt.com/docs/api/configuration/nuxt-config
    import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";
    import { defineNuxtConfig } from "nuxt/config";

    export default defineNuxtConfig({
        compatibilityDate: "2025-05-15",
        devtools: { enabled: true },
        builder: "webpack",
        hooks: {
            "webpack:config": function (configs) {
                for (const config of configs) {
                    config.output = config.output || {};
                    config.output.publicPath = "http://127.0.0.1:3001/";

                    if (
                        !config.plugins?.some(
                            (plugin) =>
                                plugin?.constructor.name ===
                                "ModuleFederationPlugin"
                        )
                    ) {
                        config.plugins = config.plugins || [];
                        config.plugins.push(
                            new ModuleFederationPlugin({
                                name: "remote_app",
                                filename: "remoteEntry.js",
                                exposes: {
                                    "./WelcomeMessage":
                                        "./components/WelcomeMessage.vue",
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
    ```

### Create Remote Component `./components/WelcomeMessage.vue`

    ```Vue
    <!-- remote-app/components/WelcomeMessage.vue -->
    <template>
        <div
            style="
                border: 2px dashed #42b883;
                padding: 20px;
                border-radius: 10px;
                background-color: #f0fdf4;
            "
        >
            <h2 style="color: #34495e">{{ message }}</h2>
            <p>
                This component is being rendered from the
                <strong style="color: #42b883">remote-app</strong>!
            </p>
        </div>
    </template>

    <script setup>
    // This component can accept props just like any other Vue component
    defineProps({
        message: {
            type: String,
            default: "­ƒæï Hello from the Remote!",
        },
    });
    </script>
    ```

### Use `@module-federation/enhanced/runtime` to load Remote Component

    ```Vue
    <!-- host-app/app.vue -->
    <template>
        <div class="host-container">
            <header>
                <h1>Welcome to the Host Application (@mf-enhanced/runtime)</h1>
                <p>This is the main application shell, running on port 3000.</p>
            </header>

            <main>
                <p>
                    Below, we will use the runtime to load a component from our
                    remote.
                </p>
                <hr />

                <Suspense>
                    <template #default>
                        <RemoteWelcomeMessage
                            v-if="RemoteWelcomeMessage"
                            :message="'This message was passed as a prop from the Host!'"
                        />
                    </template>
                    <template #fallback>
                        <div class="loading">
                            <p>ÔÅ│ Loading remote component via runtime...</p>
                        </div>
                    </template>
                </Suspense>
            </main>
        </div>
    </template>

    <script setup>
    import { init, loadRemote } from "@module-federation/enhanced/runtime";

    const RemoteWelcomeMessage = shallowRef(null);

    init({
        name: "host_app",
        remotes: [
            {
                remote_app: "remote_app@http://127.0.0.1:3001/remoteEntry.js",
            },
        ],
    });

    onMounted(() => {
        RemoteWelcomeMessage.value = defineAsyncComponent(async () => {
            console.log(
                "Attempting to load 'WelcomeMessage' from 'remote_app' via runtime"
            );
            try {
                const remoteComponent = await loadRemote(
                    "remote_app/WelcomeMessage"
                );
                console.log("Remote component loaded successfully!");
                console.log(remoteComponent.toString());
                return remoteComponent;
            } catch (error) {
                console.error("Error loading remote component:", error);
                return {
                    template:
                        '<div class="error">Failed to load the remote component.</div>',
                };
            }
        });
    });
    </script>

    <style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        background-color: #f4f5f7;
        color: #172b4d;
        margin: 0;
        padding: 2rem;
    }
    .host-container {
        max-width: 800px;
        margin: auto;
        padding: 2rem;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    header {
        border-bottom: 1px solid #dfe1e6;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }
    hr {
        border: none;
        border-top: 1px dashed #dfe1e6;
        margin: 2rem 0;
    }
    .loading,
    .error {
        padding: 20px;
        border-radius: 10px;
        background-color: #fafafa;
        text-align: center;
        color: #6b778c;
        border: 2px dashed #dfe1e6;
    }
    .error {
        background-color: #ffebe6;
        color: #bf2600;
        border-color: #ff8f73;
    }
    </style>
    ```
