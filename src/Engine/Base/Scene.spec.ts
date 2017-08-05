// tslint:disable member-access no-unused-expression
import { expect, use } from 'chai';
import { spy } from 'sinon';
import { suite, test } from 'mocha-typescript';
import { instantiate } from 'Engine/Base/runtime';
import { Scene } from 'Engine/Base/Scene';
import { GameObject } from 'Engine/Base/GameObject';
import * as sinonChai from 'sinon-chai';
use(sinonChai);

@suite class SceneTestSuite {

  scene: Scene;

  before(): void {
    this.scene = instantiate(Scene);
  }

  @test 'add: should add game object' () {
    const g = instantiate(GameObject);

    expect(this.scene.add(g)).to.be.true;
    expect(this.scene.has(g)).to.be.true;
  }

  @test 'add: should start game object' () {
    const g = instantiate(GameObject);
    const start = spy(g, 'start');

    this.scene.add(g);

    expect(start).to.be.called;
  }

  @test 'remove: should remove game object' () {
    const g = instantiate(GameObject);
    this.scene.add(g);

    expect(this.scene.remove(g)).to.be.true;
    expect(this.scene.has(g)).to.be.false;
  }

  @test 'remove: should end game object' () {
    const g = instantiate(GameObject);
    const end = spy(g, 'end');

    this.scene.add(g);
    this.scene.remove(g);

    expect(end).to.be.called;
  }

}