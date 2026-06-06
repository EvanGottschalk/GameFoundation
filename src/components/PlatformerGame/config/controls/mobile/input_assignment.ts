// Keys are potential user touch-screen inputs (pressing, tapping, swiping, etc.) when running the app on mobile

const controls = {
    swipe_up: 'action_1',
    swipe_down: 'action_2',
    press_left_of_player: 'left',
    press_right_of_player: 'right',
    up: '',
    down: '',
    // enter: 'menu_pause1',
} as const;

export default controls;