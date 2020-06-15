import WebGPURenderContext from './webgpurendercontext';
import WebGPUPipelineBase from './webgpupipelinebase';
import WebGPUMesh from './webgpumesh';
import { createBuffer } from './webgpuhelpers';
import { BoxDimensions } from './boxgeometry';
import { vec3, vec4 } from 'gl-matrix';

interface WebGPUComputePiplineOptions {
  computeShaderUrl: string;
  particleCount: number;
}

interface ComputeParams {
  vHalfBounding: vec4;
  vForcePos: vec4;
  fDeltaTime: number;
  fGravity: number;
  fForce: number;
  fForceOn: number;
}

export default class WebGPUComputePipline extends WebGPUPipelineBase {
  private _options: WebGPUComputePiplineOptions;
  private _bindGroup: GPUBindGroup;

  private _computeParamsUniformBuffer: GPUBuffer;
  private _posBuffer: GPUBuffer;
  private _velBuffer: GPUBuffer;

  private _computeParams: ComputeParams;

  private _drawMesh: WebGPUMesh;

  private _queue: GPUQueue;

  public constructor(drawMesh: WebGPUMesh, options: WebGPUComputePiplineOptions) {
    super();

    this._drawMesh = drawMesh;

    this._options = options;

    let halfBounding = vec3.clone(BoxDimensions);
    halfBounding = vec3.scale(halfBounding, halfBounding, 0.5);

    this._computeParams = {
      vHalfBounding: [halfBounding[0], halfBounding[1], halfBounding[2], 1.0],
      vForcePos: [0, 0, 0, 1],
      fDeltaTime: 0.001,
      fGravity: 9.81, // 9.81 m/s² default earth gravity
      fForce: 20,
      fForceOn: 0,
    };
  }

  public async initialize(context: WebGPURenderContext): Promise<void> {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    this._queue = context.queue;

    const velArray = new Float32Array(this._options.particleCount * 4);

    this._posBuffer = this._drawMesh.geometry.vertexBuffers[0];

    const uniformArray = this.getParamsArray();
    this._computeParamsUniformBuffer = createBuffer(
      context.device,
      uniformArray,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    );

    this._velBuffer = createBuffer(context.device, velArray, GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE);

    const computeStage: GPUProgrammableStageDescriptor = {
      module: await this.loadShader(context, this._options.computeShaderUrl),
      entryPoint: 'main',
    };

    const uniformBindGroupLayout = context.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          type: 'uniform-buffer',
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          type: 'storage-buffer',
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          type: 'storage-buffer',
        },
      ],
    });

    this._bindGroup = context.device.createBindGroup({
      layout: uniformBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this._computeParamsUniformBuffer,
            offset: 0,
            size: uniformArray.byteLength,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this._posBuffer,
            offset: 0,
            size: velArray.byteLength,
          },
        },
        {
          binding: 2,
          resource: {
            buffer: this._velBuffer,
            offset: 0,
            size: velArray.byteLength,
          },
        },
      ],
    });
    this._bindGroup.label = `${this.name}-BindGroup`;

    const layout = context.device.createPipelineLayout({
      bindGroupLayouts: [uniformBindGroupLayout],
    });

    const pipelineDesc: GPUComputePipelineDescriptor = {
      layout,
      computeStage,
    };

    this._pipeline = context.device.createComputePipeline(pipelineDesc);
  }

  private getParamsArray(): Float32Array {
    const keys = Object.keys(this._computeParams);
    const array = [];
    for (let i = 0; i < keys.length; i++) {
      const val = this._computeParams[keys[i]];
      if (Array.isArray(val)) {
        array.push(...val);
      } else {
        array.push(val);
      }
    }
    return new Float32Array(array);
  }

  private updateUniformBuffer(): void {
    if (this._initialized) {
      const uniformArray = this.getParamsArray();
      this._queue.writeBuffer(this._computeParamsUniformBuffer, 0, uniformArray.buffer);
    }
  }

  public get bindGroup(): GPUBindGroup {
    return this._bindGroup;
  }

  public get gpuPipeline(): GPUComputePipeline {
    return this._pipeline as GPUComputePipeline;
  }

  public get particleCount(): number {
    return this._options.particleCount;
  }

  public turnForceOn(): void {
    this._computeParams.fForceOn = 1;
    this.updateUniformBuffer();
  }

  public turnForceOff(): void {
    this._computeParams.fForceOn = 0;
    this.updateUniformBuffer();
  }

  public deltaTime(deltaTime: number): void {
    this._computeParams.fDeltaTime = deltaTime / 1000;
    this.updateUniformBuffer();
  }

  public set forcePostion(pos: vec3) {
    this._computeParams.vForcePos = [pos[0], pos[1], pos[2], 1.0];
    this.updateUniformBuffer();
  }
}
