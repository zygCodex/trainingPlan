<script setup>
import { days } from '../data'
defineProps({ modelValue:Number })
defineEmits(['update:modelValue'])
</script>
<template><div class="day-picker" aria-label="选择训练日"><button v-for="d in days" :key="d.id" :aria-pressed="modelValue===d.id" :class="{selected:modelValue===d.id}" @click="$emit('update:modelValue',d.id)"><span>DAY 0{{ d.id }}</span><strong>{{ d.name }}</strong><i aria-hidden="true">{{ modelValue===d.id ? '●' : '○' }}</i></button></div></template>
