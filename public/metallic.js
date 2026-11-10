/* MetallicPaint (React Bits) — versi JavaScript murni untuk proyek ini (tanpa React / bundler).
   Shader, pengolahan bentuk (Poisson) dan perilaku sama dengan komponen aslinya; hanya dibungkus sebagai
   METAL.mount(container, opsi) supaya bisa dipasang di layar loading dengan logo dari admin.
   Bila WebGL2 / gambar gagal dimuat → onDone(false) dan layar loading memakai logo biasa (tidak ada yang rusak). */
(function () {
  'use strict';
  const WORKING_SIZE = 512, MAX_SIDE = 2048, MAX_PIXELS = 2560 * 1600 * 2;

  const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position;
uniform vec2 u_resolution;
uniform float u_imageAspect;
uniform float u_scale;
uniform float u_rotation;
out vec2 v_imageUV;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  vec2 uv = a_position * 0.5;
  float r = u_rotation * 3.14159265358979323846 / 180.0;
  mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 imageBox;
  imageBox.x = min(u_resolution.x / u_imageAspect, u_resolution.y) * u_imageAspect;
  imageBox.y = imageBox.x / u_imageAspect;
  v_imageUV = uv * (u_resolution / imageBox) / u_scale;
  v_imageUV.x *= u_imageAspect;
  v_imageUV = turn * v_imageUV;
  v_imageUV.x /= u_imageAspect;
  v_imageUV += 0.5;
  v_imageUV.y = 1.0 - v_imageUV.y;
}`;

  const FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_colorBack;
uniform vec4 u_colorTint;
uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;
uniform vec2 u_tilt;
uniform float u_reveal;
uniform float u_light;

in vec2 v_imageUV;

out vec4 fragColor;

#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float getColorChanges(float c1, float c2, float stripe, vec3 w, float blur, float bump, float tint) {
  float ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe));
  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));
  bump = smoothstep(0.2, 0.8, bump);
  border = w[0] + 0.4 * (1.0 - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));
  border = w[0] + 0.5 * (1.0 - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));
  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));
  float gradientT = (stripe - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradientT));
  ch = mix(ch, gradient, smoothstep(border, border + 0.5 * blur, stripe));
  ch = mix(ch, 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.0;
  frame *= smoothstep(0.0, th, uv.y);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);
  frame *= smoothstep(0.0, th, uv.x);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;
  float sum = 4.0 * centerSample;
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += 2.0 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += 2.0 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;
  return sum / 16.0;
}

void main() {
  const float firstFrameOffset = 2.8;
  float t = 0.3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  float cycleWidth = u_repetition;

  vec2 rotatedUV = uv - vec2(0.5);
  float angle = (-u_angle + 70.0) * PI / 180.0;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(rotatedUV.x * cosA - rotatedUV.y * sinA, rotatedUV.x * sinA + rotatedUV.y * cosA) + vec2(0.5);

  float edge = blurEdge3x3(u_image, uv, dudx, dudy, 6.0, img.r);
  edge = pow(edge, 1.6);
  edge *= smoothstep(0.0, 0.4, u_contour);

  float opacity = img.g * getImgFrame(v_imageUV, 0.0);
  float depth = img.r;

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color1 = mix(vec3(0.98, 0.98, 1.0), vec3(0.9, 0.9, 0.93), u_light);
  vec3 color2 = vec3(0.1, 0.1, 0.1 + 0.1 * smoothstep(0.7, 1.3, diagTLtoBR));

  vec2 gradUV = uv - 0.5 - u_tilt * vec2(0.18, -0.12);
  float dist = length(gradUV + vec2(0.0, 0.2 * diagBLtoTR));
  gradUV = rotate(gradUV, (0.25 - 0.2 * diagBLtoTR) * PI);
  float direction = gradUV.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1.0 - bump;
  bump *= pow(uv.y, 0.3);

  float thinStrip1 = 0.12 / cycleWidth * (1.0 - 0.4 * bump);
  float thinStrip2 = 0.07 / cycleWidth * (1.0 + 0.4 * bump);
  float wideStrip = 1.0 - thinStrip1 - thinStrip2;

  float noise = snoise(uv - t);
  edge += (1.0 - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  direction -= 2.0 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));
  direction *= mix(1.0, 1.0 - edge, smoothstep(0.5, 1.0, u_contour));
  direction -= 1.7 * edge * smoothstep(0.5, 1.0, u_contour);
  direction += 0.2 * pow(u_contour, 4.0) * (1.0 - smoothstep(0.0, 1.0, edge));

  bump *= clamp(pow(uv.y, 0.1), 0.3, 1.0);
  direction *= 0.1 + (1.1 - edge) * bump;
  direction *= 0.4 + 0.6 * (1.0 - smoothstep(0.5, 1.0, edge));
  direction += 0.18 * (smoothstep(0.1, 0.2, uv.y) * (1.0 - smoothstep(0.2, 0.4, uv.y)));
  direction += 0.03 * (smoothstep(0.1, 0.2, 1.0 - uv.y) * (1.0 - smoothstep(0.2, 0.4, 1.0 - uv.y)));
  direction *= 0.5 + 0.5 * pow(uv.y, 2.0);
  direction *= cycleWidth;
  direction -= t + dot(u_tilt, vec2(0.35, 0.2));

  float colorDispersion = clamp(1.0 - bump, 0.0, 1.0);
  float dispersionRed = colorDispersion;
  dispersionRed += 0.03 * bump * noise;
  dispersionRed += 5.0 * (smoothstep(-0.1, 0.2, uv.y) * (1.0 - smoothstep(0.1, 0.5, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 1.0, bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion * 1.3;
  dispersionBlue += (smoothstep(0.0, 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.8, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 0.8, bump)));
  dispersionBlue -= 0.2 * edge;

  dispersionRed *= u_shiftRed / 20.0;
  dispersionBlue *= u_shiftBlue / 20.0;

  float softness = 0.05 * u_softness;
  float blur = softness + 0.5 * smoothstep(1.0, 10.0, u_repetition) * smoothstep(0.0, 1.0, edge);
  float smallCanvas = 1.0 - smoothstep(100.0, 500.0, min(u_resolution.x, u_resolution.y));
  blur += smallCanvas * smoothstep(0.0, 1.0, edge);
  float rExtraBlur = softness * (0.05 + 0.1 * (u_shiftRed / 20.0) * bump);
  float gExtraBlur = softness * 0.05 / max(0.001, abs(1.0 - diagBLtoTR));

  vec3 w = vec3(thinStrip1 * cycleWidth, thinStrip2 * cycleWidth, wideStrip);
  w[1] -= 0.02 * smoothstep(0.0, 1.0, edge + bump);
  float stripeR = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripeR, w, blur + fwidth(stripeR) + rExtraBlur, bump, u_colorTint.r);
  float stripeG = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripeG, w, blur + fwidth(stripeG) + gExtraBlur, bump, u_colorTint.g);
  float stripeB = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripeB, w, blur + fwidth(stripeB), bump, u_colorTint.b);

  vec3 sheen = mix(vec3(1.0), u_colorTint.rgb, 0.45 * u_colorTint.a);
  r *= sheen.r;
  g *= sheen.g;
  b *= sheen.b;

  float rim = smoothstep(0.78, 1.0, depth) * u_light;
  r *= 1.0 - rim * 0.62;
  g *= 1.0 - rim * 0.62;
  b *= 1.0 - rim * 0.58;

  float pour = u_reveal * 1.25 - 0.1;
  opacity *= smoothstep(1.0 - pour, 1.15 - pour, depth) * smoothstep(0.0, 0.25, u_reveal);

  vec3 color = vec3(r, g, b) * opacity;
  vec3 back = u_colorBack.rgb * u_colorBack.a;
  color += back * (1.0 - opacity);
  opacity += u_colorBack.a * (1.0 - opacity);
  color += 1.0 / 256.0 * (fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);
  fragColor = vec4(color, opacity);
}`;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  let colorCtx = null;
  const parseColor = (value, fallback) => {
    try {
      colorCtx = colorCtx || document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      if (!colorCtx) return fallback;
      colorCtx.clearRect(0, 0, 1, 1);
      colorCtx.fillStyle = 'rgba(0, 0, 0, 0)';
      colorCtx.fillStyle = String(value);
      colorCtx.fillRect(0, 0, 1, 1);
      const d = colorCtx.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
    } catch (e) { return fallback; }
  };

  const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('MetallicPaint: gagal memuat gambar'));
    image.src = src;
  });

  const isVector = (src) => /\.svg($|[?#])/i.test(src) || src.indexOf('data:image/svg+xml') === 0;

  const drawImageSource = async (src) => {
    const image = await loadImage(src);
    const vector = isVector(src);
    let width = image.naturalWidth || image.width || MAX_SIDE;
    let height = image.naturalHeight || image.height || MAX_SIDE;
    const longest = Math.max(width, height);
    const fit = vector ? MAX_SIDE / longest : clamp(1024 / longest, 1, MAX_SIDE / longest);
    width = Math.max(1, Math.round(width * fit));
    height = Math.max(1, Math.round(height * fit));
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height); // gagal (SecurityError) bila server gambar tanpa CORS → ditangkap pemanggil
    let opaque = true;
    for (let i = 3; i < data.data.length; i += 4) if (data.data[i] < 250) { opaque = false; break; }
    if (opaque) { // gambar tanpa transparansi: bagian terang dianggap kosong
      for (let i = 0; i < data.data.length; i += 4) {
        const light = Math.min(data.data[i], data.data[i + 1], data.data[i + 2]);
        data.data[i + 3] = Math.round(clamp((250 - light) / 30, 0, 1) * 255);
      }
      ctx.putImageData(data, 0, 0);
    }
    return canvas;
  };

  const solvePoisson = (mask, width, height) => {
    const interior = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (!mask[i]) continue;
        const boundary = x === 0 || y === 0 || x === width - 1 || y === height - 1 ||
          !mask[i - 1] || !mask[i + 1] || !mask[i - width] || !mask[i + width] ||
          !mask[i - width - 1] || !mask[i - width + 1] || !mask[i + width - 1] || !mask[i + width + 1];
        if (!boundary) interior.push(i);
      }
    }
    const field = new Float32Array(width * height);
    const red = [], black = [];
    interior.forEach((i) => (((i % width) + Math.floor(i / width)) % 2 === 0 ? red.push(i) : black.push(i)));
    const relax = (list) => {
      for (let k = 0; k < list.length; k++) {
        const i = list[k];
        const sum = field[i + 1] + field[i - 1] + field[i - width] + field[i + width];
        field[i] = 1.9 * ((0.01 + sum) / 4) - 0.9 * field[i];
      }
    };
    for (let it = 0; it < 40; it++) { relax(red); relax(black); }
    let peak = 0;
    interior.forEach((i) => { if (field[i] > peak) peak = field[i]; });
    return { field, peak: peak || 1 };
  };

  const processShape = (source) => {
    const width = source.width, height = source.height;
    const fit = WORKING_SIZE / Math.min(width, height);
    const workW = Math.max(2, Math.round(width * fit)), workH = Math.max(2, Math.round(height * fit));
    const small = document.createElement('canvas');
    small.width = workW; small.height = workH;
    const smallCtx = small.getContext('2d', { willReadFrequently: true });
    smallCtx.drawImage(source, 0, 0, workW, workH);
    const smallData = smallCtx.getImageData(0, 0, workW, workH).data;
    const mask = new Uint8Array(workW * workH);
    for (let i = 0; i < mask.length; i++) mask[i] = smallData[i * 4 + 3] > 0 ? 1 : 0;
    const { field, peak } = solvePoisson(mask, workW, workH);
    const gradient = smallCtx.createImageData(workW, workH);
    for (let i = 0; i < mask.length; i++) {
      const p = i * 4, value = mask[i] ? 255 * (1 - field[i] / peak) : 255;
      gradient.data[p] = value; gradient.data[p + 1] = value; gradient.data[p + 2] = value; gradient.data[p + 3] = mask[i] ? 255 : 0;
    }
    smallCtx.putImageData(gradient, 0, 0);
    const out = document.createElement('canvas');
    out.width = width; out.height = height;
    const outCtx = out.getContext('2d', { willReadFrequently: true });
    outCtx.imageSmoothingEnabled = true; outCtx.imageSmoothingQuality = 'high';
    outCtx.drawImage(small, 0, 0, workW, workH, 0, 0, width, height);
    const result = outCtx.getImageData(0, 0, width, height);
    const original = source.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data;
    for (let i = 0; i < result.data.length; i += 4) {
      const alpha = original[i + 3];
      if (alpha === 0) { result.data[i] = 255; result.data[i + 1] = 0; }
      else { result.data[i] = result.data[i + 3] === 0 ? 0 : result.data[i]; result.data[i + 1] = alpha; }
      result.data[i + 2] = 255; result.data[i + 3] = 255;
    }
    return result;
  };

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader); return null;
  };

  const live = new Set();

  // opsi: imageSrc, color, backgroundColor, density, softness, dispersion, distortion, edgeBend, angle, speed, scale,
  //       rotation, mouseTilt, lightMode, intro, paused, onDone(ok)
  function mount(container, o) {
    o = o || {};
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    let finished = false;
    const done = (ok) => { if (finished) return; finished = true; try { o.onDone && o.onDone(ok); } catch (e) { /* abaikan */ } };
    const canvas = document.createElement('canvas');
    canvas.className = 'mp-canvas';
    container.appendChild(canvas);
    const fail = () => { try { canvas.remove(); } catch (e) { /* abaikan */ } done(false); return { destroy() {} }; };

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl || !o.imageSrc) return fail();
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX), fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT), program = gl.createProgram();
    if (!vertex || !fragment || !program) return fail();
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fail();
    gl.useProgram(program);

    const uniforms = {}, count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) { const info = gl.getActiveUniform(program, i); if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name); }

    const vao = gl.createVertexArray(), buffer = gl.createBuffer();
    gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(uniforms.u_image, 0);

    const s = {
      tint: parseColor(o.color == null ? '#ffffff' : o.color, [1, 1, 1, 1]),
      back: parseColor(o.backgroundColor == null ? 'transparent' : o.backgroundColor, [0, 0, 0, 0]),
      density: clamp(o.density == null ? 2 : o.density, 0.5, 12),
      softness: clamp(o.softness == null ? 0.1 : o.softness, 0, 1),
      dispersion: clamp(o.dispersion == null ? 0.3 : o.dispersion, -1, 1),
      distortion: clamp(o.distortion == null ? 0.07 : o.distortion, 0, 1),
      edgeBend: clamp(o.edgeBend == null ? 0.6 : o.edgeBend, 0, 1),
      angle: o.angle == null ? 70 : o.angle,
      speed: o.speed == null ? 1 : o.speed,
      scale: Math.max(0.05, o.scale == null ? 0.6 : o.scale),
      rotation: o.rotation || 0,
      mouseTilt: clamp(o.mouseTilt == null ? 0.5 : o.mouseTilt, 0, 1.5),
      lightMode: !!o.lightMode,
      intro: o.intro !== false,
      paused: !!o.paused,
      dpr: o.dpr
    };

    const st = { raf: 0, last: 0, time: 0, visible: true, hasImage: false, imageAspect: 1, width: 0, height: 0, revealStart: -1,
      reveal: s.intro && !reduce ? 0 : 1, tiltX: 0, tiltY: 0, vx: 0, vy: 0, tx: 0, ty: 0, alive: true };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const base = s.dpr != null ? s.dpr : Math.min(window.devicePixelRatio || 1, 2);
      let ratio = Math.max(base, 2);
      const pixels = rect.width * rect.height * ratio * ratio;
      if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);
      const width = Math.max(1, Math.round(rect.width * ratio)), height = Math.max(1, Math.round(rect.height * ratio));
      if (width === st.width && height === st.height) return;
      st.width = width; st.height = height; canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height);
    };

    const draw = () => {
      if (!st.hasImage) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); return; }
      gl.useProgram(program);
      gl.uniform2f(uniforms.u_resolution, st.width, st.height);
      gl.uniform1f(uniforms.u_time, st.time);
      gl.uniform1f(uniforms.u_imageAspect, st.imageAspect);
      gl.uniform1f(uniforms.u_scale, s.scale);
      gl.uniform1f(uniforms.u_rotation, s.rotation);
      gl.uniform4f(uniforms.u_colorBack, s.back[0], s.back[1], s.back[2], s.back[3]);
      gl.uniform4f(uniforms.u_colorTint, s.tint[0], s.tint[1], s.tint[2], s.tint[3]);
      gl.uniform1f(uniforms.u_softness, s.softness);
      gl.uniform1f(uniforms.u_repetition, s.density);
      gl.uniform1f(uniforms.u_shiftRed, s.dispersion);
      gl.uniform1f(uniforms.u_shiftBlue, s.dispersion);
      gl.uniform1f(uniforms.u_distortion, s.distortion);
      gl.uniform1f(uniforms.u_contour, s.edgeBend);
      gl.uniform1f(uniforms.u_angle, s.angle);
      gl.uniform2f(uniforms.u_tilt, st.tiltX, st.tiltY);
      gl.uniform1f(uniforms.u_reveal, st.reveal);
      gl.uniform1f(uniforms.u_light, s.lightMode ? 1 : 0);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = (now) => {
      st.raf = 0;
      if (!st.alive) return;
      const dt = st.last ? Math.min(0.05, (now - st.last) / 1000) : 1 / 60;
      st.last = now;
      const moving = !s.paused && !reduce && s.speed !== 0;
      if (moving) st.time += dt * s.speed;
      let busy = moving;
      if (st.reveal < 1) {
        if (st.revealStart < 0) st.revealStart = now;
        const progress = clamp((now - st.revealStart) / 1600, 0, 1);
        st.reveal = 1 - Math.pow(1 - progress, 3);
        if (moving) st.time += dt * 2.4 * Math.pow(1 - progress, 2);
        busy = true;
      }
      const stiffness = 60, damping = 14, steps = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / steps;
      for (let i = 0; i < steps; i++) {
        st.vx += (stiffness * (st.tx * s.mouseTilt - st.tiltX) - damping * st.vx) * h;
        st.vy += (stiffness * (st.ty * s.mouseTilt - st.tiltY) - damping * st.vy) * h;
        st.tiltX += st.vx * h; st.tiltY += st.vy * h;
      }
      if (Math.abs(st.tx * s.mouseTilt - st.tiltX) > 0.0005 || Math.abs(st.ty * s.mouseTilt - st.tiltY) > 0.0005 || Math.abs(st.vx) + Math.abs(st.vy) > 0.0005) busy = true;
      draw();
      if (busy && st.visible) st.raf = requestAnimationFrame(frame); else st.last = 0;
    };
    const wake = () => { if (!st.raf && st.alive && st.visible) st.raf = requestAnimationFrame(frame); };

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      st.tx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1.2, 1.2);
      st.ty = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1.2, 1.2);
      wake();
    };
    const onLeave = () => { st.tx = 0; st.ty = 0; wake(); };
    const ro = new ResizeObserver(() => { resize(); draw(); }); ro.observe(container);
    const io = new IntersectionObserver((en) => { st.visible = en.some((x) => x.isIntersecting); if (st.visible) wake(); }); io.observe(container);
    const onLost = (e) => { e.preventDefault(); st.alive = false; cancelAnimationFrame(st.raf); done(false); };
    canvas.addEventListener('webglcontextlost', onLost);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerleave', onLeave);

    const handle = {
      destroy() {
        if (!st.alive && !live.has(handle)) return;
        st.alive = false; live.delete(handle); cancelAnimationFrame(st.raf);
        ro.disconnect(); io.disconnect();
        canvas.removeEventListener('webglcontextlost', onLost);
        container.removeEventListener('pointermove', onMove); container.removeEventListener('pointerleave', onLeave);
        try { gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteVertexArray(vao); gl.deleteProgram(program); } catch (e) { /* abaikan */ }
      }
    };
    live.add(handle);

    resize(); draw();
    drawImageSource(o.imageSrc).then((src) => {
      if (!st.alive) return;
      const data = processShape(src);
      if (!st.alive) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      st.imageAspect = data.width / data.height; st.hasImage = true;
      resize(); draw(); wake(); done(true);
    }).catch(() => { handle.destroy(); try { canvas.remove(); } catch (e) { /* abaikan */ } done(false); });
    return handle;
  }

  window.METAL = { mount, stopAll() { Array.from(live).forEach((h) => h.destroy()); } };
})();
