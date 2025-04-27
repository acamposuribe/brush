import { State } from "../core/color.js";
import { createHatch, HatchState, HatchSetState, hatch } from "./hatch.js";
import { noField, field, wiggle } from "../core/flowfield.js";
import { Polygon } from "../core/polygon.js";
import { Plot } from "../core/plot.js";
import { random } from "../core/utils.js";

const state = {isActive: false}

export function handFill(dist = 5, angle = 45, opacity = 1) {
    state.isActive = true;
    state.dist = dist;
    state.angle = angle;
    State.stroke.opacity = opacity;
}

function createHand(polygon) {
    let dist = state.dist;
    let angle = state.angle;
    let save = HatchState();
    let s1 = State.field.wiggle
    wiggle(1.3);
    for (let i = 0; i < 4; i++) {
        hatch(dist * random(0.8, 2), angle + Math.PI / 180 * random(-5,5), { continuous: true, rand: 0.1 + random(-0.05,0.05), gradient: 0.1 + random(-0.1,0.15) })
        createHatch(polygon, true)
    }
    HatchSetState(save)
    if (State.field.isActive) field(State.field.current)
    else noField();
    State.field.wiggle = s1;
    State.stroke.opacity = 1;
}

Polygon.prototype.handFill = function () {
    if (state.isActive) {
      createHand(this)
      state.isActive = false;
    }
};

Plot.prototype.handFill = function (x, y, scale) {
    if (state.isActive) {
        if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
        this.pol = this.genPol(x, y, scale, 0.25);
        this.pol.handFill();
    }
};