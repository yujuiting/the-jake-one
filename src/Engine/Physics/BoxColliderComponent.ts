import { GameObject } from 'Engine/Base/GameObject';
import { ColliderComponent } from 'Engine/Physics/ColliderComponent';
import { Bounds } from 'Engine/Physics/Bounds';
import { LineRendererComponent } from 'Engine/Render/LineRendererComponent';
import { Vector } from 'Engine/Math/Vector';
import { Line } from 'Engine/Math/Line';
import { Ray } from 'Engine/Math/Ray';
import { Projection } from 'Engine/Math/Projection';
import { CollisionJumpTable } from 'Engine/Physics/CollisionJumpTable';
import { Inject } from 'Engine/Utility/Decorator/Inject';
import { CollisionContact } from 'Engine/Physics/CollisionContact';
import { CircleColliderComponent } from 'Engine/Physics/CircleColliderComponent';
import { forward } from 'Engine/Utility/Type';

/**
 * TODO:
 * This is really strange
 * If without access GameObject ever, it will not be loaded.
 * Workaround via forward get temporarily
 * It should be a webpack relevant bug...
 */
forward(() => GameObject);

export class BoxColliderComponent extends ColliderComponent {

  public size: Vector = new Vector();

  private readonly cacheBounds: Bounds = new Bounds();

  private readonly cachePoints: Vector[] = [];

  private readonly cacheAxes: Vector[] = [];

  private readonly cacheSides: Line[] = [];

  private debugRenderer: LineRendererComponent|null = null;

  constructor(host: GameObject,
              @Inject(CollisionJumpTable) private collisionJumpTable: CollisionJumpTable) {
    super(host);
  }

  public get points(): ReadonlyArray<Vector> { return this.cachePoints; }

  public get axes(): ReadonlyArray<Vector> { return this.cacheAxes; }

  public get sides(): ReadonlyArray<Line> { return this.cacheSides; }

  public start(): void {
    for (let i = 0; i < 4; i++) {
      this.cachePoints.push(new Vector());
      this.cacheAxes.push(new Vector());
      this.cacheSides.push(new Line(new Vector(), new Vector()));
    }
  }

  public fixedUpdate(): void {
    this.calculate();
  }

  public update(): void {
    if (this.debug) {
      if (!this.debugRenderer) {
        this.debugRenderer = this.addComponent(LineRendererComponent);
        this.debugRenderer.closePath = true;
      }
      this.debugRenderer.clearPoints();
      const points = this.cachePoints;
      if (points.length > 1) {
        // repeatly add last point to close path.
        this.debugRenderer.addPoint(...points);
      }
    } else {
      if (this.debugRenderer) {
        this.removeComponent(this.debugRenderer);
        this.debugRenderer = null;
      }
    }
  }

  public calculate(): void {
    const toWorldMatrix = this.host.transform.toWorldMatrix;

    const halfSizeX = this.size.x / 2;
    const halfSizeY = this.size.y / 2;

    this.cachePoints[0].setTo(-halfSizeX, -halfSizeY);
    this.cachePoints[1].setTo( halfSizeX, -halfSizeY);
    this.cachePoints[2].setTo( halfSizeX,  halfSizeY);
    this.cachePoints[3].setTo(-halfSizeX,  halfSizeY);
    this.cachePoints.forEach(point => toWorldMatrix.multiplyToPoint(point));

    this.cacheAxes.forEach((axis, index) => {
      const p1 = this.cachePoints[index];
      const p2 = this.cachePoints[(index + 1) % this.cacheSides.length];
      axis.copy(p1).subtract(p2);
    });

    this.cacheSides.forEach((side, index) => {
      const p1 = this.cachePoints[index];
      const p2 = this.cachePoints[(index + 1) % this.cacheSides.length];
      side.begin.copy(p1);
      side.end.copy(p2);
    });

    // update bounds
    const x = this.cachePoints.map(p => p.x);
    const y = this.cachePoints.map(p => p.y);
    const minX = Math.min(...x);
    const minY = Math.min(...y);
    const maxX = Math.max(...x);
    const maxY = Math.max(...y);

    this.bounds.center.setTo((maxX + minX) / 2, (maxY + minY) / 2);
    this.bounds.extents.setTo((maxX - minX) / 2, (maxY - minY) / 2);
  }

  public collide(another: ColliderComponent): CollisionContact|undefined {
    if (another instanceof BoxColliderComponent) {
      return this.collisionJumpTable.boxBox(this, another);
    }
  }

  public contains(point: Vector): boolean {
    const ray = new Ray(point, Vector.Right);
    const count = this.cacheSides.reduce((acc, side) => ray.intersect(side) === -1 ? acc : ++acc, 0);
    return count % 2 !== 0;
  }

  public rayCast(ray: Ray): Vector|undefined {
    let minDistance = Number.MAX_VALUE;
    let noIntersect = true;
    this.cacheSides.forEach(side => {
      const distance = ray.intersect(side);
      if (distance > 0 && distance < minDistance) {
        minDistance = distance;
        noIntersect = false;
      }
    });

    if (noIntersect) {
      return;
    }

    return ray.getPoint(minDistance);
  }

  public project(axis: Vector): Projection {
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    this.cachePoints.forEach(point => {
      const s = point.dot(axis);
      min = Math.min(min, s);
      max = Math.max(max, s);
    });

    return new Projection(min, max);
  }

  public getFurthestPoint(direction: Vector): Vector {
    let max = -Number.MAX_VALUE;
    let pointer = -1;
    this.cachePoints.forEach((point, index) => {
      const dot = point.dot(direction);
      if (dot > max) {
        max = dot;
        pointer = index;
      }
    });
    return this.cachePoints[pointer].clone();
  }

}
