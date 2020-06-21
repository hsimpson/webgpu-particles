import React from 'react';

const ErrorMessage = (): React.ReactElement => {
  return (
    <div className="error">
      Your browser does not support WebGPU yet{' '}
      <a href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status">(Implementation Status)</a>
      <br></br>
      If you want to try this out:
      <ul>
        <li>In Chrome enable a flag: chrome://flags/#enable-unsafe-webgpu</li>
      </ul>
      <br></br>
      Additional information:
      <ul>
        <li>
          <a href="https://github.com/gpuweb/gpuweb">Github repo</a>
        </li>
        <li>
          <a href="https://en.wikipedia.org/wiki/WebGPU">Wikipedia article</a>
        </li>
      </ul>
    </div>
  );
};

export default ErrorMessage;
