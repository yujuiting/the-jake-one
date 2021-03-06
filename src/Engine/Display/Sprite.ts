import { Subscription } from 'rxjs/Subscription';
import { Texture } from 'Engine/Resource/Texture';
import { Vector } from 'Engine/Math/Vector';
import { Rect } from 'Engine/Math/Rect';
import { BrowserDelegate } from 'Engine/Utility/BrowserDelegate';
import { Inject } from 'Engine/Decorator/Inject';
import { Class } from 'Engine/Decorator/Class';

@Class()
export class Sprite {

  public pivot: Vector = new Vector(0.5, 0.5);

  @Inject(BrowserDelegate)
  private browser: BrowserDelegate;

  public canvas: HTMLCanvasElement = this.browser.createCanvas();

  private ctx: CanvasRenderingContext2D = this.browser.getContext(this.canvas);

  private _texture: Texture;

  private textureLoaded: Subscription|undefined;

  get texture(): Texture { return this._texture; }

  // TODO: dynamic texture
  // set texture(texture: Texture) { this.setTexture(texture); }

  get width(): number { return this.rect.width; }

  get height(): number { return this.rect.height; }

  constructor(texture: Texture,
              /**
               * Location of the Sprite on the original Texture, specified in pixels.
               * Default, it will set to whole texture when texture loaded.
               */
              public rect: Rect = new Rect()) {
    this.setTexture(texture);
  }

  public setTexture(texture: Texture): void {
    if (this._texture === texture) {
      return;
    }

    this._texture = texture;

    if (this.textureLoaded) {
      this.textureLoaded.unsubscribe();
    }

    if (texture.isLoaded) {
      this.drawTexture();
    } else {
      this.textureLoaded = texture.onLoad$.subscribe(() => this.drawTexture());
    }
  }

  private drawTexture(): void {
    if (this.rect.width === 0 && this.rect.height === 0) {
      this.rect.width = this._texture.width;
      this.rect.height = this._texture.height;
    }

    this.canvas.width = this.rect.width;
    this.canvas.height = this.rect.height;

    if (this.textureLoaded) {
      this.textureLoaded.unsubscribe();
      delete this.textureLoaded;
    }

    this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
    this.ctx.drawImage(
      this._texture.data,
      this.rect.position.x,
      this.rect.position.y,
      this.rect.width,
      this.rect.height,
      0, 0,
      this.rect.width,
      this.rect.height
    );
  }

}
