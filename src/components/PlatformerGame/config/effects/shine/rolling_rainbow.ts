const effect = {
    name: 'Rolling Rainbow',
    width: 700, // total width of the animation
    height: 0, // total height of the animation. If 0, height is unlimited
    waveDefaults: {
        color: '',
        opacity: 1,
        speed: 100, // pixels per second
        width: 100, // pixels
        period: 7, // seconds
        orientation: 'horizontal', // horizontal is left-to-right; vertical is top-to-bottom; radial is inner circles going outward
        reverseDirection: false, // if true, horizontal is right-to-left; vertical is bottom-to-top; radial is outer circles going inward
        angle: 30, // degrees. 0 is perfectly vertical, 90 is perfectly horizontal
    },
    waves: [
        {
            color: '#ff0000',
            start: 0, // pixels
        },
        {
            color: '#ffa200',
            start: 100, // pixels
        },
        {
            color: '#f2ff00',
            start: 200, // pixels
        },
        {
            color: '#1eff00',
            start: 300, // pixels
        },
        {
            color: '#008cff',
            start: 400, // pixels
        },
        {
            color: '#1100ff',
            start: 500, // pixels
        },
        {
            color: '#6f00ff',
            start: 600, // pixels
        },
    ]

} as const;

export default effect;