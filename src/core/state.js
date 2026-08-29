export const state={running:!matchMedia('(prefers-reduced-motion: reduce)').matches,simTime:0,shadowPlay:false,playT:0,consoleOpen:false};
export const frameHooks=[],resizeHooks=[],statusHooks=[],consolePoints=[];

/* hook registrars — rooms never touch the arrays directly */
export const onFrame=f=>frameHooks.push(f);
export const onResize=f=>resizeHooks.push(f);
export const registerStatus=f=>statusHooks.push(f);
