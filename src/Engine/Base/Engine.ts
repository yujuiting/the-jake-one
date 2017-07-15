import { Screen } from 'Engine/Render/Screen';
import { Scene } from 'Engine/Base/Scene';
import { SceneManager } from 'Engine/Base/SceneManager';
import { BrowserDelegate } from 'Engine/Utility/BrowserDelegate';
import { Time } from 'Engine/Time/Time';
import { ReadonlyTree } from 'Engine/Utility/Tree';
import { Vector } from 'Engine/Math/Vector';

/**
 * Engine
 * Singleton
 */
export class Engine {

  public static Get(): Engine { return this.Singleton; }

  private static Singleton: Engine = new Engine();

  public readonly screen: Screen = Screen.Get();

  public readonly time: Time = Time.Get();

  public readonly sceneManager: SceneManager = SceneManager.Get();

  private readonly browser: BrowserDelegate = BrowserDelegate.Get();

  public readonly gravity: Vector = Vector.Get(0, 9.8);

  private accumulator: number = 0;

  private _isPaused: boolean = true;

  private canvas: HTMLCanvasElement = this.browser.document.createElement('canvas');

  private ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>this.canvas.getContext('2d');

  private isInitialized: boolean = false;

  private currentScene: Scene;

  private bindedmainloop: () => void = this.mainloop.bind(this);

  private lastTimestamp: number = 0;

  public get isPaused(): boolean { return this._isPaused; }

  constructor() {
    if (Engine.Get()) {
      throw new Error('You should not instantiate engine. Use `Engine.Get() instead of.`');
    }
  }

  public initialize(container: HTMLElement): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Repeated engine initialization.');
    }

    this.check();

    this.isInitialized = true;

    const { width, height } = this.screen;
    this.canvas.width = width;
    this.canvas.height = height;
    container.appendChild(this.canvas);

    this.browser.resize$.subscribe(e => this.onResize(e));

    this.sceneManager.sceneLoaded$.subscribe(s => this.onSceneLoaded(s));

    return this.sceneManager.currentScene.load().then(() => {
      this.currentScene = this.sceneManager.currentScene;
      this.resume();
    });
  }

  public pause() {
    this._isPaused = true;
  }

  public resume() {
    this._isPaused = false;
    this.lastTimestamp = this.browser.window.performance.now();
    this.mainloop();
  }

  private check(): void {
    if (!this.sceneManager.currentScene) {
      throw new Error('No active scene');
    }
  }

  private mainloop() {
    if (this._isPaused) {
      return;
    }

    const timestamp = this.browser.window.performance.now();
    const frameTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.accumulator += frameTime;

    /**
     * clamp it, aviod spiral of death.
     */
    if (this.accumulator > 0.2) {
      this.accumulator = 0.2;
    }

    while (this.accumulator > this.time.fixedDeltaTime) {

      this.time.tick(frameTime);

      this.currentScene.fixedUpdate(1);

      this.accumulator -= this.time.fixedDeltaTime;

    }

    this.currentScene.fixedUpdate(this.accumulator / this.time.fixedDeltaTime);

    this.accumulator = 0;

    this.currentScene.update();

    this.currentScene.lateUpdate();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.currentScene.render(this.ctx);

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