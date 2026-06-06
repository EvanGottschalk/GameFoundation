// Keys are potential user inputs (keyboard, mouse, etc.) when running the app on desktop

const controls = {
    z: 'action_1', // jump by default
    x: 'action_2', // attack by default
    left: 'left',
    right: 'right',
    up: '',
    down: '',
    enter: 'enter',
} as const;

export default controls;