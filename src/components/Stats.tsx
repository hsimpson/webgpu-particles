import React from 'react';

export interface StatsProps {
  frameTime: number;
  cpuTime: number;
}

const Stats = ({ frameTime, cpuTime }: StatsProps): React.ReactElement => {
  return (
    <div className="absolute top-0 left-0 p-2 text-red-400">
      {`Avg frame time: ${frameTime.toFixed(3)} ms`}
      <br />
      {`FPS: ${(1000 / frameTime).toFixed(2)}`}
      <br />
      {`Avg CPU time: ${cpuTime.toFixed(3)} ms`}
    </div>
  );
};

export default Stats;
