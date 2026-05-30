const effect = {
    name: 'Tiger Shnig',
    width: 200, // total width of the animation
    height: 0, // total height of the animation. If 0, height is unlimited
    waveDefaults: {
        color: '',
        opacity: 1,
        // speed: 400, // pixels per second
        width: 100, // pixels
        period: 2, // seconds
        orientation: 'horizontal', // horizontal is left-to-right; vertical is top-to-bottom; radial is inner circles going outward
        reverseDirection: false, // if true, horizontal is right-to-left; vertical is bottom-to-top; radial is outer circles going inward
        angle: 15, // degrees. 0 is perfectly vertical, 90 is perfectly horizontal
    },
    waves: [
        {
            color: '#000000',
            speed: 50,
        },
        {
            color: '#ffa200',
            speed: 100,
        },
                {
            color: '#000000',
            speed: 150,
        },
        {
            color: '#ffa200',
            speed: 200,
        },
                {
            color: '#000000',
            speed: 250,
        },
        {
            color: '#ffa200',
            speed: 300,
        },
        {
            color: '#000000',
            speed: 450,
        },
        {
            color: '#ffa200',
            speed: 500,
        },
        {
            color: '#000000',
            speed: 550,
        },
    ]

} as const;

export default effect;