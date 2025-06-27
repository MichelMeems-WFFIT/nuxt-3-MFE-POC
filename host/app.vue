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
