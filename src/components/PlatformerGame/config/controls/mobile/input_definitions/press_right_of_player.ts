// This is the configuration for what defines a "press right of the player" and assigns it to press_left_of_player as a user input that can be assigned controls. Generally, this is when the user is pressing the screen at a point whose x position is greater than the uesr's.

const input_definition = {
    x_offset: 0, // number of pixels further right (positive) or left (negative) from the center of the player the user has to press to trigger this input.
};

export default input_definition;