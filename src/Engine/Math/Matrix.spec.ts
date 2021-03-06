// tslint:disable member-access no-unused-expression
import 'Engine/preset';
import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { Matrix } from './Matrix';
import { Vector } from './Vector';

@suite class MatrixTestSuite {

  @test 'should has default value' () {
    const m = new Matrix();
    expect(m[0][0]).to.equal(1);
    expect(m[0][1]).to.equal(0);
    expect(m[1][0]).to.equal(0);
    expect(m[1][1]).to.equal(1);
  }

  @test 'should write default value' () {
    const m = new Matrix([
      [1, 2, 0],
      [3, 4, 0]
    ]);
    expect(m[0][0]).to.equal(1);
    expect(m[0][1]).to.equal(2);
    expect(m[1][0]).to.equal(3);
    expect(m[1][1]).to.equal(4);
  }

  @test 'should rotate' () {
    const m = new Matrix();
    m.rotate(Math.PI); // rotate 180 degree
    expect(m[0][0]).to.equal(-1);
    expect(m[0][1]).to.closeTo(0, 1e-10);
    expect(m[1][0]).to.closeTo(0, 1e-10);
    expect(m[1][1]).to.equal(-1);

    const m2 = new Matrix();
    m.rotate(Math.PI / 2); // rotate 90 degree
    const p = new Vector(10, 0);
    m.multiplyToPoint(p);
    expect(p.x).closeTo(0, 1e-10);
    expect(p.y).to.equal(-10);
  }

  @test 'should translate' () {
    const m = new Matrix();
    const v = new Vector(10, 5);
    m.translate(v);
    expect(m[0][0]).to.equal(1);
    expect(m[0][1]).to.equal(0);
    expect(m[0][2]).to.equal(v.x);
    expect(m[1][0]).to.equal(0);
    expect(m[1][1]).to.equal(1);
    expect(m[1][2]).to.equal(v.y);
  }

  @test 'should scale' () {
    const m = new Matrix();
    const v = new Vector(2, 3);
    m.scale(v);
    expect(m[0][0]).to.equal(v.x);
    expect(m[0][1]).to.equal(0);
    expect(m[1][0]).to.equal(0);
    expect(m[1][1]).to.equal(v.y);
  }

  @test 'should multiply to self' () {
    const m1 = new Matrix([
      [1, 2, 0],
      [3, 4, 0]
    ]);
    const m2 = new Matrix([
      [5, 6, 0],
      [7, 8, 0]
    ]);
    m1.multiply(m2);
    expect(m1[0][0]).to.equal(19);
    expect(m1[0][1]).to.equal(22);
    expect(m1[1][0]).to.equal(43);
    expect(m1[1][1]).to.equal(50);
  }

  @test 'should multiply to pointer' () {
    const m = new Matrix();
    const p = new Vector(4, 4);
    m.translate(new Vector(3, 3));
    m.scale(new Vector(2, 2));
    m.multiplyToPoint(p);
    expect(p.x).to.equal(11);
    expect(p.y).to.equal(11);
  }

  @test 'should multiply to vector' () {
    const m = new Matrix();
    const v = new Vector(4, 0);
    m.translate(new Vector(3, 3)); // should not perform translation
    m.scale(new Vector(2, 2));
    m.rotate(Math.PI / 2); // rotate 90 degree on anticlockwise
    m.multiplyToVector(v);
    expect(v.x).to.closeTo(0, 1e-10);
    expect(v.y).to.equal(8);
  }

  @test 'should check equal' () {
    const m1 = new Matrix([
      [1, 2, 3],
      [4, 5, 6]
    ]);
    const m2 = new Matrix([
      [1, 2, 3],
      [4, 5, 6]
    ]);
    expect(m1.equalTo(m2)).to.be.true;
  }

  @test 'should clone' () {
    const m1 = new Matrix([
      [1, 2, 0],
      [3, 4, 0]
    ]);
    const m2 = m1.clone();
    expect(m1).not.to.equal(m2);
    expect(m1[0][0]).to.equal(m2[0][0]);
    expect(m1[0][1]).to.equal(m2[0][1]);
    expect(m1[1][0]).to.equal(m2[1][0]);
    expect(m1[1][1]).to.equal(m2[1][1]);
  }

  @test 'should invert from source' () {
    const m = new Matrix([
      [1, 2, 0],
      [3, 4, 0]
    ]);

    m.translate(new Vector(5, 6));

    const i = new Matrix().invertFrom(m);

    expect(i[0][0]).to.equal(-2);
    expect(i[0][1]).to.equal(1);
    expect(i[0][2]).to.equal(-5);
    expect(i[1][0]).to.equal(1.5);
    expect(i[1][1]).to.equal(-0.5);
    expect(i[1][2]).to.equal(-6);

    expect(m.clone().multiply(i).equalTo(Matrix.Identity)).to.be.true;
  }

  @test 'should get inverse' () {
    const m = new Matrix([
      [1, 2, 0],
      [3, 4, 0]
    ]);

    m.translate(new Vector(5, 6));

    const i = m.getInverse();

    expect(m.clone().multiply(i).equalTo(Matrix.Identity)).to.be.true;
  }

  @test 'should to string' () {
    const m = new Matrix([
      [1, 2, 0],
      [3, 4, 0]
    ]);
    expect(m.toString()).to.equal('Matrix [1,2,0][3,4,0]');
  }

}
