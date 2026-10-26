import './ui/fonts.css';
import './ui/styles.css';
import { App } from './ui/app';

const app = new App(document.getElementById('app')!);
if (import.meta.env.DEV) (window as unknown as { __reign: unknown }).__reign = app;
app.boot();
