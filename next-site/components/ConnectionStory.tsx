'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDownRight } from 'lucide-react';
import './connection-story.css';

type ConnectionStoryProps = {
  paused: boolean;
  reduced: boolean;
  still: boolean;
};

const chapters = [
  {
    title: 'Understand the work.',
    body: 'Start with the people using the system. Map their records, decisions, and the handoffs that need attention.',
    detail: 'Requirements before solutions',
  },
  {
    title: 'Define the handoffs.',
    body: 'Connect applications around the workflow. Define each trigger, destination, and the steps that need a person’s decision.',
    detail: 'Applications + automation',
  },
  {
    title: 'Make the next step clear.',
    body: 'Use clear interfaces and useful context to help people find the right information and act on it.',
    detail: 'A system people can use',
  },
];

const channels = [
  { x: 155, color: 'var(--lime)', label: 'Applications', role: 'The records', inner: 'Records', startX: -15, startY: -45, rotation: -16 },
  { x: 320, color: '#F0F4F7', label: 'Automation', role: 'The handoffs', inner: 'Rules', startX: 0, startY: 46, rotation: 13 },
  { x: 485, color: '#486B88', label: 'Intelligence', role: 'The context', inner: 'Context', startX: 15, startY: -22, rotation: -12 },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export default function ConnectionStory({ paused, reduced, still }: ConnectionStoryProps) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const forms = useRef<Array<SVGGElement | null>>([]);
  const connections = useRef<SVGGElement>(null);
  const diagramId = useId();
  const [canScrub, setCanScrub] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1001px) and (min-height: 620px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setCanScrub(desktop.matches && !motion.matches && !paused && !reduced && !still);
    sync();
    desktop.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    return () => {
      desktop.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, [paused, reduced, still]);

  useEffect(() => {
    const root = section.current;
    const region = track.current;
    if (!root || !region) return;

    // Scroll explains the change from separate tools to a connected workflow.
    // Writes stay on the SVG elements; React never renders on individual scroll frames.
    const paint = (progress: number) => {
      const alignment = clamp(progress / 0.6);
      const linkOpacity = clamp((progress - 0.52) / 0.34);
      channels.forEach((channel, index) => {
        const form = forms.current[index];
        if (!form) return;
        const remaining = 1 - alignment;
        form.style.transform = `translate(${channel.startX * remaining}px, ${channel.startY * remaining}px) rotate(${channel.rotation * remaining}deg)`;
      });
      if (connections.current) connections.current.style.opacity = String(linkOpacity);
      const chapter = progress < 0.32 ? '0' : progress < 0.68 ? '1' : '2';
      if (root.dataset.chapter !== chapter) root.dataset.chapter = chapter;
    };

    if (!canScrub) {
      paint(1);
      root.dataset.chapter = 'all';
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = region.getBoundingClientRect();
      const progress = clamp((window.innerHeight * 0.55 - bounds.top - 100) / Math.max(bounds.height - 200, 1));
      paint(progress);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [canScrub]);

  return (
    <section
      className="connection-story"
      aria-labelledby="connection-story-title"
      id="approach"
      ref={section}
      data-mode={canScrub ? 'scroll' : 'static'}
      data-chapter="all"
    >
      <div className="wrap">
        <div className="connection-story-heading">
          <div>
            <h2 id="connection-story-title">Good systems<br />start with the <span>gaps.</span></h2>
          </div>
          <p className="connection-story-intro">I begin with the records, decisions, and people behind a workflow, then connect the tools around them.</p>
        </div>

        <div className="connection-story-track" ref={track}>
          <figure className="connection-story-scene">
            <div className="connection-story-scene-heading" aria-hidden="true">
              <span>From separate tools to shared context</span>
              <span className="connection-story-scene-mark"><i /><i /><i /></span>
            </div>
            <svg className="connection-story-diagram" viewBox="0 0 640 390" role="img" aria-labelledby={`${diagramId}-title ${diagramId}-description`}>
              <title id={`${diagramId}-title`}>Applications, automation, and intelligence working together</title>
              <desc id={`${diagramId}-description`}>Three open square channels represent the records in applications, the handoffs handled by automation, and the context provided by intelligence. Connections join them into one workflow.</desc>
              <path className="connection-story-guide" d="M54 195H586" />
              <g ref={connections} className="connection-story-links" aria-hidden="true">
                <path d="M209 195H266M374 195H431" />
                <path className="connection-story-link-arrow" d="m248 190 5 5-5 5m165-10 5 5-5 5" />
                <circle cx="588" cy="195" r="4" />
                <path className="connection-story-exit" d="M539 195H578" />
              </g>
              {channels.map((channel, index) => (
                <g key={channel.label}>
                  <g transform={`translate(${channel.x} 195)`}>
                    <g ref={(element) => { forms.current[index] = element; }} className="connection-story-form" style={{ color: channel.color }}>
                      <path className="connection-story-channel-shadow" d="M54-24V-42Q54-58 38-58H-38Q-54-58-54-42V42Q-54 58-38 58H38Q54 58 54 42V24" />
                      <path className="connection-story-channel" d="M54-24V-42Q54-58 38-58H-38Q-54-58-54-42V42Q-54 58-38 58H38Q54 58 54 42V24" />
                      <path className="connection-story-channel-edge" d="M46-27V-41Q46-50 37-50H-37Q-46-50-46-41V41" />
                      <text className="connection-story-inner-label" textAnchor="middle" y="4">{channel.inner}</text>
                    </g>
                  </g>
                  <g className="connection-story-channel-label" transform={`translate(${channel.x} 310)`}>
                    <text textAnchor="middle">{channel.label}</text>
                    <text className="connection-story-role" textAnchor="middle" y="23">{channel.role}</text>
                  </g>
                </g>
              ))}
              <g className="connection-story-boundaries" aria-hidden="true">
                <path d="M30 32h13M30 32v13M610 32h-13M610 32v13M30 362h13M30 362v-13M610 362h-13M610 362v-13" />
              </g>
            </svg>
            <figcaption><span>One workflow. Every part has a purpose.</span><span>Illustrative system</span></figcaption>
          </figure>

          <div className="connection-story-chapters">
            {chapters.map((chapter, index) => (
              <article className="connection-story-chapter" key={chapter.title} data-step={index}>
                <span className="connection-story-number" aria-hidden="true">0{index + 1}</span>
                <div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.body}</p>
                  <span className="connection-story-detail">{chapter.detail}</span>
                </div>
              </article>
            ))}
            <a className="connection-story-next" href="#about">Meet the person behind the work <ArrowDownRight size={18} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
