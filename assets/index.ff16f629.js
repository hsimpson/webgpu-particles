var le=Object.defineProperty,de=Object.defineProperties;var pe=Object.getOwnPropertyDescriptors;var H=Object.getOwnPropertySymbols;var fe=Object.prototype.hasOwnProperty,me=Object.prototype.propertyIsEnumerable;var q=(s,e,t)=>e in s?le(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,v=(s,e)=>{for(var t in e||(e={}))fe.call(e,t)&&q(s,t,e[t]);if(H)for(var t of H(e))me.call(e,t)&&q(s,t,e[t]);return s},E=(s,e)=>de(s,pe(e));import{c as _,a as G,b as N,l as _e,f as ie,m as O,p as ge,t as ve,d as re,e as se,g as be,h as xe,i as ye,s as Pe,j as we,k as Me,n as X,o as Ce,q as Ue,r as n,u as C,R as ae,v as T,w as Q,C as Be,x as M,y as Se,z as Ae,A as Ee}from"./vendor.79e8274f.js";const Ge=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerpolicy&&(a.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?a.credentials="include":r.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(r){if(r.ep)return;r.ep=!0;const a=t(r);fetch(r.href,a)}};Ge();class Te{constructor(e,t,i){this._canvas=e,this._device=t,this._queue=i}get canvas(){return this._canvas}get device(){return this._device}get queue(){return this._queue}}class ne{constructor(e,t,i){this._meshes=[],this.render=a=>{this.computePass(a),this.renderPass()},this._canvas=e,this._camera=t;const r={sampleCount:1};this._options=v(v({},r),i)}static supportsWebGPU(){return!!navigator.gpu}async initialize(){const e=navigator.gpu;if(!e)throw new Error("No WebGPU support navigator.gpu not available!");const t=await e.requestAdapter();console.log(t.limits);const i=await t.requestDevice(),r=i.queue;this._context=new Te(this._canvas,i,r);const a=window.devicePixelRatio||1;this._presentationSize={width:this._canvas.clientWidth*a,height:this._canvas.clientWidth*a,depthOrArrayLayers:1},this._presentationContext=this._canvas.getContext("webgpu"),this._presentationFormat=this._presentationContext.getPreferredFormat(t),this._presentationContext.configure({device:this._context.device,format:this._presentationFormat,size:this._presentationSize})}reCreateSwapChain(){this._renderTarget!==void 0&&(this._renderTarget.destroy(),this._depthTarget.destroy()),this._presentationSize={width:this._canvas.clientWidth*devicePixelRatio,height:this._canvas.clientWidth*devicePixelRatio,depthOrArrayLayers:1},this._presentationContext.configure({device:this._context.device,format:this._presentationFormat,size:this._presentationSize}),this._renderTarget=this._context.device.createTexture({size:this._presentationSize,sampleCount:this._options.sampleCount,format:this._presentationFormat,usage:GPUTextureUsage.RENDER_ATTACHMENT}),this._renderTargetView=this._renderTarget.createView(),this._depthTarget=this._context.device.createTexture({size:this._presentationSize,sampleCount:this._options.sampleCount,format:"depth24plus-stencil8",usage:GPUTextureUsage.RENDER_ATTACHMENT}),this._depthTargetView=this._depthTarget.createView()}async initializeResources(){this._camera.initalize(this._context);const e=[];for(const t of this._meshes)e.push(t.initalize(this._context,this._camera));await Promise.all(e),this._computePipeLine&&await this._computePipeLine.initialize(this._context)}computePass(e){const t=this._context.device.createCommandEncoder();this._computePipeLine.deltaTime(e);const i=t.beginComputePass();i.setPipeline(this._computePipeLine.gpuPipeline),i.setBindGroup(0,this._computePipeLine.bindGroup),i.dispatch(Math.ceil(this._computePipeLine.particleCount/256)),i.end(),this._context.queue.submit([t.finish()])}renderPass(){const e={view:this._presentationContext.getCurrentTexture().createView(),loadOp:"clear",storeOp:"store"};this._options.sampleCount>1&&(e.view=this._renderTargetView,e.resolveTarget=this._presentationContext.getCurrentTexture().createView());const t={colorAttachments:[e],depthStencilAttachment:{view:this._depthTargetView,depthLoadOp:"clear",depthClearValue:1,depthStoreOp:"store",stencilLoadOp:"clear",stencilClearValue:0,stencilStoreOp:"store"}},i=this._context.device.createCommandEncoder(),r=i.beginRenderPass(t);for(const a of this._meshes){const o=a.geometry;r.setPipeline(a.gpuPipeline),r.setBindGroup(0,a.bindGroup);for(let p=0;p<o.vertexBuffers.length;p++)r.setVertexBuffer(p,o.vertexBuffers[p]);o.indexCount>0?(r.setIndexBuffer(o.indexBuffer,"uint16"),r.drawIndexed(o.indexCount,1,0,0,0)):r.draw(o.vertexCount,1,0,0)}r.end(),this._context.queue.submit([i.finish()])}resize(){const e=window.devicePixelRatio||1;(this._canvas.clientWidth*e!==this._presentationSize[0]||this._canvas.clientHeight*e!==this._presentationSize[1])&&this.reCreateSwapChain()}async start(){await this.initialize(),this.reCreateSwapChain(),await this.initializeResources()}addMesh(e){this._meshes.push(e)}setComputePipeLine(e){this._computePipeLine=e}}class W{constructor(){this._name=""}set name(e){this._name=e}get name(){return this._name}}class oe extends W{constructor(){super(...arguments);this._vertexBuffers=[],this._initialized=!1,this._vertexBufferLayouts=[],this._indexCount=0,this._vertexCount=0}setIndices(e){this._indicesArray=e,this._indexCount=e.length,this._initialized=!1}initalize(e){this._initialized||this._indexCount>0&&(this._indexBuffer=w(e.device,this._indicesArray,GPUBufferUsage.INDEX))}get vertexBufferLayouts(){return this._vertexBufferLayouts}get indexBuffer(){return this._indexBuffer}get indexCount(){return this._indexCount}get vertexCount(){return this._vertexCount}get vertexBuffers(){return this._vertexBuffers}set vertexBuffers(e){this._vertexBuffers=e}}class ce extends oe{constructor(){super(...arguments);this._attributes=[]}setVertices(e,t){this._interleavedArray=e,this._stride=t,this._vertexCount=e.length/(t/e.BYTES_PER_ELEMENT),this._initialized=!1}addAttribute(e){this._attributes.push(e)}initalize(e){super.initalize(e),!this._initialized&&(this._initialized=!0,this._vertexBuffers.push(w(e.device,this._interleavedArray,GPUBufferUsage.VERTEX)),this._vertexBufferLayouts.push({attributes:this._attributes,arrayStride:this._stride,stepMode:"vertex"}))}}const d=[8,5,5],b=[1,1,1,1],x=d[0]/2,y=d[1]/2,P=d[2]/2,ze=new Float32Array([x,-y,-P,...b,x,y,-P,...b,-x,y,-P,...b,-x,-y,-P,...b,-x,-y,P,...b,-x,y,P,...b,x,y,P,...b,x,-y,P,...b]),Fe=new Uint16Array([0,1,1,2,2,3,3,0,3,2,2,5,5,4,4,3,7,6,6,1,1,0,0,7,4,5,5,6,6,7,7,4]),B=new ce;B.setVertices(ze,7*Float32Array.BYTES_PER_ELEMENT);B.setIndices(Fe);B.addAttribute({shaderLocation:0,offset:0,format:"float32x3"});B.addAttribute({shaderLocation:1,offset:3*Float32Array.BYTES_PER_ELEMENT,format:"float32x4"});function w(s,e,t){const i=s.createBuffer({mappedAtCreation:!0,size:e.byteLength,usage:t}),r=i.getMappedRange();return(e instanceof Float32Array?new Float32Array(r):new Uint16Array(r)).set(e),i.unmap(),i}function Le(s,e){const t=()=>[Math.random()*d[0]-d[0]/2,Math.random()*d[1]-d[1]/2,Math.random()*d[2]-d[2]/2],i=new Float32Array(s*e);for(let r=0;r<s*e;r+=e){const a=t();i.set(a,r)}return i}class Re{constructor(e,t,i,r){this._perspectiveMatrix=_(),this._viewMatrix=_(),this._rotation=G(),this._initialized=!1,this.position=N(),this.target=N(),this.up=[0,1,0],this.fovY=45,this.aspectRatio=1,this.zNear=.1,this.zFar=1e3,this.fovY=e,this.aspectRatio=t,this.zNear=i,this.zFar=r,this.updateMatrices()}initalize(e){if(this._initialized)return;this._initialized=!0,this._context=e;const t=new Float32Array([...this._viewMatrix,...this._perspectiveMatrix]);this._uniformBuffer=w(e.device,t,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST)}get viewMatrix(){return this._viewMatrix}get perspectiveMatrix(){return this._perspectiveMatrix}get uniformBuffer(){return this._uniformBuffer}updateMatrices(){this.updateViewMatrix(),this.updatePerspectiveMatrix()}updateViewMatrix(){const e=_(),t=_();_e(e,this.position,this.target,this.up),ie(t,this._rotation),this._viewMatrix=O(this._viewMatrix,e,t),this.updateUniformBuffer()}updatePerspectiveMatrix(){this._perspectiveMatrix=ge(this._perspectiveMatrix,ve(this.fovY),this.aspectRatio,this.zNear,this.zFar),this.updateUniformBuffer()}updateUniformBuffer(){if(this._initialized){const e=new Float32Array([...this._viewMatrix,...this._perspectiveMatrix]);this._context.queue.writeBuffer(this._uniformBuffer,0,e.buffer)}}rotateQuat(e){this._rotation=re(this._rotation,e,this._rotation),this.updateViewMatrix()}rotateEuler(e,t,i){let r=G();r=se(r,e,t,i),this.rotateQuat(r)}}const j=[1,0,0,1],K=[0,1,0,1],Z=[0,0,1,1],k=[1,1,1],J=k[0]/2,ee=k[1]/2,te=k[2]/2,Ne=new Float32Array([-J,0,0,...j,J,0,0,...j,0,-ee,0,...K,0,ee,0,...K,0,0,-te,...Z,0,0,te,...Z]),Oe=new Uint16Array([0,1,2,3,4,5]),S=new ce;S.setVertices(Ne,7*Float32Array.BYTES_PER_ELEMENT);S.setIndices(Oe);S.addAttribute({shaderLocation:0,offset:0,format:"float32x3"});S.addAttribute({shaderLocation:1,offset:3*Float32Array.BYTES_PER_ELEMENT,format:"float32x4"});class Ve extends oe{constructor(e){super();this._attributes=[],this._vertexCount=e}addAttribute(e){this._attributes.push(e)}initalize(e){if(super.initalize(e),!this._initialized){this._initialized=!0;for(let t=0;t<this._attributes.length;t++){const i=this._attributes[t],r=w(e.device,i.array,i.usage||GPUBufferUsage.VERTEX);r.label=`Buffer-${this.name}-Attribute-${t}`,this._vertexBuffers.push(r),this._vertexBufferLayouts.push({attributes:[i.descriptor],arrayStride:i.stride,stepMode:"vertex"})}}}}class ue extends Ve{constructor(e,t){super(e);const i=Le(e,t);this.addAttribute({array:i,stride:t*Float32Array.BYTES_PER_ELEMENT,descriptor:{shaderLocation:0,offset:0,format:t===3?"float32x3":"float32x4"},usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE})}}class De extends W{constructor(){super(...arguments);this._modelMatrix=_(),this._position=N(),this._scale=[1,1,1],this._rotation=G()}get modelMatrix(){return this._modelMatrix}translate(e){this._position=be(this._position,this._position,e),this.updateModelMatrix()}rotateQuat(e){this._rotation=re(this._rotation,this._rotation,e),this.updateModelMatrix()}rotateEuler(e,t,i){let r=G();r=se(r,e,t,i),this.rotateQuat(r)}scale(e){this._scale=xe(this._scale,this._scale,e),this.updateModelMatrix()}get position(){return this._position}set position(e){this._position=e,this.updateModelMatrix()}updateModelMatrix(){const e=_(),t=_(),i=_(),r=_();ye(e,e,this._position),ie(t,this._rotation),Pe(i,i,this._scale),O(r,e,t),this._modelMatrix=O(this._modelMatrix,r,i)}}class F extends De{constructor(e,t,i){super();this._initialized=!1,this._geometry=e,this._pipeline=t,this._material=i}async initalize(e,t){if(this._initialized)return;this._initialized=!0,this._context=e,this._material&&this._material.initalize(e),this._geometry.initalize(e);const i=new Float32Array([...this.modelMatrix]);this._uniformBuffer=w(e.device,i,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST);const r=[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}}],a=[{binding:0,resource:{buffer:t.uniformBuffer}},{binding:1,resource:{buffer:this._uniformBuffer}}];this._material&&(r.push(...this._material.bindGroupLayoutEntries),a.push(...this._material.bindGroupEntries)),await this._pipeline.initalize(e,this._geometry.vertexBufferLayouts,r,a)}updateUniformBuffer(){if(this._context){const e=new Float32Array([...this.modelMatrix]);this._context.queue.writeBuffer(this._uniformBuffer,0,e.buffer)}}updateModelMatrix(){super.updateModelMatrix(),this.updateUniformBuffer()}get geometry(){return this._geometry}set geometry(e){this._geometry=e}get bindGroup(){return this._pipeline.bindGroup}get gpuPipeline(){return this._pipeline.gpuPipeline}get material(){return this._material}}class he extends W{constructor(){super();this._initialized=!1}async loadShader(e,t){const i=await fetch(t);return e.device.createShaderModule({code:await i.text()})}get gpuPipeline(){return this._pipeline}}class L extends he{constructor(e){super();const t={primitiveTopology:"triangle-list",sampleCount:1,colorFormat:"bgra8unorm",depthFormat:"depth24plus-stencil8"};this._options=v(v({},t),e)}async initalize(e,t,i,r){if(this._initialized)return;this._initialized=!0;const a={topology:this._options.primitiveTopology,frontFace:"cw",cullMode:"none"},o={module:await this.loadShader(e,this._options.vertexShaderUrl),entryPoint:"main",buffers:t},p={format:this._options.colorFormat,blend:{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"}},writeMask:GPUColorWrite.ALL},u={depthWriteEnabled:!0,depthCompare:"less",format:this._options.depthFormat},g={module:await this.loadShader(e,this._options.fragmentShaderUrl),entryPoint:"main",targets:[p]},A={count:this._options.sampleCount},U=e.device.createBindGroupLayout({entries:i});this._bindGroup=e.device.createBindGroup({layout:U,entries:r});const h={layout:e.device.createPipelineLayout({bindGroupLayouts:[U]}),vertex:o,primitive:a,fragment:g,depthStencil:u,multisample:A};this._pipeline=e.device.createRenderPipeline(h)}get gpuPipeline(){return this._pipeline}get bindGroup(){return this._bindGroup}}class We extends he{constructor(e,t){super();this._computeParamsUniformBufferSize=0,this._drawMesh=e,this._options=t;let i=we(d);i=Me(i,i,.5),this._computeParams={vHalfBounding:[i[0],i[1],i[2],1],vForcePos:[0,0,0,1],fDeltaTime:.001,fGravity:9.81,fForce:20,fForceOn:0}}async initialize(e){if(this._initialized)return;this._initialized=!0,this._context=e;const t=new Float32Array(this._options.particleCount*4);this._posBuffer=this._drawMesh.geometry.vertexBuffers[0];const i=this.getParamsArray();this._computeParamsUniformBufferSize=i.byteLength,this._computeParamsUniformBuffer=w(e.device,i,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST),this._velBuffer=w(e.device,t,GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE),this._bindGroupLayout=e.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]}),await this.createBindGroup()}async createBindGroup(){this._bindGroup=this._context.device.createBindGroup({layout:this._bindGroupLayout,entries:[{binding:0,resource:{buffer:this._computeParamsUniformBuffer,offset:0,size:this._computeParamsUniformBufferSize}},{binding:1,resource:{buffer:this._posBuffer,offset:0,size:this._options.particleCount*4*4}},{binding:2,resource:{buffer:this._velBuffer,offset:0,size:this._options.particleCount*4*4}}]}),this._bindGroup.label=`${this.name}-BindGroup`;const e=this._context.device.createPipelineLayout({bindGroupLayouts:[this._bindGroupLayout]}),t={module:await this.loadShader(this._context,this._options.computeShaderUrl),entryPoint:"main"},i={layout:e,compute:t};this._pipeline=this._context.device.createComputePipeline(i)}getParamsArray(){const e=Object.keys(this._computeParams),t=[];for(let i=0;i<e.length;i++){const r=this._computeParams[e[i]];Array.isArray(r)?t.push(...r):t.push(r)}return new Float32Array(t)}updateUniformBuffer(){if(this._initialized){const e=this.getParamsArray();this._context.queue.writeBuffer(this._computeParamsUniformBuffer,0,e.buffer)}}get bindGroup(){return this._bindGroup}get gpuPipeline(){return this._pipeline}get particleCount(){return this._options.particleCount}async updateParticleCount(e){e!==this._options.particleCount&&(e<=0&&(e=1),this._options.particleCount=e,this._drawMesh.geometry=new ue(this._options.particleCount,4),this._drawMesh.geometry.initalize(this._context),this._initialized=!1,await this.initialize(this._context))}turnForceOn(){this._computeParams.fForceOn=1,this.updateUniformBuffer()}turnForceOff(){this._computeParams.fForceOn=0,this.updateUniformBuffer()}deltaTime(e){this._computeParams.fDeltaTime=e/1e3,this.updateUniformBuffer()}set forcePostion(e){this._computeParams.vForcePos=[e[0],e[1],e[2],1],this.updateUniformBuffer()}set force(e){this._computeParams.fForce=e,this.updateUniformBuffer()}set gravity(e){this._computeParams.fGravity=e,this.updateUniformBuffer()}}class ke{constructor(e){this._bindGroupLayoutEntries=[],this._bindGroupEntries=[],this._initialized=!1,this._color=e}initalize(e){if(this._initialized)return;this._initialized=!0,this._context=e;const t=new Float32Array([...this._color]);this._uniformBuffer=w(e.device,t,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST),this._bindGroupLayoutEntries.push({binding:2,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}}),this._bindGroupEntries.push({binding:2,resource:{buffer:this._uniformBuffer}})}updateUniformBuffer(){if(this._initialized){const e=new Float32Array([...this._color]);this._context.queue.writeBuffer(this._uniformBuffer,0,e.buffer)}}get bindGroupLayoutEntries(){return this._bindGroupLayoutEntries}get bindGroupEntries(){return this._bindGroupEntries}set color(e){this._color=e,this.updateUniformBuffer()}}class Ie{constructor(e,t,i){this._sampleCount=4,this._currentTime=0,this._frameCount=0,this._frameDurationAvg=0,this._cpuDurationAvg=0,this._currentMousePos=X(),this._movementSpeed=.25,this.render=()=>{const l=performance.now(),h=l-this._currentTime;if(this._currentTime=l,this._frameTimeCallback&&(this._frameCount++,this._frameDurationAvg+=h,this._frameDurationAvg>1e3)){const f=this._frameDurationAvg/this._frameCount,m=this._cpuDurationAvg/this._frameCount;this._frameCount=0,this._frameDurationAvg=0,this._cpuDurationAvg=0,this._frameTimeCallback(f,m)}this._renderer.render(h),window.requestAnimationFrame(this.render);const c=performance.now();this._cpuDurationAvg+=c-l},this.onMouseWheel=l=>{let h=this._camera.position[2]+=l.deltaY*.02;h=Math.max(this._camera.zNear,Math.min(this._camera.zFar,h)),this._camera.position[2]=h,this._camera.updateMatrices()},this.onMouseMove=l=>{const h=[l.clientX,l.clientY];if(l.buttons===1){let c=X();c=Ce(c,h,this._currentMousePos),c=Ue(c,c,.2),this._camera.rotateEuler(0,c[0],0),this._camera.rotateEuler(c[1],0,0)}this._currentMousePos=h},this.onKeyDown=l=>{const h=this._crossHairMesh.position;let c=h[0],f=h[1],m=h[2];switch(l.key){case"a":c-=this._movementSpeed;break;case"d":c+=this._movementSpeed;break;case"w":m-=this._movementSpeed;break;case"s":m+=this._movementSpeed;break;case"PageUp":f+=this._movementSpeed;break;case"PageDown":f-=this._movementSpeed;break;case" ":this._computePipeLine.turnForceOn();return;default:return}const z=.001,I=d[0]/2+z,$=d[1]/2+z,Y=d[2]/2+z;(c<-I||c>I)&&(c=this._crossHairMesh.position[0]),(f<-$||f>$)&&(f=this._crossHairMesh.position[1]),(m<-Y||m>Y)&&(m=this._crossHairMesh.position[2]),this._crossHairMesh.position=[c,f,m],this._computePipeLine.forcePostion=[c,f,m]},this.onKeyup=l=>{switch(l.key){case" ":this._computePipeLine.turnForceOff();break}},this._canvas=e,this._frameTimeCallback=i,this._canvas.width=this._canvas.offsetWidth*window.devicePixelRatio,this._canvas.height=this._canvas.offsetHeight*window.devicePixelRatio,this._camera=new Re(45,this._canvas.width/this._canvas.height,.1,1e3),this._camera.position=[0,0,15],this._camera.updateMatrices(),this._renderer=new ne(this._canvas,this._camera,{sampleCount:this._sampleCount});const r="./assets/shaders/basic.frag.wgsl",a="./assets/shaders/basic.vert.wgsl",o="./assets/shaders/particle.comp.wgsl",p="./assets/shaders/particle.vert.wgsl",u="./assets/shaders/particle.frag.wgsl",g=new L({primitiveTopology:"line-list",sampleCount:this._sampleCount,vertexShaderUrl:a,fragmentShaderUrl:r});g.name="boxPipeline";const A=new L({primitiveTopology:"line-list",sampleCount:this._sampleCount,vertexShaderUrl:a,fragmentShaderUrl:r});A.name="crossHairPipeline";const U=new L({primitiveTopology:"point-list",sampleCount:this._sampleCount,vertexShaderUrl:p,fragmentShaderUrl:u});U.name="pointPipeline",this._boxMesh=new F(B,g),this._boxMesh.name="BoxMesh",this._crossHairMesh=new F(S,A),this._crossHairMesh.name="CrossHairMesh",this._particleMaterial=new ke([1,0,1,.5]),this._particleMesh=new F(new ue(t,4),U,this._particleMaterial),this._particleMesh.name="ParticleMesh",this._renderer.addMesh(this._boxMesh),this._renderer.addMesh(this._crossHairMesh),this._renderer.addMesh(this._particleMesh),this._computePipeLine=new We(this._particleMesh,{computeShaderUrl:o,particleCount:t}),this._computePipeLine.name="Compute pipeLine",this._renderer.setComputePipeLine(this._computePipeLine)}start(){this._renderer.start().then(()=>{new ResizeObserver(t=>{if(!Array.isArray(t))return;const i=t[0].contentRect.width*window.devicePixelRatio,r=t[0].contentRect.height*window.devicePixelRatio;this._canvas.width=i,this._canvas.height=r,this._camera.aspectRatio=i/r,this._camera.updateMatrices(),this._renderer.resize()}).observe(this._canvas),this._canvas.addEventListener("wheel",this.onMouseWheel),this._canvas.addEventListener("mousemove",this.onMouseMove),document.addEventListener("keydown",this.onKeyDown),document.addEventListener("keyup",this.onKeyup),this._currentTime=performance.now(),this.render()},e=>{console.error(e)})}get computePipline(){return this._computePipeLine}get particleMaterial(){return this._particleMaterial}}const R=s=>{const e=t=>{const i=parseFloat(t.target.value);s.onValueChange(i)};return n("div",{className:"slider",children:C("label",{children:[s.labelText||"",n("br",{}),n("input",{className:"w-full",type:"range",min:s.min,max:s.max,step:s.step,value:s.value,onChange:e})]})})},V=ae({key:"computePropertiesAtom",default:{gravity:9.81,force:20,color:{r:255,g:0,b:0,a:.5}}}),D=ae({key:"particleCountAtom",default:1e5}),$e=()=>{const[s,e]=T(V),[t,i]=T(D),r=Q(V),a=Q(D),o=u=>{const g={r:u.rgb.r,g:u.rgb.g,b:u.rgb.b,a:u.rgb.a||1};e(E(v({},s),{color:g}))},p=()=>{r(),a()};return C("div",{className:"absolute left-0 top-28 w-72 p-2 bg-white bg-opacity-10 flex flex-col gap-1 text-gray-200",children:[n(R,{min:1,max:81e5,step:1e5,value:t,onValueChange:u=>{i(u)},labelText:`Particle count: ${t.toLocaleString()}`}),n(R,{min:-20,max:20,step:.01,value:s.gravity,onValueChange:u=>{e(E(v({},s),{gravity:u}))},labelText:`Gravity: ${s.gravity.toFixed(2)}`}),n(R,{min:-50,max:50,step:.01,value:s.force,onValueChange:u=>{e(E(v({},s),{force:u}))},labelText:`Force: ${s.force.toFixed(2)}`}),n(Be,{color:s.color,onChange:o}),n("button",{className:"my-2 rounded bg-red-500 hover:bg-red-700 py-1 px-4 text-white",onClick:p,children:"Reset to default values"}),n("div",{className:"descriptionItem",children:n("span",{children:"Space: activate force"})}),n("div",{className:"descriptionItem",children:n("span",{children:"W: Move force -Z"})}),n("div",{className:"descriptionItem",children:n("span",{children:"A: Move force -X"})}),n("div",{className:"descriptionItem",children:n("span",{children:"S: Move force +Z"})}),n("div",{className:"descriptionItem",children:n("span",{children:"D: Move force +X"})}),n("div",{className:"descriptionItem",children:n("span",{children:"Page up: Move force +Y"})}),n("div",{className:"descriptionItem",children:n("span",{children:"Page down: Move force -Y"})})]})},Ye=s=>C("div",{className:"absolute left-0 top-0 p-2 text-red-400",children:[`Avg frame time: ${s.frameTime.toFixed(3)} ms`,n("br",{}),`FPS: ${(1e3/s.frameTime).toFixed(2)}`,n("br",{}),`Avg CPU time: ${s.cpuTime.toFixed(3)} ms`]}),He=()=>{const s=M.exports.useRef(void 0),[e,t]=M.exports.useState({frameTime:0,cpuTime:0}),[i]=T(V),[r]=T(D),a=M.exports.useRef(void 0),o=M.exports.useRef(void 0),p=(u,g)=>{t({frameTime:u,cpuTime:g})};return M.exports.useEffect(()=>{a.current?(o.current&&window.clearTimeout(o.current),o.current=window.setTimeout(()=>{(async()=>(console.log(`update particle count: ${r}`),await a.current.computePipline.updateParticleCount(r)))()},1e3)):(a.current=new Ie(s.current,r,p),a.current.start())},[r]),M.exports.useEffect(()=>{a.current&&(a.current.computePipline.force=i.force,a.current.computePipline.gravity=i.gravity,a.current.particleMaterial.color=[i.color.r/255,i.color.g/255,i.color.b/255,i.color.a])},[i]),C(Se.Fragment,{children:[n("canvas",{className:"w-full h-full",ref:s,tabIndex:1}),n(Ye,{frameTime:e.frameTime,cpuTime:e.cpuTime}),n($e,{})]})},qe=()=>C("div",{className:"text-red-600 text-xl font-bold p-5",children:["Your browser does not support WebGPU yet"," ",n("a",{className:"underline",href:"https://github.com/gpuweb/gpuweb/wiki/Implementation-Status",children:"(Implementation Status)"}),n("br",{}),"If you want to try this out:",n("ul",{className:"list-disc list-inside",children:n("li",{children:"In Chrome enable a flag: chrome://flags/#enable-unsafe-webgpu"})}),n("br",{}),"Additional information:",C("ul",{className:"list-disc list-inside",children:[n("li",{children:n("a",{href:"https://github.com/gpuweb/gpuweb",children:"Github repo"})}),n("li",{children:n("a",{href:"https://en.wikipedia.org/wiki/WebGPU",children:"Wikipedia article"})})]})]}),Xe=()=>n(Ae,{children:ne.supportsWebGPU()?n(He,{}):n(qe,{})});Ee.exports.render(n(Xe,{}),document.getElementById("root"));