import { mountApp } from './ui/app.js';

const root = document.querySelector('#app');
if (!root) throw new Error('Latchline app root is missing.');
mountApp(root);
