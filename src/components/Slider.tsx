import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  labelText?: string;
  onValueChange: (value: number) => void;
}
const Slider = ({ min, max, step, value, labelText, onValueChange }: SliderProps): React.ReactElement => {
  const onSliderChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = parseFloat(event.target.value);
    onValueChange(newValue);
  };
  return (
    <div className="slider">
      <label>
        {labelText ?? ''}
        <br />
        <input
          className="w-full"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onSliderChange}
        />
      </label>
    </div>
  );
};

export default Slider;
