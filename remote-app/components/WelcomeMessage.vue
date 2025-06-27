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
        default: "👋 Hello from the Remote!",
    },
});
</script>
