import { useEffect, useMemo, useRef, useState } from 'react';
import Matter from 'matter-js';

const COLORS = {
  1: '#ff6b6b',
  2: '#4dabf7',
  3: '#51cf66',
};

const LABELS = ['1', '2', '3'];
const MAX_BALLS_PER_LANE = 90;

function getScale(counts) {
  const highest = Math.max(counts[1] || 0, counts[2] || 0, counts[3] || 0);
  return Math.max(1, Math.ceil(highest / MAX_BALLS_PER_LANE));
}

function getVisualCounts(counts, scale) {
  return {
    1: Math.ceil((counts[1] || 0) / scale),
    2: Math.ceil((counts[2] || 0) / scale),
    3: Math.ceil((counts[3] || 0) / scale),
  };
}

export default function BallBoard({ counts }) {
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  const latestCountsRef = useRef(counts);
  const [revision, setRevision] = useState(0);
  const scale = useMemo(() => getScale(counts), [counts]);

  latestCountsRef.current = counts;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const { Engine, Render, Runner, Bodies, Composite } = Matter;

    function destroySimulation() {
      const simulation = simulationRef.current;
      if (!simulation) return;

      Render.stop(simulation.render);
      Runner.stop(simulation.runner);
      Composite.clear(simulation.engine.world, false);
      Engine.clear(simulation.engine);
      simulation.render.canvas.remove();
      simulation.render.textures = {};
      simulationRef.current = null;
    }

    function buildSimulation() {
      const width = Math.max(container.clientWidth, 320);
      const height = Math.max(container.clientHeight, 420);
      const laneWidth = width / 3;
      const wallThickness = 30;
      const ballRadius = Math.max(8, Math.min(18, width / 55));
      const engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = 0.92;

      const render = Render.create({
        element: container,
        engine,
        options: {
          width,
          height,
          wireframes: false,
          background: 'transparent',
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        },
      });
      const runner = Runner.create();

      const walls = [
        Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, {
          isStatic: true,
          render: { fillStyle: 'rgba(255,255,255,0.16)' },
        }),
        Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
          isStatic: true,
          render: { visible: false },
        }),
        Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, {
          isStatic: true,
          render: { visible: false },
        }),
        Bodies.rectangle(laneWidth, height / 2, 10, height, {
          isStatic: true,
          render: { fillStyle: 'rgba(255,255,255,0.18)' },
        }),
        Bodies.rectangle(laneWidth * 2, height / 2, 10, height, {
          isStatic: true,
          render: { fillStyle: 'rgba(255,255,255,0.18)' },
        }),
      ];
      Composite.add(engine.world, walls);

      function addBall(choice, delayIndex = 0) {
        const laneIndex = Number(choice) - 1;
        const minX = laneIndex * laneWidth + ballRadius + 14;
        const maxX = (laneIndex + 1) * laneWidth - ballRadius - 14;
        const x = minX + Math.random() * Math.max(1, maxX - minX);
        const y = -ballRadius - Math.random() * 70 - Math.min(delayIndex * 7, height * 0.7);
        const ball = Bodies.circle(x, y, ballRadius, {
          restitution: 0.72,
          friction: 0.02,
          frictionAir: 0.004,
          density: 0.0015,
          render: {
            fillStyle: COLORS[choice],
            strokeStyle: 'rgba(255,255,255,0.75)',
            lineWidth: 2,
          },
        });
        Composite.add(engine.world, ball);
      }

      const visualCounts = getVisualCounts(latestCountsRef.current, scale);
      LABELS.forEach((choice) => {
        for (let index = 0; index < visualCounts[choice]; index += 1) {
          addBall(choice, index);
        }
      });

      Render.run(render);
      Runner.run(runner, engine);
      simulationRef.current = {
        engine,
        render,
        runner,
        scale,
        visualCounts,
        addBall,
      };
    }

    buildSimulation();

    let resizeTimer = null;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        destroySimulation();
        buildSimulation();
      }, 120);
    });
    resizeObserver.observe(container);

    return () => {
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      destroySimulation();
    };
  }, [scale, revision]);

  useEffect(() => {
    const simulation = simulationRef.current;
    if (!simulation || simulation.scale !== scale) return;

    const desiredCounts = getVisualCounts(counts, scale);
    const hasDecrease = LABELS.some(
      (choice) => desiredCounts[choice] < simulation.visualCounts[choice],
    );

    if (hasDecrease) {
      setRevision((value) => value + 1);
      return;
    }

    LABELS.forEach((choice) => {
      const missing = desiredCounts[choice] - simulation.visualCounts[choice];
      for (let index = 0; index < missing; index += 1) {
        simulation.addBall(choice, index);
      }
      simulation.visualCounts[choice] = desiredCounts[choice];
    });
  }, [counts, scale]);

  return (
    <div className="ball-board-shell">
      <div className="ball-board" ref={containerRef} aria-label="投票球體即時動畫" />
      <div className="lane-headings" aria-hidden="true">
        {LABELS.map((choice) => (
          <div key={choice} className={`lane-heading lane-${choice}`}>
            <span className="choice-number">{choice}</span>
            <strong>{counts[choice] || 0} 票</strong>
          </div>
        ))}
      </div>
      {scale > 1 && <div className="scale-note">視覺比例：每顆球約代表 {scale} 票</div>}
    </div>
  );
}
