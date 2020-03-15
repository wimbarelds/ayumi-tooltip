import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

const showDelay = 500;

let mouseX: number = 0;
let mouseY: number = 0;
let showTimeout: number = 0;
let animationFrame: number = 0;
let instance: App | undefined;

const killInstance = (i: Vue): undefined => {
  if (!i) return;
  i.$el.remove();
  i.$destroy();
};

const updateMousePos = (e: MouseEvent) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(() => {
    if (instance) {
      instance.setPosition(mouseX, mouseY);
    }
  });
};

const mouseOverHandler = (e: MouseEvent) => {
  if (e.target instanceof HTMLElement) {
    const href = e.target.getAttribute('href');
    if (href && href.match(/\/raid-shadow-legends-.*-skill-mastery-equip-guide\//)) {
      e.target.addEventListener('mousemove', mouseMoveHandler);
      e.target.addEventListener('mouseleave', mouseLeaveHandler);
      updateMousePos(e);

      showTimeout = setTimeout(() => {
        if (instance) instance = killInstance(instance);
        const placeholder = document.createElement('div');
        document.body.appendChild(placeholder);
        instance = new App().$mount(placeholder);
        instance.loadUrl(href);
        instance.setPosition(mouseX, mouseY);
      }, showDelay);
    }
  }
};

const mouseMoveHandler = (e: MouseEvent) => {
  updateMousePos(e);
};

const mouseLeaveHandler = (e: MouseEvent) => {
  (e.target as HTMLElement).removeEventListener('mousemove', mouseMoveHandler);
  (e.target as HTMLElement).removeEventListener('mouseleave', mouseLeaveHandler);
  clearTimeout(showTimeout);
  if (instance) killInstance(instance);
};

document.body.addEventListener('mouseover', mouseOverHandler);
