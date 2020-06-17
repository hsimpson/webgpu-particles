import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  labelText?: string;
  onValueChange: (value: number) => void;
}
const Slider = (props: SliderProps): React.ReactElement => {
  const onSliderChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(event.target.value);
    props.onValueChange(value);
  };
  return (
    <div className="slider">
      <label>
        {props.labelText || ''}
        <br></br>
        <input
          type="range"
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          onChange={onSliderChange}
          list="tickmarks"></input>
      </label>
    </div>
  );
};

export default Slider;
