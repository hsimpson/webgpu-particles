import React from 'react';

export interface StatsProps {
  frameTime: number;
  cpuTime: number;
}

const Stats = (props: StatsProps): React.ReactElement => {
  return (
    <div className="stats">
      {`Avg frame time: ${props.frameTime.toFixed(3)} ms`}
      <br />
      {`FPS: ${(1000 / props.frameTime).toFixed(2)}`}
      <br />
      {`Avg CPU time: ${props.cpuTime.toFixed(3)} ms`}
    </div>
  );
};

export default Stats;