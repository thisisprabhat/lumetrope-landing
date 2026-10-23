// Lumi: the Lumetrope mascot, a little lantern creature with a glowing amber
// core. Breathes and blinks at rest, follows the pointer with its eyes, waves
// when hovered, hops when poked, cheers on downloads and dozes off when idle.
import { C, Doc, SNAP_SETTLE, ev, is } from "./lib.mjs";

export const name = "lumi";

const W = 480;
const GROUND = 420; // Rig origin: the floor under Lumi's feet; everything hangs off it.
const EYE_Y = -200;
const EYE_X = 36;

export function build() {
  const d = new Doc("Lumi", W, 480, 30, 270);
  d.segment("idle", 0, 60, true);
  d.segment("lookL", 60, 75, false); // played in reverse: frame 60 is the held look-left pose
  d.segment("lookR", 75, 90, false);
  d.segment("wave", 90, 130, true);
  d.segment("jump", 130, 160, false);
  d.segment("cheer", 160, 210, false);
  d.segment("sleep", 210, 270, true);

  // ------------------------------------------------------------- the rig
  d.shape({ type: "ellipse", name: "Shadow", position: [240, GROUND - 6], size: [170, 22], fill: "#000000" });
  d.set("Shadow", { opacity: 45 });
  d.null("Rig", [240, GROUND]);

  // Cheer sparkles burst from behind Lumi (hidden outside the cheer).
  const sparkles = [
    [-150, -300, C.lume, 16], [150, -290, C.cyan, 14], [-176, -200, C.violet, 12],
    [178, -196, C.ok, 13], [-104, -350, C.cyan, 10], [110, -352, C.violet, 11],
  ];
  sparkles.forEach(([, , color, r], i) => {
    d.shape({ type: "star", name: `Sparkle ${i + 1}`, position: [240, GROUND - 160], radius: r, inner_radius: r * 0.32, points: 4, fill: color });
  });
  d.shape({ type: "ellipse", name: "Halo", position: [0, -140], size: [400, 400], fill: C.lume });
  d.radial("Halo", [{ offset: 0, color: C.lume, opacity: 0.28 }, { offset: 0.55, color: C.lume, opacity: 0.08 }, { offset: 1, color: C.lume, opacity: 0 }], { start: [0, 0], end: [200, 0] });
  d.parent("Halo", "Rig");

  // Arms hang from the shoulders, behind the body.
  for (const [nm, x] of [["Arm L", -94], ["Arm R", 94]]) {
    d.shape({ type: "rect", name: nm, position: [x, -116], size: [20, 66], roundness: 10, fill: "#262c33", stroke: C.edge, stroke_width: 3 });
    d.op("set_anchor_point", { layer: nm, anchor: "top" });
    d.parent(nm, "Rig");
  }
  for (const [nm, x] of [["Foot L", -38], ["Foot R", 38]]) {
    d.shape({ type: "ellipse", name: nm, position: [x, -26], size: [46, 24], fill: "#262c33", stroke: C.edge, stroke_width: 3 });
    d.parent(nm, "Rig");
  }

  // Antenna on its own pivot at the top of the cap.
  d.null("Antenna", [0, -264], "Rig");
  d.shape({ type: "path", name: "Stalk", position: [0, 0], closed: false, path: { v: [[0, 0], [0, -46]], i: [[0, 0], [-6, 14]], o: [[6, -14], [0, 0]], c: false }, fill: null, stroke: C.edge, stroke_width: 5 });
  d.op("set_stroke", { layer: "Stalk", line_cap: "round" });
  d.shape({ type: "ellipse", name: "Tip Glow", position: [0, -50], size: [46, 46], fill: C.lume });
  d.glow("Tip Glow", 12);
  d.shape({ type: "ellipse", name: "Tip", position: [0, -50], size: [18, 18], fill: C.lume });
  d.radial("Tip", [{ offset: 0, color: C.lumeHi }, { offset: 1, color: C.lume }], { start: [-2, -2], end: [9, 0] });
  for (const l of ["Stalk", "Tip Glow", "Tip"]) d.parent(l, "Antenna");

  // Body: a rounded lantern with a cap.
  d.shape({ type: "rect", name: "Body", position: [0, -142], size: [196, 220], roundness: 86, fill: C.bg3, stroke: C.edge, stroke_width: 3 });
  d.linear("Body", [{ offset: 0, color: "#2c333c" }, { offset: 1, color: C.bg3 }], [0, -110], [0, 110]);
  d.shape({ type: "rect", name: "Rim Light", position: [0, -142], size: [182, 206], roundness: 80, fill: null, stroke: C.lume, stroke_width: 2 });
  d.set("Rim Light", { opacity: 18 });
  d.shape({ type: "rect", name: "Cap", position: [0, -254], size: [96, 24], roundness: 12, fill: C.raised, stroke: C.edge, stroke_width: 3 });
  for (const l of ["Body", "Rim Light", "Cap"]) d.parent(l, "Rig");

  // The glowing core, seen through a round window in the belly.
  d.shape({ type: "ellipse", name: "Window", position: [0, -98], size: [104, 104], fill: C.bg0, stroke: C.edge, stroke_width: 4 });
  d.shape({ type: "ellipse", name: "Core Glow", position: [0, -98], size: [128, 128], fill: C.lume });
  d.glow("Core Glow", 26);
  d.shape({ type: "ellipse", name: "Core", position: [0, -98], size: [88, 88], fill: C.lume });
  d.radial("Core", [{ offset: 0, color: C.lumeHi }, { offset: 0.45, color: "#ffc45e" }, { offset: 1, color: C.lumeDeep }], { start: [-8, -10], end: [48, 0] });
  d.shape({ type: "star", name: "Spark", position: [0, -98], radius: 20, inner_radius: 5, points: 4, roundness: 0, fill: "#ffffff" });
  d.set("Spark", { opacity: 85 });
  for (const l of ["Window", "Core Glow", "Core", "Spark"]) d.parent(l, "Rig");

  // Face.
  for (const [nm, x] of [["Cheek L", -64], ["Cheek R", 64]]) {
    d.shape({ type: "ellipse", name: nm, position: [x, -170], size: [22, 12], fill: "#ff8a5c" });
    d.parent(nm, "Rig");
  }
  for (const [nm, x] of [["Eye L", -EYE_X], ["Eye R", EYE_X]]) {
    d.shape({ type: "ellipse", name: nm, position: [x, EYE_Y], size: [40, 46], fill: C.text });
    d.parent(nm, "Rig");
  }
  for (const [nm, x] of [["Pupil L", -EYE_X], ["Pupil R", EYE_X]]) {
    d.shape({ type: "ellipse", name: nm, position: [x, EYE_Y + 2], size: [19, 23], fill: "#101215" });
    d.add(nm, { type: "ellipse", position: [4, -6], size: [6, 6], fill: "#ffffff" });
    d.parent(nm, "Rig");
  }
  // Happy "^ ^" eyes for the cheer and sleepy curved lids, drawn as strokes.
  for (const [nm, x, up] of [["Joy L", -EYE_X, true], ["Joy R", EYE_X, true], ["Lid L", -EYE_X, false], ["Lid R", EYE_X, false]]) {
    const v = up ? [[-13, 6], [0, -6], [13, 6]] : [[-13, -2], [0, 6], [13, -2]];
    const t = up ? [[0, 0], [-7, 0], [0, 0]] : [[0, 0], [-7, 0], [0, 0]];
    d.shape({ type: "path", name: nm, position: [x, EYE_Y + (up ? 0 : 4)], closed: false, path: { v, i: t, o: t.map(([a, b]) => [-a, -b]), c: false }, fill: null, stroke: C.text, stroke_width: 5 });
    d.op("set_stroke", { layer: nm, line_cap: "round", line_join: "round" });
    d.parent(nm, "Rig");
  }
  d.shape({ type: "ellipse", name: "Mouth", position: [0, -164], size: [16, 8], fill: C.lume });
  d.parent("Mouth", "Rig");

  // Sleepy z's (hidden outside the sleep).
  for (let i = 0; i < 2; i++) {
    d.shape({ type: "path", name: `Z ${i + 1}`, position: [300, 170], closed: false, points: [[-7, -7], [7, -7], [-7, 7], [7, 7]], fill: null, stroke: C.text, stroke_width: 3.5 });
    d.op("set_stroke", { layer: `Z ${i + 1}`, line_cap: "round", line_join: "round" });
  }

  // ------------------------------------------------------------- motion
  const P = (x, y) => [240 + x, GROUND + y];
  const s2 = (x, y = x) => [x, y];

  // Whole body: breathe, hop, squash and stretch.
  d.anim("Rig", "scale", s2(100), {
    idle: [[0, s2(100)], [30, s2(98.5, 102)]],
    wave: [[0, s2(100)], [10, s2(101.5, 98.5)], [20, s2(100)], [30, s2(101.5, 98.5)]],
    jump: [
      [0, s2(100), "ease_in"], [5, s2(116, 84), "ease_out"], [9, s2(90, 114)], [15, s2(97, 104), "ease_in"],
      [20, s2(92, 110), "ease_out"], [22, s2(122, 80), "ease_out"], [25, s2(94, 107)], [28, s2(101, 99)], [29, s2(100)],
    ],
    cheer: [
      [0, s2(100), "ease_in"], [4, s2(112, 88), "ease_out"], [7, s2(92, 112)], [11, s2(98, 103), "ease_in"], [16, s2(94, 108), "ease_out"],
      [18, s2(116, 86), "ease_out"], [21, s2(92, 110)], [26, s2(99, 102), "ease_in"], [30, s2(95, 106), "ease_out"],
      [32, s2(114, 88), "ease_out"], [36, s2(97, 103)], [40, s2(100)],
    ],
    sleep: [[0, s2(101, 98.5)], [30, s2(102.5, 96.5)]],
  });
  d.anim("Rig", "position", P(0, 0), {
    jump: [[0, P(0, 0)], [5, P(0, 0), "ease_out"], [15, P(0, -64), "ease_in"], [21, P(0, 0)], [29, P(0, 0)]],
    cheer: [[0, P(0, 0)], [5, P(0, 0), "ease_out"], [11, P(0, -54), "ease_in"], [17, P(0, 0)], [20, P(0, 0), "ease_out"], [26, P(0, -36), "ease_in"], [31, P(0, 0)], [49, P(0, 0)]],
  });
  d.anim("Rig", "rotation", 0, {
    wave: [[0, 0], [10, 2.5], [20, 0.5], [30, 2.5]],
    jump: [[0, 0], [9, -4], [15, 3], [21, 0]],
    cheer: [[0, 0], [11, -5], [17, 0], [26, 5], [31, 0]],
    sleep: [[0, 4], [30, 5.5]],
  });
  d.anim("Shadow", "scale", s2(100), {
    idle: [[0, s2(100)], [30, s2(102)]],
    jump: [[0, s2(100)], [5, s2(110), "ease_out"], [15, s2(56), "ease_in"], [21, s2(114)], [25, s2(100)]],
    cheer: [[0, s2(100)], [5, s2(106), "ease_out"], [11, s2(72), "ease_in"], [17, s2(110)], [20, s2(104), "ease_out"], [26, s2(80), "ease_in"], [31, s2(110)], [36, s2(100)]],
  });
  d.anim("Shadow", "opacity", 45, {
    jump: [[0, 45], [5, 45, "ease_out"], [15, 20, "ease_in"], [21, 45]],
    cheer: [[0, 45], [5, 45, "ease_out"], [11, 28, "ease_in"], [17, 45], [20, 45, "ease_out"], [26, 32, "ease_in"], [31, 45]],
  });

  // Glow: the core breathes with Lumi, flares on a hop, dims asleep.
  d.anim("Core Glow", "opacity", 70, {
    idle: [[0, 62], [30, 92]],
    lookL: 62, lookR: 62,
    wave: [[0, 62], [10, 92], [30, 80]],
    jump: [[0, 62], [9, 100], [22, 90], [29, 62]],
    cheer: [[0, 62], [8, 92], [40, 88], [49, 62]],
    sleep: [[0, 26], [30, 42]],
  });
  d.anim("Core Glow", "scale", s2(100), {
    idle: [[0, s2(100)], [30, s2(110)]],
    jump: [[0, s2(100)], [9, s2(114)], [29, s2(100)]],
    cheer: [[0, s2(100)], [8, s2(118), "ease_out_back"], [40, s2(112)], [49, s2(100)]],
    sleep: [[0, s2(92)], [30, s2(100)]],
  });
  d.anim("Core", "opacity", 100, { sleep: [[0, 68], [30, 80]] });
  d.anim("Halo", "opacity", 80, {
    idle: [[0, 75], [30, 100]],
    lookL: 75, lookR: 75,
    wave: [[0, 75], [20, 100]],
    cheer: [[0, 75], [8, 100], [40, 100], [49, 75]],
    sleep: [[0, 40], [30, 52]],
  });
  d.anim("Halo", "scale", s2(100), { idle: [[0, s2(100)], [30, s2(104)]], cheer: [[0, s2(100)], [8, s2(118)], [40, s2(112)], [49, s2(100)]] });
  d.anim("Spark", "rotation", 0, {
    idle: [[0, 0, "linear"], [59, 90]],
    wave: [[0, 0, "linear"], [39, 90]],
    jump: [[0, 0, "ease_out"], [29, 180]],
    cheer: [[0, 0, "ease_out"], [49, 270]],
    sleep: [[0, 0, "linear"], [59, 45]],
  });
  d.anim("Spark", "scale", s2(100), {
    idle: [[0, s2(90)], [30, s2(115)]],
    lookL: s2(90), lookR: s2(90),
    wave: [[0, s2(90)], [20, s2(120)]],
    jump: [[0, s2(90)], [9, s2(140)], [29, s2(90)]],
    cheer: [[0, s2(90)], [8, s2(160), "ease_out_back"], [40, s2(130)], [49, s2(90)]],
    sleep: [[0, s2(60)], [30, s2(72)]],
  });

  // Antenna: lazy sway, lags behind every hop, flops over asleep.
  d.anim("Antenna", "rotation", 0, {
    idle: [[0, 0], [15, -5], [45, 5]],
    lookL: [[0, -7], [5, -7], [14, 0]],
    lookR: [[0, 0], [9, 5]],
    wave: [[0, 5], [10, -6], [20, 6], [30, -4]],
    jump: [[0, 0], [5, 12], [10, -18], [16, 12], [21, -14], [24, 9], [27, -3], [29, 0]],
    cheer: [[0, 0], [7, -14], [12, 12], [18, -12], [24, 12], [31, -10], [36, 6], [42, 0]],
    sleep: [[0, 30], [30, 34]],
  });
  d.anim("Tip Glow", "opacity", 80, {
    idle: [[0, 70], [30, 100]],
    lookL: 70, lookR: 70,
    wave: [[0, 70], [10, 100], [20, 70], [30, 100]],
    jump: [[0, 70], [10, 100], [29, 70]],
    cheer: [[0, 70], [6, 100], [14, 60], [22, 100], [30, 60], [38, 100], [49, 70]],
    sleep: [[0, 20], [30, 38]],
  });
  d.anim("Tip Glow", "scale", s2(100), { idle: [[0, s2(90)], [30, s2(115)]], lookL: s2(90), lookR: s2(90), wave: s2(90), jump: s2(90), cheer: [[0, s2(90)], [6, s2(140)], [42, s2(120)], [49, s2(90)]], sleep: s2(80) });

  // Arms: drift while breathing, a big friendly wave, flail on hops.
  for (const [arm, sg] of [["Arm L", 1], ["Arm R", -1]]) {
    const r = (v) => v * sg;
    const waving = arm === "Arm R";
    d.anim(arm, "rotation", r(14), {
      idle: [[0, r(14)], [30, r(19)]],
      wave: waving
        ? [[0, r(14), "ease_out_back"], [7, r(145)], [12, r(118)], [17, r(150)], [22, r(118)], [27, r(150)], [32, r(125)], [38, r(14)]]
        : [[0, r(14)], [20, r(22)]],
      jump: [[0, r(14)], [5, r(34)], [10, r(70), "ease_out"], [16, r(52)], [21, r(80)], [24, r(30)], [29, r(14)]],
      cheer: [[0, r(14), "ease_out_back"], [6, r(155)], [11, r(128)], [16, r(158)], [21, r(128)], [26, r(158)], [31, r(132)], [36, r(150)], [44, r(14)]],
      sleep: [[0, r(6)], [30, r(9)]],
    });
  }

  // Eyes: blink at rest, glance left/right, widen on a hop, squeeze shut when cheering, closed asleep.
  const eyeScale = {
    idle: [[0, s2(100)], [40, s2(100), "ease_in"], [43, s2(100, 8), "ease_out"], [47, s2(100)]],
    wave: [[0, s2(100)], [6, s2(106)], [33, s2(106)]],
    jump: [[0, s2(100)], [5, s2(104, 55)], [10, s2(112, 118)], [20, s2(112, 118)], [22, s2(104, 50)], [27, s2(100)]],
    cheer: [[0, s2(100)], [4, s2(100, 0)], [38, s2(100, 0)], [44, s2(100)]],
    sleep: s2(100, 0),
  };
  const pupilScale = {
    ...eyeScale,
    idle: [[0, s2(100)], [40, s2(100), "ease_in"], [43, s2(100, 0), "ease_out"], [47, s2(100)]],
    cheer: [[0, s2(100)], [4, s2(100, 0)], [38, s2(100, 0)], [44, s2(100)]],
    sleep: s2(100, 0),
  };
  for (const [eye, pupil, x] of [["Eye L", "Pupil L", -EYE_X], ["Eye R", "Pupil R", EYE_X]]) {
    d.anim(eye, "scale", s2(100), eyeScale);
    d.anim(pupil, "scale", s2(100), pupilScale);
    const e = (dx, dy = 0) => [x + dx, EYE_Y + dy];
    const p = (dx, dy = 0) => [x + dx, EYE_Y + 2 + dy];
    d.anim(eye, "position", e(0), {
      lookL: [[0, e(-4)], [5, e(-4)], [14, e(0)]],
      lookR: [[0, e(0)], [7, e(4)]],
      wave: [[0, e(4)], [20, e(2, -2)]],
      jump: [[0, e(0)], [10, e(0, -4)], [22, e(0, 2)], [27, e(0)]],
      sleep: e(0, 6),
    });
    d.anim(pupil, "position", p(0), {
      idle: [[0, p(0)], [12, p(0), "snappy"], [15, p(3, -1)], [28, p(3, -1), "snappy"], [31, p(-3, 1)], [50, p(-3, 1), "snappy"], [54, p(0)]],
      lookL: [[0, p(-11, 1)], [5, p(-11, 1), "snappy"], [14, p(0)]],
      lookR: [[0, p(0), "snappy"], [7, p(11, 1)]],
      wave: [[0, p(11, 1)], [8, p(8, -3)], [30, p(8, -3)]],
      jump: [[0, p(0)], [9, p(0, -7)], [20, p(0, -7)], [24, p(0)]],
      sleep: p(0, 6),
    });
  }
  for (const j of ["Joy L", "Joy R"]) d.anim(j, "opacity", 0, { cheer: [[0, 0], [3, 100], [39, 100], [44, 0]] });
  for (const l of ["Lid L", "Lid R"]) d.anim(l, "opacity", 0, { sleep: 100 });
  d.anim("Mouth", "size", [16, 8], {
    idle: [[0, [16, 8]], [30, [18, 8]]],
    wave: [[0, [16, 8]], [6, [22, 13]], [34, [22, 13]]],
    jump: [[0, [16, 8]], [9, [14, 15]], [20, [14, 15]], [24, [16, 8]]],
    cheer: [[0, [16, 8]], [5, [28, 22], "ease_out_back"], [36, [28, 22]], [42, [16, 8]]],
    sleep: [[0, [10, 6]], [30, [12, 9]]],
  }, { shape: "0" });
  for (const ch of ["Cheek L", "Cheek R"]) {
    d.anim(ch, "opacity", 22, {
      wave: [[0, 22], [6, 55], [34, 55]],
      jump: [[0, 22], [10, 45], [27, 22]],
      cheer: [[0, 22], [5, 70], [40, 70], [46, 22]],
      sleep: [[0, 30], [30, 40]],
    });
  }

  // Cheer sparkles burst out from behind the head.
  sparkles.forEach(([x, y], i) => {
    const nm = `Sparkle ${i + 1}`;
    const t0 = 5 + (i % 3) * 2;
    const home = P(0, -160);
    d.anim(nm, "scale", s2(0), { cheer: [[0, s2(0)], [t0, s2(0), "ease_out_back"], [t0 + 7, s2(120)], [t0 + 24, s2(80), "ease_in"], [t0 + 32, s2(0)]] });
    d.anim(nm, "position", home, { cheer: [[0, home], [t0, home, "ease_out"], [t0 + 16, P(x, y + 30)], [t0 + 32, P(x * 1.05, y + 20)]] });
    d.anim(nm, "rotation", 0, { cheer: [[0, 0], [t0, 0, "ease_out"], [t0 + 32, i % 2 ? 140 : -140]] });
  });

  // Sleepy z's drift up and fade.
  [[2, 0.85], [24, 1.15]].forEach(([t0, s], i) => {
    const nm = `Z ${i + 1}`;
    d.anim(nm, "opacity", 0, { sleep: [[0, 0], [t0, 0], [t0 + 6, 100], [t0 + 26, 70], [t0 + 34, 0]] });
    d.anim(nm, "position", [300, 178], { sleep: [[0, [300, 178]], [t0, [300, 178], "ease_out"], [t0 + 34, [334 + i * 6, 104]]] });
    d.anim(nm, "scale", s2(60 * s), { sleep: [[0, s2(60 * s)], [t0, s2(60 * s)], [t0 + 34, s2(115 * s)]] });
    d.anim(nm, "rotation", -12, { sleep: [[0, -12], [t0, -12], [t0 + 17, 8], [t0 + 34, -6]] });
  });

  // ------------------------------------------------------------- state machine
  const m = d.machine("Lumi");
  d.input(m, "hover", "boolean", false);
  d.input(m, "look", "numeric", 0);
  d.input(m, "sleepy", "boolean", false);
  d.input(m, "poke", "event");
  d.input(m, "cheer", "event");
  d.state(m, "Idle", "idle", true);
  d.state(m, "LookLeft", "lookL", false, { mode: "reverse" });
  d.state(m, "LookRight", "lookR", false);
  d.state(m, "Wave", "wave", true);
  d.state(m, "Jump", "jump", false);
  d.state(m, "Cheer", "cheer", false);
  d.state(m, "Sleep", "sleep", true);
  d.global(m, "Any");

  const centred = [
    { input: "look", condition: "greater_than_or_equal", value: -0.33 },
    { input: "look", condition: "less_than_or_equal", value: 0.33 },
  ];
  d.go(m, "Any", "Jump", ev("poke"));
  d.go(m, "Any", "Cheer", ev("cheer"));
  d.go(m, "Idle", "Wave", is("hover", true));
  d.go(m, "Idle", "Sleep", is("sleepy", true));
  d.go(m, "Idle", "LookLeft", is("look", -0.33, "less_than"));
  d.go(m, "Idle", "LookRight", is("look", 0.33, "greater_than"));
  d.go(m, "Wave", "Idle", is("hover", false));
  for (const look of ["LookLeft", "LookRight"]) {
    d.go(m, look, "Idle", centred);
    d.go(m, look, "Wave", is("hover", true));
  }
  d.go(m, "LookLeft", "LookRight", is("look", 0.33, "greater_than"));
  d.go(m, "LookRight", "LookLeft", is("look", -0.33, "less_than"));
  d.go(m, "Sleep", "Idle", is("sleepy", false), { type: "tweened", duration: 0.3, easing: SNAP_SETTLE });
  d.go(m, "Jump", "Idle");
  d.go(m, "Cheer", "Idle");

  d.on(m, "Click", [{ type: "fire", input: "poke" }], "Body");
  d.hoverSets(m, "hover", "Body");
  return d;
}
