import React from 'react';

export interface StatsProps {
  frameTime: number;
}

const Stats = (props: StatsProps): React.ReactElement => {
  return (
    <div className="stats">
      {`Avg frame time: ${props.frameTime.toFixed(3)}`}
      <br></br>
      {`FPS: ${(1000 / props.frameTime).toFixed(2)}`}
    </div>
  );
};

export default Stats;
