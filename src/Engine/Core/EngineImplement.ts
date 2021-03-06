import { Inject } from 'Engine/Decorator/Inject';
import { Screen } from 'Engine/Display/Screen';
import { Scene } from 'Engine/Core/Scene';
import { SceneManager } from 'Engine/Core/SceneManager';
import { BrowserDelegate } from 'Engine/Utility/BrowserDelegate';
import { Time } from 'Engine/Time/Time';
import { Vector } from 'Engine/Math/Vector';
import { Service } from 'Engine/Decorator/Service';
import { Engine } from 'Engine/Core/Engine';

@Service(Engine)
export class EngineImplement implements Engine {

  public readonly gravity: Vector = Vector.Get(0, -10);

  private accumulator: number = 0;

  private _isPaused: boolean = true;

  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;

  private isInitialized: boolean = false;

  private currentScene: Scene;

  private bindedmainloop: () => void = this.mainloop.bind(this);

  private lastTimestamp: number = 0;

  public get isPaused(): boolean { return this._isPaused; }

  constructor(@Inject(Screen) public readonly screen: Screen,
              @Inject(Time) public readonly time: Time,
              @Inject(SceneManager) public readonly sceneManager: SceneManager,
              @Inject(BrowserDelegate) private readonly browser: BrowserDelegate) {
    this.canvas = this.browser.document.createElement('canvas');
    this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
  }

  public async initialize(initialScene: Scene): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Repeated engine initialization.');
    }

    this.isInitialized = true;

    const { width, height } = this.screen;
    this.canvas.width = width;
    this.canvas.height = height;
    this.browser.document.body.appendChild(this.canvas);

    this.canvas.style.marginLeft = `-${width / 2}px`;
    this.canvas.style.marginTop = `-${height / 2}px`;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '50%';
    this.canvas.style.top = '50%';
    this.browser.document.body.style.backgroundColor = '#000';

    this.browser.resize$.subscribe(e => this.onResize(e));

    this.sceneManager.sceneLoaded$.subscribe(s => this.onSceneLoaded(s));

    await this.sceneManager.switchTo(initialScene);

    this.currentScene = initialScene;

    this.resume();
  }

  public pause() {
    this._isPaused = true;
  }

  public resume() {
    this._isPaused = false;
    requestAnimationFrame(this.bindedmainloop);
  }

  private mainloop(timestamp: number) {
    if (this._isPaused) {
      return;
    }

    const frameTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.accumulator += frameTime;

    /**
     * clamp it, aviod spiral of death.
     */
    if (this.accumulator > 200) {
      this.accumulator = 200;
    }

    while (this.accumulator > this.time.fixedDeltaTime) {

      this.time.fixedUpdate(frameTime, 1);

      this.currentScene.fixedUpdate();

      this.accumulator -= this.time.fixedDeltaTime;

    }

    this.time.fixedUpdate(frameTime, this.accumulator / this.time.fixedDeltaTime);

    this.currentScene.fixedUpdate();

    this.accumulator = 0;

    this.time.update(frameTime);

    this.currentScene.update();

    this.currentScene.lateUpdate();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.currentScene.preRender();

    this.currentScene.render(this.ctx, this.canvas.width, this.canvas.height);

    this.currentScene.postRender();

    requestAnimationFrame(this.bindedmainloop);
  }

  private onResize(e: Event): void {
    const { width, height } = this.screen;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private onSceneLoaded(scene: Scene): void {
    this.currentScene = scene;
  }

}
