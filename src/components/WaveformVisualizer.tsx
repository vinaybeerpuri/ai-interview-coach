import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  analyser: AnalyserNode;
}

export const WaveformVisualizer = ({ analyser }: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        const hue = 221;
        const lightness = 40 + (dataArray[i] / 255) * 20;
        ctx.fillStyle = `hsl(${hue}, 83%, ${lightness}%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className="w-full max-w-md h-24 rounded-2xl bg-secondary/50"
    />
  );
};
