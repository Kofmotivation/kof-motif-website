import { Renderer, Camera, Geometry, Program, Mesh } from "https://cdn.jsdelivr.net/npm/ogl@1.0.10/+esm";

const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];

const hexToRgb = (hex) => {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(h.slice(0, 6), 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));

    if (uAlphaParticles < 0.5) {
      if (d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const OPTIONS = {
  particleCount: 550,
  particleSpread: 20,
  speed: 0.1,
  particleColors: ["#ffffff"],
  moveParticlesOnHover: true,
  particleHoverFactor: 1,
  alphaParticles: false,
  particleBaseSize: 100,
  sizeRandomness: 1,
  cameraDistance: 20,
  disableRotation: false,
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const container = document.querySelector("#work-particles");

// Skip WebGL particles on touch / mobile — heavy GPU load can crash-reload Safari
if (!container || reduceMotion || !finePointer) {
  container?.setAttribute("hidden", "");
} else {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
  const mouse = { x: 0, y: 0 };
  let renderer;
  let camera;
  let particles;
  let program;
  let animationFrameId = 0;
  let lastTime = performance.now();
  let elapsed = 0;
  let running = false;
  let disposed = false;

  const shouldRun = () =>
    !disposed &&
    document.body.dataset.activeView === "work" &&
    !document.body.classList.contains("focus-open") &&
    !document.body.classList.contains("is-loading") &&
    !document.hidden &&
    !container.hasAttribute("hidden");

  try {
    renderer = new Renderer({
      dpr: pixelRatio,
      depth: false,
      alpha: true,
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, OPTIONS.cameraDistance);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize, { passive: true });
    resize();

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("pointermove", handleMouseMove, { passive: true });

    const count = OPTIONS.particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette =
      OPTIONS.particleColors?.length > 0 ? OPTIONS.particleColors : defaultColors;

    for (let i = 0; i < count; i++) {
      let x;
      let y;
      let z;
      let len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      colors.set(hexToRgb(palette[Math.floor(Math.random() * palette.length)]), i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: OPTIONS.particleSpread },
        uBaseSize: { value: OPTIONS.particleBaseSize * pixelRatio },
        uSizeRandomness: { value: OPTIONS.sizeRandomness },
        uAlphaParticles: { value: OPTIONS.alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });

    particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    const update = (t) => {
      if (!running) {
        animationFrameId = 0;
        return;
      }
      animationFrameId = requestAnimationFrame(update);
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * OPTIONS.speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      if (OPTIONS.moveParticlesOnHover) {
        particles.position.x = -mouse.x * OPTIONS.particleHoverFactor;
        particles.position.y = -mouse.y * OPTIONS.particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }

      if (!OPTIONS.disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * OPTIONS.speed;
      }

      renderer.render({ scene: particles, camera });
    };

    const start = () => {
      if (running || !shouldRun()) return;
      running = true;
      container.classList.add("is-live");
      lastTime = performance.now();
      if (!animationFrameId) animationFrameId = requestAnimationFrame(update);
    };

    const stop = () => {
      running = false;
      container.classList.remove("is-live");
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
    };

    const sync = () => {
      resize();
      if (shouldRun()) start();
      else stop();
    };

    const viewObserver = new MutationObserver(sync);
    viewObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-active-view", "class"],
    });
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("load", sync);

    if (document.readyState === "complete") sync();
    else window.addEventListener("DOMContentLoaded", sync, { once: true });
    requestAnimationFrame(sync);
  } catch (err) {
    console.warn("Work particles failed to init", err);
    container.setAttribute("hidden", "");
  }
}
