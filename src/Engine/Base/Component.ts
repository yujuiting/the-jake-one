import { BaseObject } from 'Engine/Base/BaseObject';
import { GameObject } from 'Engine/Base/GameObject';
import { Class } from 'Engine/Utility/Type';

/**
 *
 */
export abstract class Component extends BaseObject {

  constructor(public host: GameObject) {
    super();
  }

  public addComponent<T extends Component>(componentType: Class<T>): T {
    return this.host.addComponent(componentType);
  }

  public removeComponent(component: Component): void {
    return this.host.removeComponent(component);
  }

  public getComponent<T extends Component>(componentType: Class<T>): T|null {
    return this.host.getComponent(componentType);
  }

  public getComponents<T extends Component>(componentType: Class<T>): T[] {
    return this.host.getComponents(componentType);
  }

  public toString(): string {
    return `GameComponent(${this.id})`;
  }

}