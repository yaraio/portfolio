import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SHEET } from '../paper/bake';
import { videoSrc } from '../paper/video';

// The opening, filmed: a real paper ball unwrapping (public/paper/unwrap.mp4), keyed
// from green-screen footage and cropped so the open sheet fills the frame. The video
// holds the colour on top and the alpha matte below. A shader puts the two together
// and re-tones the paper to the site's paper colour, then the page fades in under it.

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
  uniform sampler2D map;
  uniform vec2 scale;      // cover-fit + zoom, in uv units
  uniform vec3 tone;       // site paper colour
  uniform float mixTone;   // 0 = video colours, 1 = fully re-toned
  varying vec2 vUv;

  void main() {
    vec2 uv = (vUv - 0.5) / scale + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
    vec3 c = texture2D(map, vec2(uv.x, 0.5 + uv.y * 0.5)).rgb;     // top half
    float alpha = texture2D(map, vec2(uv.x, uv.y * 0.5)).g;         // bottom half
    alpha = smoothstep(0.02, 0.98, alpha);

    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 toned = tone * (1.0 + (lum / 0.9 - 1.0) * 2.0); // close to the page photo's creases
    gl_FragColor = vec4(mix(c, toned, mixTone) * alpha, alpha);
  }
`;

export default function VideoIntro({ onDone }: { onDone: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const doneRef = useRef(false);
  const finish = useRef(() => {});

  finish.current = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setGone(true);
    setTimeout(onDone, 650);
  };

  useEffect(() => {
    const skip = () => finish.current();
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, []);

  useEffect(() => {
    const mount = mountRef.current!;
    const W = window.innerWidth, H = window.innerHeight;
    const video = document.createElement('video');
    video.src = videoSrc();
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: true });
    } catch {
      finish.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.NoColorSpace; // raw sRGB values in, raw out
    const uniforms = {
      map: { value: tex },
      scale: { value: new THREE.Vector2(1, 1) },
      tone: { value: new THREE.Vector3(SHEET.base[0] / 255, SHEET.base[1] / 255, SHEET.base[2] / 255) },
      mixTone: { value: 1 },
    };
    const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let raf = 0;
    const loop = () => {
      const vw = video.videoWidth || 16, vh = (video.videoHeight || 18) / 2;
      const d = video.duration || 1;
      const t = video.currentTime / d;
      // the open sheet fills the frame, so cover-fit fills the screen; a slight push in at the end
      const cover = Math.max(W / vw, H / vh);
      const zoom = 1 + Math.max(0, (t - 0.75) / 0.25) ** 2 * 0.06;
      uniforms.scale.value.set((vw * cover * zoom) / W, (vh * cover * zoom) / H);
      renderer.render(scene, camera);
      if (video.ended || t > 0.985) finish.current();
      raf = requestAnimationFrame(loop);
    };

    video.addEventListener('error', () => finish.current());
    video.play().then(() => { raf = requestAnimationFrame(loop); }, () => finish.current());

    return () => {
      cancelAnimationFrame(raf);
      video.pause();
      video.removeAttribute('src');
      tex.dispose(); mat.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className={`intro intro--video${gone ? ' intro--fade' : ''}`} ref={mountRef} onClick={() => finish.current()} aria-hidden="true">
      <span className="intro__skip">tap to skip</span>
    </div>
  );
}
